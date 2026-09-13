// ═══════════════════════════════════════════════════════════════════
// REYTAL VIÐMÓT: JS fyrir þau element í reytal-ui.css sem þurfa það.
// Finnur elementin eftir klasa, svo hvert þeirra má standa hvar sem er.
// ═══════════════════════════════════════════════════════════════════
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // halli með músinni: öll .u-tilt element halla sér að bendlinum
  if (!reduce) document.querySelectorAll('.u-tilt').forEach(function(el){
    var host = el.closest('.stage, .hero-el') || el.parentElement;
    host.addEventListener('mousemove', function(e){
      var r = host.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('live');
      el.style.transform = 'rotateX(' + (12 - ny * 22).toFixed(2) + 'deg) rotateY(' + (-18 + nx * 30).toFixed(2) + 'deg)';
    }, {passive:true});
    host.addEventListener('mouseleave', function(){ el.style.transform = ''; el.classList.remove('live'); });
  });

  // 03 kóði: línur af strikum í kóðalitum, með inndrætti. Engin orð,
  // svo elementið er óháð tungumáli. [inndráttur, [[litur, breidd%], ...]]
  document.querySelectorAll('.u-code .lines').forEach(function(host){
    var L = [
      [0, [['t', 20], ['a', 12], ['s', 16]]],
      [1, [['t', 10], ['x', 30], ['t', 12]]],
      [1, [['t', 8], ['x', 24], ['t', 10]]],
      [2, [['t', 9], ['a', 10], ['s', 22]]],
      [1, [['t', 14]]],
      [0, [['t', 22]]]
    ], h = '', k = 0;
    L.forEach(function(line, n){
      h += '<div class="ln" style="--in:' + line[0] + '">';
      line[1].forEach(function(p){ h += '<b class="' + p[0] + '" style="--w:' + p[1] + '%;--i:' + (k++) + '"></b>'; });
      if (n === L.length - 1) h += '<i class="caret"></i>';
      h += '</div>';
    });
    host.innerHTML = h;
  });

  // 04 uppitími: súlur, ein þeirra sage (stutt hikst sem var lagað)
  document.querySelectorAll('.u-uptime .ticks').forEach(function(host){
    var h = '';
    for (var i = 0; i < 22; i++) h += '<i style="--i:' + i + '"' + (i === 15 ? ' class="warn"' : '') + '></i>';
    host.innerHTML = h;
  });

  // 07 hraðamælir: bogi fyllist upp í 96, heldur, núllstillist
  document.querySelectorAll('.u-gauge').forEach(function(g){
    var TARGET = +(g.getAttribute('data-value') || 96), num = g.querySelector('.val b');
    function set(v){ g.style.setProperty('--p', v.toFixed(2)); if (num) num.textContent = Math.round(v); }
    if (reduce){ set(TARGET); return; }
    var start = null;
    function frame(ts){
      if (start === null) start = ts;
      var t = (ts - start) / 1000 % 8, v;
      if (t < 2.2){ var p = t / 2.2; v = TARGET * (1 - Math.pow(1 - p, 3)); }
      else if (t < 6.0) v = TARGET;
      else if (t < 6.8){ var q = (t - 6.0) / 0.8; v = TARGET * (1 - q * q); }
      else v = 0;
      set(v); requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  // 11 leit: þinn vefur fer úr 3. sæti í 2. og svo í 1.
  document.querySelectorAll('.u-rank').forEach(function(host){
    var res = [].slice.call(host.querySelectorAll('.res'));
    if (res.length !== 3) return;
    var seq = [[0, 1, 2], [0, 2, 1], [1, 2, 0]], step = 0, wait = [1800, 1300, 3200];
    function apply(){
      seq[step].forEach(function(p, i){
        res[i].style.setProperty('--p', p);
        var pos = res[i].querySelector('.pos');
        if (pos) pos.textContent = '#' + (p + 1);
      });
    }
    if (reduce){ step = 2; apply(); return; }
    apply();
    (function tick(){ setTimeout(function(){ step = (step + 1) % 3; apply(); tick(); }, wait[step]); })();
  });
})();
