---
name: conductor-status
description: Displays the current progress of the project by parsing the Tracks Registry and individual track plans.
metadata:
  version: "1.0"
---

# Conductor Status Skill

You are an AI agent. Your primary function is to provide a status overview of the project by parsing the Tracks Registry and individual track plans.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., `conductor/tracks.md`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the status overview process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of `conductor/index.md` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the `conductor/index.md` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the `conductor-setup` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read `conductor/index.md` and use the provided links to locate the core files:
    -   **Tracks Registry** (`tracks.md`)
    -   **Product Definition** (`product.md`)
    -   **Tech Stack** (`tech-stack.md`)
    -   **Workflow** (`workflow.md`)
    -   **Health Check:** You MUST verify that every linked file actually exists. If ANY of these core files are missing, HALT immediately. Announce which file is missing and ask the user if they would like to run the setup process to repair the environment.

---

## 2. Status Overview Protocol

Follow this sequence to provide a status overview.

### 2.1 Read and Summarize (Subagent Dispatch)
Delegate the parsing of the Tracks Registry and all track plans to a subagent so the verbose contents of every `plan.md` never enter the orchestrator context.

1.  **Dispatch:** Call the native `Task` tool with `subagent_type=general_purpose_task`, passing a closed prompt with: the resolved path to the **Tracks Registry** (check `conductor/index.md`, otherwise default `conductor/tracks.md`) and the tracks directory path.
2.  **Subagent Constraints:** Read-only. MUST read the **Tracks Registry** and every track's **Implementation Plan**. Parsing logic: identify tracks via `- [ ] **Track:` or legacy `## [ ] Track:`; identify task status via `[x]` (completed), `[~]` (in-progress), `[ ]` (pending). MUST NOT commit, write any file, or interact with the user. Receives no prior conversation history.
3.  **Condensed Return Schema (the ONLY thing the orchestrator absorbs):**
    `{ phases: N, tasks: { total, done, in_progress, pending }, current: { phase, task }, next: "...", blockers: [...] }`
4.  **Fallback:** If no native `Task` tool is available, read and parse the registry and plans inline following the same rules.

### 2.2 Present Status Overview
Using the schema returned by the subagent, present the generated summary to the user in a clear, readable format. The status report must include:
    -   **Current Date/Time:** The current timestamp.
    -   **Project Status:** A high-level summary of progress (e.g., "On Track", "Behind Schedule", "Blocked").
    -   **Current Phase and Task:** The specific phase and task currently marked as in progress.
    -   **Next Action Needed:** The next task listed as pending.
    -   **Blockers:** Any items explicitly marked as blockers in the plan.
    -   **Phases (total):** The total number of major phases.
    -   **Tasks (total):** The total number of tasks.
    -   **Progress:** The overall progress of the plan, presented as tasks_completed/tasks_total (percentage_completed%).
