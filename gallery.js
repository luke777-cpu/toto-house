import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const BUCKET = "family-albums";
const PAGE_SIZE = 24;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const dateText = v => v ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(v)) : '';
const dateShort = v => v ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(v)) : '';
const publicUrl = path => path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : '';

let currentUser = null;
let isAdmin = false;

async function loadAuth() {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user || null;
  isAdmin = false;
  if (currentUser) {
    const { data } = await supabase.from('app_admins').select('user_id').eq('user_id', currentUser.id).maybeSingle();
    isAdmin = !!data;
  }
}

/* ── 로그인 게이트 (앨범 페이지 전용, 간단 버전) ───────── */
async function setupAuthGate() {
  const gate = $("#galleryAuthGate");
  const appRoot = $("#galleryApp");
  if (!gate || !appRoot) return true; // 이 페이지엔 게이트가 없음(홈페이지 미리보기 등)

  if (currentUser) {
    gate.hidden = true; appRoot.hidden = false;
    $("#galleryAccountEmail") && ($("#galleryAccountEmail").textContent = currentUser.email);
    return true;
  }
  gate.hidden = false; appRoot.hidden = true;
  return false;
}

$("#galleryGoogleLogin")?.addEventListener('click', async () => {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } });
});

$("#galleryLoginForm")?.addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const status = $("#galleryAuthStatus");
  status.textContent = '로그인 중…';
  const { error } = await supabase.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') });
  if (error) { status.textContent = '이메일 또는 비밀번호를 확인해 주세요.'; return; }
  status.textContent = '';
  await boot();
});

$("#galleryLogoutButton")?.addEventListener('click', async () => {
  await supabase?.auth.signOut();
  location.href = 'gallery.html';
});

/* ══════════════════════════════════════════════════════
   앨범 목록
   ══════════════════════════════════════════════════════ */
async function loadAlbumList() {
  const grid = $("#albumGrid");
  if (!grid) return;
  grid.innerHTML = '<div class="empty-feed"><p>앨범을 불러오는 중입니다…</p></div>';
  const { data: albums, error } = await supabase
    .from('albums')
    .select('id,title,description,cover_photo_url,event_date,event_date_end,updated_at,created_by,album_photos(count)')
    .order('updated_at', { ascending: false });
  if (error) { grid.innerHTML = '<div class="empty-feed"><p>앨범을 불러오지 못했습니다.</p></div>'; return; }
  if (!albums?.length) {
    grid.innerHTML = '<div class="empty-feed"><strong>아직 앨범이 없습니다.</strong><p>가족의 첫 앨범을 만들어 보세요.</p></div>';
    return;
  }
  grid.innerHTML = '';
  albums.forEach(a => grid.appendChild(renderAlbumCard(a)));
}

function renderAlbumCard(a) {
  const count = a.album_photos?.[0]?.count ?? 0;
  const card = document.createElement('a');
  card.className = 'album-card';
  card.href = `gallery.html?album=${a.id}`;
  const dateLabel = a.event_date_end && a.event_date_end !== a.event_date
    ? `${dateShort(a.event_date)} – ${dateShort(a.event_date_end)}`
    : dateShort(a.event_date);
  card.innerHTML = `
    <div class="album-cover">${a.cover_photo_url ? `<img src="${a.cover_photo_url}" alt="${esc(a.title)}" loading="lazy">` : '<div class="album-cover-empty">📷</div>'}</div>
    <div class="album-card-body">
      <h3>${esc(a.title)}</h3>
      <p class="album-card-meta">${count}장${dateLabel ? ' · ' + dateLabel : ''}</p>
      <p class="album-card-updated">업데이트 ${dateShort(a.updated_at)}</p>
    </div>`;
  return card;
}

/* ── 앨범 만들기/수정 모달 ────────────────────────────── */
let editingAlbumId = null;
function openAlbumModal(editAlbum = null) {
  const modal = $("#albumModal"); if (!modal) return;
  editingAlbumId = editAlbum?.id || null;
  $("#albumForm")?.reset();
  $("#albumCoverPreview").hidden = true;
  $("#albumModalTitle").textContent = editAlbum ? '앨범 정보 수정' : '새 앨범 만들기';
  $("#albumSubmitButton").textContent = editAlbum ? '저장하기' : '앨범 만들기';
  $("#albumCoverField").hidden = !!editAlbum;
  if (editAlbum) {
    $("#albumForm input[name=title]").value = editAlbum.title || '';
    $("#albumForm textarea[name=description]").value = editAlbum.description || '';
    $("#albumForm input[name=event_date]").value = editAlbum.event_date || '';
    $("#albumForm input[name=event_date_end]").value = editAlbum.event_date_end || '';
  }
  modal.hidden = false; document.body.classList.add('modal-open');
  $("#albumForm input[name=title]")?.focus();
}
function closeAlbumModal() {
  const modal = $("#albumModal"); if (!modal) return;
  modal.hidden = true; document.body.classList.remove('modal-open');
}
$("#openAlbumModal")?.addEventListener('click', () => openAlbumModal());
$("#editAlbumButton")?.addEventListener('click', () => openAlbumModal(currentAlbum));
$("#closeAlbumModal")?.addEventListener('click', closeAlbumModal);
$("#albumModal")?.addEventListener('click', e => { if (e.target.id === 'albumModal') closeAlbumModal(); });

$("#albumCoverInput")?.addEventListener('change', e => {
  const f = e.target.files?.[0]; const p = $("#albumCoverPreview");
  if (!f) { p.hidden = true; return; }
  p.src = URL.createObjectURL(f); p.hidden = false;
});

$("#albumForm")?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return;
  const form = e.currentTarget;
  const f = new FormData(form);
  const btn = form.querySelector('button[type=submit]');
  const payload = {
    title: f.get('title'),
    description: f.get('description') || null,
    event_date: f.get('event_date') || null,
    event_date_end: f.get('event_date_end') || null,
  };
  btn.disabled = true;
  try {
    if (editingAlbumId) {
      btn.textContent = '저장 중입니다…';
      const { error } = await supabase.from('albums').update(payload).eq('id', editingAlbumId);
      if (error) throw error;
      closeAlbumModal();
      Object.assign(currentAlbum, payload);
      renderAlbumHeader(currentAlbum);
    } else {
      btn.textContent = '만드는 중입니다…';
      const { data: album, error } = await supabase.from('albums').insert({ ...payload, created_by: currentUser.id }).select().single();
      if (error) throw error;
      const coverFile = f.get('cover');
      if (coverFile?.size) {
        const { blob } = await processImage(coverFile, { maxEdge: 1600, quality: 0.85 });
        const path = `${currentUser.id}/${album.id}/cover_${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp' });
        if (!upErr) await supabase.from('albums').update({ cover_photo_url: publicUrl(path) }).eq('id', album.id);
      }
      closeAlbumModal();
      location.href = `gallery.html?album=${album.id}`;
    }
  } catch (err) {
    console.error(err);
    alert('저장하지 못했습니다: ' + (err.message || ''));
  } finally {
    btn.disabled = false; btn.textContent = editingAlbumId ? '저장하기' : '앨범 만들기';
  }
});

/* ══════════════════════════════════════════════════════
   이미지 처리 (리사이즈 · 압축 · HEIC 변환)
   ══════════════════════════════════════════════════════ */
async function processImage(file, { maxEdge = 2200, quality = 0.85, mime = 'image/webp' } = {}) {
  let bitmap = null;
  try { bitmap = await createImageBitmap(file); } catch (e) { bitmap = null; }
  if (!bitmap && /heic|heif/i.test(file.type + file.name)) {
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm');
      const heic2any = mod.default;
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      bitmap = await createImageBitmap(jpegBlob);
    } catch (e2) {
      console.warn('HEIC 변환에 실패해 원본을 그대로 사용합니다.', e2);
      bitmap = null;
    }
  }
  if (!bitmap) return { blob: file, resized: false };
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale)), h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise(r => canvas.toBlob(r, mime, quality));
  return { blob: blob || file, resized: !!blob };
}

/* ══════════════════════════════════════════════════════
   앨범 상세 · 사진 그리드 (무한 스크롤)
   ══════════════════════════════════════════════════════ */
let currentAlbumId = null, currentAlbum = null;
let photoPage = 0, photoLoadedAll = false, loadedPhotos = [];
let selectMode = false; const selectedIds = new Set();

async function openAlbumDetail(albumId) {
  currentAlbumId = albumId; photoPage = 0; photoLoadedAll = false; loadedPhotos = [];
  selectMode = false; selectedIds.clear();
  $("#albumListView").hidden = true; $("#albumDetailView").hidden = false;
  const { data: album, error } = await supabase.from('albums').select('*').eq('id', albumId).single();
  if (error || !album) {
    $("#albumDetailView").innerHTML = '<p>앨범을 찾을 수 없습니다. <a href="gallery.html">← 앨범 목록으로</a></p>';
    return;
  }
  currentAlbum = album;
  renderAlbumHeader(album);
  await reloadPhotoGridFirstPage(albumId);
  setupInfiniteScroll();
  const openPhoto = new URLSearchParams(location.search).get('photo');
  if (openPhoto) {
    const idx = loadedPhotos.findIndex(p => p.id === openPhoto);
    if (idx >= 0) openLightbox(idx);
  }
}

function renderAlbumHeader(album) {
  $("#albumDetailTitle").textContent = album.title;
  $("#albumDetailDesc").textContent = album.description || '';
  $("#albumDetailDesc").hidden = !album.description;
  const dateLabel = album.event_date_end && album.event_date_end !== album.event_date
    ? `${dateShort(album.event_date)} – ${dateShort(album.event_date_end)}` : dateShort(album.event_date);
  $("#albumDetailDate").textContent = dateLabel;
  $("#albumDetailDate").hidden = !dateLabel;
  const canManage = currentUser && (currentUser.id === album.created_by || isAdmin);
  $("#uploadPanel").hidden = !currentUser;
  $("#editAlbumButton").hidden = !canManage;
  $("#selectModeButton").hidden = !currentUser;
  $("#reorderModeButton").hidden = !isAdmin;
}

async function reloadPhotoGridFirstPage(albumId) {
  photoPage = 0; photoLoadedAll = false; loadedPhotos = [];
  $("#photoGrid").innerHTML = '';
  await loadMorePhotos();
}

async function loadMorePhotos() {
  if (photoLoadedAll || !currentAlbumId) return;
  const from = photoPage * PAGE_SIZE, to = from + PAGE_SIZE - 1;
  const { data: photos, error } = await supabase.from('album_photos').select('*')
    .eq('album_id', currentAlbumId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range(from, to);
  if (error) { console.error(error); return; }
  if (!photos.length && photoPage === 0) {
    $("#photoGrid").innerHTML = '<div class="empty-feed"><strong>아직 사진이 없습니다.</strong><p>위에서 사진을 올려 보세요.</p></div>';
  }
  photos.forEach(p => { loadedPhotos.push(p); $("#photoGrid").appendChild(renderPhotoTile(p)); });
  if (photos.length < PAGE_SIZE) photoLoadedAll = true;
  photoPage++;
}

function renderPhotoTile(p) {
  const fig = document.createElement('figure'); fig.className = 'photo-tile'; fig.dataset.id = p.id;
  fig.innerHTML = `
    <label class="photo-select"><input type="checkbox" data-select="${p.id}" ${selectedIds.has(p.id) ? 'checked' : ''}><span></span></label>
    <img src="${publicUrl(p.thumbnail_path || p.storage_path)}" alt="${esc(p.caption || p.original_name || '가족 사진')}" loading="lazy">
    ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}`;
  fig.querySelector('img').addEventListener('click', () => {
    if (selectMode) { toggleSelect(p.id); return; }
    const idx = loadedPhotos.findIndex(x => x.id === p.id);
    openLightbox(idx);
  });
  fig.querySelector('[data-select]').addEventListener('change', e => toggleSelect(p.id, e.target.checked));
  return fig;
}

function setupInfiniteScroll() {
  const sentinel = $("#loadMoreSentinel"); if (!sentinel) return;
  if (window._galleryObserver) window._galleryObserver.disconnect();
  const io = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting) loadMorePhotos(); }); }, { rootMargin: '500px' });
  io.observe(sentinel);
  window._galleryObserver = io;
}

/* ── 선택 모드(다중 삭제) ─────────────────────────────── */
$("#selectModeButton")?.addEventListener('click', () => {
  selectMode = !selectMode; selectedIds.clear();
  document.body.classList.toggle('gallery-select-mode', selectMode);
  $("#selectModeButton").textContent = selectMode ? '선택 취소' : '사진 선택';
  $("#selectionToolbar").hidden = !selectMode;
  $$('.photo-tile input[type=checkbox]').forEach(cb => cb.checked = false);
  updateSelectionCount();
});
function toggleSelect(id, checked) {
  if (checked === undefined) {
    checked = !selectedIds.has(id);
    const cb = document.querySelector(`[data-select="${id}"]`); if (cb) cb.checked = checked;
  }
  if (checked) selectedIds.add(id); else selectedIds.delete(id);
  updateSelectionCount();
}
function updateSelectionCount() {
  const el = $("#selectionCount"); if (el) el.textContent = selectedIds.size ? `${selectedIds.size}장 선택됨` : '';
}
$("#deleteSelectedButton")?.addEventListener('click', async () => {
  if (!selectedIds.size) return;
  const ids = [...selectedIds];
  const targets = loadedPhotos.filter(p => ids.includes(p.id));
  const deletable = targets.filter(p => isAdmin || p.uploaded_by === currentUser?.id);
  const blocked = targets.length - deletable.length;
  if (!deletable.length) { alert('선택한 사진을 삭제할 권한이 없습니다. (본인이 올린 사진만 삭제할 수 있어요)'); return; }
  const msg = `선택한 ${deletable.length}장을 삭제할까요? 되돌릴 수 없습니다.` + (blocked ? ` (본인이 올리지 않은 ${blocked}장은 제외됩니다)` : '');
  if (!confirm(msg)) return;
  const paths = deletable.flatMap(p => [p.storage_path, p.thumbnail_path].filter(Boolean));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  await supabase.from('album_photos').delete().in('id', deletable.map(p => p.id));
  selectedIds.clear();
  await reloadPhotoGridFirstPage(currentAlbumId);
});

/* ── 순서 변경(드래그) ────────────────────────────────── */
let sortableInstance = null;
$("#reorderModeButton")?.addEventListener('click', () => {
  const grid = $("#photoGrid");
  if (sortableInstance) {
    sortableInstance.destroy(); sortableInstance = null;
    $("#reorderModeButton").textContent = '순서 변경';
    grid.classList.remove('reorder-mode');
    return;
  }
  if (typeof Sortable === 'undefined') { alert('순서 변경 기능을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); return; }
  grid.classList.add('reorder-mode');
  $("#reorderModeButton").textContent = '순서 저장 완료 (끄려면 클릭)';
  sortableInstance = new Sortable(grid, {
    animation: 150,
    delay: 120, delayOnTouchOnly: true,
    onEnd: async () => {
      const tiles = [...grid.querySelectorAll('.photo-tile')];
      await Promise.all(tiles.map((t, i) => supabase.from('album_photos').update({ sort_order: i }).eq('id', t.dataset.id)));
      loadedPhotos = tiles.map(t => loadedPhotos.find(p => p.id === t.dataset.id)).filter(Boolean);
    }
  });
});

/* ══════════════════════════════════════════════════════
   업로드 (다중 파일 · 드래그앤드롭 · 진행률 · 부분 실패 처리)
   ══════════════════════════════════════════════════════ */
const ALLOWED_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

function updateOverallProgress(done, total) {
  const bar = $("#uploadProgressBar"), label = $("#uploadProgressLabel"), wrap = $("#uploadProgressWrap");
  if (!bar) return;
  wrap.hidden = false;
  const pct = total ? Math.round((done / total) * 100) : 0;
  bar.style.width = pct + '%';
  label.textContent = `${done} / ${total}`;
}

async function uploadFilesToAlbum(albumId, fileList) {
  if (!currentUser) return;
  const files = Array.from(fileList);
  const valid = files.filter(f => ALLOWED_EXT.test(f.name));
  const skipped = files.length - valid.length;
  const queueEl = $("#uploadQueue"), summaryEl = $("#uploadSummary");
  queueEl.innerHTML = ''; queueEl.hidden = false; summaryEl.textContent = '';
  if (!valid.length) { summaryEl.textContent = '지원하는 사진 형식이 없습니다. (jpg, png, webp, heic만 가능)'; return; }
  const keepOriginal = $("#keepOriginalToggle")?.checked;

  const { data: maxRow } = await supabase.from('album_photos').select('sort_order')
    .eq('album_id', albumId).order('sort_order', { ascending: false }).limit(1).maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const rows = valid.map(file => {
    const row = document.createElement('div'); row.className = 'upload-row';
    row.innerHTML = `<span class="upload-row-name">${esc(file.name)}</span><span class="upload-row-state">대기 중</span>`;
    queueEl.appendChild(row);
    return { file, row };
  });

  let done = 0; const failed = [];
  updateOverallProgress(0, valid.length);

  for (const { file, row } of rows) {
    const stateEl = row.querySelector('.upload-row-state');
    try {
      stateEl.textContent = '처리 중…';
      const [mainResult, thumbResult] = await Promise.all([
        keepOriginal ? Promise.resolve({ blob: file }) : processImage(file, { maxEdge: 2200, quality: 0.85 }),
        processImage(file, { maxEdge: 480, quality: 0.75 }),
      ]);
      stateEl.textContent = '업로드 중…';
      const ext = keepOriginal ? (file.name.split('.').pop() || 'jpg') : 'webp';
      const mainType = keepOriginal ? (file.type || 'image/jpeg') : 'image/webp';
      const uid = crypto.randomUUID();
      const mainPath = `${currentUser.id}/${albumId}/${uid}.${ext}`;
      const thumbPath = `${currentUser.id}/${albumId}/${uid}_thumb.webp`;
      const [mainUp, thumbUp] = await Promise.all([
        supabase.storage.from(BUCKET).upload(mainPath, mainResult.blob, { contentType: mainType }),
        supabase.storage.from(BUCKET).upload(thumbPath, thumbResult.blob, { contentType: 'image/webp' }),
      ]);
      if (mainUp.error) throw mainUp.error;
      if (thumbUp.error) throw thumbUp.error;
      const { error: insErr } = await supabase.from('album_photos').insert({
        album_id: albumId, storage_path: mainPath, thumbnail_path: thumbPath,
        original_name: file.name, sort_order: nextOrder++, uploaded_by: currentUser.id,
      });
      if (insErr) throw insErr;
      stateEl.textContent = '완료'; row.classList.add('upload-row-done'); done++;
    } catch (err) {
      console.error(err);
      stateEl.textContent = '실패'; row.classList.add('upload-row-failed');
      failed.push(file.name);
    }
    updateOverallProgress(done + failed.length, valid.length);
  }

  summaryEl.textContent = `${done}장 업로드 완료`
    + (failed.length ? ` · 실패 ${failed.length}장 (${failed.join(', ')})` : '')
    + (skipped ? ` · 지원하지 않는 형식 ${skipped}개는 건너뜀` : '');

  const { data: albumRow } = await supabase.from('albums').select('cover_photo_url').eq('id', albumId).single();
  if (!albumRow?.cover_photo_url && done > 0) {
    const { data: firstPhoto } = await supabase.from('album_photos').select('storage_path')
      .eq('album_id', albumId).order('sort_order', { ascending: true }).limit(1).maybeSingle();
    if (firstPhoto) await supabase.from('albums').update({ cover_photo_url: publicUrl(firstPhoto.storage_path) }).eq('id', albumId);
  }

  await reloadPhotoGridFirstPage(albumId);
}

function handleUpload(fileList) {
  if (!currentAlbumId || !fileList?.length) return;
  uploadFilesToAlbum(currentAlbumId, fileList);
}

const dropzone = $("#uploadDropzone");
const albumPhotoInput = $("#albumPhotoInput");
const albumCameraInput = $("#albumCameraInput");
dropzone?.addEventListener('click', () => albumPhotoInput?.click());
albumPhotoInput?.addEventListener('change', e => { handleUpload(e.target.files); e.target.value = ''; });
$("#cameraCaptureButton")?.addEventListener('click', () => albumCameraInput?.click());
albumCameraInput?.addEventListener('change', e => { handleUpload(e.target.files); e.target.value = ''; });
['dragenter', 'dragover'].forEach(evt => dropzone?.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add('drag-over'); }));
['dragleave', 'drop'].forEach(evt => dropzone?.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove('drag-over'); }));
dropzone?.addEventListener('drop', e => handleUpload(e.dataTransfer.files));

/* ══════════════════════════════════════════════════════
   라이트박스
   ══════════════════════════════════════════════════════ */
let lightboxIndex = 0, slideshowTimer = null;

function openLightbox(index) {
  if (index < 0 || index >= loadedPhotos.length) return;
  lightboxIndex = index;
  renderLightbox();
  $("#lightbox").hidden = false; document.body.classList.add('modal-open');
}
function closeLightbox() {
  $("#lightbox").hidden = true; document.body.classList.remove('modal-open');
  stopSlideshow();
}
function renderLightbox() {
  const p = loadedPhotos[lightboxIndex]; if (!p) return;
  $("#lightboxImage").src = publicUrl(p.storage_path);
  $("#lightboxImage").alt = p.caption || p.original_name || '가족 사진';
  $("#lightboxCaptionView").textContent = p.caption || '';
  $("#lightboxDateView").textContent = dateText(p.taken_at);
  $("#lightboxCounter").textContent = `${lightboxIndex + 1} / ${loadedPhotos.length}`;
  const canEditPhoto = !!currentUser && (currentUser.id === p.uploaded_by || isAdmin);
  const canManageCover = !!currentUser && (currentUser.id === currentAlbum?.created_by || isAdmin);
  $("#lightboxEditPanel").hidden = !(canEditPhoto || canManageCover);
  $("#lightboxPhotoEditFields").hidden = !canEditPhoto;
  $("#lightboxSetCoverButton").hidden = !canManageCover;
  if (canEditPhoto) {
    $("#lightboxCaptionInput").value = p.caption || '';
    $("#lightboxDateInput").value = p.taken_at || '';
    $("#lightboxHeroToggle").checked = !!p.is_hero;
  }
}
$("#lightboxPrev")?.addEventListener('click', () => { lightboxIndex = (lightboxIndex - 1 + loadedPhotos.length) % loadedPhotos.length; renderLightbox(); });
$("#lightboxNext")?.addEventListener('click', () => { lightboxIndex = (lightboxIndex + 1) % loadedPhotos.length; renderLightbox(); });
$("#lightboxClose")?.addEventListener('click', closeLightbox);
$("#lightbox")?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!$("#lightbox") || $("#lightbox").hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') $("#lightboxPrev")?.click();
  if (e.key === 'ArrowRight') $("#lightboxNext")?.click();
});
let lbTouchX = 0;
$("#lightbox")?.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
$("#lightbox")?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(dx) > 50) (dx < 0 ? $("#lightboxNext") : $("#lightboxPrev"))?.click();
}, { passive: true });

function startSlideshow() {
  stopSlideshow();
  slideshowTimer = setInterval(() => $("#lightboxNext")?.click(), 3500);
  $("#lightboxSlideshowButton") && ($("#lightboxSlideshowButton").textContent = '슬라이드쇼 중지');
}
function stopSlideshow() {
  if (slideshowTimer) { clearInterval(slideshowTimer); slideshowTimer = null; }
  $("#lightboxSlideshowButton") && ($("#lightboxSlideshowButton").textContent = '슬라이드쇼 시작');
}
$("#lightboxSlideshowButton")?.addEventListener('click', () => (slideshowTimer ? stopSlideshow() : startSlideshow()));

$("#lightboxSaveButton")?.addEventListener('click', async () => {
  const p = loadedPhotos[lightboxIndex]; if (!p) return;
  const caption = $("#lightboxCaptionInput").value.trim();
  const taken_at = $("#lightboxDateInput").value || null;
  const is_hero = $("#lightboxHeroToggle").checked;
  const { error } = await supabase.from('album_photos').update({ caption, taken_at, is_hero }).eq('id', p.id);
  if (error) { alert('저장하지 못했습니다.'); return; }
  Object.assign(p, { caption, taken_at, is_hero });
  renderLightbox();
  const tile = document.querySelector(`.photo-tile[data-id="${p.id}"]`);
  if (tile) tile.replaceWith(renderPhotoTile(p));
});

$("#lightboxSetCoverButton")?.addEventListener('click', async () => {
  const p = loadedPhotos[lightboxIndex]; if (!p || !currentAlbumId) return;
  await supabase.from('albums').update({ cover_photo_url: publicUrl(p.storage_path) }).eq('id', currentAlbumId);
  alert('대표 사진으로 지정했습니다.');
});

$("#lightboxDeleteButton")?.addEventListener('click', async () => {
  const p = loadedPhotos[lightboxIndex]; if (!p) return;
  if (!confirm('이 사진을 삭제할까요? 되돌릴 수 없습니다.')) return;
  const paths = [p.storage_path, p.thumbnail_path].filter(Boolean);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  await supabase.from('album_photos').delete().eq('id', p.id);
  closeLightbox();
  await reloadPhotoGridFirstPage(currentAlbumId);
});

/* ══════════════════════════════════════════════════════
   홈페이지 미리보기 (최근 앨범 3개 · 최근 사진 6장)
   ══════════════════════════════════════════════════════ */
async function loadHomePreview() {
  const albumsBox = $("#recentAlbums"), photosBox = $("#recentPhotos");
  if (!albumsBox && !photosBox) return;
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    if (albumsBox) albumsBox.innerHTML = '<p class="album-preview-note">로그인하면 가족 앨범 미리보기가 보입니다.</p>';
    if (photosBox) photosBox.innerHTML = '';
    return;
  }
  if (albumsBox) {
    const { data: albums } = await supabase.from('albums')
      .select('id,title,cover_photo_url,event_date,event_date_end,updated_at,album_photos(count)')
      .order('updated_at', { ascending: false }).limit(3);
    albumsBox.innerHTML = '';
    if (!albums?.length) albumsBox.innerHTML = '<p class="album-preview-note">아직 앨범이 없습니다. 첫 앨범을 만들어 보세요.</p>';
    else albums.forEach(a => albumsBox.appendChild(renderAlbumCard(a)));
  }
  if (photosBox) {
    const { data: photos } = await supabase.from('album_photos')
      .select('id,album_id,storage_path,thumbnail_path,caption')
      .order('created_at', { ascending: false }).limit(6);
    photosBox.innerHTML = '';
    (photos || []).forEach(p => {
      const a = document.createElement('a');
      a.className = 'recent-photo-tile';
      a.href = `gallery.html?album=${p.album_id}&photo=${p.id}`;
      a.innerHTML = `<img src="${publicUrl(p.thumbnail_path || p.storage_path)}" alt="${esc(p.caption || '가족 사진')}" loading="lazy">`;
      photosBox.appendChild(a);
    });
  }
}

/* ══════════════════════════════════════════════════════
   대표 사진(홈 배너) 슬라이드 연동
   album_photos.is_hero = true 인 사진이 있으면 그것을 사용하고,
   없으면 script.js의 기본 heroSlides 배열을 그대로 사용합니다.
   ══════════════════════════════════════════════════════ */
async function applyHeroFromAlbums() {
  if (!supabase || typeof window.TotoHero?.setSlides !== 'function') return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const { data: heroPhotos } = await supabase.from('album_photos')
    .select('storage_path,caption')
    .eq('is_hero', true)
    .order('sort_order', { ascending: true })
    .limit(5);
  if (heroPhotos?.length) {
    window.TotoHero.setSlides(heroPhotos.map(p => ({ image: publicUrl(p.storage_path), alt: p.caption || '가족 대표 사진' })));
  }
}

/* ══════════════════════════════════════════════════════
   라우터 / 초기화
   ══════════════════════════════════════════════════════ */
async function boot() {
  await loadAuth();

  // gallery.html 전용: 로그인 게이트
  if ($("#galleryAuthGate")) {
    const ok = await setupAuthGate();
    if (!ok) return;
  }

  const params = new URLSearchParams(location.search);
  const albumId = params.get('album');

  if ($("#albumGrid")) {
    if (albumId) await openAlbumDetail(albumId);
    else { $("#albumListView").hidden = false; $("#albumDetailView").hidden = true; await loadAlbumList(); }
  }

  await loadHomePreview();
  await applyHeroFromAlbums();
}

$("#backToAlbumList")?.addEventListener('click', () => { location.href = 'gallery.html'; });

if (supabase) supabase.auth.onAuthStateChange(() => { boot(); });
boot();
