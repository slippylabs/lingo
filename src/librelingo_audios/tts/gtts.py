from . import TTS

class GTTS(TTS):
    def __init__(self, config):
        self.lang = config.get("language", "en")

    def generate(self, text: str, output_file: str):
        try:
            from gtts import gTTS
        except Exception as e:
            raise RuntimeError("gTTS is not installed. Install with `pip install gTTS`.") from e

        t = gTTS(text=text, lang=self.lang)
        t.save(output_file)
