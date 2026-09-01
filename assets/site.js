/* Progressive enhancement only: theme toggle and local search.
   No network calls except fetching the local search index. Nothing is logged
   or transmitted anywhere. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var root = document.documentElement;
  var KEY = "atomicals-arc20-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function effective() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function apply(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var eff = effective();
      btn.textContent = eff === "dark" ? "Light" : "Dark";
      btn.setAttribute("aria-label", "Switch to " + (eff === "dark" ? "light" : "dark") + " theme");
    }
  }
  apply(stored());

  document.addEventListener("DOMContentLoaded", function () {
    apply(stored());
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = effective() === "dark" ? "light" : "dark";
        try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
        apply(next);
      });
    }
    initSearch();
  });

  function initSearch() {
    var input = document.getElementById("search-input");
    var list = document.getElementById("search-results");
    if (!input || !list) { return; }
    var index = null;
    var loading = false;

    function load(cb) {
      if (index) { cb(); return; }
      if (loading) { return; }
      loading = true;
      fetch("search-index.json").then(function (r) { return r.json(); }).then(function (data) {
        index = data.entries || [];
        cb();
      }).catch(function () {
        loading = false;
        list.innerHTML = '<li class="sr-empty">Search index could not be loaded. Use the page navigation instead.</li>';
      });
    }

    function score(entry, terms) {
      var aliases = entry.aliases || [];
      var hay = (entry.heading + " " + entry.text + " " + aliases.join(" ")).toLowerCase();
      var s = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (!t) { continue; }
        if (hay.indexOf(t) === -1) { return 0; }
        if (entry.heading.toLowerCase().indexOf(t) !== -1) { s += 5; }
        for (var j = 0; j < aliases.length; j++) {
          if (aliases[j].toLowerCase().indexOf(t) !== -1) { s += 4; break; }
        }
        s += 1;
      }
      return s;
    }

    function render(q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { list.innerHTML = ""; return; }
      var hits = [];
      for (var i = 0; i < index.length; i++) {
        var s = score(index[i], terms);
        if (s > 0) { hits.push([s, index[i]]); }
      }
      hits.sort(function (a, b) { return b[0] - a[0]; });
      hits = hits.slice(0, 12);
      list.innerHTML = "";
      if (!hits.length) {
        var li = document.createElement("li");
        li.className = "sr-empty";
        li.textContent = 'No matches for "' + q + '". Try a protocol term such as envelope, bitwork, coloring, burn, realm, dmint, or a ticker.';
        list.appendChild(li);
        return;
      }
      hits.forEach(function (h) {
        var e = h[1];
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = e.page + (e.anchor ? "#" + e.anchor : "");
        var page = document.createElement("span");
        page.className = "sr-page";
        page.textContent = e.pageTitle;
        var head = document.createElement("span");
        head.className = "sr-head";
        head.textContent = e.heading;
        var snip = document.createElement("span");
        snip.className = "sr-snip";
        snip.textContent = e.text.length > 140 ? e.text.slice(0, 140) + "…" : e.text;
        a.appendChild(page); a.appendChild(document.createElement("br"));
        a.appendChild(head); a.appendChild(document.createElement("br"));
        a.appendChild(snip);
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    input.addEventListener("input", function () {
      var q = input.value;
      load(function () { render(q); });
    });
    input.addEventListener("focus", function () {
      if (input.value) { load(function () { render(input.value); }); }
    });
    document.addEventListener("keydown", function (ev) {
      var tag = document.activeElement ? document.activeElement.tagName : "";
      if (ev.key === "/" && document.activeElement !== input && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
        ev.preventDefault();
        input.focus();
      }
      if (ev.key === "Escape" && list.innerHTML !== "") {
        list.innerHTML = "";
        input.blur();
      }
    });
    document.addEventListener("click", function (ev) {
      if (input.parentElement && !input.parentElement.contains(ev.target)) { list.innerHTML = ""; }
    });
  }
})();
