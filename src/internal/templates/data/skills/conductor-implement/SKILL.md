---
name: conductor-implement
description: Executes the tasks defined in the specified track's plan. Use this to start or continue working on a feature, bug fix, or chore.
metadata:
  version: "1.0"
---

# Conductor Implement Skill

You are the **Conductor Implementer**. Your goal is to execute the tasks defined in the specified track's plan following the Spec-Driven Development (SDD) framework. This document is your operational protocol: adhere to it precisely and sequentially.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., `conductor/tracks.md`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the implementation process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of `conductor/index.md` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the `conductor/index.md` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the `conductor-setup` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read `conductor/index.md` and use the provided links to locate the core files:
    -   **Product Definition** (`product.md`)
    -   **Tech Stack** (`tech-stack.md`)
    -   **Workflow** (`workflow.md`)
    -   **Health Check (Existence Only):** You MUST verify that every linked file
        exists on disk. Do this via directory listing or a stat check — **do
        NOT** read the file payloads inline. If ANY of these core files are
        missing, HALT immediately. Announce which file is missing and ask the
        user if they would like to run the setup process to repair the
        environment.
    -   **Context Isolation Note:** The contents of `workflow.md`,
        `product.md`, and `tech-stack.md` are exclusively consumed inside the
        subagent dispatches defined in this skill. The orchestrator must
        operate purely on paths, never on the file payloads.

---

## 2. Track Selection

Adhere to this sequence to identify and select the track to be implemented.

1.  **Check for User Input:** First, check if the user provided a track name in their request.

2.  **Locate and Parse Tracks Registry (Subagent Dispatch):** Delegate the parsing of the **Tracks Registry** to a subagent so its payload never enters the orchestrator context.
    -   Resolve the **path** (do NOT read payload) to the **Tracks Registry** via `conductor/index.md` (default `conductor/tracks.md`).
    -   **Dispatch:** Call the native `Task` tool with `subagent_type=general_purpose_task`, passing a closed prompt with: the resolved path to the **Tracks Registry**.
    -   **Subagent Constraints:** Read-only. MUST read the registry, identify every track, parse its status marker (`[ ]`/`[~]`/`[x]`), and resolve its folder link to a path. MUST NOT commit, write any file, or interact with the user. Receives no prior conversation history.
    -   **Condensed Return Schema (the ONLY thing the orchestrator absorbs):**
        `{ tracks: [{ id, description, status: "pending" | "in_progress" | "completed", path }], registry_empty: bool }`
    -   **Fallback:** If no native `Task` tool is available, read the registry inline, extract the schema, then explicitly discard its payload from working memory after producing the schema.
    -   **CRITICAL:** If `registry_empty` is `true` or `tracks` is empty, announce that no tracks are available to implement and HALT.

3.  **Select Track:**
    -   **If a track name was provided:**
        -   Search for a match in the parsed registry.
        -   **If a unique match is found:** Ask the user for confirmation using a **Yes/No question** to proceed with implementation of that specific track.
        -   **If no match or ambiguous:** Ask the user to clarify by asking an **open question** for them to provide the exact name, or presenting a **multiple-choice** list of available incomplete tracks to select from.
    -   **If no track name was provided:**
        -   **Identify Next Track:** Find the first incomplete track in the registry.
        -   **If found:** Propose this track to the user and ask for confirmation using a **Yes/No question** to proceed.
        -   **If not found:** Announce that all tracks are complete and HALT.

---

## 3. Track Implementation

Adhere to this sequence to execute the selected track.

1.  **Announce Action:** Announce which track you are beginning to implement.

2.  **Update Status to 'In Progress':**
    -   Before beginning any work, update the status of the selected track to `[~]` in the **Tracks Registry** file.
    -   Stage the file and commit: `chore(conductor): Mark track '<track_description>' as in progress`.

3.  **Load Track Context (Subagent Dispatch — Task Plumber):** Delegate the parsing of the track's plan/spec/workflow and task classification to a subagent so their payloads never enter the orchestrator context.
    -   **Identify Track Folder:** Resolve `<track_id>` via the tracks file. Resolve the **paths** (do NOT read payloads) to the track's **Specification** and **Implementation Plan** (check the track's `index.md` for links, or use default paths: `conductor/tracks/<track_id>/spec.md` and `conductor/tracks/<track_id>/plan.md`). Resolve the **path** to the **Workflow** document via `conductor/index.md` (default `conductor/workflow.md`).
    -   **Dispatch:** Call the native `Task` tool with `subagent_type=general_purpose_task`, passing a closed prompt with: the resolved paths to `spec.md`, `plan.md`, and `workflow.md`, and the classification rules below.
    -   **Subagent Constraints:** Read-only. MUST read `plan.md` to extract every task with its `task_id` (derived from heading/line position) and current status marker (`[ ]`/`[~]`/`[x]`). MUST read `spec.md` and `workflow.md` to derive scope hints and TDD ordering. MUST classify each pending task as **Independent**, **Complex**, or **Trivial**. MUST NOT commit, write any file, or interact with the user. Receives no prior conversation history.
    -   **Condensed Return Schema (the ONLY thing the orchestrator absorbs):**
        `{ tasks: [{ task_id, description, type: "independent" | "complex" | "trivial", scope_hint: "...", dependencies: [task_id] }], workflow_summary: "<one-line TDD/checkpoint rule>", failed_files: [...] }`
        If any path could not be read, `failed_files` lists it; otherwise empty.
    -   **Fallback:** If no native `Task` tool is available, read the three files inline, perform the classification, then explicitly discard their payloads from working memory after producing the schema.
    -   **If `failed_files` is non-empty:** HALT and inform the user which file could not be read.
    -   **Installed Skills Check:** Check for installed skills in `.agents/skills/` and `~/.agents/extensions/conductor/skills/`. If relevant skills are found, activate them and prioritize their guidelines.

4.  **Execute Tasks and Update Track Plan:**
    -   **Subagent Delegation (dispatch point):** Use the `tasks` array and `workflow_summary` returned by the Task Plumber in step 3 (the orchestrator no longer scans or classifies tasks inline). Dispatch according to each task's `type`:
        -   If 2+ tasks of **Independent** type are found, dispatch them in parallel using the native `Task` tool with `subagent_type=general_purpose_task`, **one subagent per task**.
        -   For **Complex** tasks (whether independent or sequential), delegate each to its own subagent so the intermediate exploration, file reads, and iteration never enter the orchestrator context.
        -   For **Trivial** tasks, execute inline.
        -   Respect the `dependencies` field: a task MUST NOT be dispatched before its declared dependencies report `status: "done"` or `status: "blocked"`.
    -   **Subagent Constraints (all dispatches):** Each dispatched subagent implements exactly one task (the prompt MUST include: the `task_id`, the `task_ids` it depends on, the resolved **paths** to the track's `spec.md`/`plan.md`/`workflow.md`, and the `workflow_summary` string as a quick-reference TDD/checkpoint rule). The subagent reads `plan.md`/`spec.md`/`workflow.md` itself to obtain the full task description, acceptance criteria, and TDD protocol — the `scope_hint` is only a routing hint, NOT the full task spec. The subagent **must not commit or modify control files** (`tracks.md`, `plan.md`, `index.md`); it only returns its result to the orchestrator, which **aggregates results and performs the actual commit** for each task in plan order.
    -   **Condensed Return Schema (the ONLY thing the orchestrator absorbs per task):**
        `{ task_id, status: "done" | "blocked", files: [...], tests: { written: N, passed: N, failed: [...] }, notes: "..." }`
    -   **Fallback:** If no native `Task` tool is available, the orchestrator MUST read `plan.md`, `spec.md`, and `workflow.md` inline (one-time read), execute all tasks sequentially using the full task descriptions and TDD protocol, then explicitly discard all three payloads from working memory once every task is committed. The `workflow_summary` is NOT sufficient for inline fallback — the full documents are required.
    -   Loop through each task (in plan order, per `task_id`). The orchestrator performs the actual commit for each task in plan order, even when the underlying work was done by subagents.
    -   Ensure every human-in-the-loop interaction implied by the Workflow is conducted using appropriate question types (Yes/No, open question, or multiple-choice).

5.  **Finalize Track:**
    -   After all tasks are completed, update the track status to `[x]` in the **Tracks Registry**.
    -   Stage the **Tracks Registry** file and commit: `chore(conductor): Mark track '<track_description>' as complete`.
    -   Announce that the track is fully complete.

---

## 4. Synchronize Project Documentation

Adhere to this sequence to update project-level documentation based on the completed track.

1.  **Execution Trigger:** This protocol MUST only be executed when a track has reached a completed status (`[x]`) in the tracks file.

2.  **Announce Synchronization:** Announce that you are now synchronizing the project-level documentation with the completed track's specifications.

3.  **Resolve Track Specification Path:** Resolve the **path** (do NOT read payload) to the track's **Specification** (check the track's `index.md` for links, or use default `conductor/tracks/<track_id>/spec.md`). This path is consumed exclusively by the subagent in step 5 — the orchestrator must NOT read `spec.md` inline.

4.  **Resolve Project Document Paths (No Payload Read):**
    -   Resolve the paths to (do **NOT** read their contents inline):
        -   **Product Definition**
        -   **Tech Stack**
        -   **Product Guidelines**
    -   These payloads are consumed exclusively by the subagent in step 5.

5.  **Analyze and Update (Subagent Dispatch for Impact Analysis):** Delegate the impact analysis to a subagent so the full cross-referencing of the specification against all project documents never enters the orchestrator context.
    -   **Dispatch:** Call the native `Task` tool with `subagent_type=general_purpose_task`, passing a closed prompt with: the **path** to the track's **Specification** (from step 3) and the **paths** to **Product Definition**, **Tech Stack**, and **Product Guidelines** (from step 4). The subagent reads all four files itself.
    -   **Subagent Constraints:** Read-only. MUST read the three project documents from the provided paths. MUST NOT commit, write any file, or interact with the user. Receives no prior conversation history. Must respect the strict-controlled rule for **Product Guidelines** (only flag if the spec explicitly describes branding/voice/tone changes).
    -   **Condensed Return Schema (the ONLY thing the orchestrator absorbs):**
        `{ product_md: [{section, change_type, diff}], tech_stack: [{section, change_type, diff}], guidelines: [{section, change_type, diff}] }` — arrays are empty if no update is needed.
    -   **Fallback:** If no native `Task` tool is available, read the three project documents inline, perform the analysis, then explicitly discard their payloads from working memory after producing the diffs.
    -   **Process Returned Diffs (Orchestrator-Side):** Using the schema returned by the subagent:
        a. **Update Product Definition:** If `product_md` is non-empty, present the proposed diffs to the user and ask for approval using a **Yes/No question**. Only after explicit confirmation, perform the file edits.
        b. **Update Tech Stack:** If `tech_stack` is non-empty, present the proposed diffs to the user and ask for approval using a **Yes/No question**. Only after explicit confirmation, perform the file edits.
        c. **Update Product Guidelines (Strictly Controlled):** If `guidelines` is non-empty: **CRITICAL WARNING** — this file defines core identity. Present the proposed diffs with a clear warning about sensitivity and ask for approval using a **Yes/No question**. Only after explicit confirmation, perform the file edits.

6.  **Final Report:** Announce the completion of the synchronization process and provide a summary of the actions taken.
    -   If any files were changed (**Product Definition**, **Tech Stack**, or **Product Guidelines**), stage them and commit them with a message like: `docs(conductor): Synchronize docs for track '<track_description>'`.

---

## 5. Completion and Handoff

Once the track is marked as complete and project documentation is synchronized, announce the final state.

1.  **Summary:** Present a summary of the implementation (e.g., tasks completed, documentation updated).
2.  **Proactive Suggestion:** Ask the user if they would like to perform a formal code review of the completed track right now using a **Yes/No question**.
3.  **Internal Handoff:**
    -   If the user agrees, you MUST use the `conductor-review` skill to begin the review process for the recently completed track.
    -   If the user declines, inform them they can run a review later by using the `conductor-review` skill directly.