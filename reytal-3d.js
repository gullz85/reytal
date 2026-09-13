/* ═══════════════════════════════════════════════════════════════════
   REYTAL 3D: samræmd fjölskylda af þrívíddarhlutum.

   Það sem gerir þá að einni fjölskyldu er EKKI formið heldur allt hitt:
   sama efni, sami litur, sama lýsing (sama umhverfiskort), sama stærð,
   sama myndavél og sami hægi snúningur. Formin mega vera bull.

   Notkun (Three.js r128 þarf að vera hlaðið á undan):
     <div class="r3d" data-shape="hnutur" data-finish="navy"></div>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
     <script src="/reytal-3d.js"></script>

   Form:    oddur · snuningur · tolf · hnutur · kleina · klumpur · pilla · tviskipt
   Áferð:   navy · rjomi · sage · svart
   Breiddin ræðst af kassanum sjálfum (hann er alltaf 1:1).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (!window.THREE) { console.warn("reytal-3d: Three.js vantar"); return; }
  var T = window.THREE;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── stílar fyrir kassann: skuggi undir hlutnum er CSS, ekki WebGL ──
  if (!document.getElementById("r3d-css")) {
    var st = document.createElement("style");
    st.id = "r3d-css";
    st.textContent =
      ".r3d{position:relative;aspect-ratio:1;width:100%;}" +
      ".r3d canvas{position:relative;z-index:1;display:block;width:100%!important;height:100%!important;}" +
      ".r3d::after{content:'';position:absolute;left:24%;right:24%;bottom:9%;height:7%;border-radius:50%;" +
      "background:radial-gradient(closest-side,rgba(11,12,13,.20),transparent);filter:blur(4px);z-index:0;" +
      "animation:r3dShadow 6s ease-in-out infinite;}" +
      ".r3d.on-dark::after{background:radial-gradient(closest-side,rgba(0,0,0,.45),transparent);}" +
      "@keyframes r3dShadow{0%,100%{transform:scaleX(1);opacity:1}50%{transform:scaleX(.86);opacity:.75}}" +
      "@media (prefers-reduced-motion:reduce){.r3d::after{animation:none}}";
    document.head.appendChild(st);
  }

  // ── áferðirnar: litur úr pallettu vefsins, sama gljái á öllum ──
  var FINISH = {
    navy:  { color: 0x0D4659, rough: 0.30, clear: 0.9, env: 1.15 },
    rjomi: { color: 0xEFEAE0, rough: 0.42, clear: 0.5, env: 0.95 },
    sage:  { color: 0xAEB08F, rough: 0.34, clear: 0.7, env: 1.05 },
    svart: { color: 0x141618, rough: 0.24, clear: 1.0, env: 1.30 }
  };
  function lin(hex) { return new T.Color(hex).convertSRGBToLinear(); }

  // ── umhverfiskort: rjómalitaður himinn, navy undir, tvö ljósaspjöld ──
  function makeEnv(renderer) {
    var pm = new T.PMREMGenerator(renderer);
    var sc = new T.Scene();
    var g = new T.SphereGeometry(10, 48, 24);
    var pos = g.attributes.position, cols = [];
    var top = lin(0xF3F0EA), mid = lin(0x9AA1A6), bot = lin(0x0D4659);
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / 10, c = new T.Color();
      if (y > 0) c.copy(mid).lerp(top, Math.min(1, y * 1.6));
      else c.copy(mid).lerp(bot, Math.min(1, -y * 1.4));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    sc.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    function panel(w, h, col, x, y, z) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);
    }
    panel(7, 3.2, 0xffffff, -4, 5.5, 5);       // aðalljós, ofan vinstra megin
    panel(2.2, 6, lin(0xBEBFA6), 7, 0.5, -1);  // hlýr sage-kantur hægra megin
    panel(4, 1.2, lin(0x4C7C93), 0, -6, 3);    // slate endurkast neðan frá
    var tex = pm.fromScene(sc, 0.035).texture;
    pm.dispose();
    return tex;
  }

  // ── formin ──────────────────────────────────────────────────────
  function twistBox() {
    var g = new T.BoxGeometry(1.45, 1.45, 1.45, 28, 28, 28);
    var p = g.attributes.position, v = new T.Vector3();
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // mjúk námundun á hornum + snúningur um lóðrétta ásinn
      var len = v.length(), s = 1 + (0.9 / len - 1) * 0.16;
      v.multiplyScalar(s);
      var a = v.y * 0.75, x = v.x, z = v.z;
      v.x = x * Math.cos(a) - z * Math.sin(a);
      v.z = x * Math.sin(a) + z * Math.cos(a);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  function capsule() {
    var pts = [], r = 0.5, h = 0.75, n = 24, i, a;
    for (i = 0; i <= n; i++) { a = -Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * r, Math.sin(a) * r - h)); }
    for (i = 0; i <= n; i++) { a = (i / n) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * r, Math.sin(a) * r + h)); }
    return new T.LatheGeometry(pts, 64);
  }

  function build(shape, mat) {
    var root = new T.Group(), update = null, faceted = false, mesh;
    switch (shape) {
      case "oddur":
        mesh = new T.Mesh(new T.ConeGeometry(1.1, 1.55, 3, 1), mat); faceted = true;
        mesh.rotation.x = 0.12; root.add(mesh); break;
      case "snuningur":
        mesh = new T.Mesh(twistBox(), mat); mesh.rotation.set(0.35, 0.5, 0.1); root.add(mesh); break;
      case "tolf":
        mesh = new T.Mesh(new T.DodecahedronGeometry(1.05, 0), mat); faceted = true; root.add(mesh); break;
      case "hnutur":
        mesh = new T.Mesh(new T.TorusKnotGeometry(0.72, 0.25, 260, 36, 2, 3), mat); root.add(mesh); break;
      case "kleina":
        mesh = new T.Mesh(new T.TorusGeometry(0.78, 0.4, 56, 128), mat); mesh.rotation.x = 1.05; root.add(mesh); break;
      case "pilla":
        mesh = new T.Mesh(capsule(), mat); mesh.rotation.z = 0.75; mesh.rotation.x = 0.3; root.add(mesh); break;
      case "klumpur": {
        // SphereGeometry (ekki Icosahedron): hún er indexuð, svo normalarnir
        // verða mjúkir í stað þess að hver þríhyrningur sjáist
        var g = new T.SphereGeometry(1, 120, 80);
        var base = g.attributes.position.array.slice();
        mesh = new T.Mesh(g, mat); root.add(mesh);
        update = function (t) {
          var p = g.attributes.position.array;
          for (var i = 0; i < p.length; i += 3) {
            var x = base[i], y = base[i + 1], z = base[i + 2];
            var d = 1 + 0.13 * Math.sin(2.6 * x + t * 0.9) * Math.sin(2.9 * y + t * 0.7) * Math.sin(2.4 * z + t * 1.1)
                      + 0.05 * Math.sin(5 * y + t * 1.3);
            p[i] = x * d; p[i + 1] = y * d; p[i + 2] = z * d;
          }
          g.attributes.position.needsUpdate = true;
          g.computeVertexNormals();
        };
        update(0);
        break;
      }
      case "tviskipt": {
        // flip-mótíf merkisins: tveir helmingar, sá efri veltur á hvolf og til baka
        var r = 0.82, gap = 0.07;
        function half(topSide) {
          var grp = new T.Group();
          var dome = new T.Mesh(new T.SphereGeometry(r, 64, 32, 0, Math.PI * 2, topSide ? 0 : Math.PI / 2, Math.PI / 2), mat);
          var lid = new T.Mesh(new T.CircleGeometry(r, 64), mat);
          lid.rotation.x = topSide ? Math.PI / 2 : -Math.PI / 2;
          grp.add(dome, lid);
          var pivot = new T.Group();
          grp.position.y = topSide ? -r * 0.375 : r * 0.375;   // snúið um massamiðju helmingsins
          pivot.add(grp);
          pivot.position.y = topSide ? gap + r * 0.375 : -gap - r * 0.375;
          return pivot;
        }
        var topH = half(true), botH = half(false);
        root.add(topH, botH);
        root.rotation.z = 0.35;
        update = function (t) {
          var cyc = (t % 6) / 6, k;                      // 6s lota: kyrrt, velta, kyrrt, velta til baka
          if (cyc < 0.3) k = 0;
          else if (cyc < 0.5) k = ease((cyc - 0.3) / 0.2);
          else if (cyc < 0.8) k = 1;
          else k = 1 - ease((cyc - 0.8) / 0.2);
          topH.rotation.x = k * Math.PI;
          botH.rotation.x = -k * Math.PI * 0.0;
        };
        break;
      }
      default:
        mesh = new T.Mesh(new T.IcosahedronGeometry(1, 1), mat); faceted = true; root.add(mesh);
    }
    return { root: root, update: update, faceted: faceted };
  }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // ── eitt svið á hvern kassa ───────────────────────────────────────
  var instances = [];

  function mount(host) {
    if (host._r3d) return host._r3d;
    var shape = host.getAttribute("data-shape") || "tolf";
    var fin = FINISH[host.getAttribute("data-finish")] || FINISH.navy;

    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    var scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    var key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(-3, 4, 5); scene.add(key);
    var rim = new T.DirectionalLight(lin(0xBEBFA6), 0.5); rim.position.set(4, 1, -3); scene.add(rim);

    var camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.15, 6.2);
    camera.lookAt(0, 0, 0);

    var mat = new T.MeshPhysicalMaterial({
      color: lin(fin.color), roughness: fin.rough, metalness: 0.05,
      clearcoat: fin.clear, clearcoatRoughness: 0.18, envMapIntensity: fin.env
    });
    var obj = build(shape, mat);
    if (obj.faceted) { mat.flatShading = true; mat.needsUpdate = true; }

    // allir hlutir í sömu stærð: jafn radíus umlykjandi kúlu
    var box = new T.Box3().setFromObject(obj.root), sph = box.getBoundingSphere(new T.Sphere());
    var s = 1.42 / sph.radius;
    obj.root.scale.setScalar(s);
    obj.root.position.sub(sph.center.multiplyScalar(s));
    var spin = new T.Group(); spin.add(obj.root); scene.add(spin);

    var inst = {
      host: host, renderer: renderer, scene: scene, camera: camera, spin: spin, mat: mat, obj: obj,
      visible: true, t: Math.random() * 10, tx: 0, ty: 0, cx: 0, cy: 0, w: 0, h: 0
    };

    function size() {
      var w = host.clientWidth, h = host.clientHeight || w;
      if (w === inst.w && h === inst.h) return;
      inst.w = w; inst.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    size();
    if ("ResizeObserver" in window) new ResizeObserver(function () { size(); render(inst, 0); }).observe(host);

    host.addEventListener("mousemove", function (e) {
      var r = host.getBoundingClientRect();
      inst.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
      inst.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.6;
    }, { passive: true });
    host.addEventListener("mouseleave", function () { inst.tx = 0; inst.ty = 0; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inst.visible = en[0].isIntersecting; }, { rootMargin: "120px" }).observe(host);
    }

    host._r3d = inst;
    instances.push(inst);
    render(inst, 0);            // fyrsta mynd strax, ekki bara í næsta ramma
    return inst;
  }

  function render(inst, dt) {
    inst.t += dt;
    inst.cx += (inst.tx - inst.cx) * 0.06;
    inst.cy += (inst.ty - inst.cy) * 0.06;
    inst.spin.rotation.y = inst.t * 0.32 + inst.cx;
    inst.spin.rotation.x = Math.sin(inst.t * 0.45) * 0.12 + inst.cy;
    inst.spin.position.y = Math.sin(inst.t * 1.05) * 0.06;
    if (inst.obj.update) inst.obj.update(inst.t);
    inst.renderer.render(inst.scene, inst.camera);
  }

  var last = 0;
  function loop(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    for (var i = 0; i < instances.length; i++) if (instances[i].visible) render(instances[i], dt);
    requestAnimationFrame(loop);
  }

  function init() {
    document.querySelectorAll(".r3d").forEach(mount);
    if (!reduce) requestAnimationFrame(loop);
  }

  // opinbert: skipta um áferð á kassa, eða tengja nýja kassa sem bættust við
  window.REYTAL3D = {
    mount: mount,
    setFinish: function (host, name) {
      var inst = host._r3d, fin = FINISH[name];
      if (!inst || !fin) return;
      host.setAttribute("data-finish", name);
      inst.mat.color.copy(lin(fin.color));
      inst.mat.roughness = fin.rough; inst.mat.clearcoat = fin.clear; inst.mat.envMapIntensity = fin.env;
      render(inst, 0);
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
