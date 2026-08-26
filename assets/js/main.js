// Results One LLC — shared site behavior (mobile nav, hero slider, testimonial carousel)
document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initHeroSlider();
  initTestimonialCarousel();
});

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

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAutoplay(); });

  var timer;
  function resetAutoplay() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }
  resetAutoplay();
}

function initTestimonialCarousel() {
  var wrap = document.querySelector('.testimonial-carousel');
  if (!wrap) return;

  var items = Array.prototype.slice.call(wrap.querySelectorAll('.testimonial'));
  var prevBtn = wrap.querySelector('.testimonial-carousel__nav--prev');
  var nextBtn = wrap.querySelector('.testimonial-carousel__nav--next');
  if (items.length < 2) return;

  var current = 0;

  function goTo(index) {
    items[current].classList.remove('is-active');
    current = (index + items.length) % items.length;
    items[current].classList.add('is-active');
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAutoplay(); });

  var timer;
  function resetAutoplay() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }
  resetAutoplay();
}
