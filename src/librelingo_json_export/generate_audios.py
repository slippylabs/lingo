#!/usr/bin/env python3
"""
Generate audio files for a course from its challenge JSON files.
This is called after JSON export to create local voice files.
"""
import json
import logging
import sys
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_audio_config() -> dict:
    """Load TTS configuration."""
    try:
        import yaml
        config_path = Path(__file__).parent / "config.yaml"
        with open(config_path) as f:
            config = yaml.safe_load(f)
        return config.get("tts", {})
    except Exception as e:
        logger.warning(f"Could not load config.yaml: {e}")
        return {}


def get_tts_provider(config: dict):
    """Get TTS provider based on config."""
    try:
        from librelingo_audios.tts import get_tts
        provider_name = config.get("provider", "gtts")
        return get_tts(provider_name, config)
    except ImportError:
        logger.error("librelingo_audios not installed. Install with: pip install gTTS")
        return None


def sanitize_filename(text: str) -> str:
    """Convert text to a safe filename."""
    safe_name = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in text)
    while '__' in safe_name:
        safe_name = safe_name.replace('__', '_')
    return safe_name[:100]


def get_audio_filename(text: str) -> str:
    """Generate filename for audio file."""
    import hashlib
    sanitized = sanitize_filename(text)
    text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
    return f"{sanitized}_{text_hash}.mp3"


def extract_audio_texts_from_challenges(challenges_json: dict) -> dict:
    """
    Extract all texts that need audio from challenges.
    Returns dict of {text: audio_filename}
    """
    texts = {}
    
    if not isinstance(challenges_json, dict):
        return texts
    
    challenges = challenges_json.get("challenges", [])
    for challenge in challenges:
        if challenge.get("type") == "listeningExercise":
            answer = challenge.get("answer")
            if answer and answer not in texts:
                texts[answer] = get_audio_filename(answer)
    
    return texts


def generate_course_audios(course_dir: Path, force: bool = False) -> int:
    """
    Generate audio files for all challenges in a course.
    Returns count of generated files.
    """
    config = load_audio_config()
    tts = get_tts_provider(config)
    
    if not tts:
        logger.error("TTS provider not available")
        return 0
    
    voices_dir = course_dir / "voices"
    voices_dir.mkdir(exist_ok=True)
    
    generated_count = 0
    challenges_dir = course_dir / "challenges"
    
    if not challenges_dir.exists():
        logger.warning(f"No challenges directory found in {course_dir}")
        return 0
    
    # Collect all texts that need audio
    texts_to_generate = {}
    
    for challenge_file in challenges_dir.glob("*.json"):
        try:
            with open(challenge_file) as f:
                challenges_json = json.load(f)
            
            texts = extract_audio_texts_from_challenges(challenges_json)
            texts_to_generate.update(texts)
        except Exception as e:
            logger.error(f"Error processing {challenge_file}: {e}")
            continue
    
    # Generate audio files
    for text, filename in texts_to_generate.items():
        filepath = voices_dir / filename
        
        if filepath.exists() and not force:
            logger.info(f"Audio file already exists: {filename}")
            continue
        
        try:
            logger.info(f"Generating audio: {filename} for '{text}'")
            tts.generate(text, str(filepath))
            generated_count += 1
        except Exception as e:
            logger.error(f"Failed to generate audio for '{text}': {e}")
            continue
    
    return generated_count


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_audios.py <course_directory>")
        sys.exit(1)
    
    course_dir = Path(sys.argv[1])
    force = "--force" in sys.argv
    
    if not course_dir.exists():
        logger.error(f"Course directory not found: {course_dir}")
        sys.exit(1)
    
    count = generate_course_audios(course_dir, force=force)
    logger.info(f"Generated {count} audio files")
