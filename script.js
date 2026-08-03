/* ── 대표 사진 배너 설정 ─────────────────────────────
   사진 교체는 이 배열만 수정하면 됩니다. (3~5장 권장)
   파일은 images/ 폴더에 넣으세요. 가족 앨범에서 사진을
   "대표 사진(홈 배너)"으로 지정하면 이 기본값 대신
   그 사진들이 자동으로 사용됩니다.                       */
const heroSlides = [
  { image: "images/toto-walk.webp",   alt: "초록빛 산책길에서 쉬고 있는 토토와 가족" },
  { image: "images/toto-home.webp",   alt: "집 바닥에 편안하게 누워 쉬는 토토" },
  { image: "images/toto-gahyun.webp", alt: "가현이 언니와 토토가 다정하게 함께 있는 그림" },
];

function initHeroSlider(slides) {
  const root = document.getElementById('heroSlider');
  const track = document.getElementById('heroSlides');
  const dotsBox = document.getElementById('heroDots');
  if (!root || !track || !slides.length) return null;

  track.innerHTML = ''; dotsBox.innerHTML = '';
  if (root._totoHeroCleanup) root._totoHeroCleanup();

  const slideEls = slides.slice(0, 5).map((s, i) => {
    const img = document.createElement('img');
    img.src = s.image;
    img.alt = s.alt || `가족 대표 사진 ${i + 1}`;
    img.className = 'hero-slide';
    img.loading = i === 0 ? 'eager' : 'lazy';
    if (i === 0) img.fetchPriority = 'high';
    img.addEventListener('error', () => img.classList.add('slide-fallback'));
    track.appendChild(img);
    return img;
  });

  const dots = slideEls.map((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'hero-dot';
    d.setAttribute('aria-label', `${i + 1}번 사진 보기`);
    d.addEventListener('click', () => { go(i); hold(); });
    dotsBox.appendChild(d);
    return d;
  });

  let cur = 0, timer = null, holdUntil = 0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(i) {
    cur = (i + slideEls.length) % slideEls.length;
    slideEls.forEach((s, k) => s.classList.toggle('active', k === cur));
    dots.forEach((d, k) => d.classList.toggle('active', k === cur));
  }
  function next() { go(cur + 1); }
  function hold() { holdUntil = Date.now() + 8000; } // 직접 조작 후 8초 대기

  const prevBtn = document.getElementById('heroPrev'), nextBtn = document.getElementById('heroNext');
  const onPrev = () => { go(cur - 1); hold(); };
  const onNext = () => { next(); hold(); };
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  let hovering = false;
  const onEnter = () => hovering = true, onLeave = () => hovering = false;
  root.addEventListener('mouseenter', onEnter);
  root.addEventListener('mouseleave', onLeave);

  let sx = 0, sy = 0;
  const onTouchStart = e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; hold(); };
  const onTouchEnd = e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next() : go(cur - 1));
    hold();
  };
  root.addEventListener('touchstart', onTouchStart, { passive: true });
  root.addEventListener('touchend', onTouchEnd, { passive: true });

  go(0);
  if (slideEls.length > 1 && !reduceMotion) {
    timer = setInterval(() => {
      if (!hovering && Date.now() > holdUntil && !document.hidden) next();
    }, 5000);
  }

  root._totoHeroCleanup = () => {
    if (timer) clearInterval(timer);
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    root.removeEventListener('mouseenter', onEnter);
    root.removeEventListener('mouseleave', onLeave);
    root.removeEventListener('touchstart', onTouchStart);
    root.removeEventListener('touchend', onTouchEnd);
  };
}

initHeroSlider(heroSlides);
window.TotoHero = { setSlides: initHeroSlider };

const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('toto-theme');
if (saved) root.dataset.theme = saved;

toggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('toto-theme', next);
});

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
