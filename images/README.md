# 토토의 집 v2 — 가족 글쓰기

가족 로그인, 사진 업로드, 글 게시, 본인 글 삭제 기능이 포함된 버전입니다.

## 연결 순서
1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase-setup.sql` 전체를 실행합니다.
3. Authentication → Users에서 가족 계정을 만듭니다.
4. Project Settings → API에서 Project URL과 Publishable key를 확인합니다.
5. `config.js`의 두 값을 바꿉니다.
6. 모든 파일을 `luke777-cpu/toto-house` 저장소에 올립니다.

## 보안
브라우저에는 Publishable key만 넣습니다. Secret key 또는 service_role 키는 절대 넣지 마세요.
