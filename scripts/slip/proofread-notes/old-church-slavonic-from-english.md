# old-church-slavonic-from-english: unsure / systemic (NOT in fixes.py)

## Systemic: every hover hint shows "undefined" (affects 15 of the 16 Slavic courses)
Mini-dictionary entries are `- word: undefined` almost everywhere (Ukrainian is the exception: 0).
The exporter copies the literal string, so the challenge JSON carries `"definition": "undefined"`
(5,099 times in apps/web/src/courses/old-church-slavonic-from-english) and learners see "undefined"
as the hint, or "undefined\nкотъ". This is a code-level fix: drop "undefined" glosses
(in the exporter, or in the web app when rendering hints), not 5,000 data fixes.

## The OCS itself is largely not Old Church Slavonic
The course is a machine-style transposition of the Polish template. Beyond what I fixed, most
sentences have problems an OCS reader would see at once, but fixing them means rewriting the course:
- Modern loanwords: аѵто, аѵтобꙋсъ, фꙋтболъ, хокєи, радио, компютєр, доларъ, пицѫ, кава, пардонъ, даваи, шькода, офисъ, викєндъ, Хондꙋрасъ.
- Polish/modern grammar calques: "тъ" as a copula (Онъ тъ добръ чловѣкъ), "мьного" for "very" (OCS зѣло),
  "алє" (Polish 'but'), "до" + genitive for motion "to", "тꙋ дьнь" for "today" (OCS дьньсь),
  "тѫ" for "here" (OCS сьдє), "кимь" for 'with whom' (OCS цѣмь/кѣмь).
- Person endings often wrong: 1sg written with modern/Polish endings (читамъ, пѣвамъ, имамъ, кꙋпимъ "I will buy" = 1pl).
  I fixed only the cases where азъ was paired with a 1pl form, or the English person disagreed.
- Instrumental singular written -омъ/-ємъ throughout (OCS -омь/-ємь); "родоѭ" for masc. родъ.
- ѣсти 'eat' is spelled ѥсти, so "he eats" (ѥстъ) and "you eat" (ѥси) collide with "is"/"you are".
- глаголи is used as the 3sg (OCS глаголєтъ); стрꙑи 'uncle' spelled строи; дъшти spelled дошти;
  мъного (not мьного) is the usual spelling; разоумѣмъ in "нє разꙋмѣмъ" is 1pl for "I don't understand".
- The conditional: word list gives бꙑши 'you would be' and бꙑ 'they would be'; the lesson note's
  own aorist table (correctly) has бꙑ and бꙑшѧ. Left as is apart from the 'I' sentence.
- Demonstratives: "Сь" is used as an invariant 'this is' with feminine/neuter/plural nouns
  (Сь моꙗ сєстра, Сь моѥ дѣтѧ, Сь сѫтъ приꙗтєльѥ); OCS agrees (си / сє / си). "Сє женꙑ" for 'these women' (сиѩ).
  "тамьсь", "тамьси", "тамьтъ(и)" are invented.
- "частъ/части" (part) is used for 'hour' throughout (OCS часъ).
Recommendation for the parent: consider labelling this course as experimental, or hiding it.

## Probably wrong, left alone (not certain enough / would need many coordinated changes)
- "казати (кажєтъ): to show" vs "Она кажєтъ пьсꙋ. = She says to the dog." (Polish każe = orders).
- "Онъ даѥтъ собѣ покои. = He stops troubling others." (calque of Polish 'daje sobie spokój' = he gives up).
- "Въ ѥсєни тълико падаѥтъ дъждь. = In autumn, it will rain a lot." (тълико = only; present tense).
- "Одєжь ѥстъ чистаѥи и тълико оужє бѣла. = …only the underwear is white." (OCS mentions no underwear).
- "Тꙑмъ кътори лєжѧтъ сѧ спати спокойноѥго съна." garbled.
- "гащє" taught as 'underwear' but the phrases translate it 'shorts'.
- "чашька" is 'glass' in Drinks and 'cup' in Kitchen.
- "Идємъ тꙋ часъ въ право и потомъ прємо. = We are going right now and then straight." (ambiguous English).
- чрьвєнъ 'red' is listed twice in Colours New words (harmless; a pure deletion of a duplicate can't be
  written idempotently in course_fixes.json because the fetch skips a fix whose "new" is already present).
- Lesson notes: genitive/locative/dative adjective endings given are the definite forms or plain wrong
  (e.g. genitive adjective "all genders -а"); future of быти given as бꙋдѫ (OCS бѫдѫ) both in note and
  course; аорист example пасти 'to fall' forms (па́схъ/па́се) dubious; ціка́вѣиши (Ukrainian) and говорі́ти
  (Ukrainian і) in examples; "Она́ ѥстъ добро́ю работо́ю (She is good work)" nonsense example.
