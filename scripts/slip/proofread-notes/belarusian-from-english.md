# Belarusian: things NOT fixed (unsure, or needs a decision)

## For the parent (affects all Slavic courses, not just this one)
- **Every mini-dictionary value is the literal string `undefined`** (4,334 of 4,334 here; the same in all
  16 template Slavic courses except Ukrainian). The exporter merges it into hints, so learners hover a word
  and see "undefined" or "undefined\nрука" (verified in apps/web/src/courses/belarusian-from-english/challenges/body.json).
  Cheapest fix: drop "undefined" definitions in the exporter/app instead of hand-writing ~4k glosses per course.
  My added entries use real glosses.
- A dash in a phrase (Любоў — моцная эмоцыя) exports an **empty chip ""**. So I rewrote definition
  sentences with з'яўляецца + instrumental (correct, a bit bookish) instead of the natural dash form.

## Belarusian content, unsure, left alone
- Time of day: the course uses "у першай гадзіне", "у восьмай гадзіне" (11 phrases + ordinal note). Standard
  Belarusian is, I believe, "а восьмай гадзіне"; "у восьмай гадзіне" may read as "during the eighth hour".
  Fairly but not fully sure, so not changed.
- New words in skill 1 teach "я ёсць = am", "ты ёсць = are" etc. Misleading after the phrase fixes, but
  changing/removing taught Words changes the lesson. The note now explains ёсць correctly.
- "туш" (ink) is probably feminine (туш мокрая), course has "Туш яшчэ мокры."
- "каштанавы" = chestnut; plain brown is карычневы ("каштанавы плашч" = brown coat).
- "Увосень будзем бачыць падаючае лісце": active participle is avoided in Belarusian ("як падае лісце").
- "Новы год у снежні" / "New Year's is in December": factually New Year's Day is in January.
- "Ён дае сабе спакой" = "He stops troubling others": Polish calque (dać sobie spokój); meaning unclear.
- "Яна кажа сабаку" / Word "казаць/паказваць = to show": казаць means to say.
- "рабіць" appears twice in professions New words ("to work" and "to do/make"); the first is wrong (to work = працаваць, also listed).
- Remaining idiom calques that are grammatical but unnatural (e.g. "Мост ідзе праз раку", "Ён меў адну гадзіну",
  "Плаванне добрае для здароўя"), left as is.
- The course as a whole is a word-for-word adaptation of the Interslavic template; a native speaker review
  would find more.
