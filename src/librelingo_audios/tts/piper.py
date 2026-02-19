import subprocess
from . import TTS

class PiperTTS(TTS):
    def __init__(self, config):
        self.voice_model = f"/home/{config.get('user', 'user')}/piper-voices/{config['voice']}.onnx"
        self.voice_config = f"/home/{config.get('user', 'user')}/piper-voices/{config['voice']}.onnx.json"

    def generate(self, text: str, output_file: str):
        command = [
            "piper",
            "--model", self.voice_model,
            "--config", self.voice_config,
            "--output_file", output_file
        ]
        process = subprocess.Popen(command, stdin=subprocess.PIPE)
        process.communicate(input=text.encode('utf-8'))
