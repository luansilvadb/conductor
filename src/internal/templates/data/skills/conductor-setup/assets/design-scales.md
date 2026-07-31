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

0. **Ask for references first.** Before any band question: *"Show me two or
   three pages you admire, and say in one sentence what you like about each."*
   Read each sentence against
   `${config.directories.conductor_root}/gates/intent-vocabulary.json`, which
   maps what people actually say onto these axes — "the rhythm breathes" is a
   rhythm answer, "premium" is almost always negative space rather than
   ornament, "feels alive" is motion. Show the user the mapping you extracted
   and let them correct it; it is a claim about what they meant, and they are
   the only one who can confirm it.

   Then ask which single reference the product should feel most like. That one
   is **primary** and sets every axis it speaks to; each other reference may
   override at most one axis, and only where the primary is silent. Do not
   average them — three admired pages have three identities, and the middle of
   three coherent positions is the mean answer this whole file exists to
   prevent, reached by a route that is harder to notice.

   Record all of it in `${config.directories.conductor_root}/design/intent.json`:
   each reference with its sentence, which is primary, which axis each one
   decided, and any reason that mapped to no axis, verbatim. Unmapped reasons
   are usually the part specific to this product; no gate acts on them, and
   dropping them loses the most product-specific input the project will get.

   This step is what turns the questions below from a menu into a confirmation.
   Skip it and the bands are still chosen, but nobody can later say why — and a
   band nobody can account for is a band that drifts.

1. Ask the remaining questions one axis at a time, as a single-choice
   `question`, proposing the band the references imply and saying which
   reference implied it. Show the band names and what each implies — never the
   raw numbers, which are an implementation detail.
2. If the user has no preference on an axis, choose from the product vision
   recorded in `${config.files.artifacts.product}`, and say which band you
   chose and why. Do not fall back to "the safe middle" — a stated band that
   is wrong is correctable, an averaged one is invisible.
3. Write `DESIGN.md` using the values of the chosen bands verbatim, and record
   the depth band as `depth.selected` in
   `${config.directories.conductor_root}/gates/design-bands.json` — it is the one
   axis with no token to carry it, so the gate reads it from there or not at all.
4. Fill the `components` section. It is not optional: the contrast check only
   examines `backgroundColor`/`textColor` pairs that are actually declared, so
   a design system without components has no accessibility verification at all.
5. Run `node ${config.directories.conductor_root}/gates/design-gate.mjs` and fix what blocks.
6. Record the baselines, and check both exist afterwards: copy the approved file
   to `${config.directories.conductor_root}/gates/design-baseline.md`, then run
   `node ${config.directories.conductor_root}/gates/design-tokens-gate.mjs --update-baseline`
   and confirm `${config.directories.conductor_root}/gates/design-tokens-baseline.json`
   was written. Until it is, the ratchet has no line to hold and tolerates every
   finding — the gate reports that as unrunnable, not as a pass.

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

Record the chosen band as `depth.selected` in
`${config.directories.conductor_root}/gates/design-bands.json`. This axis is the
one that cannot be checked from `DESIGN.md`: the bands differ by whether shadows
exist at all, not by a token value, so the gate checks the code instead. Leave it
null and the axis is never checked — which is how a system that declares
`bordered` in prose ships shadowed cards and passes every gate.

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

Note the tension with the opening of this file: prose is exactly what does not
move a model off the mean. So the prose above is necessary and not sufficient —
a page composed entirely of centred sections of equal height satisfies every
band here and every sentence in `DESIGN.md`, and is the most recognisable
generated layout there is.

What carries composition instead is the grammar in
`${config.directories.conductor_root}/gates/design-grammar.json`, which applies
this file's own move one level up. Rather than measuring a finished page for
uniformity, it removes the choice beforehand: a finite vocabulary of section
archetypes, and a finite set of page shapes built from them. A page declares
itself as an ordered list of archetype names, and that list must derive from one
of the grammars — `open → establish → turn → prove → resolve` for a landing
page — as well as satisfy invariants no derivation can satisfy by accident: no
adjacent repeat, at least four distinct archetypes, something that bleeds, no
long run of one density, and a cap on how much of the page enters from the
centre.

The `turn` movement deserves a note, because it is the one a generated page
always omits. It is the section that breaks the pattern the page has been
building — a marquee, a full-bleed image, cards off the grid — and its absence
is precisely what makes such a page read as a list of features rather than an
argument. No amount of correct spacing substitutes for it.

Two floors remain measured rather than chosen, in
`${config.directories.conductor_root}/gates/composition-bands.json`, and are
counted on the rendered page. They are floors against sameness, not a definition
of good composition — nothing in this framework decides that.

## The remaining axes

Three more choices work the same way and are recorded in their own files, each
of them an axis that is invisible to `DESIGN.md` and silent until someone picks:

- **Depth** — `depth.selected` in `design-bands.json`. See Axis 5 above.
- **Motion** — `selected` in `motion-bands.json`. Fixes the stagger step and the
  travel distance, and carries the invariants that make motion safe: nothing
  above the fold starts hidden, the hidden state is applied by the script that
  removes it, and reduced motion calms movement rather than removing content.
- **Type pairing** — `selected` in `type-pairings.json`. Choose a pair and copy
  it verbatim; do not combine the display of one with the body of another, which
  is composing a new pairing and is what the catalogue exists to avoid. A project
  with its own licensed brand faces leaves this null and is reported as
  unchecked, which is correct — brand type outranks a catalogue.

## What no gate here decides

**A green board does not mean the interface is good.** That sentence is the most
important one in this file, and it is here because the opposite conclusion is
the natural one to draw: a wall of passing checks reads as a verdict on quality,
and it is not one. It is a verdict on the absence of specific defects.

It helps to be concrete about what actually separates a memorable interface from
a competent one. Roughly, it decomposes into four things:

| | Weight |
| --- | --- |
| Art direction and visual identity | 40–50% |
| Exclusive assets — illustration, 3D, photography, video | part of the above, and the hardest to fake |
| Interaction and motion | 20–30% |
| Structure and UX | 20–30% |

**This framework addresses the fourth, and part of the third.** Nothing here
reaches art direction or produces an asset. What the gates cover is real and
worth having — composition, cadence, hierarchy, and integrity — and it is enough
to move a page off "generic template" and onto "clearly designed product". It is
not enough to make it distinctive, and no amount of additional gates would be:
the missing half is aesthetic intent and original work, which by definition do
not live in a closed catalogue.

So state the aim honestly. The purpose of this framework is not to produce
award-winning interfaces. It is to raise low-cost interfaces to the level of
products that are clearly designed, non-generic and visually coherent — to
**reduce average mediocrity, not to guarantee brilliance**. Those are different
goals, and only the first one is achievable by machine.

The practical consequence, for whoever reads a green board: every check passing
means no defect this framework can name is present. Whether the artwork is any
good, whether the product shot shows the product, whether the motion lands,
whether the copy earns its space, whether anyone will remember the page — none
of that was measured, and a page can pass everything here and still be
forgettable. When the gates are green, what remains is judgement, and it needs a
human or at least an eye on the actual page.

### Where the boundary actually falls

Useful when deciding whether some new concern deserves a gate. Three tiers, and
the tier a concern falls into predicts how much a gate will help far better than
how important the concern is:

**Instrumentable — a gate settles it.** Spatial consistency, structural
hierarchy, visual rhythm, asset integrity, motion safety, composition floors,
accessibility, responsiveness. These share one property: a correct answer is
decidable from the artefact, without knowing what the page is for.

**Weakly instrumentable — a gate helps and does not settle it.** Visual
identity, personality, art direction, storytelling, visual tension,
memorability. A gate can establish necessary conditions here (a page with one
type size has no hierarchy; a page with no bleed has no tension) but never
sufficient ones. Floors, not verdicts.

**Not instrumentable.** Originality, surprise, aesthetic signature, cultural
value. Not because nobody has built the check yet — because a closed catalogue
is the wrong shape for the question. Anything a catalogue can express is, by the
time it is in the catalogue, no longer surprising.

The returns diminish sharply down that list, and they diminish *within* the
first tier too: the fifteenth gate on spatial consistency is worth far less than
the first composition archetype, which is worth far less than one set of
original illustrations. If a proposed gate lands in tier two or three, the
honest answer is usually that the work belongs to a person, and the framework's
job is to say so rather than to approximate it.

### The property this rests on

> **Gates can prove the absence of known defects. They can never prove the
> presence of quality.**

This is a property of what a gate is, not a limitation of this implementation,
and no amount of further work moves it. It is the dual of the familiar result
about tests — testing shows the presence of bugs, never their absence — with one
difference worth knowing: these gates ARE exhaustive inside the domain they
cover. Every declared value, every configured viewport, every declared page is
checked. The limit is not coverage; it is that the domain is closed, and quality
lives outside it.

So the correct reading of a green board is never "the page is good". It is
"none of the defects we know how to name are present". Those are different
statements, and treating the first as though it were the second is how a
framework built to prevent the average result ends up certifying one.
