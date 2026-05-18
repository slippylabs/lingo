from . import TTS

class PollyTTS(TTS):
    def __init__(self, config):
        self.voice = config.get("voice")
        self.engine = config.get("engine", "standard")
        self.aws_region = config.get("aws_region")

    def generate(self, text: str, output_file: str):
        raise RuntimeError(
            "AWS Polly is not supported by the local audio generator. "
            "Please switch the provider to 'gtts' or 'piper' in src/librelingo_audios/config.yaml "
            "or in the course Settings.Audio.TTS block."
        )
