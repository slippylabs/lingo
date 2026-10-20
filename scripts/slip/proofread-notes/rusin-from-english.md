# rusin-from-english: unsure / not fixed

## Cross-course (affects 15 of the 16 Slavic courses; Ukrainian is the exception)
- **Every mini-dictionary gloss is the literal string "undefined"** (4332 of 5689 entries here; 4289-4394 in each
  sibling). The exporter carries it through, so word hints show "undefined" (index.json dict: "я":["I","undefined"]).
  Best fixed in code (drop "undefined" glosses at export or in the hint UI) rather than per course. I did not
  fill them in. New entries I added carry real glosses.
- course.yaml "Special characters" lists Interslavic Latin letters (ě š č ž Ł) for a Cyrillic course. It's not
  used by the web UI, so I left it.
- The course is an Interslavic template machine-carried into Rusin. The vocabulary mixes Prešov/Lemko/Pannonian
  forms with Russian and Interslavic ones. A native reviewer would change much more than I did.

## Plausible errors left alone (not certain of the right Rusin)
- Pronouns он/она/оно/они: the Prešov standard has він/вона/воно/вони (the course's own notes use Вон). Consistent in the exercises, so I left it.
- "много" used for "very" (Она много мудра, Мелон є много смачный): standard is барз/дуже. Several sentences
  also drop the copula (Она много мудра, Мы много мудры).
- 1st person "Грам в футбол" vs "Я граю" elsewhere (грам is Pannonian).
- барже glossed "fast", "quickly" and "quick" (Он бігає барже, Єго мозок є барже): it usually means "more/faster", while борзо = quickly.
- Тамто утро (neuter) vs the тамтотот/тамтота pattern: тамтото?
- штолїк = "chair" (usually a small table; chair = стілець/кріселко). колесо = "bicycle" (wheel; bicycle = бицикель). паланка = pancake (палачінта?).
- дозрїв glossed "ripe" is a past-tense verb (adjective дозрїлый). ягода = strawberry (berry).
- Вишня росте на дївї: дївї looks wrong (дереві).
- Нїмець жиє в Нїмецьку: Germany = Нїмеччина / Нїмецько?
- много люди / Шофер веде люди: genitive/accusative should be людей. Учитель каже учеником: dative ученикам.
- Numbers: штирдцять (40) and єдиннадцять (11, double н) are spelled oddly but consistently. I aligned the
  number notes to the course's own forms, not the other way round. о третьий / о третьій are inconsistent.
- Conditional skill: the forms "быв быс слухав", "были бысме ... помагали" are garbled. The note teaches a
  different (simpler) system.
- Он дає собі спокой = "He stops troubling others" (the idiom is more like "he gives up / leaves it be").
  "Тым хторі лежать спати спокойного сна" is garbled.
- Гаты taught as "underwear" but two phrases say "shorts". I left both.
- бїлый (Colours) vs білый (Studying, after my Latin-i fix): one of them should win. Standard is білый.
- Comparatives built with выше ("Он є выше высокый і сильный нїж он") are not Rusin; the English is circular too.
- Fixes I made where the error was certain but the replacement is my best Rusin (worth a native check):
  мокрый→синїй/синє/синї/синю (blue), ясень→осїнь with locative "в осени", Ты→Тоты (these), часы→часу.
- Intro notes still use Вон, читати/книга (vs the course's Он, чітати/кнїга) and a few other spellings. I only fixed
  the forms that contradict what the exercises accept.
