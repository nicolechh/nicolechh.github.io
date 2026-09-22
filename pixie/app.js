(() => {
  const P = window.PROMPTS;
  const $ = (id) => document.getElementById(id);

  const STAR_PATH = "M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z";
  const STAR_COLORS = ["var(--star-1)", "var(--star-2)", "var(--star-3)", "var(--star-4)"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  /* ---------- Mascot: a pixel fairy in profile, holding a wand ---------- */
  const MASCOT = [
    "......hhh.......",
    ".....hhhhh..z...",
    "....hhhhfff...s.",
    "....hhhffef..sss",
    "....hhhfkfff..s.",
    "...hhh.fffm..l.z",
    "www.hh.ff...a...",
    "wwww..dddaaa....",
    "wwwww.dddd......",
    ".wwwwdddddd.....",
    "..www.dddddd....",
    ".wwww.dddddd....",
    "wwww.dddddddd...",
    ".ww..dddddddd...",
    ".......f..f.....",
    ".......oo.oo....",
  ];

  const MASCOT_FILL = {
    h: "var(--label)",
    s: "var(--star-1)",
    f: "var(--skin)",
    a: "var(--skin)",
    e: "var(--screen-edge)",
    k: "var(--star-2)",
    m: "var(--star-2)",
    d: "var(--accent)",
    o: "var(--screen-edge)",
    w: "var(--star-3)",
    l: "var(--ink-soft)",
    z: "var(--star-1)",
  };

  function drawMascot() {
    let body = "";
    let wings = "";
    let star = "";
    MASCOT.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (!MASCOT_FILL[ch]) return;
        const rect = `<rect x="${x}" y="${y}" width="1" height="1" fill="${MASCOT_FILL[ch]}"/>`;
        if (ch === "w") wings += rect;
        else if (ch === "s") star += rect;
        else body += rect;
      });
    });
    $("mascot").innerHTML =
      `<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><g class="wings">${wings}</g>${body}<g class="wand-star">${star}</g></svg>`;
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  $("theme").addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("journalcize-theme", next);
  });

  /* ---------- Depth ---------- */
  let depth = store.get("journalcize-depth") || "light";
  const segs = document.querySelectorAll(".seg");
  function setDepth(d) {
    depth = d;
    segs.forEach((s) => s.setAttribute("aria-checked", String(s.dataset.depth === d)));
    store.set("journalcize-depth", d);
  }
  segs.forEach((s) =>
    s.addEventListener("click", () => {
      if (s.dataset.depth === depth) return;
      setDepth(s.dataset.depth);
      generate();
    })
  );
  setDepth(P.topics[depth] ? depth : "light");

  /* ---------- Prompt generation ---------- */
  const pick = (arr, avoid) => {
    if (arr.length < 2) return arr[0];
    let v;
    do v = arr[Math.floor(Math.random() * arr.length)];
    while (v === avoid);
    return v;
  };

  let current = { topic: null, form: null, detail: null, quote: null };
  let loading = false;
  let typeToken = 0;

  function spawnSparkles(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = `${6 + Math.random() * 88}%`;
      s.style.top = `${8 + Math.random() * 84}%`;
      s.style.setProperty("--size", `${10 + Math.random() * 22}px`);
      s.style.setProperty("--c", STAR_COLORS[i % STAR_COLORS.length]);
      s.style.setProperty("--dur", `${0.8 + Math.random() * 0.7}s`);
      s.style.setProperty("--delay", `${Math.random() * 0.6}s`);
      s.innerHTML = `<svg viewBox="0 0 16 16"><path d="${STAR_PATH}"/></svg>`;
      container.appendChild(s);
    }
    const label = document.createElement("span");
    label.className = "loading-label";
    label.textContent = "✦ conjuring ✦";
    container.appendChild(label);
  }

  function burstFrom(el, count = 10) {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const b = document.createElement("span");
      b.className = "burst";
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 40 + Math.random() * 40;
      b.style.left = `${r.left + r.width / 2 - 7}px`;
      b.style.top = `${r.top + r.height / 2 - 7}px`;
      b.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      b.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      b.style.setProperty("--c", STAR_COLORS[i % STAR_COLORS.length]);
      b.innerHTML = `<svg viewBox="0 0 16 16"><path d="${STAR_PATH}"/></svg>`;
      document.body.appendChild(b);
      b.addEventListener("animationend", () => b.remove());
    }
  }

  async function typeInto(el, text, token) {
    if (reduceMotion) { el.textContent = text; return; }
    el.textContent = "";
    el.classList.add("is-typing");
    for (let i = 1; i <= text.length; i++) {
      if (token !== typeToken) return;
      el.textContent = text.slice(0, i);
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
    }
    el.classList.remove("is-typing");
  }

  async function generate() {
    if (loading) return;
    loading = true;
    const token = ++typeToken;
    document.querySelectorAll("dd.is-typing").forEach((d) => d.classList.remove("is-typing"));

    const next = {
      topic: pick(P.topics[depth], current.topic),
      form: pick(P.forms[depth], current.form),
      detail: pick(P.details[depth], current.detail),
      quote: pick(P.quotes, current.quote),
    };
    current = next;

    const card = $("card");
    const reload = $("reload");
    card.classList.add("is-loading");
    reload.classList.add("is-loading");
    $("mascot").classList.add("is-thinking");
    spawnSparkles($("sparkles"), 18);

    await new Promise((r) => setTimeout(r, reduceMotion ? 300 : 1100));

    $("sparkles").innerHTML = "";
    $("p-topic").textContent = "";
    $("p-form").textContent = "";
    $("p-detail").textContent = "";
    $("quote-text").textContent = next.quote[0];
    $("quote-by").textContent = next.quote[1];
    card.classList.remove("is-loading");
    reload.classList.remove("is-loading");
    $("mascot").classList.remove("is-thinking");
    loading = false;

    await typeInto($("p-topic"), next.topic, token);
    await typeInto($("p-form"), next.form, token);
    await typeInto($("p-detail"), next.detail, token);
  }

  $("reload").addEventListener("click", (e) => {
    burstFrom(e.currentTarget, 8);
    generate();
  });

  $("copy").addEventListener("click", async () => {
    if (!current.topic) return;
    const text = `Write about: ${current.topic}\nThrough: ${current.form}\nInclude: ${current.detail}`;
    const btn = $("copy");
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied!";
    } catch (e) {
      btn.textContent = "Oops";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1400);
  });

  /* ---------- Timer ---------- */
  const MIN = 1, MAX = 60;
  let minutes = Math.min(MAX, Math.max(MIN, parseInt(store.get("journalcize-minutes"), 10) || 10));
  let remaining = minutes * 60;
  let endAt = null;
  let tick = null;
  let state = "idle"; // idle | running | paused

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")} : ${String(s % 60).padStart(2, "0")}`;

  function render() {
    $("time").textContent = fmt(remaining);
    const total = minutes * 60;
    $("progress").style.width = `${state === "idle" ? 0 : ((total - remaining) / total) * 100}%`;
    $("plus").disabled = state !== "idle" || minutes >= MAX;
    $("minus").disabled = state !== "idle" || minutes <= MIN;
    $("play").disabled = state === "running";
    $("pause").disabled = state !== "running";
    $("stop").disabled = state === "idle";
    document.querySelector(".screen--timer").classList.toggle("is-running", state === "running");
  }

  function setMinutes(m) {
    minutes = Math.min(MAX, Math.max(MIN, m));
    remaining = minutes * 60;
    store.set("journalcize-minutes", String(minutes));
    render();
  }

  function play() {
    if (state === "running") return;
    document.querySelector(".screen--timer").classList.remove("is-done");
    state = "running";
    endAt = Date.now() + remaining * 1000;
    tick = setInterval(() => {
      remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      if (remaining === 0) finish();
      else render();
    }, 250);
    render();
  }
  function pause() {
    if (state !== "running") return;
    clearInterval(tick);
    remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    state = "paused";
    render();
  }
  function stop() {
    clearInterval(tick);
    state = "idle";
    remaining = minutes * 60;
    render();
  }
  function finish() {
    clearInterval(tick);
    state = "idle";
    remaining = 0;
    render();
    $("progress").style.width = "100%";
    const screen = document.querySelector(".screen--timer");
    screen.classList.add("is-done");
    chime();
    burstFrom($("card"), 16);
    burstFrom($("mascot"), 10);
    setTimeout(() => {
      screen.classList.remove("is-done");
      remaining = minutes * 60;
      render();
    }, 4000);
  }

  function chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      [659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.65);
      });
    } catch (e) {}
  }

  $("plus").addEventListener("click", () => setMinutes(minutes + 1));
  $("minus").addEventListener("click", () => setMinutes(minutes - 1));
  $("play").addEventListener("click", play);
  $("pause").addEventListener("click", pause);
  $("stop").addEventListener("click", stop);

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "r" || e.key === "R") {
      $("reload").classList.add("is-pressed");
      setTimeout(() => $("reload").classList.remove("is-pressed"), 120);
      burstFrom($("reload"), 8);
      generate();
    } else if (e.key === " " && tag !== "BUTTON") {
      e.preventDefault();
      state === "running" ? pause() : play();
    }
  });

  /* ---------- Init ---------- */
  drawMascot();
  render();
  generate();
})();
