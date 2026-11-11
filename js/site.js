// Small enhancements: section tabs, scrolling tab rows on phones, photo lightbox.
// The site still reads fine without any of this.
(function () {
  "use strict";

  var phone = window.matchMedia("(max-width: 900px)");

  // On phones the tabs sit in scrolling rows: bring the active one to the middle.
  var centerInRow = function (row, el) {
    if (!phone.matches || !row || !el) return;
    var offset = el.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    row.scrollLeft = offset - (row.clientWidth - el.offsetWidth) / 2;
  };

  var current = document.querySelector('.tabs-left [aria-current="page"]');
  if (current) centerInRow(current.parentElement, current);

  // ----- section tabs (right-hand tabs) -----
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var page = document.querySelector(".page");

    var select = function (tab, moveFocus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      centerInRow(tablist, tab);
      if (moveFocus) tab.focus();
    };

    var toPageTop = function () {
      if (!page) return;
      var top = page.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.scrollY + top - 16 });
    };

    var setHash = function (tab) {
      try {
        history.replaceState(null, "", "#" + tab.id.replace("tab-", ""));
      } catch (e) { /* embedded or sandboxed page: the tab still switches */ }
    };

    var fromHash = function () {
      var name = window.location.hash.replace("#", "");
      var match = tabs.filter(function (t) { return t.id === "tab-" + name; })[0];
      select(match || tabs[0], false);
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab, false);
        setHash(tab);
        toPageTop();
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
          setHash(next);
        }
      });
    });

    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  // ----- lightbox -----
  var box = document.querySelector(".lightbox");
  if (box && typeof box.showModal === "function") {
    var boxImg = box.querySelector("img");
    var boxCap = box.querySelector("figcaption");

    document.querySelectorAll(".snap-open").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        var cap = btn.closest(".snap").querySelector("figcaption");
        boxImg.src = img.currentSrc || img.src;
        boxImg.alt = img.alt;
        boxCap.textContent = cap ? cap.textContent : "";
        box.showModal();
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  }
})();
