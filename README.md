# LibreLingo on Slippy Labs

**Live:** https://lingo.slippylabs.com/ · listed on [projects.slippylabs.com](https://projects.slippylabs.com/#tab=apps)

Our fork of [LibreLingoRelive](https://codeberg.org/LibreLingoRelive/LibreLingoRelive), the community
continuation of [LibreLingo](https://github.com/kantord/LibreLingo): Duolingo-style lessons from
community-written courses. AGPL-3.0, like upstream. Upstream is the `upstream` remote.

What this fork changes (v2, `slip-v2.0.0`, rebuilt the learning side; upstream's exercise types and
course format are kept):

- **Teach first.** A lesson introduces 3-5 new words or phrases on teach cards (picture, sound, meaning, an
  example sentence from the same lesson) before any exercise asks for them, then goes from recognising to
  reading to typing and hearing. Lessons with notes show them first.
- **Per-word spaced repetition** (`apps/web/src/learn/srs.ts`): Leitner boxes with 0/1/3/7/16/35/90-day
  intervals. Right moves a word up a box, wrong drops it two; a hint keeps it where it is. A *Review* session
  brings back what's due, harder each time; *Weak spots* drills the words and exercise kinds you miss most.
- **A personal plan** (`learn/plan.ts`): a goal (travel, conversation, reading, general) sets the exercise mix,
  daily minutes set new words per day, and a week view projects reviews and lessons with a finish date. New
  words pause when reviews pile past three days' worth.
- **Placement check** (`learn/placement.ts`): two questions per lesson, unit by unit; 80% marks a unit known.
- **Feedback that teaches:** the right answer with your wrong words marked, the meaning, a word-by-word
  breakdown, accent-only and one-letter slips told apart from mistakes; tap any word for its meaning.
- **Grammar notes** written for the Spanish, Brazilian Portuguese and German lessons that had none, plus the
  gaps in French and Dutch (`apps/web/src/notes/`, checked by `npm run check:notes` against the course words).
- **New UI:** plain CSS tokens with dark mode, mobile-first, 44px targets; Bulma, Font Awesome and the
  uncompiled `<style type="text/scss">` components are gone.
- **Static build.** adapter-static; course pages render in the browser where the progress lives
  (`localStorage`, `lingo:v2/<course>/…`; export/import as a file on the Plan page). `scripts/buildIndex.js`
  writes a compact per-course item index at build time.
- **Lesson audio is generated locally** with [Piper](https://github.com/rhasspy/piper)
  (`scripts/slip/make_audio.py`). The cloud gTTS/Polly providers were removed. Courses with no native Piper
  voice have audio off. Credits: [VOICES-CREDITS.md](VOICES-CREDITS.md).
- No analytics, no account, nothing leaves the browser.

Tests: `cd apps/web && npm test` (vitest: scheduler, plan, session builder, placement, answer checking).

## Building

```sh
git lfs install --local && git lfs pull            # course pictures
python3 -m venv .venv && .venv/bin/pip install -e src piper-tts
.venv/bin/python scripts/slip/fetch_courses.py     # every deploy:true course in apps/web/config/courses.json
.venv/bin/python scripts/slip/make_audio.py        # Piper audio into apps/web/static/voice (skips existing)
npm ci && (cd apps/web && PYTHON_BIN=$PWD/../../.venv/bin/python npm run build)
deploy/deploy.sh [rev]                             # build from a commit and swap into /var/www/lingo.slippylabs.com
```

`scripts/slip/voices.json` maps each course to its Piper voice (or `null`), and `fetch_courses.py` patches
each course's Audio settings from it. Courses and audio are not committed: they are third-party content and
regenerable.

---

# LibreLingoRelive
*a community-owned language-learning platform*

> [!CAUTION]
> Not ready for production use. See [security issues](https://codeberg.org/LibreLingoRelive/LibreLingoRelive/issues/16).

LibreLingo's mission is to create a modern language-learning platform that is owned by the community of its users. All software is licensed under AGPLv3, which guarantees the freedom to run, study, share, and modify the software. Course authors can choose their license freely. 

Here there is an article of [why the original author has built LibreLingo](https://dev.to/kantord/why-i-built-librelingo-280o).

# Why LibreLingoRelive?
LibreLingo is/was an open-source language learning platform originally created by Dániel Kántor. Due to technical issues with the Svelte framework, the project became non-functional a few years ago. Greg later forked the project as LibreLingoCommunity, successfully reviving it. However, due to time constraints, this version also stopped working. In November 2025, we decided to revive LibreLingo once again. We forked the project from LibreLingoCommunity (a fork of a fork) and are now actively maintaining and improving it.

# Documentation

Please read: [LibreLingoRelive Docs](https://codeberg.org/LibreLingoRelive/LibreLingoRelive_Docs)    

## Development

```
(Starting from the root of the repo)

# Install and load LFS (it's necessary for showing images)
git lfs install
git lfs pull 

then add a course or use the test-2 course and copy or clone it to courses.

# back to your root directory and add audio for your course
# if you have once generated the audio it's better to copy paste the folder instead of generating it all the time

PYTHONPATH=src python3.10 src/librelingo_audios/cli.py courses/language-from-language apps/web/static/voice language-from-language

# E.g. like this
 PYTHONPATH=src python3.10 src/librelingo_audios/cli.py courses/fr-from-en apps/web/static/voice fr-from-en

cd src
uv sync

mkdir -p ../apps/web/src/courses/
uv run python3 -m librelingo_json_export.cli $PATH_TO_COURSE_YAML_SOURCE_DIR ../apps/web/src/courses/$CONVERTED_COURSE_NAME

# E.g. like this:
uv run python3 -m librelingo_json_export.cli ~/dev/librelingo/courses/LibreLingo-ES-from-EN ../apps/web/src/courses/converted_ES-from-en

cd ../apps/web
npm ci
npm run dev
```

## Docker Setup

```
(Starting from the root of the repo)

# Install and load LFS (it's necessary for showing images)
git lfs install
git lfs pull 

then add a course or use the test-2 course and copy or clone it to courses.

# back to your root directory and add audio for your course

docker compose up -d

# generate the audio
# replace fr-from-en with your exact course name
docker-compose exec librelingo python3 src/librelingo_audios/cli.py /data/courses/fr-from-en /apps/web/static/voice fr-from-en 

# if you have once generated the audio it's better to copy paste the folder instead of generating it all the time

The service should be available under http://localhost:5173
```

## Contribution

You can contribute by:

* Help us coding (this repo | read [Contribute.md](https://codeberg.org/LibreLingoRelive/LibreLingoRelive/src/branch/main/Contribute.md)) 
* Help us writing the [Documentation](https://codeberg.org/LibreLingoRelive/LibreLingoRelive_Docs)
* Create your own language course and set it up [Read the Documentation](https://codeberg.org/LibreLingoRelive/LibreLingoRelive_Docs)

## License

LibreLingoRelive is licensed under the AGPL-3.0 license. In addition, course content and other creative content might be licensed under different licenses, such as CC. 
