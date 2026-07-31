# Design Scales — authoring aid for `DESIGN.md`

Read this before writing `${config.directories.conductor_root}/DESIGN.md`.

## Why this file exists

A weak model asked "what spacing should sections use?" answers with the average
of everything it has read. The average of all CSS ever written is a 1.25 type
ratio, 8/16/24 spacing, an 8px radius and a blue-violet accent. That answer is
not a mistake — it is the centre of the distribution, and the centre is what
generic looks like. Prose ("make it modern", "be bold") does not move it; the
model regresses to the mean on the next token.

What does move it is removing the choice. Each axis below offers named bands
with concrete numbers. Pick **one band per axis** and copy its values
literally into the front matter. Never average two bands, never interpolate,
never invent a value "between" them.

This is enforced, not advised: the design gate reads
`${config.directories.conductor_root}/gates/design-bands.json` and rejects a
design system whose anchor value on any axis sits between bands. The two files
carry the same numbers — change one and change the other.

## Brownfield first

If the project already has an interface, do not start from the bands. Run:

```
node ${config.directories.conductor_root}/gates/design-extract.mjs --src src --format json
```

It reports the colours and scales the code already uses, infers which colour is
ink, which is paper and which is the accent, and names the band nearest to each
axis. Present that as the proposal — "your code is closest to `airy`, with
`#1A1C1E` as ink and `#B8422E` as the accent; adopt these or redesign?" — and
run the questions below only to confirm or override.

It never writes and never blocks. Frequency is evidence, not endorsement: the
most repeated value may be the most repeated mistake, so every extracted value
is confirmed before it becomes a token.

## Procedure

1. Ask the user one question per axis, in the order below, as a single-choice
   `question`. Show the band names and what each implies — never the raw
   numbers, which are an implementation detail.
2. If the user has no preference on an axis, choose from the product vision
   recorded in `${config.files.artifacts.product}`, and say which band you
   chose and why. Do not fall back to "the safe middle" — a stated band that
   is wrong is correctable, an averaged one is invisible.
3. Write `DESIGN.md` using the values of the chosen bands verbatim.
4. Fill the `components` section. It is not optional: the contrast check only
   examines `backgroundColor`/`textColor` pairs that are actually declared, so
   a design system without components has no accessibility verification at all.
5. Run `node ${config.directories.conductor_root}/gates/design-gate.mjs` and fix what blocks.
6. Record the baselines: copy the approved file to
   `${config.directories.conductor_root}/gates/design-baseline.md`, then run
   `node ${config.directories.conductor_root}/gates/design-tokens-gate.mjs --update-baseline`.

## Axis 1 — Vertical rhythm

How much the page breathes. The single most visible difference between a
designed page and a generated one.

| Band | Feel | `spacing` tokens |
| --- | --- | --- |
| `compact` | Dense tools, dashboards, tables | xs 4, sm 8, md 12, lg 20, xl 32, **section 48** |
| `airy` | Product marketing, apps, most SaaS | xs 4, sm 8, md 16, lg 32, xl 64, **section 96** |
| `editorial` | Long-form, portfolio, brand-led | xs 8, sm 16, md 24, lg 48, xl 96, **section 160** |

The `section` token is required — it is the gap between page sections, it is what
the gate reads for this axis, and it is a different number from `xl`. A system
without it leaves the axis unchecked.

The mean answer is a 64px section gap. None of the bands offer it.

## Axis 2 — Typographic contrast

The ratio between the largest heading and body text. A weak model defaults to
roughly 2x, which reads as a document rather than a designed screen.

| Band | Ratio | `display` | `headline-lg` | `body-md` |
| --- | --- | --- | --- | --- |
| `functional` | 2.0x | 32px | 24px | 16px |
| `expressive` | 3.5x | 56px | 32px | 16px |
| `editorial` | 4.5x | 72px | 32px | 16px |

Tighten `lineHeight` as size grows — 1.6 at body, 1.2 at headline, 1.05 at
display — and apply negative `letterSpacing` (-0.02em to -0.03em) only at
display sizes. A 72px heading at line-height 1.5 looks broken, and that
combination is exactly what averaging produces.

## Axis 3 — Colour strategy

| Band | Rule | Palette shape |
| --- | --- | --- |
| `monochrome+1` | One accent, used only for the single most important action per screen | primary (ink), neutral (background), one accent, plus `error` |
| `dual` | One accent plus one supporting hue for secondary emphasis | as above plus `secondary` |
| `expressive` | Accent family with tonal steps for surfaces and states | accent-10 … accent-90, plus neutral ramp |

`monochrome+1` is the safest strong choice and the hardest to make ugly. Note
that it is not the average: the average is three or four competing hues.

Whichever band is chosen, `neutral` should be a tinted off-white (warm
`#F7F5F2`, cool `#F4F6F8`) rather than pure `#FFFFFF`, and `primary` a near-
black (`#141517`) rather than `#000000`. Pure black on pure white is the
strongest signal of an unconsidered palette.

## Axis 4 — Shape

| Band | `rounded` tokens |
| --- | --- |
| `sharp` | none 0, sm 2px, full 9999px |
| `architectural` | none 0, sm 4px, md 8px, full 9999px |
| `soft` | sm 8px, md 16px, lg 24px, full 9999px |

Do not mix bands within a view — a sharp card containing pill buttons reads as
an accident unless the whole system commits to that contrast deliberately.

## Axis 5 — Depth

| Band | How hierarchy is conveyed |
| --- | --- |
| `tonal` | Layered background values only. No shadows. |
| `bordered` | 1px borders in `secondary`, no shadows. |
| `shadowed` | Two shadow levels maximum, low opacity, large blur. |

`tonal` and `bordered` are much harder to get wrong than `shadowed`, and a
default shadow (`0 2px 4px rgba(0,0,0,0.1)`) is the mean answer.

## Banned defaults

If the draft contains any of these, an axis was averaged rather than chosen.
Go back to the band and copy its values.

- A spacing scale of 8 / 16 / 24 / 32 with a section gap of 48–64px
- A display size under 32px, or a display/body ratio between 2.2x and 3.4x
- `#FFFFFF` as `neutral`, or `#000000` as `primary`
- A radius of 6px, 10px or 12px in the `architectural` or `sharp` bands
- More than two font families, or more than three font weights
- An accent that is any of `#3B82F6`, `#6366F1`, `#8B5CF6` — the three most
  common generated blues and violets

## What this file does not decide

These bands constrain style, not composition. Hierarchy, information density,
what belongs above the fold, and when a modal beats an inline panel are not
expressible as tokens; they belong in the `Overview` and `Layout` prose of
`DESIGN.md`, which is what the agent falls back to when no token applies.
Write those sections as instructions, not adjectives: "prefer the more spacious
option when unsure" is actionable, "modern and clean" is not.
