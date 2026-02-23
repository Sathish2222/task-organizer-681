# Project Repository

This is the initial README file for the project.

## Squashing commits (important)
If you see an error like **“No git repository found in workspace”**, it usually means the squash operation is being run from the workspace root instead of this repo folder.

Use the repo-safe squash helper from the workspace root:

```bash
./scripts/kavia-squash.sh --repo task-organizer-681 --base origin/main
```

For details, see: `SQUASHING.md` (at the workspace root).