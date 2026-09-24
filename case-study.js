/* Shared behavior for pages under /case-studies/: custom cursor, image
   lightbox, TOC scroll-spy, and the image switches/carousels. See
   DESIGN-SYSTEM.md. */
(function(){

  /* The homepage's Figma-style cursor chip (styled in styles.css, which
     hides the OS cursor only on pages that include .cursor-chip). No dot
     canvas here, so X/Y are page coordinates measured from the content's
     top-left, below the 46px nav; Y keeps counting as the page scrolls. */
  var chip = document.getElementById('cursorChip');
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

  document.querySelectorAll('.cs-asset img').forEach(function(el){
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
      if (tocTriggerLabel) tocTriggerLabel.textContent = links[0].textContent;
    }
    activate(sections[0].id);
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, {rootMargin:'-15% 0px -70% 0px'});
    sections.forEach(function(s){ observer.observe(s); });
  }

})();
