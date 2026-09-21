/* Shared behavior for pages under /case-studies/: image lightbox + TOC scroll-spy.
   See DESIGN-SYSTEM.md. */
(function(){

  var overlay = document.createElement('div');
  overlay.className = 'cs-lightbox';
  overlay.innerHTML = '<button class="cs-lightbox-close" type="button" aria-label="Close">&times;</button><img class="cs-lightbox-img" alt="">';
  document.body.appendChild(overlay);
  var lbImg = overlay.querySelector('.cs-lightbox-img');
  var closeBtn = overlay.querySelector('.cs-lightbox-close');
  var zoomed = false;

  function openLightbox(src, alt){
    lbImg.src = src;
    lbImg.alt = alt || '';
    zoomed = false;
    lbImg.classList.remove('is-zoomed');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    zoomed = false;
    lbImg.classList.remove('is-zoomed');
  }

  document.querySelectorAll('.cs-media img').forEach(function(el){
    el.addEventListener('click', function(){
      openLightbox(el.currentSrc || el.src, el.alt);
    });
  });

  lbImg.addEventListener('click', function(e){
    e.stopPropagation();
    zoomed = !zoomed;
    lbImg.classList.toggle('is-zoomed', zoomed);
  });
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) closeLightbox();
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
  });

  var toc = document.querySelector('.cs-toc');
  var tocIndicator = document.querySelector('.cs-toc-indicator');
  var allTocLinks = document.querySelectorAll('.cs-toc a, .cs-toc-panel a');
  var sections = document.querySelectorAll('.cs-section[id]');

  var tocMobile = document.getElementById('csTocMobile');
  var tocTrigger = document.getElementById('csTocTrigger');
  var tocTriggerLabel = tocTrigger ? tocTrigger.querySelector('.cs-toc-trigger-label') : null;

  function setTocOpen(open){
    if (!tocMobile) return;
    tocMobile.dataset.open = String(open);
    tocTrigger.setAttribute('aria-expanded', String(open));
  }
  if (tocTrigger){
    tocTrigger.addEventListener('click', function(e){
      e.stopPropagation();
      setTocOpen(tocMobile.dataset.open !== 'true');
    });
    document.addEventListener('click', function(e){
      if (tocMobile.dataset.open === 'true' && !tocMobile.contains(e.target)) setTocOpen(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && tocMobile.dataset.open === 'true'){ setTocOpen(false); tocTrigger.focus(); }
    });
  }
  document.querySelectorAll('.cs-toc-panel a').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      setTocOpen(false);
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({block:'start'});
    });
  });

  if (allTocLinks.length && sections.length && 'IntersectionObserver' in window){
    var linksFor = {};
    allTocLinks.forEach(function(a){
      var id = a.getAttribute('href').slice(1);
      (linksFor[id] = linksFor[id] || []).push(a);
    });
    var indicatorPlaced = false;
    function moveIndicator(link){
      if (!tocIndicator || !toc) return;
      // First placement (page load, Summary): jump straight to position/
      // height with only opacity transitioning -- a plain fade in, not
      // the bar sliding/growing in from the top. Pinned to opacity's own
      // CSS duration explicitly (not just narrowing transition-property)
      // so it doesn't inherit transform's shorter duration by cycling
      // through a mismatched-length list. Later section changes keep
      // the normal sliding transition (restored below).
      if (!indicatorPlaced) tocIndicator.style.transition = 'opacity .3s ease';
      tocIndicator.style.opacity = '1';
      tocIndicator.style.transform = 'translateY(' + link.offsetTop + 'px)';
      tocIndicator.style.height = link.offsetHeight + 'px';
      if (!indicatorPlaced){
        tocIndicator.offsetHeight; // force layout so the transition override above applies before...
        tocIndicator.style.transition = '';   // ...restoring the CSS-defined transitions for subsequent moves
        indicatorPlaced = true;
      }
    }
    function activate(id){
      var links = linksFor[id];
      if (!links) return;
      allTocLinks.forEach(function(a){ a.classList.remove('is-active'); });
      links.forEach(function(a){ a.classList.add('is-active'); });
      var desktopLink = toc ? toc.querySelector('a[href="#' + id + '"]') : null;
      if (desktopLink) moveIndicator(desktopLink);
      if (tocTriggerLabel) tocTriggerLabel.textContent = links[0].textContent;
    }
    // Summary is active as soon as the page opens, before any scrolling
    // (and before the observer's own first check) -- otherwise both the
    // sidebar and the mobile trigger sit unhighlighted until the reader
    // scrolls past the -15% rootMargin line.
    activate(sections[0].id);
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, {rootMargin:'-15% 0px -70% 0px'});
    sections.forEach(function(s){ observer.observe(s); });
  }

})();
