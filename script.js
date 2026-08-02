/* ── 대표 사진 배너 설정 ─────────────────────────────
   사진 교체는 이 배열만 수정하면 됩니다. (3~5장 권장)
   파일은 images/ 폴더에 넣으세요.                       */
const heroSlides = [
  { image: "images/toto-walk.webp",   alt: "초록빛 산책길에서 쉬고 있는 토토와 가족" },
  { image: "images/toto-home.webp",   alt: "집 바닥에 편안하게 누워 쉬는 토토" },
  { image: "images/toto-gahyun.webp", alt: "가현이 언니와 토토가 다정하게 함께 있는 그림" },
];

(function initHeroSlider() {
  const root = document.getElementById('heroSlider');
  const track = document.getElementById('heroSlides');
  const dotsBox = document.getElementById('heroDots');
  if (!root || !track || !heroSlides.length) return;

  const slides = heroSlides.slice(0, 5).map((s, i) => {
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

  const dots = slides.map((_, i) => {
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
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === cur));
    dots.forEach((d, k) => d.classList.toggle('active', k === cur));
  }
  function next() { go(cur + 1); }
  function hold() { holdUntil = Date.now() + 8000; } // 직접 조작 후 8초 대기

  document.getElementById('heroPrev').addEventListener('click', () => { go(cur - 1); hold(); });
  document.getElementById('heroNext').addEventListener('click', () => { next(); hold(); });

  let hovering = false;
  root.addEventListener('mouseenter', () => hovering = true);
  root.addEventListener('mouseleave', () => hovering = false);

  // 모바일 스와이프
  let sx = 0, sy = 0;
  root.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; hold(); }, { passive: true });
  root.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next() : go(cur - 1));
    hold();
  }, { passive: true });

  go(0);
  if (slides.length > 1 && !reduceMotion) {
    timer = setInterval(() => {
      if (!hovering && Date.now() > holdUntil && !document.hidden) next();
    }, 5000);
  }
})();

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
