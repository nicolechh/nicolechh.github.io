// Footer clock: fills every [data-clock] with the current time in the San
// Francisco Bay Area (Pacific time, DST handled by Intl), once a second, as a
// 24-hour clock (h23, so midnight reads 00:00:00, never 24:00:00).
(() => {
  const els = document.querySelectorAll("[data-clock]");
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const tick = () => {
    const now = fmt.format(new Date());
    els.forEach(el => { el.textContent = now; });
  };
  tick();
  setInterval(tick, 1000);
})();
