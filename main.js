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
  // flip-orðin: byrja á hvolfi/speglað og réttast úr sér við skroll
  // (sama hreyfing og á forsíðunni - hrein 2D-skölun, engin þrívídd)
  var flipWords = [].slice.call(document.querySelectorAll('.flip-word')).map(function(el){
    return { el: el, top0: null };
  });
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!mainNav && !flipWords.length) return;
  var ticking = false;
  function update(){
    if (mainNav) mainNav.classList.toggle('pill', window.scrollY > 60);
    if (!reduceMotion && flipWords.length){
      // page-hero á undirsíðunum er mun styttri en heilskjás-hetjan á
      // forsíðunni, svo fyrirsögnin skrollast fljótt upp úr glugganum -
      // styttra flipRange svo hreyfingin klárist meðan hún er enn sýnileg
      var vh = window.innerHeight;
      var flipRange = vh * 0.32;
      flipWords.forEach(function(fw){
        var hf = fw.el.getBoundingClientRect();
        if (fw.top0 === null) fw.top0 = hf.top;
        var ref = Math.min(fw.top0, vh * 0.92);
        var fp = Math.min(1, Math.max(0, (ref - hf.top) / flipRange));
        fw.el.style.transform = 'scaleX(' + (fp < 0.5 ? -1 : 1) + ') scaleY(' + (-1 + 2 * fp).toFixed(4) + ')';
      });
    }
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

// valmyndarstrikið: eitt strik sem skýst milli hlekkja með teygju
(function(){
  var ul = document.querySelector('header nav ul');
  if (!ul) return;
  var navWrap = document.querySelector('header nav.wrap');
  var links = [].slice.call(ul.querySelectorAll('a'));
  if (!links.length) return;
  var bar = document.createElement('span');
  bar.className = 'nav-underline';
  ul.appendChild(bar);
  ul.classList.add('has-underline');
  var activeLink = ul.querySelector('a.active');

  function moveTo(a, instant){
    if (!a){ bar.style.opacity = 0; return; }
    if (instant) bar.style.transition = 'none';
    // offsetLeft/offsetWidth i stad getBoundingClientRect: gefur endanlega
    // stodu strax, lika a medan pillu-morphid er i gangi
    bar.style.opacity = 1;
    bar.style.left = a.offsetLeft + 'px';
    bar.style.width = a.offsetWidth + 'px';
    if (instant) requestAnimationFrame(function(){ bar.style.transition = ''; });
  }

  var current = activeLink;
  moveTo(current, true);
  // leturgerdin getur breytt breidd hlekkjanna eftir hledslu
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ moveTo(current, true); });
  }
  links.forEach(function(a){
    a.addEventListener('mouseenter', function(){ current = a; moveTo(a); });
  });
  ul.addEventListener('mouseleave', function(){ current = activeLink; moveTo(activeLink); });
  window.addEventListener('resize', function(){ moveTo(current, true); });
  // pillu-morphið hnikar hlekkjunum til (bæði gap á ul-inu og padding/
  // max-width á nav.wrap sjálfu) - þessar tvær hreyfingar enda ekki alltaf
  // á nákvæmlega sömu millisekúndu, svo strikið var stundum mælt of snemma
  // og lenti því örlítið skakkt. Hlustum á bæði til að vera viss.
  ul.addEventListener('transitionend', function(e){
    if (e.propertyName === 'gap') moveTo(current, true);
  });
  if (navWrap){
    navWrap.addEventListener('transitionend', function(e){
      if (e.propertyName === 'max-width' || e.propertyName === 'padding') moveTo(current, true);
    });
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
