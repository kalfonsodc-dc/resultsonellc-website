// Results One LLC — shared site behavior (mobile nav, hero slider, testimonial carousel)
document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initHeroSlider();
  initTestimonialCarousel();
});

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Auto-advance with a visible pause/play control (WCAG 2.2.2 Pause, Stop, Hide).
 * Starts paused when the visitor has asked for reduced motion (WCAG 2.3.3).
 * Returns a `restart` hook so manual navigation can reset the timer without
 * resuming a slideshow the visitor deliberately paused.
 */
function createAutoplay(options) {
  var advance = options.advance;
  var button = options.button;
  var label = options.label;
  var interval = options.interval || 6000;

  var timer = null;
  var playing = false;

  function play() {
    clearInterval(timer);
    timer = setInterval(advance, interval);
    playing = true;
    button.textContent = 'Pause';
    button.setAttribute('aria-label', 'Pause the ' + label);
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    playing = false;
    button.textContent = 'Play';
    button.setAttribute('aria-label', 'Play the ' + label);
  }

  button.addEventListener('click', function () {
    if (playing) { pause(); } else { play(); }
  });

  if (prefersReducedMotion()) { pause(); } else { play(); }

  return {
    restart: function () { if (playing) play(); }
  };
}

function initMobileNav() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  if (!header || !toggle) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('.site-nav .has-children > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 900px)').matches) {
        e.preventDefault();
        link.parentElement.classList.toggle('is-expanded');
        var submenu = link.parentElement.querySelector(':scope > .site-nav__submenu');
        if (submenu) {
          submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        }
      }
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
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', function () {
      goTo(i);
      autoplay.restart();
    });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  var pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'hero__pause';
  hero.appendChild(pauseBtn);

  var autoplay = createAutoplay({
    advance: function () { goTo(current + 1); },
    button: pauseBtn,
    label: 'slideshow'
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

  function goTo(index) {
    items[current].classList.remove('is-active');
    current = (index + items.length) % items.length;
    items[current].classList.add('is-active');
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
    label: 'testimonial carousel'
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); autoplay.restart(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); autoplay.restart(); });
}
