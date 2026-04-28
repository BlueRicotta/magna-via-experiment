# Scoring

Magna Via uses the quiz as the primary RIASEC signal, then applies small personalization bonuses from Hobby Cards and Birth Star.

```txt
finalScores = quizScores + hobbyCardBonuses + birthStarBonus
```

## Hobby Card Bonuses

```txt
Fighter          -> R +2, E +1
Scholar          -> I +2, C +1
Artist           -> A +2, S +1
Guardian Lantern -> S +2, I +1
Leader Crown     -> E +2, S +1
Keeper Codex     -> C +2, I +1
```

## Birth Star Bonuses

```txt
Ignis  -> R +1, E +1
Aqua   -> S +1, I +1
Terra  -> C +1, R +1
Ventus -> A +1, I +1
```

The bonuses are intentionally lighter than the 15-question quiz. This makes the earlier fantasy choices feel meaningful while keeping the career result primarily based on scenario responses.
