// Shared nav behavior for pages that don't carry index.html's dot-grid/
// ruler/cursor script — the collapsed-menu and reduce-motion-toggle logic,
// extracted so every page gets identical nav behavior without duplicating
// (and risking drifting from) index.html's copy. See DESIGN-SYSTEM.md.
(() => {
  const bar = document.getElementById("bar");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");

  const setMenu = open => {
    bar.dataset.open = String(open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", e => {
    e.stopPropagation();
    setMenu(bar.dataset.open !== "true");
  });
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", e => {
    if (bar.dataset.open === "true" && !bar.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && bar.dataset.open === "true"){ setMenu(false); burger.focus(); }
  });
  window.addEventListener("resize", () => {
    if (document.documentElement.clientWidth > 500) setMenu(false);
  });

  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const motionBtn = document.getElementById("motion");
  function setMotion(on){
    motionBtn.setAttribute("aria-checked", String(on));
    document.documentElement.dataset.motion = on ? "reduced" : "full";
  }
  motionBtn.addEventListener("click", () => setMotion(motionBtn.getAttribute("aria-checked") !== "true"));
  mqReduce.addEventListener("change", e => setMotion(e.matches));
  setMotion(mqReduce.matches);
})();
