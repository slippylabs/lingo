# church-slavonic-from-english: unsure / not fixed

## Systemic (needs a code or all-course decision, not per-line fixes)
- **Every mini-dictionary gloss is the literal string "undefined"** (4,366 of 4,366 entries). They reach the
  site: apps/web/src/courses/church-slavonic-from-english/index.json `dict` gives e.g. азъ -> ["I","undefined"],
  моꙗ -> ["undefined"]. Polish, Interslavic and Russian are the same (all 16 Slavic courses share the template).
  Suggest filtering "undefined" in the loader/exporter (or dictionary.ts) once for all of them.
- The course is a mechanical transliteration of the Polish/Interslavic template, not real Church Slavonic.
  Left alone because each is course-wide and "fixing" means rewriting:
  - 3rd-person singular written as a bare stem: глаголи, готови (should be глаголѥтъ, готовитъ).
  - Polish "to" carried over as a copula тъ ("Онъ тъ добрии приꙗтєль", "Любовь тъ силььна ѥмоциꙗ").
  - мьного used for "very" (Church Slavonic is зѣло); missing copula in "Она мьного мѫдра".
  - Modern loans with no Church Slavonic form: аѵто, компютєр, фꙋтболъ, пижама, викєндъ, Хондꙋрасъ.
  - Russian/Ukrainian letters and forms: й in аньглийськомъ, спокойно, спокойноѥго; ꙗ as "I" (fixed where
    it appeared); ціка́вѣиши ("interesting", Ukrainian) in the comparisons note.
  - ѥ/є spelling (exercises) vs є҆ / е҆ and то́й/та̀ (notes): learners see two different orthographies.
- **частъ is taught as "hour"** and used in every clock phrase ("о пръвои части"); частъ means "part",
  hour is часъ. Course-wide, so not changed.
- Conditional: the course teaches бꙑши for "you would" (and used бꙑ for he/they), but the note's own
  aorist table (and real OCS) has 2nd sg бꙑ. I only fixed "тꙑ бꙑхъ" (an I-form) to the course's бꙑши.
- Past-tense note teaches aorist/imperfect; the exercises only use the l-participle (бꙑлъ, шєлъ).
- Accusative note: "plural masculine animate = genitive plural" is a later Russian rule, not OCS
  (OCS acc. pl. = -ꙑ/-ѧ). Also its examples о҆тє́цъ / мꙋжє́и. Not certain enough for Church Slavonic usage.

## Individual items I was unsure about
- Words given in an oblique case as the dictionary form: кошꙋлѭ (shirt, accusative; used as subject in
  "Кошꙋлѭ ѥстъ въ скринѥ"), соли (salt, genitive).
- казати (кажєтъ) is translated "to show" but used as "says/tells" ("Она кажєтъ пьсꙋ" = She says to the dog).
- Drinks teaches чашька = glass, Kitchen uses чашька = cup and чаша = cup (I only added a "glass" alternative).
- гащє is taught as underwear but two answers say "shorts" (I added underwear alternatives, left "shorts").
- "Одєжь ѥстъ чистаѥи и тълико оужє бѣла" -> "only the underwear is white": the sentence has no underwear and
  чистаѥи is garbled.
- "Тръпѣти тълико хощємъ къгда любимъ" literally "we want to suffer only when we love".
- "О томъ оужє дълъго ває вѣсть." and "Тꙑмъ кътори лєжѧтъ сѧ спати спокойноѥго съна." are garbled.
- "Тꙑ ѥси ꙗицє?" reads as "Are you an egg?", because the course spells ѣсти (eat) as ѥсти (ѥси = you are).
- "Она ѥстъ оучитєлѥмъ" uses the male teacher for "she" (the lesson teaches оучитєлька).
- "Оучитєль кажєтъ оучєникамъ дѣлати" -> "tells the students to do" (incomplete English, as in the source).
- "Сь ѥстъ вꙑшє красьнъ чловѣкъ нєже тъи" -> "He is ..." (сь = this).
- Spelling variants: хладьнъ/хладънъ, бързо/бръзо/бързъи, вилица/вилѥцєѭ, тꙑжьдьнь/тꙑждньꙋ,
  работъникъ/работникъ, станициꙗ/станицю, срьци/сръдьцє, нашеѭ (е vs є).
- Notes: "ѩ́гньчии гла́съ є҆́сть то́нъ" ("a lamb's voice is thin": то́нъ is not "thin"); the "Plural (all
  genders)" adjective lines in the instrumental/dative/locative notes have the same feminine problem as the noun
  lines I fixed; Nominative plural до́ми for a u-stem (домове); the "-а- stem" present table is fine.
- course.yaml Repository points to the Interslavic repo (LibreLingo-Isv-from-EN).
