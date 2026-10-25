/* Shared behavior for pages under /case-studies/: custom cursor, image
   lightbox, TOC scroll-spy, and the image switches/carousels. See
   DESIGN-SYSTEM.md. */
(function(){

  /* The homepage's Figma-style cursor chip (styled in styles.css, which
     hides the OS cursor only on pages that include .cursor-chip). No dot
     canvas here, so X/Y are page coordinates measured from the content's
     top-left, below the 46px nav; Y keeps counting as the page scrolls. */
  /* Image lightbox. Videos keep their native controls: click to play/pause,
     and the browser's own fullscreen. */
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
    lbImg.style.transformOrigin = '';
  }
  // Zoomed-in panning for a mouse: the pointer's position across the
  // viewport sets the zoom origin, so pointing toward an edge brings that
  // part of the image into view (and a click zooms in on the spot clicked).
  function panTo(x, y){
    var px = Math.min(100, Math.max(0, x / innerWidth * 100));
    var py = Math.min(100, Math.max(0, y / innerHeight * 100));
    lbImg.style.transformOrigin = px + '% ' + py + '%';
  }
  overlay.addEventListener('pointermove', function(e){
    if (zoomed && e.pointerType === 'mouse') panTo(e.clientX, e.clientY);
  });

  document.querySelectorAll('.cs-asset img').forEach(function(el){
    el.addEventListener('click', function(){
      openLightbox(el.currentSrc || el.src, el.alt);
    });
  });

  lbImg.addEventListener('click', function(e){
    e.stopPropagation();
    zoomed = !zoomed;
    if (zoomed && e.pointerType !== 'touch') panTo(e.clientX, e.clientY);
    lbImg.classList.toggle('is-zoomed', zoomed);
    setCursorMode(e.target);
  });
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) closeLightbox();
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
  });

  /* The homepage's Figma-style cursor chip (styled in styles.css, which
     hides the OS cursor only on pages that include .cursor-chip). No dot
     canvas here, so X/Y are page coordinates measured from the content's
     top-left, below the 46px nav; Y keeps counting as the page scrolls.
     Over images it becomes a magnifier (zoom-out on a zoomed lightbox image). */
  var chip = document.getElementById('cursorChip');
  function setCursorMode(target){
    if (!chip) return;
    var mode = '';
    if (target.closest('.cs-lightbox-img')) mode = zoomed ? 'out' : 'in';
    else if (target.closest('.cs-asset img')) mode = 'in';
    if (chip.dataset.zoom !== mode) chip.dataset.zoom = mode;
  }
  if (chip && matchMedia('(hover:hover) and (pointer:fine)').matches){
    var chipX = document.getElementById('cursorX');
    var chipY = document.getElementById('cursorY');
    var lastX = null, lastY = null;
    var paintChip = function(){
      chip.style.transform = 'translate(' + lastX + 'px,' + lastY + 'px)';
      chipX.textContent = 'X: ' + Math.max(0, Math.round(lastX));
      chipY.textContent = 'Y: ' + Math.max(0, Math.round(lastY - 46 + scrollY));
    };
    window.addEventListener('pointermove', function(e){
      if (e.pointerType === 'touch') return;
      lastX = e.clientX; lastY = e.clientY;
      paintChip();
      setCursorMode(e.target);
      chip.classList.add('is-visible');
    }, {passive:true});
    window.addEventListener('scroll', function(){ if (lastX !== null) paintChip(); }, {passive:true});
    var hideChip = function(){ chip.classList.remove('is-visible'); };
    // pointerout with no relatedTarget = the pointer left the window entirely
    document.addEventListener('pointerout', function(e){
      if (e.pointerType !== 'touch' && !e.relatedTarget) hideChip();
    }, {passive:true});
    window.addEventListener('blur', hideChip);
  }

  /* Image switches: a [data-switch] block holds Button Group buttons
     (data-key/data-value) and figures tagged data-when="key=value ...";
     only figures whose every condition matches the current state show.
     A carousel is the same thing with a "slide" key driven by its dots
     and arrows, so light/dark and slide combine without extra code. */
  document.querySelectorAll('[data-switch]').forEach(function(root){
    var state = {};
    root.querySelectorAll('[data-key][aria-pressed="true"], [data-key][aria-current="true"]').forEach(function(b){
      state[b.dataset.key] = b.dataset.value;
    });
    var slides = root.querySelectorAll('.cs-dot').length;
    var prev = root.querySelector('[data-step="-1"]');
    var next = root.querySelector('[data-step="1"]');

    function render(){
      root.querySelectorAll('[data-key]').forEach(function(b){
        var on = state[b.dataset.key] === b.dataset.value;
        b.setAttribute(b.classList.contains('cs-dot') ? 'aria-current' : 'aria-pressed', String(on));
      });
      root.querySelectorAll('[data-when]').forEach(function(el){
        var show = el.dataset.when.split(' ').every(function(pair){
          var kv = pair.split('=');
          return state[kv[0]] === kv[1];
        });
        el.hidden = !show;
        var video = el.querySelector('video');
        if (!show && video) video.pause();
      });
      if (slides){
        var i = Number(state.slide);
        prev.disabled = i <= 1;
        next.disabled = i >= slides;
      }
    }

    root.addEventListener('click', function(e){
      var b = e.target.closest('[data-key]');
      if (b && root.contains(b)){
        state[b.dataset.key] = b.dataset.value;
        render();
        return;
      }
      var step = e.target.closest('[data-step]');
      if (step && root.contains(step)){
        var n = Number(state.slide) + Number(step.dataset.step);
        if (n >= 1 && n <= slides){ state.slide = String(n); render(); }
      }
    });
    render();
  });

  /* .cs-row.is-mid: lift the text by its image's caption (height + the 8px
     figure gap) so it centres on the image itself, as in Figma. Rows that set
     --cap themselves keep it. */
  var midRows = [].slice.call(document.querySelectorAll('.cs-row.is-mid')).filter(function(r){
    return !/--cap/.test(r.getAttribute('style') || '');
  });
  function fitCaps(){
    midRows.forEach(function(r){
      var cap = r.querySelector(':scope > .cs-figure > .cs-caption');
      if (cap) r.style.setProperty('--cap', (cap.offsetHeight + 8) + 'px');
    });
  }
  fitCaps();
  window.addEventListener('resize', fitCaps);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCaps);

  var toc = document.querySelector('.cs-toc');
  var tocIndicator = document.querySelector('.cs-toc-indicator');
  var allTocLinks = document.querySelectorAll('.cs-toc a:not(.cs-back), .cs-toc-panel a');
  var sections = document.querySelectorAll('.cs-hero[id], .cs-section[id]');

  var tocMobile = document.getElementById('csTocMobile');
  var tocTrigger = document.getElementById('csTocTrigger');
  var tocTriggerLabel = tocTrigger ? tocTrigger.querySelector('.cs-toc-trigger-label') : null;

  function setTocOpen(open){
    if (!tocMobile) return;
    tocMobile.dataset.open = String(open);
    tocTrigger.setAttribute('aria-expanded', String(open));
  }

  /* Site menu (under 740px the hamburger opens Home / Work / AI Builds /
     About and the reduce-motion switch, as the homepage). Only one of it and
     the section dropdown is open at a time. */
  var siteMenu = document.getElementById('csMenu');
  var menuBtn = document.getElementById('csMenuBtn');
  function setMenuOpen(open){
    if (!siteMenu) return;
    siteMenu.dataset.open = String(open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn){
    menuBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var open = siteMenu.dataset.open !== 'true';
      if (open) setTocOpen(false);
      setMenuOpen(open);
    });
    siteMenu.addEventListener('click', function(e){ if (e.target.closest('a')) setMenuOpen(false); });
    document.addEventListener('click', function(e){
      if (siteMenu.dataset.open === 'true' && !siteMenu.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && siteMenu.dataset.open === 'true'){ setMenuOpen(false); menuBtn.focus(); }
    });
    matchMedia('(min-width: 740px)').addEventListener('change', function(e){ if (e.matches) setMenuOpen(false); });
  }
  var motionBtn = document.getElementById('motion');
  if (motionBtn){
    var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
    var setMotion = function(on){
      motionBtn.setAttribute('aria-checked', String(on));
      document.documentElement.dataset.motion = on ? 'reduced' : 'full';
    };
    motionBtn.addEventListener('click', function(){ setMotion(motionBtn.getAttribute('aria-checked') !== 'true'); });
    mqReduce.addEventListener('change', function(e){ setMotion(e.matches); });
    setMotion(mqReduce.matches);
  }

  if (tocTrigger){
    tocTrigger.addEventListener('click', function(e){
      e.stopPropagation();
      var open = tocMobile.dataset.open !== 'true';
      if (open) setMenuOpen(false);
      setTocOpen(open);
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

  if (allTocLinks.length && sections.length){
    var linksFor = {};
    allTocLinks.forEach(function(a){
      var id = a.getAttribute('href').slice(1);
      (linksFor[id] = linksFor[id] || []).push(a);
    });
    var indicatorPlaced = false;
    function moveIndicator(link){
      if (!tocIndicator || !toc) return;
      // First placement: fade in at position rather than sliding in from
      // the top; later moves use the CSS transform/height transitions.
      if (!indicatorPlaced) tocIndicator.style.transition = 'opacity .3s ease';
      tocIndicator.style.opacity = '1';
      tocIndicator.style.transform = 'translateY(' + link.offsetTop + 'px)';
      tocIndicator.style.height = link.offsetHeight + 'px';
      if (!indicatorPlaced){
        tocIndicator.offsetHeight; // flush so the override applies before it's restored
        tocIndicator.style.transition = '';
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
      if (tocTriggerLabel) tocTriggerLabel.textContent = links[0].textContent.trim();
    }
    /* Current section = the last one whose top has reached the line a TOC
       jump lands it on (its scroll-margin), or the last section once the
       page can't scroll further. A band in the middle of the window (the old
       IntersectionObserver) let a short section like Constraints lose to the
       one below it as soon as both fit in the band. */
    var current = null, spyQueued = false;
    function spy(){
      spyQueued = false;
      var line = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) + 8;
      var id = sections[0].id;
      for (var i = 0; i < sections.length; i++){
        if (sections[i].getBoundingClientRect().top <= line) id = sections[i].id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) id = sections[sections.length - 1].id;
      if (id !== current){ current = id; activate(id); }
    }
    window.addEventListener('scroll', function(){ if (!spyQueued){ spyQueued = true; requestAnimationFrame(spy); } }, {passive:true});
    window.addEventListener('resize', spy);
    spy();
  }

  /* Card thumbs with data-hover (Masking's animation): on a pointer device,
     hovering the card lays the animation over the still. It loads on first
     hover, and leaving drops its src so the next hover starts from the top.
     Skipped while motion is reduced. */
  (function playOnHover(){
    if (!matchMedia('(hover:hover)').matches) return;
    var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.thumb[data-hover]').forEach(function(thumb){
      var card = thumb.closest('.card') || thumb;
      var play = null;
      card.addEventListener('mouseenter', function(){
        var motion = document.documentElement.dataset.motion;
        if (motion === 'reduced' || (!motion && mqReduce.matches)) return;
        if (!play){
          play = document.createElement('img');
          play.className = 'thumb-play'; play.alt = ''; play.decoding = 'async';
          play.addEventListener('load', function(){ if (play.getAttribute('src')) thumb.classList.add('is-playing'); });
          thumb.appendChild(play);
        }
        play.src = thumb.dataset.hover;
        if (play.complete && play.naturalWidth) thumb.classList.add('is-playing');
      });
      card.addEventListener('mouseleave', function(){
        thumb.classList.remove('is-playing');
        if (play) play.removeAttribute('src');
      });
    });
  })();

  /* Facts (Role, Timeline, Status, Client, Agency): one line while every
     item fits side by side (natural widths + the 64px gaps), else two equal
     columns 14px apart while the widest item fits half the width (the
     markup's two .cs-facts-col groups), else one column -- never a partial
     wrap. Gaps match case-study.css. Re-checked whenever the row's width
     changes, and re-measured once the webfonts have loaded. */
  var facts = document.querySelector('.cs-facts');
  if (facts){
    var FACTS_GAP = 64, FACTS_COL_GAP = 14;
    var factItems = [].slice.call(facts.querySelectorAll('.cs-facts-col > div'));
    var needRow = 0, needTwo = 0;
    var measureFacts = function(){
      var widths = factItems.map(function(item){
        item.style.width = 'max-content';
        var w = item.getBoundingClientRect().width;
        item.style.width = '';
        return w;
      });
      needRow = widths.reduce(function(a, b){ return a + b; }, 0) + FACTS_GAP * (widths.length - 1);
      needTwo = 2 * Math.max.apply(null, widths) + FACTS_COL_GAP;
    };
    var fitFacts = function(){
      var w = facts.clientWidth;
      facts.dataset.fit = w >= Math.ceil(needRow) ? 'row' : w >= Math.ceil(needTwo) ? 'two' : 'stack';
    };
    measureFacts(); fitFacts();
    if (window.ResizeObserver) new ResizeObserver(fitFacts).observe(facts);
    else window.addEventListener('resize', fitFacts);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ measureFacts(); fitFacts(); });
  }

})();
