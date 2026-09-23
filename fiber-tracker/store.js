/* Storage adapter.
   Everything the app saves goes through load() / save(). Right now that's the browser's
   localStorage, so each person's log stays private on their own device and the site can be
   hosted as plain static files (e.g. GitHub Pages).
   To add accounts + cross-device sync later, swap these two functions for calls to a backend
   (Supabase, Firebase, …) keyed by the signed-in user; app.js doesn't need to change. */
(() => {
  const KEY = "fiberpatch-v1";

  const fresh = () => ({ version: 1, goal: 30, entries: [], customFoods: [] });

  function normalize(d) {
    const out = fresh();
    if (!d || typeof d !== "object") return out;
    if (Number.isFinite(d.goal)) out.goal = Math.min(80, Math.max(5, Math.round(d.goal)));
    if (Array.isArray(d.entries)) {
      out.entries = d.entries.filter((e) =>
        e && typeof e.id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
        typeof e.name === "string" && Number.isFinite(e.grams) && Number.isFinite(e.per100));
    }
    if (Array.isArray(d.customFoods)) {
      out.customFoods = d.customFoods.filter((f) => f && typeof f.id === "string" && typeof f.name === "string" && Number.isFinite(f.per100));
    }
    return out;
  }

  window.FiberStore = {
    fresh,
    normalize,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return normalize(JSON.parse(raw));
      } catch (e) {}
      return fresh();
    },
    save(data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
  };
})();
