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
    return { el: el, top0: null, dir: -1 };
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
      var flipRange = vh * 0.10;
      flipWords.forEach(function(fw){
        var hf = fw.el.getBoundingClientRect();
        if (fw.top0 === null) fw.top0 = hf.top;
        var ref = Math.min(fw.top0, vh * 0.92);
        var fp = Math.min(1, Math.max(0, (ref - hf.top) / flipRange));
        // dautt belti um miðjuna svo örsmátt fram/til-baka trackpad-skroll
        // (inertial scroll á Mac) ýti ekki scaleX endalaust milli -1/1
        if (fp < 0.46) fw.dir = -1; else if (fp > 0.54) fw.dir = 1;
        fw.el.style.transform = 'scaleX(' + fw.dir + ') scaleY(' + (-1 + 2 * fp).toFixed(4) + ')';
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
//
// Undirsíðurnar höfðu áður EINGÖNGU splash B, svo leiðin "undirsíða -> forsíða"
// sýndi alltaf sama skjáinn á meðan "forsíða -> undirsíða" sýndi handahófskennt.
// Hér eru A og C byggð í JS (í stað þess að afrita mörg hundruð SVG-stafi og
// raðir inn í hverja einustu undirsíðu) svo allar leiðir hafi sama úrvalið.
(function(){
  var B = document.getElementById('splashB');
  if (!B) return;

  // ── Splash A: fjórir hringir af REYTAL sem snúast hvor á móti öðrum ──
  // [fjöldi orða í hring, gráður milli stafa, fjarlægð frá miðju, leturstærð]
  var RINGS = [
    ['g-outer', 13, 3.956,  28, 34],
    ['g-mid',   12, 4.286, 100, 28],
    ['g-inner', 12, 4.286, 170, 22],
    ['g-core',  12, 4.286, 236, 16]
  ];
  function buildA(){
    if (document.getElementById('splashA')) return;
    var svg = '';
    RINGS.forEach(function(r){
      var cls = r[0], words = r[1], step = r[2], rad = r[3], fs = r[4];
      var per = 360 / words;
      var letters = 'REYTAL';
      var g = '<g class="' + cls + '" style="font-size:' + fs + 'px">';
      for (var w = 0; w < words; w++){
        for (var i = 0; i < letters.length; i++){
          var ang = (w * per + i * step).toFixed(3);
          // seinni helmingur orðsins (TAL) er á hvolfi - flip-mótíf merkisins
          var flip = i >= 3 ? ' rotate(180)' : '';
          g += '<text transform="rotate(' + ang + ' 400 400) translate(400 ' +
               rad + ')' + flip + '">' + letters[i] + '</text>';
        }
      }
      svg += g + '</g>';
    });
    var el = document.createElement('div');
    el.className = 'splash';
    el.id = 'splashA';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="splash-rings"><svg class="ring" viewBox="0 0 800 800" aria-hidden="true">' +
      svg + '</svg></div>' +
      '<svg class="splash-mark" viewBox="0 0 23.19 18.89"><use href="#markStack"/></svg>';
    document.body.appendChild(el);
    return el;
  }

  // ── Splash C: raðir af REYTAL sem skríða í sitt hvora áttina ──
  // [leturstærð í vmin, sekúndur (lágt = hratt), átt]
  var C_ROWS = [
    [ 9.5,  95, 'L'], [ 2.2,  46, 'R'], [ 5.8, 175, 'L'], [ 3.4,  62, 'R'],
    [12.0, 130, 'L'], [ 2.0,  38, 'R'], [ 7.2, 205, 'L'], [ 2.8,  54, 'R'],
    [ 4.4,  78, 'L'], [10.5, 155, 'R'], [ 2.2,  50, 'L'], [ 5.0, 230, 'R'],
    [ 8.6, 110, 'L'], [ 2.4,  42, 'R'], [ 6.2, 190, 'L'], [ 3.0,  58, 'R'],
    [11.0, 145, 'L'], [ 2.2,  52, 'R'], [ 7.8, 218, 'L']
  ];
  // alvoru merkid (einlinu-utgafan med (R)-merkinu), ekki velritadur texti
  var WORD = '<svg class="w" viewBox="0 0 46.38 8.54" aria-hidden="true"><use href="#markWide"/></svg>';

  function rowsHTML(){
    var vmin = Math.min(innerWidth, innerHeight) / 100;
    var need = innerWidth * 2.2;                 // hver rák þarf að þekja 2x skjáinn
    var html = '';
    C_ROWS.forEach(function(r, i){
      var wordW = r[0] * vmin * 4.54;            // breidd merkisins (.78em x 5.43) + bil
      var reps  = Math.max(3, Math.ceil(need / wordW));
      var track = new Array(reps + 1).join(WORD);
      html += '<div class="c-row" style="font-size:' + r[0] + 'vmin;--d:' +
              (i * 0.035).toFixed(3) + 's;--dout:' +
              ((C_ROWS.length - 1 - i) * 0.022).toFixed(3) + 's">' +
                '<div class="c-track ' + (r[2] === 'L' ? 'r-l' : 'r-r') +
                '" style="animation-duration:' + r[1] + 's">' + track + track + '</div>' +
              '</div>';
    });
    return html;
  }
  function buildC(){
    var el = document.getElementById('splashC');
    if (!el){
      el = document.createElement('div');
      el.className = 'splash';
      el.id = 'splashC';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="c-rows"></div>';
      document.body.appendChild(el);
    }
    el.querySelector('.c-rows').innerHTML = rowsHTML();
    return el;
  }

  var A = buildA();
  var C = buildC();
  var rt;
  addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(buildC, 250);
  });

  var all = [A, B, C].filter(Boolean);

  // Sami lykill og forsíðan notar, svo sami splash birtist ekki tvisvar í röð
  // þó flakkað sé fram og til baka milli forsíðu og undirsíðna.
  var LASTKEY = 'reytal-splash-last';
  function pick(){
    var last = -1;
    try { last = parseInt(sessionStorage.getItem(LASTKEY), 10); } catch(e){}
    var i = Math.floor(Math.random() * all.length);
    if (all.length > 1 && i === last) i = (i + 1 + Math.floor(Math.random() * (all.length - 1))) % all.length;
    try { sessionStorage.setItem(LASTKEY, String(i)); } catch(e){}
    return all[i];
  }

  document.querySelectorAll('nav a, a.logo-mark, .mobile-menu a').forEach(function(a){
    var dest = a.getAttribute('href');
    if (!dest || dest === '#' || dest.charAt(0) === '#' || dest.indexOf('mailto:') === 0) return;
    a.addEventListener('click', function(e){
      e.preventDefault();
      pick().classList.add('on');
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

  // ── Pillu-morphið og strikið ──────────────────────────────────
  // Þrennt hreyfist samtímis þegar navið morphast: gap á ul-inu, padding/
  // max-width á nav.wrap og leturstærðin á hlekkjunum sjálfum. Það þýðir að
  // hlekkirnir renna til ALLAN tímann sem morphið tekur (~0.5s).
  //
  // Áður var strikið aðeins endurmælt við transitionend, þ.e. EFTIR á. Fyrir
  // "Heim" sást það ekki (fremsti hlekkur, offsetLeft er alltaf 0 og breiddin
  // breytist varla) en fyrir "Um okkur" - aftasta hlekkinn - safnast öll
  // gap-breytingin upp, svo strikið sat kyrrt á gamla staðnum og hrökk svo
  // til í lokin. Þess vegna virtist það "færast til og frá".
  //
  // Lausn: elta hlekkinn í hverjum ramma á meðan morphið stendur yfir.
  var trackRaf = null, trackUntil = 0;
  function trackMorph(){
    moveTo(current, true);
    if (performance.now() < trackUntil){
      trackRaf = requestAnimationFrame(trackMorph);
    } else {
      trackRaf = null;
      moveTo(current, true);   // lokamæling þegar allt er kyrrt
    }
  }
  function startTracking(){
    trackUntil = performance.now() + 750;   // aðeins lengur en 0.5s morphið
    if (!trackRaf) trackRaf = requestAnimationFrame(trackMorph);
  }
  if (navWrap && 'MutationObserver' in window){
    new MutationObserver(startTracking).observe(navWrap, {
      attributes: true, attributeFilter: ['class']
    });
  }
  // öryggisnet ef MutationObserver er ekki til staðar
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
