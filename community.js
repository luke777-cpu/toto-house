import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, FAMILY_BY_EMAIL } from "./config.js";

const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const $ = s => document.querySelector(s);

/* 가족 계정 매핑은 config.js의 FAMILY_BY_EMAIL을 그대로 사용합니다. */

function applyAuthorLock(session){
  const select=$("#postForm select[name=author_name]"); if(!select) return;
  const hint=$("#authorLockHint");
  const matched=session?FAMILY_BY_EMAIL[session.user.email]:null;
  if(matched){ select.value=matched; select.dataset.lockedName=matched; select.classList.add('locked'); if(hint) hint.hidden=false; }
  else { delete select.dataset.lockedName; select.classList.remove('locked'); if(hint) hint.hidden=true; }
}
document.querySelector("#postForm select[name=author_name]")?.addEventListener('change',e=>{
  const sel=e.currentTarget; const locked=sel.dataset.lockedName;
  if(locked && sel.value!==locked) sel.value=locked;
});
const feed = $("#communityFeed");
const modal = $("#writerModal");
const status = $("#communityStatus");
const esc = (v="") => v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const dateText = v => new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric'}).format(new Date(v));

let lastTrigger=null;
function setStatus(msg, type=''){ status.textContent=msg; status.className=`community-status ${type}`; }
function openWriter(e){ lastTrigger=e?.currentTarget||null; modal.hidden=false; document.body.classList.add('modal-open'); refreshSession().then(()=>{ const panel=$("#loginPanel").hidden?$("#editorPanel"):$("#loginPanel"); panel?.querySelector('select,input')?.focus({preventScroll:true}); }); }
function closeWriter(){ modal.hidden=true; document.body.classList.remove('modal-open'); setStatus(''); lastTrigger?.focus?.(); }
$("#openWriter")?.addEventListener('click',openWriter);
$("#openWriterInline")?.addEventListener('click',openWriter);
$("#openWriterHero")?.addEventListener('click',openWriter);
$("#closeWriter")?.addEventListener('click',closeWriter);
modal?.addEventListener('click',e=>{if(e.target===modal) closeWriter();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal&&!modal.hidden) closeWriter();});

async function refreshSession(){
  if(!configured){ $("#loginPanel").hidden=false; $("#editorPanel").hidden=true; $("#authStatus").textContent='Supabase 연결 전입니다.'; return; }
  const {data:{session}}=await supabase.auth.getSession();
  $("#loginPanel").hidden=!!session; $("#editorPanel").hidden=!session;
  $("#authStatus").textContent=session?session.user.email:'가족 계정으로 로그인해 주세요.';
  applyAuthorLock(session);
}

$("#googleLoginButton")?.addEventListener('click',async()=>{
  if(!supabase){setStatus('config.js 설정이 필요합니다.','error');return;}
  sessionStorage.setItem('toto-reopen-writer','1');
  const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0]}});
  if(error) setStatus('Google 로그인을 시작하지 못했습니다.','error');
});

$("#loginForm")?.addEventListener('submit',async e=>{
  e.preventDefault(); if(!supabase){setStatus('config.js 설정이 필요합니다.','error');return;}
  const form=e.currentTarget; const f=new FormData(form); setStatus('로그인 중…');
  const {error}=await supabase.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});
  if(error){setStatus('이메일 또는 비밀번호를 확인해 주세요.','error');return;}
  form.reset(); setStatus('로그인했습니다.','success'); refreshSession();
});

$("#logoutButton")?.addEventListener('click',async()=>{await supabase?.auth.signOut(); refreshSession();});
$("#postImage")?.addEventListener('change',e=>{
  const f=e.target.files?.[0]; const p=$("#imagePreview"); const n=$("#fileName"); const t=$("#fileTriggerText");
  if(!f){p.hidden=true; n.hidden=true; t.textContent='사진 선택 또는 촬영'; return;}
  p.src=URL.createObjectURL(f); p.hidden=false;
  n.textContent=f.name; n.hidden=false;
  t.textContent='다른 사진 선택';
});

async function compress(file){
  const bmp=await createImageBitmap(file); const max=1800; const scale=Math.min(1,max/Math.max(bmp.width,bmp.height));
  const c=document.createElement('canvas'); c.width=Math.round(bmp.width*scale); c.height=Math.round(bmp.height*scale);
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height); bmp.close();
  return await new Promise(r=>c.toBlob(r,'image/webp',0.84));
}

$("#postForm")?.addEventListener('submit',async e=>{
  e.preventDefault(); const form=e.currentTarget; const f=new FormData(form);
  const btn=form.querySelector('button[type=submit]'); btn.disabled=true; btn.textContent='게시 중입니다…'; setStatus('게시 중입니다…');
  try{
    const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error('로그인이 필요합니다.');
    const file=f.get('image'); let image_path=null;
    if(file?.size){ const blob=await compress(file); image_path=`${user.id}/${crypto.randomUUID()}.webp`;
      const {error}=await supabase.storage.from('toto-photos').upload(image_path,blob,{contentType:'image/webp'}); if(error) throw error; }
    const {error}=await supabase.from('toto_posts').insert({author_id:user.id,author_name:f.get('author_name'),title:f.get('title'),body:f.get('body'),image_path});
    if(error) throw error; form.reset(); $("#imagePreview").hidden=true; $("#fileName").hidden=true; $("#fileTriggerText").textContent='사진 선택 또는 촬영'; setStatus('게시되었습니다.','success'); await loadPosts(); setTimeout(closeWriter,600);
  }catch(err){console.error(err);setStatus(err.message||'게시하지 못했습니다.','error');}finally{btn.disabled=false; btn.textContent='게시하기';}
});

async function removePost(post){
  if(!confirm('이 글을 삭제할까요?')) return;
  const {error}=await supabase.from('toto_posts').delete().eq('id',post.id); if(error){alert('삭제하지 못했습니다.');return;}
  if(post.image_path) await supabase.storage.from('toto-photos').remove([post.image_path]); loadPosts();
}

async function loadPosts(){
  if(!configured){feed.innerHTML='<div class="empty-feed"><strong>가족 게시판 준비 완료</strong><p>Supabase를 연결하면 가족 글과 사진이 여기에 자동으로 표시됩니다.</p></div>';return;}
  feed.innerHTML='<div class="empty-feed"><p>이야기를 불러오는 중입니다…</p></div>';
  const [{data:posts,error},{data:{user}}]=await Promise.all([
    supabase.from('toto_posts').select('id,created_at,author_id,author_name,title,body,image_path').order('created_at',{ascending:false}).limit(30),
    supabase.auth.getUser()
  ]);
  if(error){feed.innerHTML='<div class="empty-feed"><p>이야기를 불러오지 못했습니다.</p></div>';return;}
  if(!posts?.length){feed.innerHTML='<div class="empty-feed"><strong>아직 첫 글이 없습니다.</strong><p>가족의 첫 이야기를 남겨 보세요.</p></div>';return;}
  feed.innerHTML=''; posts.forEach(post=>{
    const card=document.createElement('article'); card.className='community-card';
    const image=post.image_path?supabase.storage.from('toto-photos').getPublicUrl(post.image_path).data.publicUrl:'';
    card.innerHTML=`${image?`<img class="community-photo" src="${image}" alt="${esc(post.title)}" loading="lazy">`:''}<div class="community-body"><div class="community-meta"><span>${esc(post.author_name)}</span><time>${dateText(post.created_at)}</time></div><h3>${esc(post.title)}</h3><p>${esc(post.body).replace(/\n/g,'<br>')}</p>${user?.id===post.author_id?'<button class="delete-post" type="button">삭제</button>':''}</div>`;
    card.querySelector('.delete-post')?.addEventListener('click',()=>removePost(post)); feed.appendChild(card);
  });
}
if(supabase) supabase.auth.onAuthStateChange(()=>{refreshSession();loadPosts();});
loadPosts();
if(sessionStorage.getItem('toto-reopen-writer')){ sessionStorage.removeItem('toto-reopen-writer'); openWriter(); }
