import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';

const todayElement = document.getElementById('todayVisits');
const totalElement = document.getElementById('totalVisits');
const counterElement = document.getElementById('visitorCounter');

function seoulDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatCount(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value) || 0);
}

async function loadVisitorStats() {
  if (!todayElement || !totalElement) return;

  const storageKey = 'toto-house-last-visit';
  const todayKey = seoulDateKey();
  let increment = true;

  try {
    increment = localStorage.getItem(storageKey) !== todayKey;
  } catch {
    // 저장소 접근이 막힌 브라우저에서는 현재 접속을 방문으로 집계합니다.
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase.rpc('toto_visit_stats', {
    p_increment: increment,
  });

  if (error) throw error;

  const stats = Array.isArray(data) ? data[0] : data;
  todayElement.textContent = formatCount(stats?.today_visits);
  totalElement.textContent = formatCount(stats?.total_visits);

  if (increment) {
    try {
      localStorage.setItem(storageKey, todayKey);
    } catch {
      // 카운터 표시는 유지하고 브라우저 저장 오류만 무시합니다.
    }
  }
}

loadVisitorStats().catch((error) => {
  console.warn('방문자 수를 불러오지 못했습니다.', error);
  counterElement?.setAttribute('title', '방문자 수를 불러오지 못했습니다.');
});
