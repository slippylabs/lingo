# german-from-english: unsure / not fixed

- professions.yaml is NOT listed in basics/module.yaml, so it is never exported (unreachable). If it is ever
  enabled it needs fixes first: "Die Krankenschwester lebt hier" -> "The nurses live here" (singular German,
  plural English; should be "The nurse lives here"); "Der Bauer sieht Tiere" -> "The farmer sees the animals"
  (no article in German: "sees animals"); mini-dictionary German words are lower-case (arzt, kellner, tiere,
  sänger) and "feuerwehrmann: firefighters" is singular->plural; "sehen: sees" should be "sieht: sees".
- clothes: accepted German "Danke Ihnen" is unidiomatic on its own ("Ich danke Ihnen" is the normal form). Left.
- clothes: Hemd synonyms "Trikot" (sports jersey) and "Hemdbluse" (shirt-blouse) are loose, and Hut synonyms
  Kappe/Mütze are "cap"/"beanie". Accepted answers only, harmless. Left.
- plurals: Studenten synonym "Schüler" means school pupils, not students. Accepted answer only. Left.
- food: accepted "Das Paar säuft Bier" is a pejorative register (guzzles); I removed only the hint.
- nature: English hint "have: (Ich) habe" for "Have a good trip!" is a literal mis-hint (the phrase is Gute Reise). Left.

## Our notes (apps/web/src/notes/german-from-english) vs the course
- food.md: "Cäcilie trinkt — Cäcilie drinks" and "Cäcilie trinkt Wasser — Cäcilie drinks water": the course's
  English answer is "Cecilia drinks water". The English side should say Cecilia (keep notes = course answers).
- hello.md, plurals.md: match the course after the capitalisation fixes ("Hello", "Green cats").
- Everything else checked against the yaml (articles, phrases, translations): correct.
