# Visual Companion — Guide

A local, browser-based surface for capturing intent that text cannot capture.
Read this only after the user has accepted the companion.

## When a screen is justified

A screen is justified when the user must **operate** something to answer:
click, tab, compare side by side, judge spacing or hierarchy.

If the screen can be read aloud without losing anything, it is terminal
content. Send it to the chat.

| Question | Where |
|---|---|
| "Which of these two layouts?" | screen |
| "Does the keyboard escape this panel?" | screen |
| "Is this spacing too tight?" | screen |
| "Which of A, B, C do you want?" | chat |
| "Should sessions expire in 24h or 7d?" | chat |
| "What does *personality* mean here?" | chat |

A question about a UI topic is not automatically a visual question. The most
common failure is a screen that renders a numbered option list — it costs a
round trip and a page of HTML to deliver what three lines of chat deliver.

## Rules for a screen

1. **One question per screen.** No toggles, no configuration panels, no
   multi-part forms. A screen that needs a legend is two screens.
2. **No jargon.** Write "the keyboard stays inside the panel", not "focus
   trap". The user is deciding scope, not reviewing an implementation.
3. **Instructions live on the screen.** If you must explain in chat how to
   operate the screen, the screen is wrong.
4. **Do not make the user perform a procedure.** Give a button that runs the
   demonstration. A user who has to click, then press Tab six times, then
   watch the right indicator, will see nothing and report that both options
   look identical.
5. **Failure must be loud.** Signal the state on the whole component — border,
   banner, colour — not with a small marker beside it.
6. **High fidelity when the question is about a product surface.** Real
   product names, real prices, the complete form. Placeholder boxes hide
   exactly the decisions the screen exists to surface: a login panel drawn as
   a grey rectangle never reveals that it holds eight focusable elements.
   Wireframe fidelity is for questions about structure alone.

## The loop

1. **Start the server** (once per track), from the project root:

   ```
   node <script> --dir <track-dir>/visual --open
   ```

   It prints one JSON line and writes the same object to
   `<track-dir>/visual/state/server-info.json`. Launch it detached/background
   so it outlives the turn; recover the URL from that file in later turns.
   Give the user the **complete** URL, including `?key=…` — every route is
   gated by that key.

2. **Publish a screen** — write an HTML file into `<track-dir>/visual/content/`.
   Use ordered, semantic names (`01-layout.html`, `02-teclado.html`). Never
   reuse a name for a different question. The newest file by mtime is served,
   and the browser reloads itself.

   Write it with your file-creation tool, never by echoing it into a terminal.

3. **Lint before you trust it.** A screen with an unbalanced tag or a broken
   inline script renders as dead text and reports nothing. Confirm every block
   tag is closed and every `<script>` parses before telling the user to look.

4. **End your turn.** Say in one line what is on the screen and ask the user to
   answer in the chat.

5. **Next turn, read `<track-dir>/visual/state/events`** — JSONL, one record per
   click, each carrying the `screen` it belongs to. Merge it with what the user
   typed. The chat message is the primary answer; the events file is the
   structured half. A missing file means the user did not interact — use the
   chat alone, and never assume a screen was seen.

6. **Stop the server** when planning ends:

   ```
   node <script> --dir <track-dir>/visual --stop
   ```

   Screens stay in the track directory as evidence of what the scope decisions
   were made against.

## Writing a screen

Write a fragment — the server wraps it in a frame that supplies the theme, the
connection status, and the click-recording client. Only start a file with
`<!DOCTYPE` or `<html>` when you need the whole document, and then you own
everything.

Record an answer with `data-choice` on a clickable element:

```html
<h2>Qual layout?</h2>
<p class="subtitle">Clique numa opção e volte ao chat.</p>
<div class="options">
  <div class="option" data-choice="modal"><div class="letter">A</div>
    <div><h3>Modal</h3><p>Mantém o contexto da página.</p></div></div>
  <div class="option" data-choice="pagina"><div class="letter">B</div>
    <div><h3>Página dedicada</h3><p>Deep-link funciona.</p></div></div>
</div>
```

Add `data-multi` to `.options` or `.cards` for multiple selection.

Classes the frame provides: `.label`, `.subtitle`, `.options`/`.option`/`.letter`,
`.cards`/`.card`, `.mock`/`.mock-bar`/`.mock-body`, `.ph`. Everything else you
style yourself inside the fragment — inline `<style>` and `<script>` both run.

The frame carries the Conductor wordmark, the track id and the connection
state, and it reads its palette and every visible string from the project's
resolved configuration. Do not restate the brand or the track inside a screen,
and never hardcode interface text in a full document — a screen written as a
whole document opts out of the frame, and with it out of the locale the project
was generated in.

## Events format

One record per click, matching `config.schemas.companion_event`:

```
{"ts":"2026-08-02T01:20:08.886Z","track":"login-drawer_20260802","screen":"01-layout.html","choice":"drawer","label":"Drawer lateral","selected":true}
```

The file is cleared when a **new** screen is published and preserved when the
same screen is revised, so an answer never outlives its question.

## Turning a screen into scope

A click is not a preference; it is a scope clause. When an answer arrives,
number the clause it produces and give it an acceptance criterion that names
the observable behaviour the screen demonstrated. That is the whole reason
this surface exists: a behaviour nobody saw is a behaviour nobody specified,
and the plan lint cannot flag a clause that was never written.
