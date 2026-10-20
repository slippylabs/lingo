# Slovak: unsure / out of scope (not in fixes.py)

## Course-wide (affects all 16 Slavic template courses, for the parent)
- EVERY mini-dictionary gloss is the literal string "undefined" (4,319 entries in Slovak; Polish has 4,394).
  The exporter accepts it (truthy), so word hints show "undefined": ~3,740 in the exported JSON.
  Needs a global fix (generate glosses, or suppress "undefined" hints in the UI), not per-item edits.
  My added entries use real glosses.

## Plausible but not certain
- Compound numbers ending 1-4 written as separate words: "sedemsto jeden bicyklov", "dvesto tri počítačov",
  "tristo štyri vecí", "dvadsať štyri vecí", "deväťdesiat tri počítačov", "sto jeden bicyklov",
  "tisíc jeden hodiniek". Slovak usage varies (genitive plural is common when written as one word,
  e.g. dvadsaťtri počítačov); left alone. The numbers10100.md example "41 psov (governed by 'jeden')"
  is self-contradictory but I'm not sure enough of the norm to rewrite it.
- ordinalnumbers.yaml teaches "tisícny" while the .md says "tisíci" (1000th). Standard is likely tisíci.
- šla/šlo/šli (talkingabouttimepasttense) are colloquial; standard is išla/išlo/išli.
- tetka (aunt) and dedo (grandfather) are colloquial; standard teta, starý otec/dedko.
- korenie taught as "pepper" (it means spice; pepper is čierne korenie).
- "Ona vie rusky a slovansky" — "slovansky" is not a language name (Interslavic = medzislovansky).
- "Oni majú raňajky" (calque; Slovak says raňajkujú), "Ja ľúbim džús" (ľúbiť for things; mám rád),
  "Telo u mňa je zdravé", "Ulica ide do obchodu" — unidiomatic but understandable.
- "Šofér vedie autobus" (riadi is more usual).
- Generic singular adjectives translated as plurals ("Smelý hovorí pravdu" = "Brave people…",
  "Hlúpy sa neučí", "Lenivý nechce…") — acceptable English renderings, left.
- "Vidím starého otca" in foodaccusativecase.md is glossed "an old father"; starý otec = grandfather.
