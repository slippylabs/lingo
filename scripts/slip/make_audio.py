#!/usr/bin/env python3
"""slippylabs: generate lesson audio LOCALLY with Piper (no cloud TTS).

For every course in scripts/slip/voices.json that has a voice, synthesise each
word and phrase in the target language into apps/web/static/voice/<audio_id>.mp3,
the exact filenames the exporter writes into listening challenges. Text
collection and ids mirror upstream src/librelingo_audios/cli.py. One model load
per course (upstream's wrapper spawned a fresh piper process per phrase).
Existing files are skipped, so re-runs only fill gaps.

Voices are downloaded once to ~/.cache/piper-voices and md5-checked against
rhasspy/piper-voices' voices.json.
"""
import hashlib, io, json, logging, re, subprocess, sys, urllib.request, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
from librelingo_yaml_loader import load_course  # noqa: E402
from librelingo_utils import audio_id, iterate_phrases, iterate_words, remove_control_characters_for_display  # noqa: E402
from piper import PiperVoice, SynthesisConfig  # noqa: E402

HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
CACHE = Path.home() / ".cache/piper-voices"
OUT = ROOT / "apps/web/static/voice"
VOICES = json.loads((ROOT / "scripts/slip/voices.json").read_text())
# A touch slower than natural speed: these are for learners.
LENGTH_SCALE = 1.15


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "slippylabs-lingo"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def voice_files(key, catalog):
    CACHE.mkdir(parents=True, exist_ok=True)
    paths = []
    for rel, meta in catalog[key]["files"].items():
        if not rel.endswith((".onnx", ".onnx.json")):
            continue
        dest = CACHE / Path(rel).name
        if not dest.exists() or hashlib.md5(dest.read_bytes()).hexdigest() != meta["md5_digest"]:
            print(f"  downloading {rel}")
            data = fetch(HF + rel)
            if hashlib.md5(data).hexdigest() != meta["md5_digest"]:
                raise SystemExit(f"md5 mismatch for {rel}")
            dest.write_bytes(data)
        paths.append(dest)
    model = next(p for p in paths if p.suffix == ".onnx")
    return model, model.with_suffix(".onnx.json")


# Some voices (nl_NL-ronnie) open every clip with ~1 s of silence, which makes a
# listening exercise feel broken. Trim leading and trailing silence below
# -45 dB, keeping 80 ms so the first consonant is not clipped.
TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse")
TMP = ROOT / "tmp/voice-tmp"  # outside static/, which a concurrent build scans


def to_mp3(wav_bytes, dest):
    TMP.mkdir(parents=True, exist_ok=True)
    tmp = TMP / dest.name
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", "pipe:0", "-af", TRIM, "-ac", "1",
         "-codec:a", "libmp3lame", "-b:a", "48k", str(tmp)],
        input=wav_bytes, check=True,
    )
    tmp.rename(dest)


class MissingPhonemes(logging.Handler):
    """Piper only WARNS when a symbol is not in the voice's map, then silently
    drops it. Count those per course so a broken voice fails loudly."""

    def __init__(self):
        super().__init__()
        self.symbols = {}

    def emit(self, record):
        msg = record.getMessage()
        if msg.startswith("Missing phoneme"):
            sym = msg.rsplit(" ", 1)[-1]
            self.symbols[sym] = self.symbols.get(sym, 0) + 1


def speakable(text, voice_config):
    """The text to synthesise (the audio id still uses the course's own text).

    Course answers list alternatives as "він/вона" and notes in brackets; read
    "/" as a pause and drop the brackets. Text-input voices (phoneme_type
    "text", e.g. uk_UA-ukrainian_tts) map raw letters, lower-case only, so a
    capital was silently dropped ("Вода" spoken as "ода"): lower-case them and
    blank anything else the map lacks.
    """
    t = re.sub(r"\s*/\s*", ", ", text).replace("(", "").replace(")", "")
    if voice_config.get("phoneme_type") == "text":
        known = voice_config["phoneme_id_map"]
        t = t.lower().replace("\u2019", "'").replace("\u02bc", "'")
        t = "".join(ch if ch in known else " " for ch in t)
    return re.sub(r"\s+", " ", t).strip()


def course_texts(course):
    texts = set()
    for phrase in iterate_phrases(course):
        texts.add(remove_control_characters_for_display(phrase.in_target_language[0]))
    for word in iterate_words(course):
        texts.add(remove_control_characters_for_display(word.in_target_language[0]))
    return sorted(t for t in texts if t)


def main(only):
    catalog = json.loads(fetch(HF + "voices.json"))
    OUT.mkdir(parents=True, exist_ok=True)
    failed = []
    for name, v in VOICES.items():
        if name.startswith("_") or not v or (only and name not in only):
            continue
        course = load_course(str(ROOT / "courses" / name))
        if not course.settings.audio_settings.enabled:
            raise SystemExit(f"{name}: has a voice but audio is disabled; re-run fetch_courses.py")
        texts = course_texts(course)
        todo = [(t, OUT / f"{audio_id(course.target_language, t)}.mp3") for t in texts]
        todo = [(t, d) for t, d in todo if not d.exists()]
        print(f"{name}: {len(texts)} texts, {len(todo)} to generate ({v['voice']})", flush=True)
        if not todo:
            continue
        model, config = voice_files(v["voice"], catalog)
        voice = PiperVoice.load(model, config_path=config)
        voice_config = json.loads(config.read_text())
        syn = SynthesisConfig(speaker_id=v.get("speaker"), length_scale=LENGTH_SCALE)
        missing = MissingPhonemes()
        logging.getLogger("piper").addHandler(missing)
        for i, (text, dest) in enumerate(todo, 1):
            buf = io.BytesIO()
            with wave.open(buf, "wb") as w:
                voice.synthesize_wav(speakable(text, voice_config), w, syn_config=syn)
            to_mp3(buf.getvalue(), dest)
            if i % 200 == 0:
                print(f"  {i}/{len(todo)}", flush=True)
        logging.getLogger("piper").removeHandler(missing)
        if missing.symbols:
            print(f"  !! {name}: symbols missing from the voice map (dropped): {missing.symbols}", flush=True)
            failed.append(name)


    if failed:
        raise SystemExit(f"dropped symbols in: {', '.join(failed)}")


if __name__ == "__main__":
    main(set(sys.argv[1:]))
