"""
Audio file generation and management for LibreLingo courses.
"""
import hashlib
import logging
from pathlib import Path
from typing import Optional
from librelingo_types import Course
from librelingo_utils import remove_control_characters_for_display

logger = logging.getLogger(__name__)


def sanitize_filename(text: str) -> str:
    """Convert text to a safe filename."""
    # Remove control characters
    text = remove_control_characters_for_display(text)
    # Replace special characters with underscores
    safe_name = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in text)
    # Remove multiple underscores
    while '__' in safe_name:
        safe_name = safe_name.replace('__', '_')
    # Truncate if too long
    return safe_name[:100]


def get_audio_filename(text: str) -> str:
    """
    Generate a filename for audio based on text.
    Format: {sanitized_text}_{hash}.mp3
    """
    sanitized = sanitize_filename(text)
    text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
    return f"{sanitized}_{text_hash}.mp3"


def generate_audio_file(
    text: str,
    output_dir: Path,
    course: Course,
    settings=None
) -> Optional[str]:
    """
    Generate an audio file for the given text.
    Returns the filename (not full path) if successful, None otherwise.
    """
    if not course.settings.audio_settings.enabled:
        return None
    
    try:
        from librelingo_audios.tts import get_tts
        from librelingo_audios.config import get_config
    except ImportError:
        logger.warning("librelingo_audios not available, skipping audio generation")
        return None
    
    try:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Get TTS config
        config = get_config()
        tts_config = config.get("tts", {})
        tts = get_tts(tts_config.get("provider", "gtts"), tts_config)
        
        # Generate filename
        filename = get_audio_filename(text)
        filepath = output_dir / filename
        
        # Skip if already exists
        if filepath.exists():
            logger.info(f"Audio file already exists: {filename}")
            return filename
        
        # Generate audio
        logger.info(f"Generating audio: {filename}")
        tts.generate(text, str(filepath))
        
        return filename
    except Exception as e:
        logger.error(f"Failed to generate audio for '{text}': {e}")
        return None
