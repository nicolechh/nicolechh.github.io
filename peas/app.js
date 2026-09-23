(() => {
  const { FOODS, CUSTOM_LOOK, pixelSvg, foodSvg, foodColor } = window.FIBER;
  const Store = window.FiberStore;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LEAF_PATH = "M5 0h3v1H5zM3 1h5v1H3zM2 2h5v1H2zM1 3h5v1H1zM1 4h4v1H1zM1 5h3v1H1zM0 6h2v1H0zM0 7h1v1H0z";
  const LEAF_COLORS = ["var(--hatch-lime)", "var(--hatch-mint)", "var(--accent)", "var(--hatch-sun)", "var(--hatch-berry)"];

  const prefs = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  let data = Store.load();
  const save = () => Store.save(data);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- Dates (local YYYY-MM-DD keys, weeks start Monday) ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
  const todayKey = () => keyOf(new Date());
  const weekStart = (k) => { const d = parseKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return keyOf(d); };
  const monthStart = (k) => k.slice(0, 8) + "01";
  const monthEnd = (k) => { const d = parseKey(k); return keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
  const rangeKeys = (a, b) => { const out = []; for (let k = a; k <= b; k = addDays(k, 1)) out.push(k); return out; };
  const fmtDate = (k, opts) => parseKey(k).toLocaleDateString(undefined, opts).toLowerCase();
  const dayDiff = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);

  /* ---------- Numbers ---------- */
  const fmtG = (n) => { const v = Math.round(n * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); };
  const fiberOf = (e) => (e.grams * e.per100) / 100;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  /* ---------- Foods ---------- */
  const allFoods = () => [...FOODS, ...data.customFoods];
  const findFood = (id) => allFoods().find((f) => f.id === id);
  // Look (sprite + colour) for an entry, even if its food was since removed
  const lookOf = (e) => findFood(e.foodId) || { name: e.name, ...CUSTOM_LOOK };

  function dayTotals() {
    const m = new Map();
    for (const e of data.entries) m.set(e.date, (m.get(e.date) || 0) + fiberOf(e));
    return m;
  }

  /* ---------- Pixel sprites for the pot mascot & decor ---------- */
  const POT = [
    "...osssssssso...",
    "..orrrrrrrrrro..",
    "..oRRRRRRRRRRo..",
    "...opppppppPo...",
    "....oppppPPo....",
    ".....oooooo.....",
  ];
  const PLANTS = [
    // 0: a seed resting in the soil
    ["................", "................", "................", "................", "................",
     "................", "................", "................", "................", "......oddo......"],
    // 1: first sprout
    ["................", "................", "................", "................", "................",
     "................", ".....oo.oo......", "....oggoggo.....", ".....ooeoo......", ".......e........"],
    // 2: two big leaves
    ["................", "................", "................", "..ooo.....ooo...", ".ogggo...ogggo..",
     ".oggGGo.oGGggo..", "..ooGGoeoGGoo...", ".......e........", ".......e........", ".......e........"],
    // 3: growing tall
    ["................", ".....oo.oo......", "....oggoggo.....", ".....ooeoo......", "..ooo..e..ooo...",
     ".ogggo.e.ogggo..", ".oggGGoeoGGggo..", "..ooGGoeoGGoo...", ".......e........", ".......e........"],
    // 4: in bloom — goal met!
    [".....oo.oo......", "....offoffo.....", "....ofyyyfo.....", "....offyffo.....", ".....ooeoo......",
     "..ooo..e..ooo...", ".ogggo.e.ogggo..", ".oggGGoeoGGggo..", "..ooGGoeoGGoo...", ".......e........"],
  ];
  const POT_FILL = {
    o: "var(--ink)", s: "#6a4a30", r: "#e0895a", R: "#b8603a", p: "#d0704a", P: "#a0502e",
    d: "#c8a060", g: "#7ad05a", G: "#4a9a3a", e: "#4a9a3a", f: "#ffd23a", y: "#8a5a2a",
  };
  const potSvg = (stage) => pixelSvg([...PLANTS[stage], ...POT], POT_FILL);

  const DECOR = {
    ladybug: {
      rows: ["..o...o..", "...ooo...", "..okkko..", ".orrkrro.", "orrdkdrro", "orrrkrrro", ".ordkdro.", "..ooooo.."],
      fill: { o: "var(--ink)", k: "#1e1e1e", d: "#1e1e1e", r: "#e8403a" },
    },
    butterfly: {
      rows: ["....o.o....", ".oo..o..oo.", "oppo.b.oppo", "opyppbppypo", "oppppbppppo", "..oqqbqqo..", "..oqoboqo..", "...o.o.o..."],
      fill: { o: "var(--ink)", b: "var(--ink)", p: "#ffd23a", y: "#ff8a3a", q: "#ffb03a" },
    },
  };
  const FLOWER = pixelSvg([".opo.", "opcpo", ".opo.", "..e..", ".ee.."], { o: "var(--ink)", p: "#ffd23a", c: "#a0602a", e: "#2f7a2a" });

  document.querySelectorAll("[data-sprite]").forEach((el) => {
    const name = el.dataset.sprite;
    if (DECOR[name]) el.innerHTML = pixelSvg(DECOR[name].rows, DECOR[name].fill);
    if (name === "seed") el.innerHTML = potSvg(1);
  });
  document.querySelectorAll("[data-food]").forEach((el) => {
    const f = findFood(el.dataset.food);
    if (f) el.innerHTML = foodSvg(f);
  });

  /* ---------- State ---------- */
  let selected = todayKey();
  let view = ["day", "week", "month"].includes(prefs.get("peapal-view")) ? prefs.get("peapal-view") : "week";
  let chosen = null;     // the food picked in the form
  let editingId = null;  // entry being edited
  const expanded = { week: false, month: false };
  let rankBy = prefs.get("peapal-rank") === "grams" ? "grams" : "fiber";

  /* ---------- Render: date bar ---------- */
  const narrow = window.matchMedia("(max-width: 720px)");
  function renderDate() {
    const today = todayKey();
    $("date-main").textContent = fmtDate(selected, { weekday: narrow.matches ? "short" : "long", month: "short", day: "numeric" });
    const diff = dayDiff(today, selected);
    $("date-sub").textContent =
      diff === 0 ? "today" : diff === -1 ? "yesterday" : diff === 1 ? "tomorrow" :
      diff < 0 ? `${-diff} days ago` : `in ${diff} days`;
    $("go-today").disabled = diff === 0;
  }

  narrow.addEventListener?.("change", renderDate);

  /* ---------- Render: summary tiles ---------- */
  function renderStats(totals) {
    const goal = data.goal;
    const today = todayKey();
    const t = (k) => totals.get(k) || 0;

    // Day
    const dayTotal = t(selected);
    $("today-label").textContent = selected === today ? "today" : fmtDate(selected, { weekday: "long" });
    $("today-total").textContent = fmtG(dayTotal);
    $("today-goal").textContent = goal;
    const pct = Math.min(100, (dayTotal / goal) * 100);
    $("today-bar").style.width = `${pct}%`;
    $("today-meter").setAttribute("aria-valuenow", String(Math.round(pct)));
    $("today-note").textContent =
      dayTotal >= goal ? `goal met! ${dayTotal > goal ? `+${fmtG(dayTotal - goal)} g bonus` : "✿"}` :
      dayTotal === 0 ? "your seed is waiting…" : `${fmtG(goal - dayTotal)} g to go`;
    const ratio = dayTotal / goal;
    const stage = ratio >= 1 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.35 ? 2 : ratio > 0 ? 1 : 0;
    const pot = $("pot");
    if (pot.dataset.stage !== String(stage)) {
      pot.dataset.stage = String(stage);
      pot.innerHTML = potSvg(stage);
      pot.classList.toggle("is-grown", stage === 4);
    }

    // Week
    const ws = weekStart(selected);
    const week = rangeKeys(ws, addDays(ws, 6));
    const weekTotal = week.reduce((s, k) => s + t(k), 0);
    const weekElapsed = week.filter((k) => k <= today).length;
    const weekMet = week.filter((k) => t(k) >= goal).length;
    $("week-total").textContent = fmtG(weekTotal);
    $("week-avg").textContent = fmtG(weekElapsed ? weekTotal / weekElapsed : 0);
    $("week-dots").innerHTML = week.map((k) => {
      const v = t(k);
      const cls = [v >= goal ? "is-met" : v > 0 ? "is-some" : "", k > today ? "is-future" : "", k === selected ? "is-selected" : ""].join(" ");
      return `<span class="${cls}" data-tip="${esc(fmtDate(k, { weekday: "short", day: "numeric" }))}\n${fmtG(v)} g"></span>`;
    }).join("");
    $("week-note").textContent = `${weekMet} of 7 days on goal`;

    // Month
    const ms = monthStart(selected);
    const month = rangeKeys(ms, monthEnd(selected));
    const monthTotal = month.reduce((s, k) => s + t(k), 0);
    const monthElapsed = month.filter((k) => k <= today).length;
    const best = month.reduce((b, k) => (t(k) > t(b) ? k : b), month[0]);
    $("month-label").textContent = ms === monthStart(today) ? "this month" : fmtDate(ms, { month: "long" });
    $("month-total").textContent = fmtG(monthTotal);
    $("month-avg").textContent = fmtG(monthElapsed ? monthTotal / monthElapsed : 0);
    $("month-note").textContent = t(best) > 0
      ? `best day: ${fmtG(t(best))} g on ${fmtDate(best, { month: "short", day: "numeric" })}`
      : "nothing logged yet";

    // Streak (counts back from today; today only breaks it once it's over)
    let k = t(today) >= goal ? today : addDays(today, -1);
    let streak = 0;
    while (t(k) >= goal) { streak++; k = addDays(k, -1); }
    $("streak").textContent = streak;
    $("streak-unit").textContent = streak === 1 ? " day" : " days";
    $("streak-note").textContent = streak === 0 ? "hit your goal to start one"
      : t(today) >= goal ? "in a row, including today" : "in a row · keep it going!";
    $("goal").textContent = goal;
  }

  /* ---------- Render: today's plate ---------- */
  const ICON_EDIT = `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 15.8 C4.5 14.3 4.8 12.9 5.1 11.6 C8 8.6 10.8 5.8 13.5 3.3 C14.6 4.2 15.6 5.3 16.6 6.4 C13.8 9.2 11 12 8.2 14.8 C6.9 15.2 5.5 15.5 4.2 15.8 M11.8 5 C12.9 6 14 7.1 15 8.2"/></svg>`;
  const ICON_DEL = `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5.2 C8 8.1 11.8 11.9 15.1 15 M15 4.9 C11.9 8 8.2 11.8 4.9 15.2"/></svg>`;

  function renderEntries() {
    const today = todayKey();
    const list = data.entries.filter((e) => e.date === selected).sort((a, b) => a.createdAt - b.createdAt);
    const total = list.reduce((s, e) => s + fiberOf(e), 0);
    const shortDay = fmtDate(selected, { weekday: "short", month: "short", day: "numeric" });
    $("plate-title").textContent = selected === today ? "today's plate" : `plate for ${shortDay}`;
    $("eaten-title").textContent = selected === today ? "eaten today" : `eaten on ${shortDay}`;
    $("plate-total").textContent = list.length ? `${fmtG(total)} g fiber · ${plural(list.length, "food", "foods")}` : "";
    $("entries").innerHTML = list.map((e) => `
      <li class="entry${e.id === editingId ? " is-editing" : ""}" data-id="${e.id}">
        <span class="art">${foodSvg(lookOf(e))}</span>
        <span class="entry__name">${esc(e.name)}<small>${fmtG(e.grams)} g · ${fmtG(e.per100)} g fiber per 100 g</small></span>
        <span class="entry__fiber">${fmtG(fiberOf(e))} g</span>
        <span class="entry__actions">
          <button type="button" class="edit" aria-label="Edit ${esc(e.name)}" data-tip="edit">${ICON_EDIT}</button>
          <button type="button" class="del" aria-label="Remove ${esc(e.name)}" data-tip="remove">${ICON_DEL}</button>
        </span>
      </li>`).join("");
    $("empty").hidden = list.length > 0;
    $("empty").querySelector("p").innerHTML =
      selected === today ? "nothing planted yet today.<br />log a food above to start growing."
      : selected < today ? "nothing logged on this day.<br />missed it? add foods above to backfill."
      : "this day hasn't happened yet.<br />check back when it does.";
  }

  function renderRecent() {
    const seen = new Set();
    const recent = [];
    for (const e of [...data.entries].sort((a, b) => b.createdAt - a.createdAt)) {
      if (seen.has(e.foodId)) continue;
      seen.add(e.foodId);
      const f = findFood(e.foodId);
      if (f) recent.push(f);
      if (recent.length === 6) break;
    }
    $("recent-wrap").hidden = recent.length === 0;
    $("recent").innerHTML = recent.map((f) =>
      `<button type="button" class="chip" data-food="${esc(f.id)}"><span class="art">${foodSvg(f)}</span>${esc(f.name.replace(/ \(.*\)$/, ""))}</button>`
    ).join("");
  }

  /* ---------- Render: chart ---------- */
  function renderChart(totals) {
    document.querySelectorAll(".seg[data-view]").forEach((s) => s.setAttribute("aria-checked", String(s.dataset.view === view)));
    if (view === "day") renderWaffle();
    else if (view === "week") renderWeek(totals);
    else renderMonth(totals);
  }

  function renderWaffle() {
    const goal = data.goal;
    const byFood = new Map();
    for (const e of data.entries.filter((x) => x.date === selected)) {
      const key = e.foodId || e.name;
      const cur = byFood.get(key) || { name: e.name, look: lookOf(e), fiber: 0 };
      cur.fiber += fiberOf(e);
      byFood.set(key, cur);
    }
    const foods = [...byFood.values()].sort((a, b) => b.fiber - a.fiber);
    const total = foods.reduce((s, f) => s + f.fiber, 0);
    const dayName = selected === todayKey() ? "today" : fmtDate(selected, { weekday: "long", month: "short", day: "numeric" });

    $("chart-caption").textContent = `${dayName} · each square is 1 g of fiber · ${fmtG(total)} of ${goal} g`;
    if (!total) {
      $("chart").innerHTML = `<div class="chart-empty"><div><div class="empty__art">${potSvg(0)}</div><p>no fiber logged ${selected === todayKey() ? "yet today" : "on this day"}.<br />each gram you log fills a square of soil.</p></div></div>`;
      $("chart-legend").innerHTML = "";
      return;
    }
    const cells = Math.min(150, Math.max(goal, Math.ceil(total)));
    const owner = new Array(cells).fill(null);
    let cum = 0, from = 0;
    foods.forEach((f, i) => {
      cum += f.fiber;
      const to = Math.min(cells, Math.round(cum));
      for (let c = from; c < to; c++) owner[c] = i;
      from = Math.max(from, to);
    });
    $("chart").innerHTML = `<div class="waffle" role="img" aria-label="${fmtG(total)} of ${goal} grams of fiber">${owner.map((i, c) => {
      if (i === null) return `<i data-tip="${c < goal ? "empty soil · still to grow" : ""}"></i>`;
      const f = foods[i];
      return `<i class="is-filled${c >= goal ? " is-bonus" : ""}" style="background:${foodColor(f.look)};animation-delay:${reduceMotion ? 0 : c * 12}ms" data-tip="${esc(f.name)}\n${fmtG(f.fiber)} g fiber"></i>`;
    }).join("")}</div>`;
    $("chart-legend").innerHTML = foods.map((f) =>
      `<span class="legend-item"><span class="sw" style="background:${foodColor(f.look)}"></span><span class="art">${foodSvg(f.look)}</span>${esc(f.name)} <em>${fmtG(f.fiber)} g</em></span>`
    ).join("") + (total > goal ? `<span class="legend-item"><span class="sw" style="background:var(--heat-3);position:relative"><span style="position:absolute;inset:3px;background:#fffbe0"></span></span><em>bonus beyond goal</em></span>` : "");
  }

  function renderWeek(totals) {
    const goal = data.goal;
    const today = todayKey();
    const ws = weekStart(selected);
    const days = rangeKeys(ws, addDays(ws, 6));
    const vals = days.map((k) => totals.get(k) || 0);
    // Draw at the container's real width so labels stay legible on phones
    const W = Math.round(Math.max(300, Math.min(660, $("chart").clientWidth || 660)));
    const H = W < 480 ? 250 : 300, top = 52, bottom = 46, side = 4;
    const plotH = H - top - bottom;
    const max = Math.max(goal * 1.25, ...vals.map((v) => v * 1.08));
    const col = (W - side * 2) / 7;
    const bw = Math.round(col * 0.54);
    const yOf = (v) => top + plotH - (v / max) * plotH;
    const base = top + plotH;

    let svg = `<svg class="bars" viewBox="0 0 ${W} ${H}" role="group" aria-label="Fiber per day this week">`;
    svg += `<rect class="soil" x="0" y="${base}" width="${W}" height="8"/>`;
    days.forEach((k, i) => {
      const v = vals[i];
      const cx = side + col * i + col / 2;
      const x = Math.round(cx - bw / 2);
      const y = Math.round(yOf(v));
      const h = base - y;
      const met = v >= goal;
      const sel = k === selected;
      const label = fmtDate(k, { weekday: "long", month: "short", day: "numeric" });
      svg += `<rect class="bar-hit" x="${side + col * i}" y="${top - 40}" width="${col}" height="${plotH + 40 + bottom}" tabindex="0" role="button" data-key="${k}" aria-label="${esc(label)}: ${fmtG(v)} grams" data-tip="${esc(label)}\n${fmtG(v)} g${met ? " · goal met ✿" : ""}"/>`;
      if (v > 0) {
        svg += `<rect class="bar${met ? " is-met" : ""}${sel ? " is-sel" : ""}" x="${x}" y="${y}" width="${bw}" height="${h}"/>`;
        if (h > 12) svg += `<rect class="bar-hl" x="${x + 5}" y="${y + 5}" width="5" height="${h - 10}"/>`;
        svg += `<text class="val" x="${cx}" y="${y - 10}" text-anchor="middle">${fmtG(v)}</text>`;
        if (met) svg += `<svg class="flower" x="${cx - 9}" y="${y - 42}" width="18" height="18" viewBox="0 0 5 5">${FLOWER.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`;
      }
      svg += `<text class="axis${sel ? " day-sel" : ""}" x="${cx}" y="${base + 26}" text-anchor="middle">${fmtDate(k, { weekday: "short" })}</text>`;
      svg += `<text class="axis${sel ? " day-sel" : ""}" x="${cx}" y="${base + 42}" text-anchor="middle">${parseKey(k).getDate()}${k === today ? "•" : ""}</text>`;
    });
    svg += `<line class="base" x1="0" x2="${W}" y1="${base}" y2="${base}"/>`;
    const gy = Math.round(yOf(goal));
    svg += `<line class="goal" x1="0" x2="${W}" y1="${gy}" y2="${gy}"/>`;
    svg += `<text class="goal-label" x="${W}" y="${gy - 8}" text-anchor="end">goal ${goal} g</text>`;
    svg += `</svg>`;

    $("chart").innerHTML = svg;
    const total = vals.reduce((a, b) => a + b, 0);
    $("chart-caption").textContent =
      `${fmtDate(ws, { month: "short", day: "numeric" })} – ${fmtDate(days[6], { month: "short", day: "numeric" })} · ${fmtG(total)} g total · pick a day to open it`;
    $("chart-legend").innerHTML =
      `<span class="legend-item"><span class="sw" style="background:var(--bar)"></span>fiber that day</span>` +
      `<span class="legend-item"><span class="sw" style="background:var(--heat-4)"></span><span class="art">${FLOWER}</span>goal met</span>` +
      `<span class="legend-item"><span class="sw" style="background:var(--goal-line);height:4px;border:0"></span>daily goal</span>`;
  }

  function renderMonth(totals) {
    const goal = data.goal;
    const today = todayKey();
    const ms = monthStart(selected);
    const days = rangeKeys(ms, monthEnd(selected));
    const lead = (parseKey(ms).getDay() + 6) % 7;
    const level = (v) => (v <= 0 ? 0 : v >= goal ? 4 : v / goal >= 0.75 ? 3 : v / goal >= 0.4 ? 2 : 1);

    let html = `<div class="cal">`;
    html += ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => `<span class="cal__dow">${d}</span>`).join("");
    html += `<span class="cal__blank"></span>`.repeat(lead);
    let met = 0, best = 0;
    for (const k of days) {
      const v = totals.get(k) || 0;
      if (v >= goal) met++;
      best = Math.max(best, v);
      const cls = ["cal__day", `h${level(v)}`, k > today ? "is-future" : "", k === today ? "is-today" : "", k === selected ? "is-sel" : ""].join(" ");
      const label = fmtDate(k, { weekday: "long", month: "short", day: "numeric" });
      html += `<button type="button" class="${cls}" data-key="${k}" aria-label="${esc(label)}: ${fmtG(v)} grams" data-tip="${esc(label)}\n${fmtG(v)} g${v >= goal ? " · goal met ✿" : ""}">` +
        `<span>${parseKey(k).getDate()}</span>${v > 0 ? `<b>${fmtG(v)}</b>` : ""}${v >= goal ? `<span class="flower">${FLOWER}</span>` : ""}</button>`;
    }
    html += `</div>`;
    $("chart").innerHTML = html;
    $("chart-caption").textContent =
      `${fmtDate(ms, { month: "long", year: "numeric" })} · ${plural(met, "day", "days")} on goal${best ? ` · best ${fmtG(best)} g` : ""}`;
    $("chart-legend").innerHTML =
      `<span class="legend-item"><em>none</em><span class="ramp"><i style="background:var(--soil)"></i><i style="background:var(--heat-1)"></i><i style="background:var(--heat-2)"></i><i style="background:var(--heat-3)"></i><i style="background:var(--heat-4)"></i></span><em>goal met</em></span>` +
      `<span class="legend-item"><em>shades: under 40% · 40–75% · 75–99% of goal</em></span>`;
  }

  /* ---------- Render: top foods ---------- */
  function topFoods(start, end) {
    const m = new Map();
    for (const e of data.entries) {
      if (e.date < start || e.date > end) continue;
      const key = e.foodId || e.name;
      const cur = m.get(key) || { key, name: e.name, look: lookOf(e), fiber: 0, grams: 0, count: 0 };
      cur.fiber += fiberOf(e);
      cur.grams += e.grams;
      cur.count += 1;
      m.set(key, cur);
    }
    return [...m.values()].sort((a, b) => b[rankBy] - a[rankBy] || b.count - a.count);
  }

  function renderTopList(which, start, end, prevStart, prevEnd, periodLabel) {
    const list = topFoods(start, end);
    const prevRank = new Map(topFoods(prevStart, prevEnd).map((f, i) => [f.key, i]));
    const total = list.reduce((s, f) => s + f[rankBy], 0);
    const byFiber = rankBy === "fiber";
    const el = $(`top-${which}`);
    $(`top-${which}-label`).textContent = periodLabel;

    if (!list.length) {
      el.innerHTML = `<li class="top-empty">nothing logged ${periodLabel === "this week" || periodLabel === "this month" ? periodLabel : "in this stretch"} yet. your top foods will chart here.</li>`;
      return;
    }
    const shown = expanded[which] ? list.slice(0, 15) : list.slice(0, 5);
    el.innerHTML = shown.map((f, i) => {
      const was = prevRank.get(f.key);
      const move = was === undefined ? `<span class="track__move new">new</span>`
        : was > i ? `<span class="track__move up" aria-label="up ${was - i}">▲${was - i}</span>`
        : was < i ? `<span class="track__move down" aria-label="down ${i - was}">▼${i - was}</span>`
        : `<span class="track__move" aria-label="same spot">–</span>`;
      const share = Math.round((f[rankBy] / total) * 100);
      return `<li class="track${i === 0 ? " track--top" : ""}">
        <span class="track__rank">${i + 1}${move}</span>
        <span class="track__art">${foodSvg(f.look)}</span>
        <span class="track__meta">${i === 0 ? `<span class="crown">#1 ${esc(periodLabel)}</span>` : ""}
          <span class="track__name">${esc(f.name)}</span>
          <span class="track__plays">${plural(f.count, "serving", "servings")} · ${byFiber ? `${fmtG(f.grams)} g eaten` : `${fmtG(f.fiber)} g fiber`}</span></span>
        <span class="track__amt">${fmtG(f[rankBy])} g${byFiber ? "" : "<small> eaten</small>"}</span>
        <span class="track__share" data-tip="${share}% of ${byFiber ? "your fiber" : "what you ate"} ${esc(periodLabel)}"><i style="width:${(f[rankBy] / list[0][rankBy]) * 100}%;background:${foodColor(f.look)}"></i></span>
      </li>`;
    }).join("") + (list.length > 5
      ? `<li class="more"><button type="button" class="link" data-expand="${which}">${expanded[which] ? "show top 5" : `show all ${Math.min(15, list.length)}`}</button></li>`
      : "");
  }

  function renderTop() {
    const today = todayKey();
    $("top-sub").textContent = rankBy === "fiber" ? "ranked by fiber" : "ranked by amount eaten";
    document.querySelectorAll(".seg[data-sort]").forEach((s) => s.setAttribute("aria-checked", String(s.dataset.sort === rankBy)));
    const ws = weekStart(selected);
    const ms = monthStart(selected);
    const prevMs = monthStart(addDays(ms, -1));
    renderTopList("week", ws, addDays(ws, 6), addDays(ws, -7), addDays(ws, -1),
      ws === weekStart(today) ? "this week" : `week of ${fmtDate(ws, { month: "short", day: "numeric" })}`);
    renderTopList("month", ms, monthEnd(ms), prevMs, addDays(ms, -1),
      ms === monthStart(today) ? "this month" : `in ${fmtDate(ms, { month: "long" })}`);
  }

  function renderBackup() {
    const hasSample = data.entries.some((e) => e.sample);
    $("sample").hidden = data.entries.length > 0;
    $("clear-sample").hidden = !hasSample;
  }

  function renderAll() {
    const totals = dayTotals();
    renderDate();
    renderStats(totals);
    renderEntries();
    renderRecent();
    renderChart(totals);
    renderTop();
    renderBackup();
    sketchify();
  }

  /* ---------- Food search / autocomplete ---------- */
  const foodInput = $("food");
  const gramsInput = $("grams");
  const suggest = $("suggest");
  let results = [];
  let active = -1;

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const f of allFoods()) {
      const n = f.name.toLowerCase();
      const aliases = f.aliases || [];
      let s = -1, via = null;
      if (n === q) s = 0;
      else if (n.startsWith(q)) s = 1;
      else if (n.split(/[\s(,–-]+/).some((w) => w.startsWith(q))) s = 2;
      else if ((via = aliases.find((a) => a.startsWith(q)))) s = 3;
      else if (n.includes(q)) s = 4;
      else if ((via = aliases.find((a) => a.includes(q)))) s = 5;
      if (s >= 0) scored.push({ f, s, via });
    }
    return scored.sort((a, b) => a.s - b.s || a.f.name.length - b.f.name.length).slice(0, 8);
  }

  function highlight(name, q) {
    const i = name.toLowerCase().indexOf(q.trim().toLowerCase());
    if (i < 0 || !q.trim()) return esc(name);
    return esc(name.slice(0, i)) + `<mark>${esc(name.slice(i, i + q.trim().length))}</mark>` + esc(name.slice(i + q.trim().length));
  }

  function openSuggest() {
    const q = foodInput.value;
    const found = search(q);
    const exact = found.some((r) => r.s === 0);
    results = found.map((r) => ({ type: "food", ...r }));
    if (q.trim() && !exact) results.push({ type: "new", name: q.trim() });
    if (!q.trim()) { closeSuggest(); return; }
    active = results.length && results[0].type === "food" ? 0 : -1;
    drawSuggest(q);
    suggest.hidden = false;
    foodInput.setAttribute("aria-expanded", "true");
  }

  function drawSuggest(q) {
    suggest.innerHTML = results.map((r, i) => {
      const sel = i === active ? ' aria-selected="true"' : ' aria-selected="false"';
      if (r.type === "new") {
        return `<li role="option" id="opt-${i}" class="add-new" data-i="${i}"${sel}><span class="plus">+</span><span>add “${esc(r.name)}” as a new food</span></li>`;
      }
      const f = r.f;
      return `<li role="option" id="opt-${i}" data-i="${i}"${sel}>
        <span class="art">${foodSvg(f)}</span>
        <span>${highlight(f.name, q)}${r.via ? `<span class="tag">aka ${esc(r.via)}</span>` : ""}${f.custom ? `<span class="tag">yours</span>` : ""}</span>
        <span class="per"><b>${fmtG(f.per100)}</b> g / 100 g</span>
      </li>`;
    }).join("");
    if (active >= 0) {
      foodInput.setAttribute("aria-activedescendant", `opt-${active}`);
      suggest.querySelector(`#opt-${active}`)?.scrollIntoView({ block: "nearest" });
    } else foodInput.removeAttribute("aria-activedescendant");
  }

  function closeSuggest() {
    suggest.hidden = true;
    foodInput.setAttribute("aria-expanded", "false");
    foodInput.removeAttribute("aria-activedescendant");
    active = -1;
  }

  function pick(r) {
    if (!r) return;
    if (r.type === "new") chooseNew(r.name);
    else choose(r.f);
  }

  function choose(f, { focusGrams = true } = {}) {
    chosen = f;
    foodInput.value = f.name;
    $("food-art").innerHTML = foodSvg(f);
    $("custom").hidden = true;
    closeSuggest();
    if (f.portion) {
      $("portion").hidden = false;
      $("portion").innerHTML = `${esc(f.portionLabel)} ≈ ${f.portion} g · <button type="button" class="link" id="use-portion">use this</button>`;
    } else $("portion").hidden = true;
    if (!gramsInput.value && f.portion) gramsInput.value = f.portion;
    updatePreview();
    if (focusGrams) { gramsInput.focus(); gramsInput.select(); }
  }

  function chooseNew(name) {
    chosen = { isNew: true, name };
    foodInput.value = name;
    $("food-art").innerHTML = foodSvg(CUSTOM_LOOK);
    $("portion").hidden = true;
    $("custom").hidden = false;
    closeSuggest();
    updatePreview();
    $("custom-fiber").focus();
  }

  function customPer100() {
    const fiber = parseFloat($("custom-fiber").value);
    const serving = parseFloat($("custom-serving").value);
    if (!(fiber >= 0) || !(serving > 0) || fiber > serving) return null;
    return Math.round((fiber / serving) * 1000) / 10;
  }

  function updatePreview() {
    const grams = parseFloat(gramsInput.value);
    const per100 = chosen ? (chosen.isNew ? customPer100() : chosen.per100) : null;
    const el = $("preview");
    if (chosen && per100 !== null && grams > 0) {
      const look = chosen.isNew ? CUSTOM_LOOK : chosen;
      el.innerHTML = `<span class="art">${foodSvg(look)}</span><span>= <b>${fmtG((grams * per100) / 100)} g</b> fiber</span>`;
    } else if (chosen && chosen.isNew) {
      el.textContent = "fill in the label numbers ↑";
    } else if (chosen) {
      el.textContent = "add grams to see its fiber";
    } else {
      el.textContent = "pick a food to see its fiber";
    }
    el.classList.toggle("is-empty", !el.querySelector(".art"));
  }

  foodInput.addEventListener("input", () => {
    const match = allFoods().find((f) => f.name.toLowerCase() === foodInput.value.trim().toLowerCase());
    chosen = match || null;
    $("food-art").innerHTML = match ? foodSvg(match) : "";
    $("custom").hidden = true;
    $("portion").hidden = !match;
    setError("");
    openSuggest();
    updatePreview();
  });
  foodInput.addEventListener("focus", () => { if (foodInput.value.trim() && !chosen) openSuggest(); });
  foodInput.addEventListener("blur", () => setTimeout(closeSuggest, 120));
  foodInput.addEventListener("keydown", (e) => {
    if (suggest.hidden) {
      if (e.key === "ArrowDown" && foodInput.value.trim()) { openSuggest(); e.preventDefault(); }
      return;
    }
    if (e.key === "ArrowDown") { active = (active + 1) % results.length; drawSuggest(foodInput.value); e.preventDefault(); }
    else if (e.key === "ArrowUp") { active = (active - 1 + results.length) % results.length; drawSuggest(foodInput.value); e.preventDefault(); }
    else if (e.key === "Enter") { if (active >= 0) { pick(results[active]); e.preventDefault(); } }
    else if (e.key === "Escape") { closeSuggest(); e.preventDefault(); }
    else if (e.key === "Tab" && active >= 0 && results[active].type === "food") { pick(results[active]); e.preventDefault(); }
  });
  suggest.addEventListener("pointerdown", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    e.preventDefault();
    pick(results[Number(li.dataset.i)]);
  });

  gramsInput.addEventListener("input", () => { setError(""); updatePreview(); });
  $("custom-fiber").addEventListener("input", updatePreview);
  $("custom-serving").addEventListener("input", updatePreview);
  $("portion").addEventListener("click", (e) => {
    if (e.target.id === "use-portion" && chosen?.portion) {
      gramsInput.value = chosen.portion;
      updatePreview();
      gramsInput.focus();
    }
  });

  function setError(msg) { $("error").textContent = msg; }

  /* ---------- Add / edit / delete ---------- */
  $("log").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!chosen) {
      const found = search(foodInput.value);
      if (found.length === 1) choose(found[0].f, { focusGrams: false });
    }
    if (!chosen) { setError(foodInput.value.trim() ? "pick a food from the list, or add it as a new food" : "what did you eat?"); foodInput.focus(); return; }
    const grams = parseFloat(gramsInput.value);
    if (!(grams > 0) || grams > 5000) { setError("how many grams? (between 0 and 5000)"); gramsInput.focus(); return; }

    let food = chosen;
    if (chosen.isNew) {
      const per100 = customPer100();
      if (per100 === null) { setError("enter the fiber and serving size from the label"); $("custom-fiber").focus(); return; }
      food = { id: `c-${uid()}`, name: chosen.name.toLowerCase().slice(0, 60), per100, custom: true, aliases: [], ...CUSTOM_LOOK };
      data.customFoods.push(food);
    }

    let flashId;
    if (editingId) {
      const entry = data.entries.find((x) => x.id === editingId);
      if (entry) {
        Object.assign(entry, { foodId: food.id, name: food.name, per100: food.per100, grams });
        const newDate = $("entry-date").value;
        if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) entry.date = newDate;
        delete entry.sample;
        flashId = entry.id;
        selected = entry.date;
      }
    } else {
      flashId = uid();
      data.entries.push({ id: flashId, date: selected, foodId: food.id, name: food.name, per100: food.per100, grams, createdAt: Date.now() });
    }
    save();
    burstFrom($("add"), 10);
    resetForm();
    renderAll();
    const li = document.querySelector(`.entry[data-id="${flashId}"]`);
    if (li) li.style.animation = "none", li.offsetWidth, li.style.animation = "";
    foodInput.focus();
  });

  function resetForm() {
    chosen = null;
    editingId = null;
    foodInput.value = "";
    gramsInput.value = "";
    $("custom-fiber").value = "";
    $("custom-serving").value = "";
    $("food-art").innerHTML = "";
    $("custom").hidden = true;
    $("portion").hidden = true;
    $("date-field").hidden = true;
    $("cancel-edit").hidden = true;
    $("add-label").textContent = "plant it";
    setError("");
    updatePreview();
    document.querySelectorAll(".entry.is-editing").forEach((el) => el.classList.remove("is-editing"));
  }

  function startEdit(id) {
    const entry = data.entries.find((x) => x.id === id);
    if (!entry) return;
    resetForm();
    editingId = id;
    gramsInput.value = entry.grams;
    const f = findFood(entry.foodId) || { id: entry.foodId, name: entry.name, per100: entry.per100, ...CUSTOM_LOOK };
    choose(f, { focusGrams: false });
    $("date-field").hidden = false;
    $("entry-date").value = entry.date;
    $("cancel-edit").hidden = false;
    $("add-label").textContent = "save changes";
    document.querySelectorAll(".entry").forEach((el) => el.classList.toggle("is-editing", el.dataset.id === id));
    $("log").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    gramsInput.focus();
    gramsInput.select();
    sketchify();
  }

  $("cancel-edit").addEventListener("click", resetForm);

  $("entries").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.closest(".entry").dataset.id;
    if (btn.classList.contains("edit")) startEdit(id);
    else if (btn.classList.contains("del")) removeEntry(id);
  });

  function removeEntry(id) {
    const idx = data.entries.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const [gone] = data.entries.splice(idx, 1);
    if (editingId === id) resetForm();
    save();
    renderAll();
    hideTip();
    toast(`removed ${gone.name}`, () => {
      data.entries.splice(idx, 0, gone);
      save();
      renderAll();
    });
  }

  $("recent").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const f = findFood(chip.dataset.food);
    if (!f) return;
    if (!editingId) gramsInput.value = "";
    choose(f);
  });

  /* ---------- Toast with undo ---------- */
  let toastTimer = null;
  let undoFn = null;
  function toast(text, undo) {
    $("toast-text").textContent = text;
    undoFn = undo;
    $("toast-undo").hidden = !undo;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $("toast").hidden = true; undoFn = null; }, 5000);
  }
  $("toast-undo").addEventListener("click", () => {
    if (undoFn) undoFn();
    undoFn = null;
    $("toast").hidden = true;
  });

  /* ---------- Navigation, goal, chart tabs ---------- */
  function select(k) {
    if (editingId) resetForm();
    selected = k;
    renderAll();
  }
  $("prev-day").addEventListener("click", () => select(addDays(selected, -1)));
  $("next-day").addEventListener("click", () => select(addDays(selected, 1)));
  $("go-today").addEventListener("click", () => select(todayKey()));

  /* ---------- Daily goal popup ---------- */
  const goalDialog = $("goal-dialog");
  const goalInput = $("goal-input");
  const clampGoal = (n) => Math.min(80, Math.max(5, Math.round(n)));
  function setGoalDraft(n) {
    goalInput.value = clampGoal(n);
    $("goal-error").textContent = "";
    $("goal-minus").disabled = Number(goalInput.value) <= 5;
    $("goal-plus").disabled = Number(goalInput.value) >= 80;
  }
  $("goal-edit").addEventListener("click", () => {
    hideTip();
    setGoalDraft(data.goal);
    goalDialog.showModal();
    goalInput.focus();
    goalInput.select();
  });
  $("goal-minus").addEventListener("click", () => setGoalDraft((Number(goalInput.value) || data.goal) - 1));
  $("goal-plus").addEventListener("click", () => setGoalDraft((Number(goalInput.value) || data.goal) + 1));
  goalInput.addEventListener("input", () => {
    $("goal-error").textContent = "";
    const v = Number(goalInput.value);
    $("goal-minus").disabled = v <= 5;
    $("goal-plus").disabled = v >= 80;
  });
  goalDialog.querySelector(".presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-goal]");
    if (b) setGoalDraft(Number(b.dataset.goal));
  });
  $("goal-cancel").addEventListener("click", () => goalDialog.close());
  // click on the dimmed backdrop closes it too
  goalDialog.addEventListener("click", (e) => { if (e.target === goalDialog) goalDialog.close(); });
  $("goal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Number(goalInput.value);
    if (!Number.isFinite(v) || v < 5 || v > 80) {
      $("goal-error").textContent = "pick a goal between 5 and 80 g";
      goalInput.focus();
      return;
    }
    data.goal = clampGoal(v);
    save();
    goalDialog.close();
    renderAll();
    toast(`daily goal set to ${data.goal} g`);
  });

  document.querySelectorAll(".seg[data-sort]").forEach((s) =>
    s.addEventListener("click", () => {
      rankBy = s.dataset.sort;
      prefs.set("peapal-rank", rankBy);
      hideTip();
      renderTop();
    })
  );

  document.querySelectorAll(".seg[data-view]").forEach((s) =>
    s.addEventListener("click", () => {
      view = s.dataset.view;
      prefs.set("peapal-view", view);
      hideTip();
      renderChart(dayTotals());
      sketchify();
    })
  );

  let chartW = 0;
  new ResizeObserver(() => {
    const w = $("chart").clientWidth;
    if (view === "week" && Math.abs(w - chartW) > 20) renderChart(dayTotals());
    chartW = w;
  }).observe($("chart"));

  $("chart").addEventListener("click", (e) => {
    const t = e.target.closest("[data-key]");
    if (t) { hideTip(); select(t.dataset.key); }
  });
  $("chart").addEventListener("keydown", (e) => {
    const t = e.target.closest(".bar-hit[data-key]");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(t.dataset.key); }
  });

  document.querySelector(".charts-top").addEventListener("click", (e) => {
    const b = e.target.closest("[data-expand]");
    if (!b) return;
    expanded[b.dataset.expand] = !expanded[b.dataset.expand];
    renderTop();
  });

  /* ---------- Theme ---------- */
  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  $("theme").addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    prefs.set("peapal-theme", next);
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || $("goal-dialog").open) return;
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") {
      if (e.key === "Escape" && editingId && suggest.hidden) resetForm();
      return;
    }
    if (e.key === "ArrowLeft") select(addDays(selected, -1));
    else if (e.key === "ArrowRight") select(addDays(selected, 1));
    else if (e.key === "t" || e.key === "T") select(todayKey());
    else if (e.key === "/") { e.preventDefault(); foodInput.focus(); }
  });

  /* ---------- Backup: export / import ---------- */
  $("export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pea-pal-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("backup saved to your downloads");
  });
  $("import").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const incoming = Store.normalize(JSON.parse(await file.text()));
      if (!incoming.entries.length && !incoming.customFoods.length) { toast("that file doesn't look like a pea pal backup"); return; }
      if (data.entries.length && !confirm(`Replace your current log (${data.entries.length} entries) with this backup (${incoming.entries.length} entries)?`)) return;
      data = incoming;
      save();
      resetForm();
      renderAll();
      toast(`imported ${plural(incoming.entries.length, "entry", "entries")}`);
    } catch (err) {
      toast("couldn't read that file");
    }
  });

  /* ---------- Sample data ---------- */
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  $("sample").addEventListener("click", () => {
    const rnd = seeded(42);
    const breakfast = ["oats", "branflakes", "wwbread", "chia", "raspberries", "banana", "blueberries"];
    const mains = ["blackbeans", "lentils", "chickpeas", "brownrice", "quinoa", "broccoli", "sweetpotato", "avocado", "wwpasta", "kale", "peas", "hummus"];
    const snacks = ["apple", "pear", "almonds", "popcorn", "darkchoc", "carrot", "strawberries", "pistachios"];
    const today = todayKey();
    const pickOne = (arr) => arr[Math.floor(rnd() * arr.length)];
    const entries = [];
    for (let i = 45; i >= 0; i--) {
      const k = addDays(today, -i);
      if (i > 0 && rnd() < 0.08) continue;
      const meals = i === 0 ? [breakfast, mains, snacks] : [breakfast, mains, mains, snacks, ...(rnd() < 0.4 ? [snacks] : [])];
      meals.forEach((pool, j) => {
        const f = findFood(pickOne(pool));
        const grams = Math.round(f.portion * (0.8 + rnd() * 0.8));
        entries.push({ id: uid() + j, date: k, foodId: f.id, name: f.name, per100: f.per100, grams, createdAt: parseKey(k).getTime() + j * 3600000 + 8 * 3600000, sample: true });
      });
    }
    data.entries.push(...entries);
    save();
    renderAll();
    toast(`planted ${entries.length} sample entries`);
  });
  $("clear-sample").addEventListener("click", () => {
    const before = data.entries;
    data.entries = data.entries.filter((e) => !e.sample);
    save();
    renderAll();
    toast("sample data cleared", () => { data.entries = before; save(); renderAll(); });
  });

  /* ---------- Tooltip ---------- */
  const tip = $("tip");
  function showTip(el, x, y) {
    const text = el.getAttribute("data-tip");
    if (!text) return hideTip();
    const [first, ...rest] = text.split("\n");
    tip.innerHTML = `${esc(first)}${rest.length ? `\n<b>${esc(rest.join("\n"))}</b>` : ""}`;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = `${Math.min(window.innerWidth - r.width - 8, Math.max(8, x - r.width / 2))}px`;
    tip.style.top = `${y - r.height - 14 < 8 ? y + 22 : y - r.height - 14}px`;
  }
  function hideTip() { tip.hidden = true; }
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest?.("[data-tip]");
    if (el) showTip(el, e.clientX, e.clientY);
    else if (!tip.hidden) hideTip();
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest?.("[data-tip]");
    if (el && e.target.matches(":focus-visible")) {
      const r = el.getBoundingClientRect();
      showTip(el, r.left + r.width / 2, r.top);
    }
  });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, { passive: true });

  /* ---------- Leaf burst ---------- */
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
      b.style.setProperty("--c", LEAF_COLORS[i % LEAF_COLORS.length]);
      b.innerHTML = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges"><path d="${LEAF_PATH}"/></svg>`;
      document.body.appendChild(b);
      b.addEventListener("animationend", () => b.remove());
    }
  }

  /* ---------- Hand-drawn sketch outlines ---------- */
  // Each .sketch element gets a rough pen box: every edge is drawn twice with
  // slightly bowed strokes that overshoot the corners, plus loose diagonal
  // coloured-pencil hatching. Seeded per element so the drawing is stable.
  function drawSketch(el, seed) {
    const pad = 8;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const rnd = seeded(seed);
    const j = (a) => (rnd() * 2 - 1) * a;
    const f = (n) => n.toFixed(1);

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

  const sketchSeeds = new WeakMap();
  let sketchCount = 0;
  const ro = "ResizeObserver" in window
    ? new ResizeObserver((entries) => entries.forEach((e) => drawSketch(e.target, sketchSeeds.get(e.target))))
    : null;
  function sketchify() {
    document.querySelectorAll(".sketch").forEach((el) => {
      if (sketchSeeds.has(el)) return;
      sketchSeeds.set(el, 1234 + sketchCount++ * 97);
      if (ro) ro.observe(el);
      else drawSketch(el, sketchSeeds.get(el));
    });
  }

  /* ---------- Cursor leaf trail ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let lastX = -99, lastY = -99, lastT = 0;
    document.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 16 || now - lastT < 40) return;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      const t = document.createElement("span");
      t.className = "trail";
      t.style.left = `${e.clientX + (Math.random() * 10 - 5)}px`;
      t.style.top = `${e.clientY + (Math.random() * 10 - 5)}px`;
      t.style.setProperty("--s", `${8 + Math.random() * 8}px`);
      t.style.setProperty("--c", LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]);
      t.style.setProperty("--dx", `${Math.random() * 24 - 12}px`);
      t.style.setProperty("--rot", `${Math.random() * 240 - 120}deg`);
      t.innerHTML = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges"><path d="${LEAF_PATH}"/></svg>`;
      document.body.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    });
  }

  /* ---------- Midnight rollover: keep "today" honest if the tab stays open ---------- */
  let lastToday = todayKey();
  setInterval(() => {
    const now = todayKey();
    if (now !== lastToday) {
      if (selected === lastToday) selected = now;
      lastToday = now;
      renderAll();
    }
  }, 60000);

  /* ---------- Init ---------- */
  resetForm();
  renderAll();
})();
