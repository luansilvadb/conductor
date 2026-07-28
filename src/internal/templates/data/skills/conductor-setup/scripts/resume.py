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

    setup_complete = os.path.exists(os.path.join(conductor_dir, setup_marker))

    # Find first incomplete step
    next_step = None
    for item in setup_chain:
        filename = item["file"]
        if not checklist[filename]:
            next_step = {
                "step": item["step"],
                "file": filename,
            }
            break

    return {
        "setup_complete": setup_complete,
        "checklist": checklist,
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
