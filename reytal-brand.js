// ═══════════════════════════════════════════════════════════════════
// REYTAL BRAND-ELEMENT: JS fyrir þau element sem þurfa það.
// Finnur elementin eftir klasa (sjá reytal-brand.css), svo það má setja
// hvert þeirra hvar sem er og þessi skrá sér um restina.
// ═══════════════════════════════════════════════════════════════════
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 04 spegilorð
  document.querySelectorAll('.b-mirror').forEach(function(host){
    var word = host.getAttribute('data-word') || 'REYTAL';
    var trk = '<div class="trk">' + new Array(13).join('<span>' + word + '</span>') + '</div>';
    host.innerHTML = '<div class="half top">' + trk + '</div><div class="half bot">' + trk + '</div>';
  });

  // 05 hringorð: sama uppbygging og splash A
  document.querySelectorAll('.b-ring').forEach(function(host){
    var rings = [[86, 6, 6.2, 17, 'o'], [58, 4, 9.4, 12, 'i']], L = 'REYTAL';
    var svg = '<svg viewBox="0 0 200 200" aria-hidden="true">';
    rings.forEach(function(r){
      var per = 360 / r[1];
      svg += '<g class="' + r[4] + '" style="font-size:' + r[3] + 'px">';
      for (var w = 0; w < r[1]; w++) for (var i = 0; i < 6; i++){
        var a = (w * per + i * r[2]).toFixed(2);
        svg += '<text transform="rotate(' + a + ' 100 100) translate(100 ' + (100 - r[0]) + ')' +
               (i >= 3 ? ' rotate(180)' : '') + '">' + L[i] + '</text>';
      }
      svg += '</g>';
    });
    host.innerHTML = svg + '<circle cx="100" cy="100" r="3.5"/></svg>';
  });

  // 06 raðir: sama uppbygging og splash C
  document.querySelectorAll('.b-rows').forEach(function(host){
    var R = [[40, 26, 'l'], [15, 14, 'r'], [30, 34, 'l'], [20, 18, 'r'], [48, 40, 'l'], [14, 12, 'r'], [28, 28, 'l']], h = '';
    R.forEach(function(r, i){
      var word = new Array(9).join('<span>REYTAL</span>');
      h += '<div class="row' + (i % 2 ? ' fl' : '') + '" style="font-size:' + r[0] + 'px"><div class="trk ' + r[2] +
           '" style="animation-duration:' + r[1] + 's">' + word + word + '</div></div>';
    });
    host.innerHTML = h;
  });

  // 07 flippað orð: sama hreyfing og „Lausnir" á forsíðunni.
  // Orðin koma úr data-words="A,B,C" ef það er til.
  document.querySelectorAll('.b-flip .w').forEach(function(w){
    if (reduce || !w.animate) return;
    var attr = w.parentElement.getAttribute('data-words');
    var words = attr ? attr.split(',') : ['Vefir', 'Hönnun', 'SEO', 'Hýsing', 'Kóði'];
    var k = 0, prev = null;
    function cycle(){
      var out = w.animate([{transform:'scaleX(1) scaleY(1)'}, {transform:'scaleX(1) scaleY(0)'}],
        {duration:340, easing:'cubic-bezier(.7,0,.9,.4)', fill:'forwards'});
      if (prev) prev.cancel();
      out.onfinish = function(){
        k = (k + 1) % words.length; w.textContent = words[k];
        var inn = w.animate([
          {transform:'scaleX(-1) scaleY(0)', offset:0, easing:'cubic-bezier(.2,.8,.3,1)'},
          {transform:'scaleX(-1) scaleY(-1)', offset:.3},
          {transform:'scaleX(-1) scaleY(-1)', offset:.55, easing:'cubic-bezier(.7,0,.9,.4)'},
          {transform:'scaleX(-1) scaleY(0)', offset:.76},
          {transform:'scaleX(1) scaleY(0)', offset:.7601, easing:'cubic-bezier(.2,.8,.3,1)'},
          {transform:'scaleX(1) scaleY(1)', offset:1}
        ], {duration:1500, fill:'forwards'});
        out.cancel(); prev = inn;
        inn.onfinish = function(){ setTimeout(cycle, 1500); };
      };
    }
    setTimeout(cycle, 1200);
  });

  // 08 talning: hver tölustafur rúllar heilan hring og lendir á réttri tölu
  document.querySelectorAll('.b-odo .num').forEach(function(n){
    var target = n.getAttribute('data-value') || '30.000', cols = [];
    n.innerHTML = '';
    target.split('').forEach(function(ch){
      if (!/\d/.test(ch)){ var s = document.createElement('span'); s.className = 'sep'; s.textContent = ch; n.appendChild(s); return; }
      var d = document.createElement('span'); d.className = 'd';
      var c = document.createElement('span'); c.className = 'col';
      for (var i = 0; i < 20; i++){ var x = document.createElement('span'); x.textContent = i % 10; c.appendChild(x); }
      d.appendChild(c); n.appendChild(d); cols.push([c, +ch]);
    });
    function roll(on){
      cols.forEach(function(p, i){
        p[0].style.transition = on ? '' : 'none';
        p[0].style.transitionDelay = on ? (i * 0.12) + 's' : '0s';
        p[0].style.transform = 'translateY(' + (on ? -(10 + p[1]) * 5 : 0) + '%)';
      });
    }
    if (reduce){ roll(true); return; }
    function loop(){
      roll(false); n.style.opacity = 1;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ roll(true); }); });
      setTimeout(function(){ n.style.opacity = 0; setTimeout(loop, 350); }, 5200);
    }
    loop();
  });

  // 09 strikið: sama teygja og í valmyndinni
  document.querySelectorAll('.b-under').forEach(function(host){
    var links = [].slice.call(host.querySelectorAll('span')), bar = host.querySelector('i'), k = 0, hover = false;
    if (!links.length || !bar) return;
    function go(i){
      links.forEach(function(l, j){ l.classList.toggle('on', j === i); });
      bar.style.left = links[i].offsetLeft + 'px';
      bar.style.width = links[i].offsetWidth + 'px';
      bar.style.top = (links[i].offsetTop + links[i].offsetHeight + 6) + 'px';
    }
    go(0);
    links.forEach(function(l, i){ l.addEventListener('mouseenter', function(){ hover = true; k = i; go(i); }); });
    host.addEventListener('mouseleave', function(){ hover = false; });
    if (!reduce) setInterval(function(){ if (hover) return; k = (k + 1) % links.length; go(k); }, 1500);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ go(k); });
  });

  // 10 pillur
  document.querySelectorAll('.b-pills').forEach(function(host){
    var P = [['Vefþróun', 7, 16, -3, 1], ['SEO', 42, 16, 5], ['Hýsing', 63, 16, -6],
             ['UX / UI', 16, 27.5, 4], ['Netverslun', 49, 27.5, -2], ['AI', 34, 39, 8]];
    host.innerHTML = '';
    var els = P.map(function(p){
      var s = document.createElement('span'); s.textContent = p[0];
      if (p[4]) s.className = 'on';
      s.style.left = p[1] + '%'; s.style.bottom = p[2] + '%'; s.dataset.r = p[3];
      s.style.transform = 'rotate(' + p[3] + 'deg)';
      host.appendChild(s); return s;
    });
    if (reduce || !host.animate) return;
    function run(){
      var H = host.clientHeight;
      els.forEach(function(s, i){
        s.getAnimations().forEach(function(a){ a.cancel(); });
        var r = +s.dataset.r;
        s.animate([{transform:'translateY(' + (-H) + 'px) rotate(' + (r * 4) + 'deg)', opacity:1},
                   {transform:'translateY(0) rotate(' + r + 'deg)', opacity:1}],
                  {duration:900, delay:i * 170, easing:'cubic-bezier(.3,1.35,.45,1)', fill:'both'});
      });
      setTimeout(function(){
        els.forEach(function(s){
          var r = +s.dataset.r;
          s.animate([{transform:'rotate(' + r + 'deg)', opacity:1}, {transform:'translateY(12px) rotate(' + r + 'deg)', opacity:0}],
                    {duration:450, easing:'ease-in', fill:'forwards'});
        });
        setTimeout(run, 550);
      }, 900 + els.length * 170 + 2600);
    }
    run();
  });

  // 11 punktar
  document.querySelectorAll('.b-dots').forEach(function(host){
    var h = '';
    for (var y = 0; y < 9; y++) for (var x = 0; x < 9; x++){
      var d = Math.hypot(x - 4, y - 4);
      h += '<i style="--d:' + (d * 0.16).toFixed(2) + 's"' + (d === 0 ? ' class="c"' : '') + '></i>';
    }
    host.innerHTML = h;
  });
})();
