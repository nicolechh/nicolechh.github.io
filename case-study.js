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

  var tocLinks = document.querySelectorAll('.cs-toc a');
  var sections = document.querySelectorAll('.cs-section[id]');
  if (tocLinks.length && sections.length && 'IntersectionObserver' in window){
    var linkFor = {};
    tocLinks.forEach(function(a){ linkFor[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var link = linkFor[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        tocLinks.forEach(function(a){ a.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, {rootMargin:'-15% 0px -70% 0px'});
    sections.forEach(function(s){ observer.observe(s); });
  }

})();
