// Results One LLC — shared site behavior (mobile nav, hero slider, testimonial carousel)
document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initHeroSlider();
  initTestimonialCarousel();
});

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Auto-advance with a visible pause/play control (WCAG 2.2.2 Pause, Stop, Hide).
 * Starts paused when the visitor has asked for reduced motion (WCAG 2.3.3).
 *
 * `userPaused` is tracked separately from `playing` so that hovering or tabbing
 * through the carousel can suspend motion temporarily without ever resuming a
 * carousel the visitor deliberately stopped.
 */
function createAutoplay(options) {
  var advance = options.advance;
  var button = options.button;
  var label = options.label;
  var container = options.container;
  var interval = options.interval || 6000;

  var timer = null;
  var playing = false;
  var userPaused = prefersReducedMotion();

  function start() {
    clearInterval(timer);
    timer = setInterval(advance, interval);
    playing = true;
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    playing = false;
  }

  function render() {
    button.textContent = userPaused ? 'Play' : 'Pause';
    button.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    button.setAttribute('aria-label', (userPaused ? 'Play the ' : 'Pause the ') + label);
  }

  button.addEventListener('click', function () {
    userPaused = !userPaused;
    if (userPaused) { stop(); } else { start(); }
    render();
  });

  // Suspend while the visitor is reading or tabbing through, then resume —
  // but never override an explicit pause.
  if (container) {
    container.addEventListener('mouseenter', function () { if (!userPaused) stop(); });
    container.addEventListener('mouseleave', function () { if (!userPaused) start(); });
    container.addEventListener('focusin', function () { if (!userPaused) stop(); });
    container.addEventListener('focusout', function (e) {
      if (!userPaused && !container.contains(e.relatedTarget)) start();
    });
  }

  render();
  if (!userPaused) start();

  return {
    restart: function () { if (!userPaused) start(); }
  };
}

function initNav() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (nav && !nav.id) nav.id = 'primary-nav';

  if (header && toggle) {
    toggle.setAttribute('aria-label', 'Menu');
    if (nav) toggle.setAttribute('aria-controls', nav.id);
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Each parent keeps its link to a real page; a separate disclosure button
  // opens the submenu. This is what makes About Us, Leadership for
  // Organizational Success, and Workforce Development Training reachable on
  // mobile, where the old code called preventDefault on the parent link.
  var parents = document.querySelectorAll('.site-nav .has-children');
  parents.forEach(function (li, i) {
    var link = li.querySelector(':scope > a');
    var submenu = li.querySelector(':scope > .site-nav__submenu');
    if (!link || !submenu) return;

    if (!submenu.id) submenu.id = 'submenu-' + (i + 1);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'submenu-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', submenu.id);
    btn.innerHTML = '<span class="visually-hidden">' + link.textContent.trim() + ' submenu</span>';
    link.insertAdjacentElement('afterend', btn);

    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        submenu.setAttribute('data-open', 'true');
      } else {
        submenu.removeAttribute('data-open');
        // also close any nested submenus
        li.querySelectorAll('.site-nav__submenu[data-open]').forEach(function (s) {
          s.removeAttribute('data-open');
        });
        li.querySelectorAll('.submenu-toggle[aria-expanded="true"]').forEach(function (b) {
          if (b !== btn) b.setAttribute('aria-expanded', 'false');
        });
      }
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });

    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) setOpen(false);
    });
  });
}

function initHeroSlider() {
  var hero = document.querySelector('.hero');
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
  var dotsWrap = hero.querySelector('.hero__dots');
  var prevBtn = hero.querySelector('.hero__nav--prev');
  var nextBtn = hero.querySelector('.hero__nav--next');
  if (slides.length < 2) return;

  var current = 0;
  var dots = [];

  slides.forEach(function (slide, i) {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
    // A11Y-2: inactive slides must leave the accessibility tree and tab order.
    if (i !== 0) slide.setAttribute('aria-hidden', 'true');

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    if (i === 0) {
      dot.classList.add('is-active');
      dot.setAttribute('aria-current', 'true');
    }
    dot.addEventListener('click', function () {
      goTo(i);
      autoplay.restart();
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].removeAttribute('aria-current');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('is-active');
    slides[current].removeAttribute('aria-hidden');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-current', 'true');
  }

  var pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'hero__pause';
  hero.appendChild(pauseBtn);

  var autoplay = createAutoplay({
    advance: function () { goTo(current + 1); },
    button: pauseBtn,
    label: 'slideshow',
    container: hero
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); autoplay.restart(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); autoplay.restart(); });
}

function initTestimonialCarousel() {
  var wrap = document.querySelector('.testimonial-carousel');
  if (!wrap) return;

  var items = Array.prototype.slice.call(wrap.querySelectorAll('.testimonial'));
  var navWrap = wrap.querySelector('.testimonial-carousel__nav');
  var prevBtn = wrap.querySelector('.testimonial-carousel__nav--prev');
  var nextBtn = wrap.querySelector('.testimonial-carousel__nav--next');
  if (items.length < 2) return;

  var current = 0;

  items.forEach(function (item, i) {
    if (i !== 0) item.setAttribute('aria-hidden', 'true');
  });

  function goTo(index) {
    items[current].classList.remove('is-active');
    items[current].setAttribute('aria-hidden', 'true');
    current = (index + items.length) % items.length;
    items[current].classList.add('is-active');
    items[current].removeAttribute('aria-hidden');
  }

  var pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'testimonial-carousel__pause';
  if (navWrap) {
    navWrap.appendChild(pauseBtn);
  } else {
    wrap.appendChild(pauseBtn);
  }

  var autoplay = createAutoplay({
    advance: function () { goTo(current + 1); },
    button: pauseBtn,
    label: 'testimonial carousel',
    container: wrap
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); autoplay.restart(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); autoplay.restart(); });
}
