import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, FAMILY_BY_EMAIL } from "./config.js";
import { chapters, reactionQuestions, thenAndNow, childhoodMemories } from "./data/childhood-memories.js";

const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

/* 배경음악 파일이 생기면 여기에 경로를 넣으세요. 예: "audio/childhood-theme.mp3"
   비어있으면 음악 버튼이 자동으로 숨겨집니다. */
const MUSIC_SRC = "";

let currentUser = null;
async function loadAuth() {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user || null;
}

const byId = id => childhoodMemories.find(p => p.id === id);
const chapterOf = num => chapters.find(c => c.num === num);
// 챕터 순서대로 정렬된 스토리 전체 순서 (챕터별로는 이미 오름차순으로 배치되어 있음)
const storyOrder = chapters.slice().sort((a, b) => a.num - b.num)
  .flatMap(ch => childhoodMemories.filter(p => p.chapter === ch.num));

function questionFor(photoId) {
  let hash = 0;
  for (const ch of photoId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return reactionQuestions[hash % reactionQuestions.length];
}

/* ══════════════════════════════════════════════════════
   오늘의 추억 (localStorage 기반 순환)
   ══════════════════════════════════════════════════════ */
function getTodayMemory() {
  const todayStr = new Date().toISOString().slice(0, 10);
  let state;
  try { state = JSON.parse(localStorage.getItem('toto-today-memory') || 'null'); } catch { state = null; }
  if (state?.date === todayStr && byId(state.photoId)) return byId(state.photoId);

  let seen = [];
  try { seen = JSON.parse(localStorage.getItem('toto-seen-memories') || '[]'); } catch { seen = []; }
  let pool = childhoodMemories.filter(p => !seen.includes(p.id));
  if (!pool.length) { seen = []; pool = childhoodMemories.slice(); }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  seen.push(pick.id);
  localStorage.setItem('toto-seen-memories', JSON.stringify(seen));
  localStorage.setItem('toto-today-memory', JSON.stringify({ date: todayStr, photoId: pick.id }));
  return pick;
}

function renderTodayMemoryCard() {
  const card = $("#todayMemoryCard");
  if (!card) return;
  const photo = getTodayMemory();
  $("#todayMemoryImg").src = photo.thumbnail;
  $("#todayMemoryImg").alt = photo.title;
  $("#todayMemoryCaption").textContent = photo.caption;
  card.href = `memories.html?photo=${photo.id}`;
  card.hidden = false;
  card.addEventListener('click', e => {
    if (!$("#storyView")) return; // 다른 페이지(홈)에서는 memories.html로 그냥 이동
    e.preventDefault();
    openStory(storyOrder.findIndex(p => p.id === photo.id));
  });
}

/* ══════════════════════════════════════════════════════
   표지 버튼
   ══════════════════════════════════════════════════════ */
$("#startStoryButton")?.addEventListener('click', () => openStory(0));
$("#goGridButton")?.addEventListener('click', () => {
  $("#gridView")?.scrollIntoView({ behavior: 'smooth' });
});
$("#randomMemoryButton")?.addEventListener('click', () => {
  openStory(Math.floor(Math.random() * storyOrder.length));
});

/* ══════════════════════════════════════════════════════
   전체 보기(그리드)
   ══════════════════════════════════════════════════════ */
let gridFilter = 'all';
let gridList = childhoodMemories.slice();

function renderChapterFilters() {
  const box = $("#chapterFilters");
  if (!box) return;
  chapters.forEach(ch => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.dataset.chapter = ch.num;
    btn.textContent = ch.title;
    btn.addEventListener('click', () => setGridFilter(ch.num, btn));
    box.appendChild(btn);
  });
  box.querySelector('[data-chapter="all"]').addEventListener('click', e => setGridFilter('all', e.currentTarget));
}

function setGridFilter(filter, btnEl) {
  gridFilter = filter;
  $$('#chapterFilters button').forEach(b => b.classList.toggle('active', b === btnEl));
  renderGrid();
}

function renderGrid() {
  const grid = $("#memoryGrid"); if (!grid) return;
  gridList = gridFilter === 'all' ? childhoodMemories.slice() : childhoodMemories.filter(p => p.chapter === gridFilter);
  grid.innerHTML = '';
  gridList.forEach((p, i) => {
    const tile = document.createElement('div');
    tile.className = 'memory-tile';
    tile.innerHTML = `<img src="${p.thumbnail}" alt="${esc(p.caption)}" loading="${i === 0 ? 'eager' : 'lazy'}" ${i === 0 ? 'fetchpriority="high"' : ''}><span>${esc(p.sourceFolder || p.title)}</span>`;
    tile.addEventListener('click', () => openMemoryModal(i));
    grid.appendChild(tile);
  });
}

/* ── 그리드 확대 모달 ─────────────────────────────────── */
let modalIndex = 0;
function openMemoryModal(index) {
  modalIndex = index;
  renderMemoryModal();
  $("#memoryModal").hidden = false;
  document.body.classList.add('modal-open');
}
function closeMemoryModal() {
  $("#memoryModal").hidden = true;
  document.body.classList.remove('modal-open');
}
function renderMemoryModal() {
  const p = gridList[modalIndex]; if (!p) return;
  $("#memoryModalImage").src = p.image;
  $("#memoryModalImage").alt = p.caption;
  $("#memoryModalCaption").textContent = p.caption;
  $("#memoryModalDownload").href = p.image;
  $("#memoryModalDownload").setAttribute('download', p.id + '.webp');
  $("#memoryModalSource").textContent = p.sourceFolder ? `원본 폴더: ${p.sourceFolder}` : '';
}
$("#memoryModalPrev")?.addEventListener('click', () => { modalIndex = (modalIndex - 1 + gridList.length) % gridList.length; renderMemoryModal(); });
$("#memoryModalNext")?.addEventListener('click', () => { modalIndex = (modalIndex + 1) % gridList.length; renderMemoryModal(); });
$("#memoryModalClose")?.addEventListener('click', closeMemoryModal);
$("#memoryModal")?.addEventListener('click', e => { if (e.target.id === 'memoryModal') closeMemoryModal(); });
document.addEventListener('keydown', e => {
  if ($("#memoryModal") && !$("#memoryModal").hidden) {
    if (e.key === 'Escape') closeMemoryModal();
    if (e.key === 'ArrowLeft') $("#memoryModalPrev")?.click();
    if (e.key === 'ArrowRight') $("#memoryModalNext")?.click();
  }
});

/* ══════════════════════════════════════════════════════
   스토리 뷰
   ══════════════════════════════════════════════════════ */
let storyIndex = 0, autoplayTimer = null, autoplayOn = true, storyHolding = false;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function currentChapterPhotos(chNum) { return storyOrder.filter(p => p.chapter === chNum); }

function openStory(index) {
  const view = $("#storyView"); if (!view) return;
  storyIndex = Math.max(0, Math.min(index, storyOrder.length - 1));
  view.hidden = false;
  document.body.classList.add('modal-open');
  autoplayOn = !reduceMotion;
  $("#storyAutoplayToggle").textContent = autoplayOn ? '⏸' : '▶';
  renderStory();
  restartAutoplay();
}
function closeStory() {
  const view = $("#storyView"); if (!view) return;
  view.hidden = true;
  document.body.classList.remove('modal-open');
  stopAutoplay();
}
$("#storyCloseButton")?.addEventListener('click', closeStory);

function renderStory() {
  const p = storyOrder[storyIndex]; if (!p) return;
  const ch = chapterOf(p.chapter);
  const chPhotos = currentChapterPhotos(p.chapter);
  const posInChapter = chPhotos.findIndex(x => x.id === p.id);

  $("#storyImage").src = p.image;
  $("#storyImage").alt = p.caption;
  $("#storyStageBg").style.backgroundImage = `url('${p.image}')`;
  $("#storyCaption").textContent = p.caption;
  $("#storyChapterLabel").textContent = `${ch.title} · ${posInChapter + 1}/${chPhotos.length}`;
  $("#storyQuestion").textContent = questionFor(p.id);
  $("#storyNextChapter").classList.remove('show');

  renderStoryProgress(chPhotos.length, posInChapter);
  renderStoryReactions(p.id);
  renderStoryComments(p.id);
  $("#storyComments").classList.remove('open');
}

function renderStoryProgress(total, pos) {
  const box = $("#storyProgress"); box.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const seg = document.createElement('span');
    if (i < pos) seg.classList.add('done');
    const bar = document.createElement('i');
    if (i === pos) bar.style.width = '100%';
    seg.appendChild(bar);
    box.appendChild(seg);
  }
}

function storyNext() {
  const p = storyOrder[storyIndex];
  const chPhotos = currentChapterPhotos(p.chapter);
  const posInChapter = chPhotos.findIndex(x => x.id === p.id);
  const isLastOfChapter = posInChapter === chPhotos.length - 1;

  if (isLastOfChapter) {
    stopAutoplay();
    const nextChapter = chapters.find(c => c.num === p.chapter + 1);
    const box = $("#storyNextChapter");
    if (nextChapter) {
      box.querySelector('h3').textContent = `다음 챕터 — ${nextChapter.title}`;
      $("#storyNextChapterButton").textContent = '다음 챕터 보기';
      box.classList.add('show');
      box.dataset.action = 'next-chapter';
    } else {
      box.querySelector('h3').textContent = '여기까지가 오늘의 추억입니다';
      $("#storyNextChapterButton").textContent = '표지로 돌아가기';
      box.classList.add('show');
      box.dataset.action = 'finish';
    }
    return;
  }
  storyIndex++;
  renderStory();
  restartAutoplay();
}
function storyPrev() {
  storyIndex = Math.max(0, storyIndex - 1);
  renderStory();
  restartAutoplay();
}
$("#storyNextChapterButton")?.addEventListener('click', () => {
  const box = $("#storyNextChapter");
  if (box.dataset.action === 'finish') { closeStory(); return; }
  storyIndex++;
  box.classList.remove('show');
  renderStory();
  restartAutoplay();
});

$("#storyTapPrev")?.addEventListener('click', storyPrev);
$("#storyTapNext")?.addEventListener('click', storyNext);

document.addEventListener('keydown', e => {
  if (!$("#storyView") || $("#storyView").hidden) return;
  if (e.key === 'Escape') closeStory();
  if (e.key === 'ArrowLeft') storyPrev();
  if (e.key === 'ArrowRight') storyNext();
});

// 길게 누르면 일시정지, 스와이프로 이동
let touchStartX = 0, touchStartY = 0, longPressTimer = null;
$("#storyStage")?.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
  longPressTimer = setTimeout(() => { storyHolding = true; stopAutoplay(); }, 450);
}, { passive: true });
$("#storyStage")?.addEventListener('touchend', e => {
  clearTimeout(longPressTimer);
  if (storyHolding) { storyHolding = false; restartAutoplay(); return; }
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? storyNext() : storyPrev());
}, { passive: true });

function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
function restartAutoplay() {
  stopAutoplay();
  if (!autoplayOn || reduceMotion) return;
  autoplayTimer = setInterval(() => {
    if (!$("#storyComments").classList.contains('open')) storyNext();
  }, 5000);
}
$("#storyAutoplayToggle")?.addEventListener('click', () => {
  autoplayOn = !autoplayOn;
  $("#storyAutoplayToggle").textContent = autoplayOn ? '⏸' : '▶';
  if (autoplayOn) restartAutoplay(); else stopAutoplay();
});

/* ══════════════════════════════════════════════════════
   반응 · 댓글 (Supabase, 로그인 필요)
   ══════════════════════════════════════════════════════ */
const EMOJIS = ['😂', '❤️', '😮'];

async function renderStoryReactions(photoId) {
  const box = $("#storyReactions"); if (!box || !supabase) return;
  const { data: rows } = await supabase.from('memory_reactions').select('emoji,user_id').eq('photo_id', photoId);
  const counts = {}; EMOJIS.forEach(e => counts[e] = 0);
  const mine = new Set();
  (rows || []).forEach(r => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    if (currentUser && r.user_id === currentUser.id) mine.add(r.emoji);
  });
  $$('#storyReactions button[data-emoji]').forEach(btn => {
    const e = btn.dataset.emoji;
    btn.querySelector('[data-count]').textContent = counts[e] || 0;
    btn.classList.toggle('active', mine.has(e));
  });
}

$$('#storyReactions button[data-emoji]').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!supabase) return;
    if (!currentUser) { alert('로그인한 가족만 반응을 남길 수 있어요. 가족 게시판에서 먼저 로그인해 주세요.'); return; }
    const p = storyOrder[storyIndex]; if (!p) return;
    const emoji = btn.dataset.emoji;
    const { data: existing } = await supabase.from('memory_reactions').select('id')
      .eq('photo_id', p.id).eq('user_id', currentUser.id).eq('emoji', emoji).maybeSingle();
    if (existing) await supabase.from('memory_reactions').delete().eq('id', existing.id);
    else await supabase.from('memory_reactions').insert({ photo_id: p.id, user_id: currentUser.id, emoji });
    renderStoryReactions(p.id);
  });
});

$("#storyCommentToggle")?.addEventListener('click', () => {
  const box = $("#storyComments");
  box.classList.toggle('open');
  if (box.classList.contains('open')) stopAutoplay(); else restartAutoplay();
});

async function renderStoryComments(photoId) {
  const list = $("#storyCommentList"); if (!list || !supabase) return;
  const { data: rows } = await supabase.from('memory_comments').select('*').eq('photo_id', photoId).order('created_at', { ascending: true });
  list.innerHTML = (rows || []).map(r => `<div class="story-comment-item"><b>${esc(r.author_name)}</b> · ${esc(r.body)}</div>`).join('')
    || '<p style="opacity:.6; font-size:12px; margin:0;">아직 남긴 추억이 없어요.</p>';
}

$("#storyCommentForm")?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!supabase) return;
  if (!currentUser) { alert('로그인한 가족만 댓글을 남길 수 있어요. 가족 게시판에서 먼저 로그인해 주세요.'); return; }
  const input = $("#storyCommentInput");
  const body = input.value.trim(); if (!body) return;
  const p = storyOrder[storyIndex]; if (!p) return;
  const author_name = FAMILY_BY_EMAIL[currentUser.email] || '가족';
  const { error } = await supabase.from('memory_comments').insert({ photo_id: p.id, user_id: currentUser.id, author_name, body });
  if (error) { alert('댓글을 남기지 못했습니다.'); return; }
  input.value = '';
  renderStoryComments(p.id);
});

/* ══════════════════════════════════════════════════════
   누군지 맞혀보세요
   가족이 데이터 파일의 people 배열에 이름을 하나씩 채우면
   그 사진이 자동으로 이 게임에 등장합니다.
   ══════════════════════════════════════════════════════ */
const NAMES = ['가현', '지용', '영현'];
let guessLastId = null;

function renderGuessGame() {
  const box = $("#guessGameArea"); if (!box) return;
  const pool = childhoodMemories.filter(p => p.people?.length === 1 && NAMES.includes(p.people[0]));
  if (!pool.length) {
    box.innerHTML = '<p class="guess-empty">아직 정답이 확인된 사진이 없습니다.<br>데이터 파일(data/childhood-memories.js)에서 얼굴이 잘 보이는 사진의 <code>people</code> 배열에 이름을 하나씩 채워보세요. 예: <code>people: ["가현"]</code></p>';
    return;
  }
  let candidates = pool.filter(p => p.id !== guessLastId);
  if (!candidates.length) candidates = pool;
  const p = candidates[Math.floor(Math.random() * candidates.length)];
  guessLastId = p.id;
  const options = [...NAMES].sort(() => Math.random() - 0.5);
  box.innerHTML = `
    <div class="guess-card">
      <img src="${p.image}" alt="누군지 맞혀보세요">
      <div class="guess-options">${options.map(n => `<button type="button" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <p class="guess-result" id="guessResult"></p>
      <button class="text-button" id="guessNextButton" type="button" style="margin-top:8px;">다음 문제</button>
    </div>`;
  box.querySelectorAll('.guess-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.name === p.people[0];
      box.querySelectorAll('.guess-options button').forEach(b => { b.disabled = true; if (b.dataset.name === p.people[0]) b.classList.add('correct'); });
      $("#guessResult").textContent = correct ? `정답! ${p.people[0]}였어요. ${p.caption}` : `아쉽지만 정답은 ${p.people[0]}였어요.`;
    });
  });
  box.querySelector('#guessNextButton').addEventListener('click', renderGuessGame);
}

/* ══════════════════════════════════════════════════════
   그때와 지금
   ══════════════════════════════════════════════════════ */
function renderThenAndNow() {
  const section = $("#thenNowSection"); if (!section) return;
  if (!thenAndNow.length) { section.hidden = true; return; }
  section.hidden = false;
  const grid = $("#thenNowGrid");
  grid.innerHTML = thenAndNow.map((c, i) => `
    <div class="thennow-card">
      <div class="thennow-slider">
        <img class="now-img" src="${c.recentImage}" alt="최근 모습">
        <img class="then-img" id="thenImg${i}" src="${c.childhoodImage}" alt="어린 시절">
        <div class="thennow-handle" id="thenHandle${i}"></div>
        <input type="range" min="0" max="100" value="50" id="thenRange${i}" aria-label="비교 슬라이더">
      </div>
      <p style="padding:12px 16px; margin:0; font-size:13px; color:var(--muted);">${esc(c.label || '')}</p>
    </div>`).join('');
  thenAndNow.forEach((c, i) => {
    const range = $(`#thenRange${i}`);
    range?.addEventListener('input', () => {
      const v = range.value;
      $(`#thenImg${i}`).style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      $(`#thenHandle${i}`).style.left = v + '%';
    });
  });
}

/* ══════════════════════════════════════════════════════
   배경음악
   ══════════════════════════════════════════════════════ */
function setupMusic() {
  const btn = $("#musicToggle"), audio = $("#bgMusic");
  if (!btn || !audio || !MUSIC_SRC) return;
  audio.src = MUSIC_SRC; audio.volume = 0.5;
  btn.hidden = false;
  let playing = false;
  btn.addEventListener('click', () => {
    playing = !playing;
    if (playing) { audio.play().catch(() => {}); btn.textContent = '🔊'; }
    else { audio.pause(); btn.textContent = '🔈'; }
  });
}

/* ══════════════════════════════════════════════════════
   초기화
   ══════════════════════════════════════════════════════ */
async function boot() {
  await loadAuth();
  renderChapterFilters();
  renderGrid();
  renderTodayMemoryCard();
  renderGuessGame();
  renderThenAndNow();
  setupMusic();

  const photoParam = new URLSearchParams(location.search).get('photo');
  if (photoParam && $("#storyView")) {
    const idx = storyOrder.findIndex(p => p.id === photoParam);
    if (idx >= 0) openStory(idx);
  }
}

if (supabase) {
  supabase.auth.onAuthStateChange(async () => {
    await loadAuth();
    const p = storyOrder[storyIndex];
    if (p && $("#storyView") && !$("#storyView").hidden) { renderStoryReactions(p.id); renderStoryComments(p.id); }
  });
}

boot();
