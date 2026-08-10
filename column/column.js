import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../config.js";

/* 칼럼은 형님(아빠) 전용 글쓰기 공간입니다. 기존 가족 게시판(toto_posts)과는
   완전히 다른 테이블(toto_columns)·정책을 쓰고, 쓰기는 이 이메일 계정만 됩니다.
   (Supabase RLS에서도 같은 이메일로 한 번 더 막아둬서, 이 값만 바꿔도 뚫리지 않습니다.) */
const ADMIN_EMAIL = "ypark1416@gmail.com";

const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const $ = s => document.querySelector(s);
const esc = (v = "") => v.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const dateText = v => new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(v));
const coverUrl = path => path ? supabase.storage.from("toto-photos").getPublicUrl(path).data.publicUrl : "";

async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
function isAdmin(session) {
  return !!session && session.user.email === ADMIN_EMAIL;
}

/* ---------- 관리자 로그인 (목록·상세 페이지 공통) ---------- */
export function initColumnAuth() {
  const loginForm = $("#columnLoginForm");
  const loginPanel = $("#columnLoginPanel");
  const logoutBtn = $("#columnLogoutButton");
  const authStatus = $("#columnAuthStatus");
  if (!loginForm && !logoutBtn) return;

  async function refresh() {
    const session = await getSession();
    const admin = isAdmin(session);
    if (loginPanel) loginPanel.hidden = admin;
    if (logoutBtn) logoutBtn.hidden = !admin;
    if (authStatus) authStatus.textContent = admin ? "아빠로 로그인됨" : (session ? `${session.user.email} (칼럼 작성 권한 없음)` : "");
    const writerToggle = $("#openColumnWriter");
    if (writerToggle) writerToggle.hidden = !admin;
  }
  loginForm?.addEventListener("submit", async e => {
    e.preventDefault(); if (!supabase) return;
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: f.get("email"), password: f.get("password") });
    if (error) { if (authStatus) authStatus.textContent = "이메일 또는 비밀번호를 확인해 주세요."; return; }
    e.currentTarget.reset(); await refresh();
  });
  logoutBtn?.addEventListener("click", async () => { await supabase?.auth.signOut(); await refresh(); });
  if (supabase) supabase.auth.onAuthStateChange(refresh);
  refresh();
}

/* ---------- 목록 페이지 (index.html) ---------- */
export async function initColumnList() {
  const feed = $("#columnFeed");
  const writerToggle = $("#openColumnWriter");
  if (!feed) return;

  const session = await getSession();
  if (writerToggle) writerToggle.hidden = !isAdmin(session);

  if (!configured) {
    feed.innerHTML = `<div class="empty-feed"><strong>칼럼 준비 완료</strong><p>Supabase를 연결하면 글이 여기에 표시됩니다.</p></div>`;
    return;
  }
  feed.innerHTML = `<div class="empty-feed"><p>글을 불러오는 중입니다…</p></div>`;
  const { data: cols, error } = await supabase
    .from("toto_columns")
    .select("id,created_at,title,body,cover_image_path")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) { feed.innerHTML = `<div class="empty-feed"><p>글을 불러오지 못했습니다.</p></div>`; return; }
  if (!cols?.length) {
    feed.innerHTML = isAdmin(session)
      ? `<div class="empty-feed"><strong>아직 첫 칼럼이 없습니다.</strong><p>위 "새 글쓰기"로 첫 글을 남겨 보세요.</p></div>`
      : `<div class="empty-feed"><strong>아직 등록된 칼럼이 없습니다.</strong></div>`;
    return;
  }
  feed.innerHTML = "";
  cols.forEach(c => {
    const excerpt = c.body.length > 120 ? c.body.slice(0, 120) + "…" : c.body;
    const card = document.createElement("a");
    card.className = "column-card";
    card.href = `post.html?id=${c.id}`;
    card.innerHTML = `
      ${c.cover_image_path ? `<img class="column-cover" src="${coverUrl(c.cover_image_path)}" alt="" loading="lazy">` : ""}
      <div class="column-card-body">
        <time>${dateText(c.created_at)}</time>
        <h3>${esc(c.title)}</h3>
        <p>${esc(excerpt)}</p>
      </div>`;
    feed.appendChild(card);
  });
}

/* ---------- 글쓰기 모달 (index.html 안에 있음) ---------- */
export function initColumnWriter() {
  const modal = $("#columnWriterModal");
  const form = $("#columnForm");
  if (!modal || !form) return;
  const status = $("#columnStatus");
  const setStatus = (msg, type = "") => { status.textContent = msg; status.className = `community-status ${type}`; };

  $("#openColumnWriter")?.addEventListener("click", () => { modal.hidden = false; document.body.classList.add("modal-open"); });
  $("#closeColumnWriter")?.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  function closeModal() { modal.hidden = true; document.body.classList.remove("modal-open"); setStatus(""); }

  $("#columnCover")?.addEventListener("change", e => {
    const f = e.target.files?.[0]; const p = $("#columnCoverPreview");
    if (!f) { p.hidden = true; return; }
    p.src = URL.createObjectURL(f); p.hidden = false;
  });

  async function compress(file) {
    const bmp = await createImageBitmap(file); const max = 1800;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); bmp.close();
    return await new Promise(r => c.toBlob(r, "image/webp", 0.84));
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "올리는 중…"; setStatus("올리는 중…");
    try {
      const session = await getSession();
      if (!isAdmin(session)) throw new Error("이 계정으로는 칼럼을 쓸 수 없습니다.");
      const f = new FormData(form);
      const file = f.get("cover"); let cover_image_path = null;
      if (file?.size) {
        const blob = await compress(file);
        cover_image_path = `columns/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from("toto-photos").upload(cover_image_path, blob, { contentType: "image/webp" });
        if (error) throw error;
      }
      const { error } = await supabase.from("toto_columns").insert({
        author_id: session.user.id, author_name: "아빠",
        title: f.get("title"), body: f.get("body"), cover_image_path,
      });
      if (error) throw error;
      form.reset(); $("#columnCoverPreview").hidden = true;
      setStatus("게시되었습니다.", "success");
      await initColumnList();
      setTimeout(closeModal, 600);
    } catch (err) {
      console.error(err); setStatus(err.message || "게시하지 못했습니다.", "error");
    } finally { btn.disabled = false; btn.textContent = "올리기"; }
  });
}

/* ---------- 상세 페이지 (post.html) ---------- */
export async function initColumnDetail() {
  const wrap = $("#columnDetail");
  if (!wrap) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id || !configured) { wrap.innerHTML = `<p class="empty-feed">글을 찾을 수 없습니다.</p>`; return; }

  const session = await getSession();
  const { data: c, error } = await supabase
    .from("toto_columns").select("id,created_at,author_name,title,body,cover_image_path")
    .eq("id", id).single();
  if (error || !c) { wrap.innerHTML = `<p class="empty-feed">글을 찾을 수 없습니다.</p>`; return; }

  document.title = `${c.title} · 토토의 집 칼럼`;
  wrap.innerHTML = `
    ${c.cover_image_path ? `<img class="column-detail-cover" src="${coverUrl(c.cover_image_path)}" alt="">` : ""}
    <div class="column-detail-meta"><time>${dateText(c.created_at)}</time><span>${esc(c.author_name)}</span></div>
    <h1>${esc(c.title)}</h1>
    <div class="column-detail-body">${esc(c.body).replace(/\n/g, "<br>")}</div>
    ${isAdmin(session) ? `<div class="column-detail-actions"><button id="deleteColumn" class="btn-ghost" type="button">이 글 삭제</button></div>` : ""}
  `;
  $("#deleteColumn")?.addEventListener("click", async () => {
    if (!confirm("이 칼럼을 삭제할까요?")) return;
    const { error } = await supabase.from("toto_columns").delete().eq("id", id);
    if (error) { alert("삭제하지 못했습니다."); return; }
    if (c.cover_image_path) await supabase.storage.from("toto-photos").remove([c.cover_image_path]);
    location.href = "index.html";
  });
}
