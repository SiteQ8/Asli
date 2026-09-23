/*
  The Asli seal: guilloche line work of the kind printed on banknotes and ID cards
  to prove they are genuine. Drawn once; the lines trace themselves on first load
  unless the visitor prefers reduced motion.
*/
(function (root) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var TAU = Math.PI * 2;

  function node(name, attrs) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function closed(points) {
    var d = "";
    for (var i = 0; i < points.length; i++) {
      d += (i ? "L" : "M") + points[i][0].toFixed(2) + " " + points[i][1].toFixed(2);
    }
    return d + "Z";
  }

  /* A band of phase-shifted waves around a ring: the basic guilloche weave. */
  function band(spec) {
    var paths = [];
    for (var i = 0; i < spec.lines; i++) {
      var phase = (i / spec.lines) * TAU / spec.k * spec.spread;
      var pts = [];
      for (var s = 0; s < spec.steps; s++) {
        var t = (s / spec.steps) * TAU;
        var r = spec.r + spec.a * Math.sin(spec.k * (t + phase));
        if (spec.a2) r += spec.a2 * Math.sin(spec.k2 * t - i * 0.35);
        pts.push([r * Math.cos(t), r * Math.sin(t)]);
      }
      paths.push(closed(pts));
    }
    return paths;
  }

  var LAYERS = [
    { cls: "g-outer", r: 186, a: 8, k: 64, lines: 5, steps: 2048, spread: 1 },
    { cls: "g-mid", r: 157, a: 12, k: 32, a2: 4, k2: 96, lines: 7, steps: 2048, spread: 1 },
    { cls: "g-rose", r: 119, a: 27, k: 12, a2: 7, k2: 36, lines: 12, steps: 1800, spread: 1 }
  ];

  function draw(svg, options) {
    var animate = !!(options && options.animate);
    svg.textContent = "";

    var art = node("g", { "class": "seal-art", fill: "none", "stroke-linejoin": "round" });
    var drawn = [];

    art.appendChild(node("circle", { r: 199, "class": "g-foil g-dots" }));
    art.appendChild(node("circle", { r: 203.5, "class": "g-foil" }));

    LAYERS.forEach(function (layer) {
      band(layer).forEach(function (d) {
        var p = node("path", { d: d, "class": layer.cls });
        art.appendChild(p);
        drawn.push(p);
      });
    });

    var center = node("g", { "class": "seal-center" });
    center.appendChild(node("circle", { r: 84, "class": "g-disc" }));
    center.appendChild(node("circle", { r: 88.5, "class": "g-foil g-dots" }));
    center.appendChild(node("circle", { r: 78, "class": "g-foil g-thin" }));
    var word = node("text", { x: 0, y: -4, "class": "g-word", "text-anchor": "middle", "dominant-baseline": "central", direction: "rtl" });
    word.textContent = "أَصْلي";
    var latin = node("text", { x: 0, y: 40, "class": "g-latin", "text-anchor": "middle", "dominant-baseline": "central" });
    latin.textContent = "Asli";
    center.appendChild(word);
    center.appendChild(latin);

    svg.appendChild(art);
    svg.appendChild(center);

    if (!animate) return;

    svg.classList.add("is-drawing");
    drawn.forEach(function (p, i) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = String(len);
      p.style.transitionDelay = (i * 45) + "ms";
    });
    /* Two frames so the start state is painted before the transition begins. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        svg.classList.add("is-drawn");
        drawn.forEach(function (p) { p.style.strokeDashoffset = "0"; });
      });
    });
  }

  root.AsliSeal = { draw: draw };
})(typeof window !== "undefined" ? window : globalThis);
