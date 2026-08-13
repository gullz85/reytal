// hringurinn rekur hægt undan músinni, eltir hana ekki
(function(){
  var orb = document.querySelector('.orb');
  if (!orb) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var tx = 0, ty = 0, cx = 0, cy = 0;
  var AMPX = 190, AMPY = 40;
  var raf = null;

  addEventListener('mousemove', function(e){
    var nx = (e.clientX / innerWidth  - 0.5) * 2;
    var ny = (e.clientY / innerHeight - 0.5) * 2;
    tx = nx * AMPX;
    // hringurinn má reka upp á við, en aldrei niður fyrir kyrrstöðupunktinn
    // svo hann skerist ekki af undir haus undirsíðnanna
    ty = Math.min(0, ny * AMPY);
    if (!raf) raf = requestAnimationFrame(tick);
  }, {passive:true});

  function tick(){
    cx += (tx - cx) * 0.026;
    cy += (ty - cy) * 0.026;
    orb.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
    if (Math.abs(tx-cx) < 0.15 && Math.abs(ty-cy) < 0.15){ raf = null; return; }
    raf = requestAnimationFrame(tick);
  }
})();

// navið dregst mjúklega saman í miðjusetta pillu þegar byrjað er að skrolla
// (enginn litamorph á þessari síðu, bara pillan)
(function(){
  var mainNav = document.querySelector('header nav');
  if (!mainNav) return;
  var ticking = false;
  function update(){
    mainNav.classList.toggle('pill', window.scrollY > 60);
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});
  update();
})();

// síðuskipti: splash spilast og svo er flakkað þegar skjárinn er hulinn
(function(){
  var splash = document.getElementById('splashB');
  if (!splash) return;
  document.querySelectorAll('nav a, a.logo-mark, .mobile-menu a').forEach(function(a){
    var dest = a.getAttribute('href');
    if (!dest || dest === '#' || dest.charAt(0) === '#' || dest.indexOf('mailto:') === 0) return;
    a.addEventListener('click', function(e){
      e.preventDefault();
      splash.classList.add('on');
      setTimeout(function(){ window.location.href = dest; }, 550);
    });
  });
})();

// fyrirsagnir: orðin rísa upp úr ósýnilegri línu, hvert á fætur öðru
(function(){
  if (!('IntersectionObserver' in window)) return;
  var STAG = 0.05;   // sekúndur milli orða

  // skiptir texta fyrirsagnar í orð og pakkar hverju í yfirfalls-maska,
  // heldur innri elementum (accent, br) og sleppir örvum/teljurum
  function splitWords(el, state){
    var nodes = [].slice.call(el.childNodes);
    nodes.forEach(function(node){
      if (node.nodeType === 3){
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if (!p) return;
          if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
          var mask = document.createElement('span');
          mask.className = 'fx-w';
          var word = document.createElement('span');
          word.textContent = p;
          word.style.transitionDelay = (state.i++ * STAG).toFixed(2) + 's';
          mask.appendChild(word);
          frag.appendChild(mask);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR' &&
                 !node.classList.contains('arrow') && !node.classList.contains('count')){
        splitWords(node, state);
      }
    });
  }

  // orðin eru falin STRAX við hleðslu (áður en nokkuð sést á skjánum),
  // aðeins birtingin sjálf bíður eftir að introið sleppi síðunni
  var els = [].slice.call(document.querySelectorAll('h1, h2, h3')).filter(function(el){
    return !el.closest('.show-slide') && !el.closest('.intro') && !el.closest('.splash');
  });
  els.forEach(function(el){
    splitWords(el, {i:0});
    el.classList.add('fx');
  });

  function startObserve(){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.2});
    els.forEach(function(el){ io.observe(el); });
  }
  if (document.body.classList.contains('locked')){
    var t = setInterval(function(){
      if (!document.body.classList.contains('locked')){ clearInterval(t); startObserve(); }
    }, 120);
  } else {
    startObserve();
  }
})();

// farsímavalmynd: opna/loka heilsíðu-yfirlagið
(function(){
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  var close = document.getElementById('menuClose');
  if (!btn || !menu) return;
  btn.addEventListener('click', function(){ menu.classList.add('open'); });
  if (close) close.addEventListener('click', function(){ menu.classList.remove('open'); });
})();
