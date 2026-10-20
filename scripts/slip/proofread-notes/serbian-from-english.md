# serbian-from-english proofread notes

## The upstream course was not Serbian
All 38 skill YAMLs were Interslavic/Russian-flavoured pseudo-Serbian in Cyrillic: јест/сут (is/are),
тож, кто, что, быстро (Russian ы), желудок, дочерка, матка (= "womb" in Serbian, used for "mother"),
"Он јест мојим братом", "Она је месо" for "she is eating meat", "Он да миши сир" = "On da myši syr" as the
English. Nearly every phrase needed changing, so each YAML is a whole-file replacement generated from
content.txt + sr.tsv/en.tsv by gen.py (re-run gen.py, then run.sh, after editing any of them).
Kept: skill Name/Id headers, module structure, the character name Bartek, and the English sentences
wherever they were correct. Changed English only where it was wrong or garbled; the old wording is kept as an
Alternative translation where it was still acceptable.
Standard chosen: ekavian, Cyrillic (matches the intro notes, which were already real Serbian).

## Hints were "undefined" (affects 15 sibling courses, not only this one)
Every Mini-dictionary value upstream was the literal string `undefined`; the loader merges it into each
word's hint, so learners saw "sister / undefined". Replaced here with real glosses. Same in belarusian,
church-slavonic, croatian, czech, interslavic, kashubian, lower-sorbian, old-church-slavonic, polish, rusin,
russian, silesian, slovak, slovenian, upper-sorbian (grep ': undefined$' counts 4289-4394 per course;
ukrainian is clean). A loader/exporter-side filter dropping "undefined" definitions would fix the
hint display for all of them at once; per-course real glosses are the proper fix.

## Judgement calls (reasonable, not certain)
- Demonstratives: upstream taught то/та = "this", тај = "that". Taught as standard Serbian ово/ова/овај =
  this, тај/та = that, онај = that over there.
- Ordinal-number skill: upstream English "at twenty past the first hour" (ordinals for clock time) is not how
  Serbian tells time. Rewritten as cardinal clock times (у један и двадесет = at twenty past one); the
  ordinal words are still taught in New words and the "two hundred third computer" items.
- Toast "На здравље!" (upstream) is said after sneezing; used "У здравље!" (alt "Cheers!").
- "Може." (upstream "Perhaps") means "OK/sure" in Serbian; replaced by "Можда."
- Week = седмица (недеља also means Sunday, which the same skill teaches).
- "Нова година је у децембру" was factually wrong; now "Дочек Нове године" = New Year's Eve.
- Instrumental-skill items like "He is my brother": Serbian uses the nominative (Он је мој брат).
- Words whose spelling changed lose their per-word review history (expected).
