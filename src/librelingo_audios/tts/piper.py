import subprocess
from pathlib import Path
from . import TTS

class PiperTTS(TTS):
    def __init__(self, config):
        self.voice = config["voice"]
        voices_dir = config.get("piper_voices_dir")
        if voices_dir:
            voices_dir = Path(voices_dir)
        else:
            voices_dir = Path.home() / "piper-voices"

        self.voice_model = Path(config.get("voice_model") or voices_dir / f"{self.voice}.onnx")
        self.voice_config = Path(config.get("voice_config") or voices_dir / f"{self.voice}.onnx.json")

        if not self.voice_model.exists():
            raise FileNotFoundError(f"Piper voice model not found: {self.voice_model}")
        if not self.voice_config.exists():
            raise FileNotFoundError(f"Piper voice config not found: {self.voice_config}")

    def generate(self, text: str, output_file: str):
        command = [
            "piper",
            "--model", str(self.voice_model),
            "--config", str(self.voice_config),
            "--output_file", output_file,
        ]
        subprocess.run(command, input=text.encode("utf-8"), check=True)
