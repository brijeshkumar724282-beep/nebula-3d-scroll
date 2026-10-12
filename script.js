/* Nebula Scroll interactions. Guards allow page to work without CDN libs. */
(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function(){ return window.matchMedia("(max-width: 820px)").matches; };

  /* ---------- Nav ---------- */
  var burger = document.getElementById("burger");
  var navlinks = document.getElementById("navlinks");
  if(burger && navlinks){
    burger.addEventListener("click", function(){
      var open = navlinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navlinks.addEventListener("click", function(e){
      if(e.target.closest("a")){
        navlinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded","false");
      }
    });
  }

  /* ---------- Starfield (Three.js with 2D fallback) ---------- */
  var canvas = document.getElementById("bg");
  var targetBoost = 0;   // extra speed from scroll velocity
  var baseSpeed = prefersReduced ? 0.0004 : 0.0022;
  var shapes = [];
  var starPoints = null;
  var starGeo = null;
  var renderer = null, scene = null, camera = null;
  var threeOK = (typeof window.THREE !== "undefined");
  var raf = 0, t = 0;

  function noteBoost(v){
    // v is scroll velocity, clamp to sane range
    var a = Math.abs(v || 0);
    if(a > 60) a = 60;
    targetBoost = a / 60; // 0..1
  }

  var fallback = null;
  function initFallback2D(){
    var ctx = canvas.getContext("2d");
    var stars = [];
    var W = 0, H = 0, speed = 0.4;
    function size(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    size();
    window.addEventListener("resize", size);
    for(var i=0;i<320;i++){
      stars.push({x:Math.random(), y:Math.random(), r:Math.random()*1.6+0.3, c: Math.random() > 0.86 ? "#FF6B57" : "#FFFFFF", s: Math.random()*0.6+0.2});
    }
    var cur = 0;
    function loop(){
      cur += ((speed + targetBoost*6) - cur) * 0.06;
      ctx.fillStyle = "#070B18";
      ctx.fillRect(0,0,W,H);
      for(var k=0;k<stars.length;k++){
        var st = stars[k];
        st.y += (cur * st.s) / H * 3;
        if(st.y > 1) { st.y = 0; st.x = Math.random(); }
        ctx.globalAlpha = 0.55 + st.s * 0.4;
        ctx.fillStyle = st.c;
        ctx.beginPath();
        ctx.arc(st.x*W, st.y*H, st.r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      targetBoost *= 0.94;
      requestAnimationFrame(loop);
    }
    if(!prefersReduced) loop();
    else { // single static frame
      ctx.fillStyle = "#070B18"; ctx.fillRect(0,0,W,H);
      stars.forEach(function(st){ ctx.fillStyle = st.c; ctx.beginPath(); ctx.arc(st.x*W, st.y*H, st.r, 0, Math.PI*2); ctx.fill(); });
    }
    fallback = { size: size };
  }

  function initThree(){
    var THREE = window.THREE;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x070B18, 1);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070B18);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 200);
    camera.position.z = 26;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(6, 10, 8);
    scene.add(dir);
    var coral = new THREE.PointLight(0xFF6B57, 30, 60);
    coral.position.set(-8, -4, 8);
    scene.add(coral);

    // white stars
    var N = 1600;
    var pos = new Float32Array(N*3);
    for(var i=0;i<N;i++){
      pos[i*3] = (Math.random()-0.5)*90;
      pos[i*3+1] = (Math.random()-0.5)*60;
      pos[i*3+2] = (Math.random()-0.5)*60;
    }
    starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.14, transparent:true, opacity:0.9 }));
    scene.add(starPoints);

    // coral accent stars
    var M = 220;
    var pos2 = new Float32Array(M*3);
    for(var j=0;j<M;j++){
      pos2[j*3] = (Math.random()-0.5)*80;
      pos2[j*3+1] = (Math.random()-0.5)*50;
      pos2[j*3+2] = (Math.random()-0.5)*50;
    }
    var g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
    var p2 = new THREE.Points(g2, new THREE.PointsMaterial({ color: 0xFF6B57, size: 0.24, transparent:true, opacity:0.95 }));
    scene.add(p2);
    starPoints.userData.extra = p2;

    // floating low poly shapes, solid materials only
    var mats = [
      new THREE.MeshStandardMaterial({ color: 0xFF6B57, roughness: 0.55, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0xE8ECF8, roughness: 0.6, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x2A3A7A, roughness: 0.6, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x111A38, roughness: 0.5, flatShading: true })
    ];
    var geos = [
      new THREE.IcosahedronGeometry(2.2, 0),
      new THREE.OctahedronGeometry(1.7, 0),
      new THREE.TetrahedronGeometry(2.0, 0),
      new THREE.BoxGeometry(2.2, 2.2, 2.2)
    ];
    var spots = [[-11,4,-6],[10,-3,-4],[8,6,-10],[-9,-6,-8]];
    for(var s=0;s<4;s++){
      var m = new THREE.Mesh(geos[s], mats[s]);
      m.position.set(spots[s][0], spots[s][1], spots[s][2]);
      m.userData = { baseY: spots[s][1], ph: Math.random()*Math.PI*2, rs: 0.0016 + Math.random()*0.002 };
      scene.add(m);
      shapes.push(m);
    }

    window.addEventListener("resize", function(){
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
    });

    var cur = baseSpeed;
    function loop(){
      raf = requestAnimationFrame(loop);
      t += 0.008;
      var want = baseSpeed + targetBoost * 0.03;
      cur += (want - cur) * 0.07;
      targetBoost *= 0.93;
      starPoints.rotation.y += cur * 0.4;
      starPoints.position.y -= cur * 6;
      if(starPoints.position.y < -8) starPoints.position.y = 0;
      starPoints.userData.extra.rotation.y -= cur * 0.5;
      for(var k=0;k<shapes.length;k++){
        var sh = shapes[k];
        sh.rotation.x += sh.userData.rs + cur * 0.6;
        sh.rotation.y += sh.userData.rs * 1.4 + cur;
        sh.position.y = sh.userData.baseY + Math.sin(t + sh.userData.ph) * 1.1;
      }
      camera.position.y += ((window.scrollY * 0.0012) - camera.position.y) * 0.04;
      renderer.render(scene, camera);
    }
    if(!prefersReduced) loop();
    else renderer.render(scene, camera);
  }

  try{
    if(threeOK) initThree();
    else initFallback2D();
  }catch(err){
    try{ initFallback2D(); }catch(e2){}
  }

  /* ---------- Smooth scroll (Lenis with native fallback) ---------- */
  var lenis = null;
  var lenisOK = (typeof window.Lenis !== "undefined");
  if(lenisOK && !prefersReduced && !isMobile()){
    try{
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on("scroll", function(e){ noteBoost(e.velocity || 0); });
      var loopL = function(time){ lenis.raf(time); requestAnimationFrame(loopL); };
      requestAnimationFrame(loopL);
    }catch(err){ lenis = null; }
  }
  // native scroll velocity fallback
  if(!lenis){
    var lastY = window.scrollY;
    window.addEventListener("scroll", function(){
      var y = window.scrollY;
      noteBoost((y - lastY) * 0.6);
      lastY = y;
    }, { passive:true });
  }

  // anchor clicks
  document.querySelectorAll("[data-scroll]").forEach(function(a){
    a.addEventListener("click", function(e){
      var id = a.getAttribute("href");
      if(!id || id.charAt(0) !== "#") return;
      var el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      if(lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
      else el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- Animations (GSAP with IO fallback) ---------- */
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-dot]"));
  function setDot(id){
    dots.forEach(function(d){ d.classList.toggle("active", d.getAttribute("data-dot") === id); });
  }
  var sections = ["launch","orbit","landing","gallery"];
  var gsapOK = (typeof window.gsap !== "undefined");
  var stOK = (typeof window.ScrollTrigger !== "undefined");

  if(gsapOK && stOK && !prefersReduced){
    window.gsap.registerPlugin(window.ScrollTrigger);
    // hero stagger
    window.gsap.from(".heroanim", { y: 44, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.15 });
    // pins on desktop only
    var mm = window.gsap.matchMedia();
    mm.add("(min-width: 821px)", function(){
      ["#launch","#orbit","#landing"].forEach(function(sel){
        window.gsap.fromTo(sel + " .card", { y: 60, rotate: 1.2 }, {
          y: -30, rotate: 0, ease: "none",
          scrollTrigger: { trigger: sel, start: "top top+=70", end: "+=90%", scrub: 1, pin: sel + " .chapterinner", anticipatePin: 1 }
        });
      });
    });
    // reveals
    window.gsap.utils.toArray(".art, .stats div, .sechead").forEach(function(el){
      window.gsap.from(el, { y: 36, opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    // dots
    sections.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      window.ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%",
        onToggle: function(self){ if(self.isActive) setDot(id); } });
    });
  } else {
    // fallback: IntersectionObserver for dots + reveals
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting) setDot(en.target.id); });
      }, { rootMargin: "-40% 0px -50% 0px" });
      sections.forEach(function(id){ var el = document.getElementById(id); if(el) io.observe(el); });
      var io2 = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ en.target.style.opacity = "1"; en.target.style.transform = "none"; io2.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".art, .stats div").forEach(function(el){
        el.style.opacity = "0"; el.style.transform = "translateY(24px)";
        el.style.transition = "opacity .6s ease, transform .6s ease";
        io2.observe(el);
      });
    }
  }

  // fps label nudge (purely cosmetic, paused under reduced motion)
  var fps = document.getElementById("fpsLabel");
  if(fps && !prefersReduced){
    setInterval(function(){
      fps.textContent = String(58 + Math.round(Math.random()*4));
    }, 1600);
  }

  /* ---------- Tilt ---------- */
  var tiltOK = !prefersReduced && window.matchMedia("(pointer: fine)").matches;
  if(tiltOK){
    document.querySelectorAll(".tilt").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left)/r.width - 0.5;
        var y = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (-y*10).toFixed(2) + "deg) rotateY(" + (x*12).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function(){ card.style.transform = ""; });
    });
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el){
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    if(prefersReduced){ el.textContent = String(end); return; }
    var start = 0, steps = 40, i = 0;
    var iv = setInterval(function(){
      i++;
      el.textContent = String(Math.round(end * (i/steps)));
      if(i >= steps){ clearInterval(iv); el.textContent = String(end); }
    }, 30);
  }
  if("IntersectionObserver" in window){
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ runCounter(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ---------- Contact validation ---------- */
  var form = document.getElementById("contactform");
  if(form){
    var ok = document.getElementById("formok");
    function err(id, msg){
      var s = form.querySelector('[data-err="' + id + '"]');
      var input = document.getElementById(id);
      if(s) s.textContent = msg || "";
      if(input) input.style.borderColor = msg ? "#C22E20" : "#CBD2E8";
    }
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = document.getElementById("fname").value.trim();
      var email = document.getElementById("femail").value.trim();
      var msg = document.getElementById("fmsg").value.trim();
      var good = true;
      if(name.length < 2){ err("fname", "Please enter your name."); good = false; } else err("fname", "");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ err("femail", "Please enter a valid email."); good = false; } else err("femail", "");
      if(msg.length < 10){ err("fmsg", "Please write at least 10 characters."); good = false; } else err("fmsg", "");
      if(!good){ if(ok) ok.textContent = ""; return; }
      if(ok) ok.textContent = "Message received. Thanks for reaching out.";
      form.reset();
    });
  }
})();
