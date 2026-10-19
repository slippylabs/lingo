#!/usr/bin/env python3
"""slippylabs: download every deploy:true course in apps/web/config/courses.json
into courses/<jsonFolder>/ (the directory holding the shallowest course.yaml, plus
the repo's top-level LICENSE).
Non-interactive replacement for installSelectedCourses/installExternalCourse.sh.
Then applies our corrections from course_fixes.json (--fixes-only re-applies them
without downloading)."""
import io, json, re, shutil, subprocess, sys, tempfile, urllib.request, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = ROOT / "apps/web/config/courses.json"
OUT = ROOT / "courses"
VOICES = json.loads((ROOT / "scripts/slip/voices.json").read_text())
FIXES = json.loads((ROOT / "scripts/slip/course_fixes.json").read_text())


def apply_fixes(name):
    """Our corrections to upstream content (course_fixes.json). Safe to re-run:
    a fix already in place is skipped; one that no longer matches fails."""
    for fx in FIXES.get(name, []):
        f = OUT / name / fx["file"]
        y = f.read_text()
        if fx["new"] and fx["new"] in y:
            continue
        n = y.count(fx["old"])
        if n == 1:
            f.write_text(y.replace(fx["old"], fx["new"]))
        elif not (n == 0 and not fx["new"]):
            raise SystemExit(f"{name}/{fx['file']}: fix no longer matches ({fx['why']})")


def set_audio(course_yaml: Path, voice):
    """Point the course's Audio settings at our local Piper voice, or disable
    audio when there is none. Upstream courses name Polly/gTTS (cloud TTS),
    which slippylabs does not use."""
    y = course_yaml.read_text()
    m = re.search(r"^(  Audio:\n)((?:    .*\n|      .*\n|\s*\n)*)", y, re.M)
    block = "  Audio:\n    Enabled: %s\n" % ("True" if voice else "False")
    if voice:
        block += "    TTS:\n      - Provider: Piper\n        Voice: %s\n        Engine: local\n" % voice["voice"]
    if m:
        y = y[: m.start()] + block + y[m.end():]
    else:
        raise SystemExit(f"{course_yaml}: no Settings/Audio block to patch")
    course_yaml.write_text(y)


def zip_url(url):
    if url.endswith(".zip"):
        return [url]
    base = url.rstrip("/")
    return [f"{base}/archive/refs/heads/{b}.zip" for b in ("main", "master")]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "slippylabs-lingo"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def clone_as_zip(url):
    """Codeberg sometimes serves an empty archive; build the zip from a clone."""
    repo = url.split("/archive/")[0]
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["git", "clone", "-q", "--depth", "1", repo, f"{d}/repo"], check=True)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as z:
            for f in sorted(Path(d, "repo").rglob("*")):
                if f.is_file() and ".git" not in f.relative_to(d).parts:
                    z.write(f, str(f.relative_to(d)))
        return buf.getvalue()


def main(only=None):
    ok, bad = [], []
    for c in json.loads(CFG.read_text()):
        name = c["paths"]["jsonFolder"]
        if not c["deploy"] or (only and name not in only) or name in VOICES["_skip"]:
            continue
        data = None
        for u in zip_url(c["url"]):
            try:
                data = fetch(u)
                break
            except Exception as e:  # try next branch name
                err = e
        if data is None:
            bad.append((name, str(err)))
            continue
        z = zipfile.ZipFile(io.BytesIO(data))
        if not any(f.endswith("course.yaml") for f in z.namelist()):
            z = zipfile.ZipFile(io.BytesIO(clone_as_zip(c["url"])))
        dest = OUT / name
        shutil.rmtree(dest, ignore_errors=True)
        names = [m.filename for m in z.infolist() if not m.is_dir()]
        yamls = sorted((f for f in names if f.endswith("/course.yaml")), key=lambda f: f.count("/"))
        if not yamls:
            bad.append((name, "no course.yaml in archive"))
            continue
        top = names[0].split("/", 1)[0] + "/"
        croot = yamls[0][: -len("course.yaml")]  # e.g. repo-main/course/ or repo-main/
        n = 0
        for f in names:
            if f.startswith(croot):
                rel = f[len(croot):]
                if croot == top and rel.startswith("."):
                    continue  # skip .github etc. when the course is the repo root
            elif f.startswith(top) and "/" not in f[len(top):] and \
                    f[len(top):].upper().startswith(("LICENSE", "COPYING")):
                rel = f[len(top):]
            else:
                continue
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(z.read(f))
            n += 1
        if not (dest / "course.yaml").exists():
            bad.append((name, "no course/course.yaml in archive"))
            shutil.rmtree(dest, ignore_errors=True)
            continue
        if name not in VOICES:
            raise SystemExit(f"{name}: add it to scripts/slip/voices.json (voice or null)")
        set_audio(dest / "course.yaml", VOICES[name])
        apply_fixes(name)
        ok.append((name, n))
    for name, n in ok:
        print(f"ok   {name} ({n} files)")
    for name, e in bad:
        print(f"FAIL {name}: {e}")


if __name__ == "__main__":
    if sys.argv[1:2] == ["--fixes-only"]:  # re-apply to the courses already downloaded
        for name in sys.argv[2:] or [k for k in FIXES if not k.startswith("_")]:
            apply_fixes(name)
    else:
        main(set(sys.argv[1:]) or None)
