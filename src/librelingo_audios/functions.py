import os
import yaml
from typing import List

def extract_sentences(course_path: str) -> List[str]:
    """Extrahiert alle Sätze aus den Skill-YAML-Dateien des Kurses."""
    sentences = set()  # Verwende ein Set, um Duplikate zu vermeiden

    # Durchsuche alle Ordner im Kursverzeichnis
    for root, dirs, files in os.walk(course_path):
        for file in files:
            if file.endswith(".yaml") and file.startswith("_"):
                continue  # Ignoriere versteckte Dateien
            if file.endswith(".yaml"):
                skill_path = os.path.join(root, file)
                with open(skill_path, "r", encoding="utf-8") as f:
                    try:
                        skill = yaml.safe_load(f)
                        if skill and "Phrases" in skill:
                            for phrase in skill["Phrases"]:
                                if "Phrase" in phrase:
                                    sentences.add(phrase["Phrase"])
                    except Exception as e:
                        print(f"Fehler beim Laden der Datei {skill_path}: {e}")

    return list(sentences)
