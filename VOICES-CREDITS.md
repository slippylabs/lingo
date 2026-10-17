# Lesson audio voices

All lesson audio on lingo.slippylabs.com is generated locally with [Piper](https://github.com/rhasspy/piper)
(`scripts/slip/make_audio.py`); no cloud text-to-speech is used. Voice models come from
[rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices). Each voice keeps its dataset licence:

| Voice | Used for | Dataset | Licence |
|---|---|---|---|
| `es_ES-davefx-medium` | spanish | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `pt_BR-faber-medium` | brazilian-portuguese | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `de_DE-thorsten-medium` | german | https://github.com/thorstenMueller/Thorsten-Voice | CC0 |
| `fr_FR-siwis-medium` | french | https://datashare.is.ed.ac.uk/handle/10283/2353 | CC-BY 4.0 |
| `nl_NL-ronnie-medium` | dutch | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `pl_PL-gosia-medium` | polish | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `ru_RU-dmitri-medium` | russian | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `uk_UA-tetiana-high` | ukrainian | https://github.com/egorsmkv/ukrainian-tts-datasets | Apache 2.0 |
| `cs_CZ-jirka-medium` | czech | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `sk_SK-lili-medium` | slovak | https://github.com/OHF-Voice/voice-datasets | CC0 |
| `sl_SI-artur-medium` | slovenian | https://huggingface.co/datasets/ppisljar/artur_studio_tts/ | https://creativecommons.org/licenses/by/4.0/ |
| `sr_RS-serbski_institut-medium` | upper-sorbian, lower-sorbian | https://github.com/marytts/serbski-institut-dsb-data | https://creativecommons.org/licenses/by-nc-sa/4.0/ |

`sr_RS-serbski_institut-medium` is labelled Serbian upstream, but its two speakers are Lower Sorbian
(`dsb`, speaker 0) and Upper Sorbian (`hsb`, speaker 1), recorded by the Serbski institut; it is used only for the
two Sorbian courses. Courses with no native Piper voice have audio switched off rather than borrowing a
neighbouring language's voice.
