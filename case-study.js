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
    function moveIndicator(link){
      if (!tocIndicator || !toc) return;
      tocIndicator.style.opacity = '1';
      tocIndicator.style.transform = 'translateY(' + link.offsetTop + 'px)';
      tocIndicator.style.height = link.offsetHeight + 'px';
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var links = linksFor[entry.target.id];
        if (!links || !entry.isIntersecting) return;
        allTocLinks.forEach(function(a){ a.classList.remove('is-active'); });
        links.forEach(function(a){ a.classList.add('is-active'); });
        var desktopLink = toc ? toc.querySelector('a[href="#' + entry.target.id + '"]') : null;
        if (desktopLink) moveIndicator(desktopLink);
        if (tocTriggerLabel) tocTriggerLabel.textContent = links[0].textContent;
      });
    }, {rootMargin:'-15% 0px -70% 0px'});
    sections.forEach(function(s){ observer.observe(s); });
  }

})();
