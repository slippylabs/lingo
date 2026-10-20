# polish-from-english: unsure / not fixed

## Systemic (affects all 16 Slavic courses, best fixed in code, not content)
- Every mini-dictionary gloss is the literal string "undefined" (4394 entries in Polish alone). If the app
  shows mini-dictionary glosses as hover hints, learners see "undefined". Suggest the loader/exporter treat
  "undefined" as no gloss. New entries added by fixes.py follow the same convention.
- Phrases with slash alternatives in the target text ("Plac/Rynek", "Szofer/Kierowca", "zdrowy/zdrowa",
  "pracuję/pracujemy") — check how the exercise treats a typed answer; many sentences rely on it.
- The course is a word-for-word adaptation of the Interslavic template, so several calques remain that are
  understandable but unidiomatic: "Most idzie przez rzekę", "Ulica idzie do sklepu", "Droga idzie przez las",
  "Światła drogowe pokazują czerwone" (Polish: "Na światłach jest czerwone" / sygnalizacja świetlna),
  "Radość idzie z wewnątrz", "Państwem jest Polska", "To jest dom z rodziną".

## Plausible but left alone
- "Oni dają zwierzęciu łapę. / They give their hand to the animal." — łapa is a paw; sentence is odd either way.
- "Ona mówi w języku słowiańskim" / "Ona zna rosyjski i słowiański" — there is no single 'Slavic language'
  in Polish usage (template residue from Interslavic).
- "wybacz = excuse me" (wybacz is 'forgive (me)'); "rano = morning" (it is 'in the morning'; ranek = morning).
- "patrzeć = to watch" (it is 'to look'; the phrases use oglądać).
- "równy = straight" ('even/level'; straight is prosty).
- "kupiec/klient = customer" (kupiec is a merchant); "paragon/czek" (czek is a cheque).
- "On gniewnie/źle każe mu pracować" (źle is 'badly', not 'angrily').
- "Wstydliwie on czuje wstyd" — garbled, but I could not find a minimal fix that keeps the skill's adverb.
- "Kto ty jesteś?" kept: it is the famous line from Bełza's poem, though everyday Polish says "Kim jesteś?".
- Duplicate word cards: czerwony twice in colours; robić twice in professions (wrong 'to work' one removed).
- Time phrases without minutes ("o piątej godzinie") left as is; natural Polish is "o piątej" / "o godzinie piątej".
- Intro .md: "Feminine ... -ej (after a vowel)" in the genitive note is dubious (that is adjectival nouns like
  królowej); numbers010.md omits that men-only nouns take the genitive with 2-4 (dwóch chłopców), which the
  exercises use.
