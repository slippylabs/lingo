# russian-from-english: proofread notes

## Big picture
The course is an Interslavic/Church-Slavonic template machine-converted to Russian. Before fixes, roughly 60% of
the phrases were not modern Russian: "X есть Y" / "X суть Y" copulas, Church Slavonic "я есмь / ты еси / вы есте",
"я имею" for "I have", "много" for "very", "до" for "to", "-ою/-ею" instrumentals, "о N-ом часе" for clock times.
fixes.py rewrites these into natural Russian and keeps the English unless it was wrong too. Generated from
edits.txt by gen.py (also adds the dictionary entries the exporter needs, as "undefined" like the rest of the file).

## Systemic, not fixed per-course (parent should decide)
- EVERY Mini-dictionary gloss in this course is the literal string "undefined" (5,447 in the export), so hints
  show "undefined" to learners. Likely the same in all 16 Slavic sibling courses. Best fixed centrally
  (drop "undefined" definitions in the loader/UI, or fill the dictionaries), not by hand-editing thousands of lines.
- New words like "был бы" appear 3x with different English (I/you/he would be); "были бы" 3x. Left alone.

## Unsure / left alone
- пёс for "dog" throughout (собака is the everyday word; пёс is fine but bookish). Left.
- авто for "car" (colloquial/dated; машина is normal). Kept the word, used машина in two rewritten phrases.
- горшок for "pot" (кастрюля is the normal kitchen pot). Left.
- тушь for "ink" (today mostly mascara/drawing ink; чернила is ink). Left.
- каштановый for "brown" (only hair/horses; коричневый is generic brown). Left.
- Slash words "площадь/рынок", "артист/художник" are odd teaching items but internally consistent. Left.
- Skill "Numbers": "сто один велосипед = one hundred one bicycles" etc.: English plural is fine.
- "Сторона на карте показывает запад", "Она знает каждый контур Англии": strange but grammatical. Left.
- Ordinal-number skill rewritten to "двадцать минут второго" style times; the original "о первом часе двадцать"
  is not Russian. Translations changed accordingly (twenty past one...).
