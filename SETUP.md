# 유통3팀 매입·매출 관리시스템 설치 가이드

## 1. 프로젝트 생성

```bash
npx create-react-app dist3-manager
cd dist3-manager
npm install @supabase/supabase-js
```

---

## 2. App.js 교체

다운로드한 `App.js`를 `src/App.js`에 덮어씌웁니다.

---

## 3. Supabase 설정

### 3-1. Supabase 프로젝트 생성
1. https://supabase.com → New project 생성
2. Project URL, anon key 복사해두기

### 3-2. SQL 실행
Supabase > SQL Editor에서 `supabase_setup.sql` 전체 실행

### 3-3. Storage 버킷 확인
- Supabase > Storage > `excel-uploads` 버킷이 생성되었는지 확인
- 없으면 수동으로 생성: New Bucket → 이름: `excel-uploads`, Public: OFF

---

## 4. 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```
REACT_APP_SUPABASE_URL=https://xxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_ADMIN_EMAIL=your-admin@email.com
```

---

## 5. 관리자 계정 설정

1. 앱 실행 후 **회원가입** 탭에서 관리자 이메일로 가입
2. Supabase > SQL Editor에서 실행:

```sql
UPDATE profiles
SET role = 'admin', approved = TRUE
WHERE email = 'your-admin@email.com';
```

3. 이후 로그인하면 관리자 메뉴(사용자 관리) 표시됨

---

## 6. 로컬 실행

```bash
npm start
```

---

## 7. Vercel 배포

```bash
npm run build
# Vercel에 push 또는 vercel deploy
```

Vercel 환경변수에도 동일하게 설정:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_ADMIN_EMAIL`

---

## 기능 요약

| 기능 | 설명 |
|------|------|
| 회원가입 | 이름, 부서, 이메일, 비밀번호 |
| 관리자 승인 | 가입 요청 승인/거절 |
| 매입 업로드 | 판매처 → 날짜 → 엑셀 파일 |
| 매출 업로드 | 판매처 → 날짜 → 엑셀 파일 |
| 업로드 이력 | 조회/다운로드/삭제 |
| 관리자 패널 | 사용자 관리 전체 이력 조회 |

## 판매처 목록
홈플러스, 익스프레스, 롯데마트, 롯데슈퍼, 메가마트, 이마트, 에브리데이
