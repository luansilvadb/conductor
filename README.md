# Conductor

The ultimate framework for working with AI in code (Cursor, Claude Code, Antigravity, Trae).
Stop debugging hallucinations. Force the AI to plan, execute, and test with discipline.

## Start in 1 Command

At the root of your project, run (requires Node 20.11+):

```bash
npx github:luansilvadb/conductor generate
```

## How to Use (The Daily Flow)

Open your AI tool's chat and invoke the skills in the order below. All history, rules, and decisions will be saved in your project's `conductor/` folder.

### 1. Initialize the project (Only the 1st time)
> **You:** "Run `conductor-setup` to create a todo list app in React."

The AI will analyze the idea and record the vision, rules (UX, tests), and the tech stack in the Conductor directory.

### 2. Plan a task
> **You:** "Run `conductor-new-track` for the login feature."

Zero code is generated here. The AI will only create a specification (`spec.md`) and a step-by-step action plan (`plan.md`).

### 3. Write the code
> **You:** "Run `conductor-implement`."

Now we're talking. The AI will read the plan it just made, write code following tests (TDD), check off what it finished (`[x]`) in the document, and commit to Git maintaining traceability.

### 4. Review and Finalize
> **You:** "Run `conductor-review`."

The AI takes on the role of a tech lead: it reviews its own code against the project's initial rules, ensures quality, and closes the track.

---

## Other Useful Skills (Ask the AI)

- **`conductor-status`**: Shows what has already been done, completion %, what is missing, and blockers.
- **`conductor-revert`**: Did the AI mess up? Invoke this skill and it accurately undoes (using git notes) all commits and changes from the current track only.
- **`conductor-archive`**: Cleans up the workspace by archiving finished tasks.

---

## CLI (Manual Terminal Usage)

If you want to tweak configurations via terminal instead of using the `npx` wizard:

```bash
conductor                # Starts the interactive wizard mode
conductor generate       # Updates skills if you switch IDEs
conductor --tool trae    # Forces installation for Trae (or cursor, claude-code)
conductor list           # Lists installed skills
conductor uninstall      # Removes the framework from the project
```

---

## Contributing (Dev)

To tinker with Conductor's own source code:

```bash
git clone https://github.com/luansilvadb/conductor.git
cd conductor
npm install
npm run build      # Generates dist/index.cjs (single-file bundle)
npm link           # Makes `conductor` available globally for testing
```

MIT License.
