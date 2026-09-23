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
        const rect = `<rect x="${x}" y="${y}" width="1" height="1" style="fill:${MASCOT_FILL[ch]}"/>`;
        if (ch === "w") wings += rect;
        else if (ch === "s") star += rect;
        else body += rect;
      });
    });
    $("mascot").innerHTML =
      `<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><g class="wings">${wings}</g>${body}<g class="wand-star">${star}</g></svg>`;
  }


  /* ---------- Desk decor sprites ---------- */
  const SPRITES = {
    pencil: {
      rows: [
        "oooooooooooooooo....",
        "oeebyyyyyyyyyyyyoo..",
        "oeebYYYYYYYYYYYYwwlo",
        "oeebyyyyyyyyyyyyoo..",
        "oooooooooooooooo....",
      ],
      fill: { o: "var(--ink)", e: "var(--star-2)", b: "var(--ring)", y: "var(--star-1)", Y: "#e8b64c", w: "#f3d2a8", l: "var(--ink)" },
    },
    pen: {
      rows: [
        "oooooooooooooooooo....",
        "ocggggcgbbbbbbbbbbooo.",
        "occccccgbbbbbbbbbbnnno",
        "occccccgbbbbbbbbbbooo.",
        "oooooooooooooooooo....",
      ],
      fill: { o: "var(--ink)", c: "var(--label)", g: "var(--star-1)", b: "var(--accent)", n: "var(--star-1)" },
    },
    mug: {
      rows: [
        "oooooooooo..",
        "oCCCCCCCCo..",
        "ommmmmmmmooo",
        "ommmhmmmmo.o",
        "ommhhhmmmo.o",
        "ommmhmmmmooo",
        "ommmmmmmmo..",
        ".ommmmmmo...",
        "..oooooo....",
      ],
      fill: { o: "var(--ink)", C: "#8a5a44", m: "var(--tape-blue)", h: "var(--star-2)" },
    },
    heart: {
      rows: [
        ".ooo.ooo.",
        "ohhhohhho",
        "ohWhhhhho",
        "ohhhhhhho",
        ".ohhhhho.",
        "..ohhho..",
        "...oho...",
        "....o....",
      ],
      fill: { o: "var(--ink)", h: "var(--star-2)", W: "#ffffff" },
    },
    star: {
      rows: [
        ".....o.....",
        "....oso....",
        "...ossso...",
        "oooosssoooo",
        ".ossssssso.",
        "..ossssso..",
        ".ossssssso.",
        ".osso.osso.",
        "oso.....oso",
        "oo.......oo",
      ],
      fill: { o: "var(--ink)", s: "var(--star-1)" },
    },
    moon: {
      rows: [
        "...oo......",
        "..ommo.....",
        ".ommo......",
        "ommmo......",
        "ommmo......",
        "ommmmo.....",
        "ommmmooooo.",
        "ommmmmmmmmo",
        ".ommmmmmmo.",
        "..ommmmmo..",
        "...ooooo...",
      ],
      fill: { o: "var(--ink)", m: "var(--star-3)" },
    },
    flower: {
      rows: [
        ".....ooo.....",
        "....opppo....",
        "...opppppo...",
        "..oopppppoo..",
        ".oppopppoppo.",
        "oppppcccppppo",
        "oppppcccppppo",
        "oppppcccppppo",
        ".oppopppoppo.",
        "..oopppppoo..",
        "...opppppo...",
        "....opppo....",
        ".....ooo.....",
      ],
      fill: { o: "var(--ink)", p: "var(--tape-lilac)", c: "var(--star-1)" },
    },
  };

  SPRITES.ring = {
    rows: [
      ".oooooooooooooooo.",
      "orwwwwwwwwwwwwwwro",
      "orrrrrrrrrrrrrrrro",
      "oddddddddddddddddo",
      ".oooooooooooooooo.",
    ],
    fill: { o: "var(--ink)", r: "var(--ring)", w: "var(--ring-hi)", d: "var(--ring-shade)" },
  };
  SPRITES.ribbon = {
    rows: [
      ...Array(24).fill("oRRRRRLo"),
      "oRRooRLo",
      "oRo..oRo",
      "oo....oo",
    ],
    fill: { o: "var(--ink)", R: "var(--label)", L: "color-mix(in srgb, var(--label) 70%, white)" },
  };

  function pixelSvg(rows, fill) {
    let rects = "";
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (fill[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" style="fill:${fill[ch]}"/>`;
      });
    });
    return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  document.querySelectorAll("[data-sprite]").forEach((el) => {
    const s = SPRITES[el.dataset.sprite];
    if (s) el.innerHTML = pixelSvg(s.rows, s.fill);
  });

  // Spiral binding
  const rings = document.querySelector(".rings");
  for (let i = 0; i < 13; i++) {
    const ring = document.createElement("span");
    ring.innerHTML = pixelSvg(SPRITES.ring.rows, SPRITES.ring.fill);
    rings.appendChild(ring);
  }

  // Today's date, journal style
  $("date").textContent = new Date()
    .toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
    .toLowerCase();

  // Page numbers turn with each new prompt
  let pageNo = 10 + Math.floor(Math.random() * 40) * 2;
  function turnPage() {
    pageNo += 2;
    $("page-left").textContent = `— ${pageNo - 1} —`;
    $("page-right").textContent = `— ${pageNo} —`;
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
    $("m-reload").classList.add("is-loading");
    $("mascot").classList.add("is-thinking");
    spawnSparkles($("sparkles"), 18);

    await new Promise((r) => setTimeout(r, reduceMotion ? 300 : 1100));

    $("sparkles").innerHTML = "";
    $("p-topic").textContent = "";
    $("p-form").textContent = "";
    $("p-detail").textContent = "";
    $("quote-text").textContent = next.quote[0];
    $("quote-by").textContent = next.quote[1];
    turnPage();
    card.classList.remove("is-loading");
    reload.classList.remove("is-loading");
    $("m-reload").classList.remove("is-loading");
    $("mascot").classList.remove("is-thinking");
    loading = false;

    await typeInto($("p-topic"), next.topic, token);
    await typeInto($("p-form"), next.form, token);
    await typeInto($("p-detail"), next.detail, token);
    if (token === typeToken) fitDesk();
  }

  $("reload").addEventListener("click", (e) => {
    burstFrom(e.currentTarget, 8);
    generate();
  });

  // Phone quick bar: new prompt, bringing the prompt page back into view if needed
  $("m-reload").addEventListener("click", (e) => {
    burstFrom(e.currentTarget, 8);
    // the prompt page comes first on phones, so head back to the top
    if ($("card").getBoundingClientRect().top < 0) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
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
    document.querySelector(".clock").classList.toggle("is-running", state === "running");
    // phone quick bar mirrors the main timer
    $("m-time").textContent = fmt(remaining);
    $("m-time").classList.toggle("is-running", state === "running");
    $("m-toggle").classList.toggle("is-running", state === "running");
    $("m-toggle").setAttribute("aria-label", state === "running" ? "Pause timer" : "Start timer");
  }

  function setMinutes(m) {
    minutes = Math.min(MAX, Math.max(MIN, m));
    remaining = minutes * 60;
    store.set("journalcize-minutes", String(minutes));
    render();
  }

  function play() {
    if (state === "running") return;
    document.querySelector(".clock").classList.remove("is-done");
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
    const screen = document.querySelector(".clock");
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
  $("m-toggle").addEventListener("click", () => (state === "running" ? pause() : play()));

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



  /* ---------- Hand-drawn sketch outlines ---------- */
  // Each .sketch element gets a rough pen box: every edge is drawn twice with
  // slightly bowed strokes that overshoot the corners, plus loose diagonal
  // colored-pencil hatching. Seeded per element so the drawing is stable.
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawSketch(el, seed) {
    const pad = 8;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const rnd = seeded(seed);
    const j = (a) => (rnd() * 2 - 1) * a;
    const f = (n) => n.toFixed(1);

    // one slightly bowed pen stroke from a to b, overshooting both ends
    const stroke = (xa, ya, xb, yb, wobble) => {
      const len = Math.hypot(xb - xa, yb - ya);
      const ux = (xb - xa) / len, uy = (yb - ya) / len;
      const o1 = 1 + rnd() * 3, o2 = 1 + rnd() * 4;
      const sx = xa - ux * o1 + j(wobble), sy = ya - uy * o1 + j(wobble);
      const ex = xb + ux * o2 + j(wobble), ey = yb + uy * o2 + j(wobble);
      const bow = j(Math.min(2.5, 0.6 + len * 0.01));
      const mx = (sx + ex) / 2 - uy * bow + j(0.6), my = (sy + ey) / 2 + ux * bow + j(0.6);
      return `M${f(sx)} ${f(sy)}Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
    };

    const x0 = pad, y0 = pad, x1 = pad + w, y1 = pad + h;
    const box = (wob) =>
      stroke(x0, y0, x1, y0, wob) + stroke(x1, y0, x1, y1, wob) +
      stroke(x1, y1, x0, y1, wob) + stroke(x0, y1, x0, y0, wob);
    const ink1 = box(1.2);
    const ink2 = box(1.8);

    // hatching: "/" strokes clipped to a slightly inset box
    const hx0 = x0 + 3, hy0 = y0 + 3, hx1 = x1 - 3, hy1 = y1 - 3;
    const gap = Math.min(w, h) < 30 ? 4.5 : 6;
    let hatch = "";
    for (let c = hx0 + hy0 + gap / 2; c < hx1 + hy1; c += gap + j(0.8)) {
      const sx = Math.max(hx0, c - hy1), ex = Math.min(hx1, c - hy0);
      if (ex - sx < 2) continue;
      const a = j(1.2), b = j(1.2);
      hatch += `M${f(sx + a)} ${f(c - sx - a + j(0.8))}L${f(ex + b)} ${f(c - ex - b + j(0.8))}`;
    }

    let svg = el.querySelector(":scope > .sketch-line");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sketch-line");
      svg.setAttribute("aria-hidden", "true");
      el.appendChild(svg);
    }
    const W = w + pad * 2, H = h + pad * 2;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.left = `${-pad}px`;
    svg.style.top = `${-pad}px`;
    svg.style.width = `${W}px`;
    svg.style.height = `${H}px`;
    svg.innerHTML =
      `<path class="hatch" d="${hatch}"/>` +
      `<path class="ink" d="${ink1}"/>` +
      `<path class="ink ink--2" d="${ink2}"/>`;
  }

  const sketches = [...document.querySelectorAll(".sketch")];
  const redrawSketches = () => sketches.forEach((el, i) => drawSketch(el, 1234 + i * 97));
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver((entries) => entries.forEach((e) => drawSketch(e.target, 1234 + sketches.indexOf(e.target) * 97)));
    sketches.forEach((el) => ro.observe(el));
  } else {
    redrawSketches();
    window.addEventListener("resize", redrawSketches);
  }

  /* ---------- Fit the desk to the viewport on desktop ---------- */
  const desk = document.querySelector(".desk");
  function fitDesk() {
    desk.style.zoom = "";
    if (window.innerWidth <= 900) return;
    const cs = getComputedStyle(document.body);
    const availH = window.innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const scale = Math.min(1, availH / desk.offsetHeight);
    if (scale < 1) desk.style.zoom = scale.toFixed(3);
  }
  let fitFrame;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitDesk);
  });
  if (document.fonts) document.fonts.ready.then(fitDesk);


  /* ---------- Cursor sparkle trail ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let lastX = -99, lastY = -99, lastT = 0;
    document.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 12 || now - lastT < 28) return;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      const t = document.createElement("span");
      t.className = "trail";
      t.style.left = `${e.clientX + (Math.random() * 10 - 5)}px`;
      t.style.top = `${e.clientY + (Math.random() * 10 - 5)}px`;
      t.style.setProperty("--s", `${9 + Math.random() * 10}px`);
      t.style.setProperty("--c", STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
      t.style.setProperty("--dx", `${Math.random() * 20 - 10}px`);
      t.innerHTML = `<svg viewBox="0 0 16 16"><path d="${STAR_PATH}"/></svg>`;
      document.body.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    });
  }

  /* ---------- Init ---------- */
  drawMascot();
  render();
  fitDesk();
  generate();
})();
