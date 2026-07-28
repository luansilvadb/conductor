"""Determines the next unblocked setup step in the Conductor workflow.

Reads centralized configuration from config.json — no hardcoded file lists or paths.
"""

import json
import os
import sys


def load_config():
    """Loads the centralized Conductor configuration."""
    search_paths = [
        os.path.join("conductor", "config.json"),
        os.path.join(".conductor", "config.json"),
    ]
    for path in search_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)

    # Fallback: use built-in defaults from the template
    template_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "..", "config.json"
    )
    if os.path.exists(template_path):
        with open(template_path, "r", encoding="utf-8") as f:
            return json.load(f)

    raise FileNotFoundError(
        "Cannot find config.json. Expected at conductor/config.json or .conductor/config.json"
    )


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
