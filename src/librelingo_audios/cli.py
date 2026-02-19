#!/usr/bin/env python3
import os
import sys
import yaml
from tts import get_tts

def load_config():
    with open("librelingo_audios/config.yaml", "r") as file:
        return yaml.safe_load(file)

def load_course_yaml(course_path):
    yaml_path = os.path.join(course_path, "course.yaml")
    with open(yaml_path, "r") as file:
        return yaml.safe_load(file)

def generate_course_audio(course_path, output_dir, course_name):
    # Load config
    config = load_config()
    course_config = load_course_yaml(course_path)

    # Check, if audio has been activated
    if not course_config.get("Settings", {}).get("Audio", {}).get("Enabled", False):
        print("Audio generation is disabled in course.yaml")
        return

    # TTS-Provider from config
    tts_config = {**config["tts"], **course_config.get("Settings", {}).get("TTS", [{}])[0]}
    tts = get_tts(tts_config["provider"], tts_config)

    # Create output folder
    os.makedirs(output_dir, exist_ok=True)

    # Beispiel: Lade alle Sätze aus dem Kurs
    sentences = [
        "Hallo, wie geht es dir?",
        "Ich lerne eine neue Sprache.",
        "Das Wetter ist heute schön."
    ]

    for i, sentence in enumerate(sentences):
        output_file = os.path.join(output_dir, f"{course_name}_{i}.mp3")
        print(f"Generating audio for: {sentence}")
        tts.generate(sentence, output_file)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python cli.py <course_path> <output_dir> <course_name>")
        sys.exit(1)

    course_path = sys.argv[1]
    output_dir = sys.argv[2]
    course_name = sys.argv[3]

    generate_course_audio(course_path, output_dir, course_name)
