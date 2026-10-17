document.getElementById('theme-toggle').addEventListener('click', function () {
  var root = document.documentElement;
  var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// ---------- Photos: category tabs + 3-up carousel ----------
(function () {
  var carousel = document.querySelector('.carousel');
  if (!carousel) return;
  var tabs = document.querySelectorAll('.photo-tab');
  var prev = carousel.querySelector('.prev');
  var next = carousel.querySelector('.next');
  var track = carousel.querySelector('.photo-track:not([hidden])');
  var page = 0;

  function perView() {
    return parseInt(getComputedStyle(carousel).getPropertyValue('--per'), 10) || 3;
  }

  function render() {
    var items = track.children;
    var per = perView();
    var pages = Math.max(1, Math.ceil(items.length / per));
    page = (page + pages) % pages;                                // wrap around
    var start = Math.min(page * per, Math.max(0, items.length - per)); // last page stays full
    var step = items[1] ? items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left : 0;
    track.style.transform = 'translateX(' + (-start * step) + 'px)';
    prev.disabled = next.disabled = pages < 2;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
      });
      carousel.querySelectorAll('.photo-track').forEach(function (t) {
        t.hidden = t.dataset.set !== tab.dataset.set;
      });
      track = carousel.querySelector('.photo-track[data-set="' + tab.dataset.set + '"]');
      page = 0;
      render();
    });
  });
  prev.addEventListener('click', function () { page--; render(); });
  next.addEventListener('click', function () { page++; render(); });
  window.addEventListener('resize', render);
  render();
})();

// ---------- Side navigation: enlarge the section currently in view ----------
(function () {
  var links = document.querySelectorAll('.toc a');
  if (!links.length) return;
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  // A clicked item stays highlighted until the user scrolls on their own
  // (sections near the page bottom can't scroll all the way to the top)
  var clicked = null;
  links.forEach(function (a, i) {
    a.addEventListener('click', function () { clicked = i; setActive(i); });
  });
  ['wheel', 'touchmove', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, function () { clicked = null; }, { passive: true });
  });

  function setActive(current) {
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }

  function update() {
    if (clicked !== null) return setActive(clicked);
    var current = 0;
    var line = 140; // just below the sticky navbar, where a clicked section lands
    sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= line) current = i;
    });
    // At the very bottom, the last section wins even if it is short
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections.length - 1;
    }
    setActive(current);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
