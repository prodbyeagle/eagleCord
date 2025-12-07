This plugin ensures that only one user-facing audio element (like a message attachment) plays at a time. When a new sound starts, any currently playing sound with controls is automatically paused so you can quickly preview effects or samples without overlap.

Implementation detail: we patch the rendered `<audio controls>` elements to wire `onPlay`/`onEnded` handlers instead of monkey-patching `Audio.prototype.play`, so notification sounds and other internal audio remain unaffected.
