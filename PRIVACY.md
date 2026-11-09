# Privacy

This fork of show-your-work runs only on your computer. It has no telemetry and no updater: the plugin itself makes no network requests.

## What it keeps on your computer

- Video frames and converted pictures, in a temp folder (`$TMPDIR/claude-show-your-work-<your user id>`). Anything older than a week is deleted.
- A copy of each file Claude shows you, in `store/` inside that temp folder, for version history. Never inside your project.
- Your settings, in Claude Code's storage for the plugin.
- Only if you start Claude Code with `SHOW_YOUR_WORK_DEBUG=1`: a debug log (`debug.log` in the temp folder) of what the plugin did, including file paths and window sizes.

Nothing kept on your computer is sent anywhere.
