"""Determines the next unblocked setup step in the Conductor workflow.

Reads centralized configuration from config.json — no hardcoded file lists or paths.
"""

import json
import os
import sys


def find_config():
    """Walks up from cwd to find config.json."""
    current = os.getcwd()
    while True:
        candidate = os.path.join(current, "config.json")
        if os.path.exists(candidate):
            return candidate
        parent = os.path.dirname(current)
        if parent == current:  # reached filesystem root
            break
        current = parent
    raise FileNotFoundError(
        "Cannot find config.json in any parent directory from " + os.getcwd()
    )


def load_config():
    """Loads the centralized Conductor configuration."""
    config_path = find_config()
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def determine_resumption():
    """Checks existing setup artifacts and returns the next unblocked step."""
    config = load_config()

    conductor_dir = config["directories"]["conductor_root"]
    setup_chain = config["files"]["setup_chain"]
    setup_marker = config["files"]["setup_marker"]

    # Build checklist dynamically from setup_chain
    checklist = {}
    for item in setup_chain:
        filename = item["file"]
        path = os.path.join(conductor_dir, filename)
        checklist[filename] = os.path.exists(path)

    marker_present = os.path.exists(os.path.join(conductor_dir, setup_marker))

    # A step carrying a `condition` does not apply to every project — the design
    # system is skipped for a library, a CLI or a headless service. Its artifact
    # will never exist there, so counting it as missing would leave the setup
    # permanently incomplete: the marker stays, `missing_steps` never empties,
    # and every later run greets as an upgrade and re-offers a step the user
    # already declined. Conditional steps are reported separately so the skill
    # can decide whether they apply, and they never block completion.
    missing_steps = [
        {"step": item["step"], "file": item["file"]}
        for item in setup_chain
        if not checklist[item["file"]] and "condition" not in item
    ]

    pending_conditional = [
        {"step": item["step"], "file": item["file"], "condition": item["condition"]}
        for item in setup_chain
        if not checklist[item["file"]] and "condition" in item
    ]

    next_step = missing_steps[0] if missing_steps else None

    # The marker alone does not mean "done": a project set up by an older
    # Conductor carries the marker but predates steps added since. Reporting it
    # as complete would hide them; reporting it as fresh would re-run a setup
    # that already happened and overwrite the user's answers. The two flags are
    # kept separate so the skill can tell those cases apart — marker present and
    # nothing missing is complete, marker present with steps missing is an
    # upgrade, and no marker is a first run.
    return {
        "setup_complete": marker_present and not missing_steps,
        "marker_present": marker_present,
        "is_upgrade": marker_present and bool(missing_steps),
        "checklist": checklist,
        "missing_steps": missing_steps,
        "pending_conditional": pending_conditional,
        "next_step": next_step,
    }


if __name__ == "__main__":
    try:
        result = determine_resumption()
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["next_step"] is None else 1)
    except FileNotFoundError as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(2)
