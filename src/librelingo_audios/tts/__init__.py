from abc import ABC, abstractmethod

class TTS(ABC):
    @abstractmethod
    def generate(self, text: str, output_file: str):
        pass

def get_tts(provider: str, config: dict) -> TTS:
    # slippylabs: only local text-to-speech. The gTTS (Google) and Polly (AWS)
    # providers sent course text to cloud services and were removed; use
    # scripts/slip/make_audio.py, which drives Piper on this machine.
    provider = provider.lower()

    if provider == "piper":
        from .piper import PiperTTS
        return PiperTTS(config)
    raise ValueError(f"TTS provider {provider!r} is not available; only local Piper is supported")
