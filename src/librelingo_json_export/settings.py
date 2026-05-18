import collections

Settings = collections.namedtuple(
    "Settings",
    [
        "dry_run",
        "generate_audio",
        "audio_output_dir",
    ],
)

DEFAULT_SETTINGS = Settings(
    dry_run=False,
    generate_audio=False,
    audio_output_dir=None,
)
