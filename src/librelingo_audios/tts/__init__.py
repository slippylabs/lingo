from abc import ABC, abstractmethod

class TTS(ABC):
    @abstractmethod
    def generate(self, text: str, output_file: str):
        pass

def get_tts(provider: str, config: dict) -> TTS:
    if provider == "piper":
        from .piper import PiperTTS
        return PiperTTS(config)
    elif provider == "gtts":
        from .gtts import GTTS
        return GTTS(config)
    elif provider == "polly":
        from .polly import PollyTTS
        return PollyTTS(config)
    else:
        raise ValueError(f"Unknown TTS provider: {provider}")


# Please note GTTS and Polly have not been tested
