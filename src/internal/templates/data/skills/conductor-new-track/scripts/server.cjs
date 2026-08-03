#!/usr/bin/env node
/**
 * Conductor — Visual Companion.
 *
 * A local surface for the questions a track cannot settle in text: the ones the
 * user must operate to answer. The planner writes screens into the track's
 * visual content directory; this serves the newest one, reloads the browser on
 * change, and records each click into the events file as JSONL so the next turn
 * reads intent instead of guessing it.
 *
 * Usage:
 *   node server.cjs --dir <track-dir>/visual [--port N] [--open]
 *   node server.cjs --dir <same> --stop
 *
 * Contract with the planner:
 *   - stdout emits one JSON line on start: {"type":"started","url":...}
 *   - the same object is written to the state directory, so a later turn
 *     recovers the url without the stdout a background launch discards
 *   - the events file is append-only JSONL matching config.schemas.companion_event,
 *     cleared when a NEW screen is published and preserved when one is revised
 *
 * GENERATED FILE — every visible string and every threshold below is resolved
 * from the Conductor config and i18n catalogue at generation time. Edit the
 * template under the skill's scripts directory, never this output, and never
 * hardcode a user-facing string here: a literal survives `conductor generate
 * --locale en-US` and hands an English project a Portuguese interface.
 *
 * Node built-ins only, and no shell wrapper. `node server.cjs` is the whole
 * launch on every platform: a .sh entry point needs Git Bash on Windows,
 * arrives without its exec bit through template generation, and forces a
 * foreground fallback that dies with the turn that started it.
 */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** Strings and thresholds baked from the Conductor catalogue at generation. */
const T = {
  brand: `Conductor`,
  companion: `${i18n.t("common.companion.title")}`,
  track: `${i18n.t("common.companion.track_label")}`,
  connecting: `${i18n.t("common.companion.status_connecting")}`,
  connected: `${i18n.t("common.companion.status_connected")}`,
  reconnecting: `${i18n.t("common.companion.status_reconnecting")}`,
  offline: `${i18n.t("common.companion.status_offline")}`,
  hint: `${i18n.t("common.companion.hint")}`,
  recorded: `${i18n.t("common.companion.recorded")}`,
  waitingTitle: `${i18n.t("common.companion.waiting_title")}`,
  waitingBody: `${i18n.t("common.companion.waiting_body")}`,
  deniedTitle: `${i18n.t("common.companion.denied_title")}`,
  deniedBody: `${i18n.t("common.companion.denied_body")}`,
};
const DEFAULT_IDLE_MINUTES = Number(`${config.visual_companion.idle_minutes}`);

// ---------------------------------------------------------------------------
// arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { dir: null, port: 0, open: false, stop: false, idleMinutes: DEFAULT_IDLE_MINUTES };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') out.dir = argv[++i];
    else if (a === '--port') out.port = Number(argv[++i]);
    else if (a === '--open') out.open = true;
    else if (a === '--stop') out.stop = true;
    else if (a === '--idle-minutes') out.idleMinutes = Number(argv[++i]);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.dir) {
  process.stderr.write('conductor/companion: --dir <visual-dir> is required\n');
  process.exit(2);
}

const VISUAL_DIR = path.resolve(args.dir);
const CONTENT_DIR = path.join(VISUAL_DIR, `${config.visual_companion.content_subdir}`);
const STATE_DIR = path.join(VISUAL_DIR, `${config.visual_companion.state_subdir}`);
const INFO_FILE = path.join(STATE_DIR, `${config.visual_companion.server_info}`);
const EVENTS_FILE = path.join(STATE_DIR, `${config.visual_companion.events}`);
const PID_FILE = path.join(STATE_DIR, 'companion.pid');

// The visual directory is a peer of the track's artifacts, so its parent names
// the track. Shown in the header because a user with two companions open needs
// to know which track each one is deciding.
const TRACK_ID = path.basename(path.dirname(VISUAL_DIR));

// ---------------------------------------------------------------------------
// stop
// ---------------------------------------------------------------------------

if (args.stop) {
  let stopped = false;
  try {
    const pid = Number(fs.readFileSync(PID_FILE, 'utf8').trim());
    if (Number.isInteger(pid) && pid > 0) {
      try { process.kill(pid); stopped = true; }
      catch (e) { if (e.code !== 'ESRCH') throw e; }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      process.stdout.write(JSON.stringify({ type: 'stop', ok: false, reason: e.message }) + '\n');
      process.exit(1);
    }
  }
  for (const f of [PID_FILE, INFO_FILE]) { try { fs.unlinkSync(f); } catch { /* already gone */ } }
  process.stdout.write(JSON.stringify({ type: 'stop', ok: true, stopped }) + '\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// single instance per track
// ---------------------------------------------------------------------------

// Starting twice on one track is not an error to report — it is the planner
// asking for this track's companion, which already exists. Answer with the
// running one and exit.
//
// Without this the second start wins the pid file and the first becomes an
// orphan: a live server holding a valid session key on a port `--stop` can no
// longer name, surviving until the idle timeout hours later. The trigger is
// ordinary — a resumed session, or a turn that could not find the server-info
// and started again — so this is a state the framework must make unreachable
// rather than a mistake it can ask the planner not to make.
try {
  const priorPid = Number(fs.readFileSync(PID_FILE, 'utf8').trim());
  if (Number.isInteger(priorPid) && priorPid > 0 && priorPid !== process.pid) {
    let alive = true;
    try { process.kill(priorPid, 0); } catch (e) { alive = e.code === 'EPERM'; }
    if (alive) {
      // Hand back the running instance: the caller needs its url and its key,
      // and a second key for the same track would authenticate nothing the
      // first one serves. Re-serialised to ONE line — the state file is stored
      // indented for a human, while the startup contract is a single JSON line
      // a caller parses, and printing the file verbatim breaks that reader.
      const prior = JSON.parse(fs.readFileSync(INFO_FILE, 'utf8'));
      prior.reused = true;
      process.stdout.write(JSON.stringify(prior) + '\n');
      process.exit(0);
    }
  }
} catch { /* no prior instance, or its state is unreadable — start normally */ }

// ---------------------------------------------------------------------------
// setup
// ---------------------------------------------------------------------------

fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(STATE_DIR, { recursive: true });

// The state directory is runtime, not artifact: it holds the session key, a pid
// and the current screen's answers. The track directory around it IS committed,
// so without this the key reaches version control on the next `git add` of the
// track — and a key in history is a key that cannot be rotated by restarting.
// Written here rather than instructed in the skill because the failure is
// silent, the value is a secret, and a rule the agent must remember is a rule
// that eventually is not.
try {
  fs.writeFileSync(path.join(STATE_DIR, '.gitignore'), '*\n');
} catch { /* a read-only checkout still runs; nothing here is durable */ }

// Every route is gated by this key. The companion binds to loopback, but
// loopback is shared with every other process and browser tab on the machine,
// and the events file is read back by the planner as the user's intent — an
// unauthenticated write there is instruction injection, not noise.
const TOKEN = process.env.CONDUCTOR_COMPANION_TOKEN || crypto.randomBytes(24).toString('hex');
const IDLE_MS = Math.max(1, args.idleMinutes) * 60 * 1000;

let lastActivity = Date.now();
const streams = new Set();
const knownScreens = new Set(listScreens().map((s) => s.name));

function touch() { lastActivity = Date.now(); }

function listScreens() {
  let names;
  try { names = fs.readdirSync(CONTENT_DIR); } catch { return []; }
  return names
    .filter((n) => !n.startsWith('.') && n.toLowerCase().endsWith('.html'))
    .map((n) => {
      const full = path.join(CONTENT_DIR, n);
      let st;
      try { st = fs.lstatSync(full); } catch { return null; }
      // Only plain files that really live in the content directory are servable.
      if (!st.isFile() || st.isSymbolicLink()) return null;
      return { name: n, full, mtime: st.mtimeMs };
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);
}

function newestScreen() {
  const all = listScreens();
  return all.length ? all[0] : null;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------------------------------------------------------------------------
// frame
// ---------------------------------------------------------------------------

const FRAME = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(T.brand)} — ${escapeHtml(T.companion)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f4f5f6; --panel:#fff; --line:#dcdfe2; --fg:#16181a; --dim:#6b7075;
  --accent:#0e8fa8; --sel:#e6f6f9;
  --ok:#1a9c5b; --warn:#c98a0a; --err:#d64545;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media(prefers-color-scheme:dark){:root{
  --bg:#141618; --panel:#1c1f22; --line:#2f343a; --fg:#eef0f2; --dim:#98a0a8;
  --accent:#2ec7e0; --sel:rgba(46,199,224,.12);
  --ok:#3ecf8e; --warn:#e0b341; --err:#f2726f;
}}
html,body{height:100%}
body{font:15px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--fg);
 display:flex;flex-direction:column}

header{display:flex;align-items:center;gap:.8rem;padding:.55rem 1.35rem;
 background:var(--panel);border-bottom:1px solid var(--line)}
.wm{font:700 .84rem/1 var(--mono);letter-spacing:-.01em}
.wm i{color:var(--accent);font-style:normal}
.tk{font:.7rem/1 var(--mono);color:var(--dim);padding:.22rem .5rem;border:1px solid var(--line);border-radius:5px}
.tk b{color:var(--fg);font-weight:600}
#st{margin-left:auto;font:600 .72rem/1 var(--mono);color:var(--dim);display:flex;align-items:center;gap:.4rem}
#st i{font-style:normal;font-size:.8rem}

main{flex:1;overflow:auto}
#screen{padding:2.1rem 1.35rem;max-width:1100px;margin:0 auto}
h2{font-size:1.42rem;font-weight:640;letter-spacing:-.02em;margin-bottom:.35rem}
h3{font-size:1rem;font-weight:600;margin-bottom:.2rem}
.subtitle{color:var(--dim);margin-bottom:1.5rem}
.label{font:600 .68rem/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem}

.options{display:flex;flex-direction:column;gap:.7rem}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
.option,.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;
 padding:1rem 1.15rem;cursor:pointer;transition:border-color .14s,background .14s,box-shadow .14s}
.option:hover,.card:hover{border-color:var(--accent)}
.option.sel,.card.sel{border-color:var(--accent);background:var(--sel);box-shadow:inset 3px 0 0 var(--accent)}
.option{display:flex;gap:1rem;align-items:flex-start}
.letter{flex:0 0 1.7rem;height:1.7rem;border-radius:6px;background:var(--bg);border:1px solid var(--line);
 display:flex;align-items:center;justify-content:center;font:600 .8rem var(--mono);color:var(--dim)}
.option.sel .letter{background:var(--accent);border-color:var(--accent);color:#fff}
.option p,.card p{color:var(--dim);font-size:.875rem}

.mock{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-bottom:1.25rem}
.mock-bar{background:var(--bg);border-bottom:1px solid var(--line);padding:.4rem 1rem;
 font:.7rem var(--mono);color:var(--dim)}
.mock-body{padding:1.35rem}
.ph{border:1px dashed var(--line);border-radius:8px;padding:2rem;text-align:center;color:var(--dim)}

footer{padding:.55rem 1.35rem;border-top:1px solid var(--line);background:var(--panel);
 font-size:.76rem;color:var(--dim);text-align:center}
footer b{color:var(--accent);font-weight:600}
</style></head><body>
<header>
  <span class="wm"><i>▹</i> ${escapeHtml(T.brand)}</span>
  <span class="tk">${escapeHtml(T.track)} <b>${escapeHtml(TRACK_ID)}</b></span>
  <span id="st"><i>◦</i><span id="sttx">${escapeHtml(T.connecting)}</span></span>
</header>
<main><div id="screen"><!--CONTENT--></div></main>
<footer id="hint">${escapeHtml(T.hint)}</footer>
<script>
(function(){
  var S={connected:${JSON.stringify(T.connected)},reconnecting:${JSON.stringify(T.reconnecting)},
         offline:${JSON.stringify(T.offline)},recorded:${JSON.stringify(T.recorded)}};
  var KEY=new URLSearchParams(location.search).get('key')||'';
  function q(p){return p+(KEY?(p.indexOf('?')<0?'?':'&')+'key='+encodeURIComponent(KEY):'')}
  var box=document.getElementById('st'),tx=document.getElementById('sttx');
  function st(text,glyph,color){tx.textContent=text;box.firstElementChild.textContent=glyph;box.style.color=color}

  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-choice]'); if(!el) return;
    var group=el.closest('.options,.cards'), multi=group&&group.hasAttribute('data-multi');
    if(group&&!multi) group.querySelectorAll('.sel').forEach(function(n){n.classList.remove('sel')});
    if(multi) el.classList.toggle('sel'); else el.classList.add('sel');
    var label=(el.querySelector('h3')||el).textContent.trim().slice(0,140);
    fetch(q('/choice'),{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({choice:el.dataset.choice,label:label,selected:el.classList.contains('sel')})
    }).catch(function(){});
    document.getElementById('hint').innerHTML='<b>'+label+'</b> — '+S.recorded;
  });

  var es=new EventSource(q('/stream'));
  es.onopen=function(){st(S.connected,'\\u2713','var(--ok)')};
  es.onerror=function(){st(S.reconnecting,'\\u26a0','var(--warn)');
    setTimeout(function(){if(es.readyState===2)st(S.offline,'\\u2717','var(--err)')},8000)};
  es.addEventListener('reload',function(){location.reload()});
})();
</script></body></html>`;

function isFullDocument(html) {
  const head = html.trimStart().slice(0, 40).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

const WAITING = `<h2>${escapeHtml(T.waitingTitle)}</h2><p class="subtitle">${escapeHtml(T.waitingBody)}</p>`;

function renderScreen() {
  const screen = newestScreen();
  const raw = screen ? fs.readFileSync(screen.full, 'utf8') : WAITING;
  if (screen && isFullDocument(raw)) return raw;
  // Split/join, not replace(): a replacement string treats $& and friends as
  // backreferences, so a screen containing one would silently lose characters.
  return FRAME.split('<!--CONTENT-->').join(raw);
}

// ---------------------------------------------------------------------------
// auth
// ---------------------------------------------------------------------------

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const COOKIE = 'conductor_companion';

function authorized(req) {
  const url = new URL(req.url, 'http://localhost');
  const key = url.searchParams.get('key');
  if (key !== null) return safeEqual(key, TOKEN);
  const m = new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)').exec(req.headers.cookie || '');
  return m ? safeEqual(m[1], TOKEN) : false;
}

const HEADERS = {
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
};

const DENIED = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${escapeHtml(T.brand)}</title><style>
body{font:15px/1.6 system-ui,sans-serif;max-width:34rem;margin:18vh auto;padding:0 1.5rem;color:#16181a}
@media(prefers-color-scheme:dark){body{background:#141618;color:#eef0f2}}
h1{font-size:1.2rem;margin-bottom:.5rem}p{color:#6b7075}
code{font:.85em ui-monospace,monospace;background:rgba(127,127,127,.16);padding:.1em .35em;border-radius:4px}
</style></head><body><h1>${escapeHtml(T.deniedTitle)}</h1>
<p>${escapeHtml(T.deniedBody)}</p></body></html>`;

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (!authorized(req)) {
    res.writeHead(403, { ...HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
    res.end(DENIED);
    return;
  }
  touch();

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, {
      ...HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': COOKIE + '=' + TOKEN + '; HttpOnly; SameSite=Strict; Path=/',
    });
    res.end(renderScreen());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/stream') {
    res.writeHead(200, { ...HEADERS, 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n');
    streams.add(res);
    req.on('close', () => streams.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/choice') {
    let body = '';
    let tooBig = false;
    req.on('data', (c) => { body += c; if (body.length > 8192) { tooBig = true; req.destroy(); } });
    req.on('end', () => {
      if (tooBig) return;
      let payload;
      try { payload = JSON.parse(body); } catch { payload = null; }
      if (!payload || typeof payload !== 'object' || !payload.choice) {
        res.writeHead(400, HEADERS); res.end(); return;
      }
      // Shape declared by config.schemas.companion_event.
      const record = {
        ts: new Date().toISOString(),
        track: TRACK_ID,
        screen: (newestScreen() || {}).name || null,
        choice: String(payload.choice).slice(0, 120),
        label: String(payload.label || '').slice(0, 200),
        selected: payload.selected !== false,
      };
      fs.appendFileSync(EVENTS_FILE, JSON.stringify(record) + '\n');
      res.writeHead(204, HEADERS); res.end();
    });
    return;
  }

  res.writeHead(404, HEADERS);
  res.end('not found');
});

// ---------------------------------------------------------------------------
// watch
// ---------------------------------------------------------------------------

const debounce = new Map();
try {
  const watcher = fs.watch(CONTENT_DIR, (_event, filename) => {
    if (!filename || filename.startsWith('.') || !filename.toLowerCase().endsWith('.html')) return;
    clearTimeout(debounce.get(filename));
    debounce.set(filename, setTimeout(() => {
      debounce.delete(filename);
      if (!fs.existsSync(path.join(CONTENT_DIR, filename))) return;
      touch();
      // A new screen is a new question: the previous screen's answers no longer
      // describe what is on the glass, so they are retired rather than left for
      // the planner to read as an answer to the question now being asked.
      if (!knownScreens.has(filename)) {
        knownScreens.add(filename);
        try { fs.unlinkSync(EVENTS_FILE); } catch { /* nothing to clear */ }
      }
      for (const s of streams) s.write('event: reload\ndata: {}\n\n');
    }, 120));
  });
  watcher.on('error', (e) => process.stderr.write('conductor/companion: watch error ' + e.message + '\n'));
} catch (e) {
  process.stderr.write('conductor/companion: cannot watch ' + CONTENT_DIR + ': ' + e.message + '\n');
}

// ---------------------------------------------------------------------------
// lifecycle
// ---------------------------------------------------------------------------

function shutdown(reason) {
  for (const f of [INFO_FILE, PID_FILE]) { try { fs.unlinkSync(f); } catch { /* already gone */ } }
  for (const s of streams) { try { s.end(); } catch { /* client gone */ } }
  process.stdout.write(JSON.stringify({ type: 'stopped', reason }) + '\n');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}

const idleTimer = setInterval(() => {
  if (Date.now() - lastActivity > IDLE_MS) shutdown('idle');
}, 30000);
idleTimer.unref();

process.on('SIGTERM', () => shutdown('sigterm'));
process.on('SIGINT', () => shutdown('sigint'));

server.listen(args.port, '127.0.0.1', () => {
  const port = server.address().port;
  const info = {
    type: 'started',
    url: 'http://localhost:' + port + '/?key=' + TOKEN,
    port,
    pid: process.pid,
    track: TRACK_ID,
    content_dir: CONTENT_DIR,
    events_file: EVENTS_FILE,
    idle_minutes: args.idleMinutes,
  };
  fs.writeFileSync(INFO_FILE, JSON.stringify(info, null, 2) + '\n', { mode: 0o600 });
  fs.writeFileSync(PID_FILE, String(process.pid) + '\n');
  process.stdout.write(JSON.stringify(info) + '\n');

  if (args.open) {
    const cp = require('node:child_process');
    try {
      if (process.platform === 'win32') cp.execFile('rundll32.exe', ['url.dll,FileProtocolHandler', info.url], () => {});
      else if (process.platform === 'darwin') cp.execFile('open', [info.url], () => {});
      else if (process.env.DISPLAY || process.env.WAYLAND_DISPLAY) cp.execFile('xdg-open', [info.url], () => {});
    } catch { /* best effort */ }
  }
});
