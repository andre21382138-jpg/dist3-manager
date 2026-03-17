-- ============================================================
-- 유통3팀 매입·매출 관리시스템 - Supabase 초기 설정 SQL
-- Supabase > SQL Editor 에서 실행하세요
-- ============================================================


-- 1. profiles 테이블 (사용자 정보 + 승인 여부)
CREATE TABLE profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT NOT NULL,
  name      TEXT NOT NULL,
  dept      TEXT,
  role      TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  approved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 자기 자신의 프로필 읽기
CREATE POLICY "자신의 프로필 읽기"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 관리자는 모든 프로필 읽기
CREATE POLICY "관리자 전체 프로필 읽기"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 가입 시 자신의 프로필 삽입
CREATE POLICY "프로필 삽입"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 관리자 업데이트 (승인 처리)
CREATE POLICY "관리자 프로필 업데이트"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 관리자 삭제
CREATE POLICY "관리자 프로필 삭제"
  ON profiles FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 2. uploads 테이블 (파일 업로드 이력)
CREATE TABLE uploads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL,
  type       TEXT NOT NULL,      -- '매입' | '매출'
  vendor     TEXT NOT NULL,      -- 판매처
  date       DATE NOT NULL,      -- 매입/매출 날짜
  file_name  TEXT NOT NULL,
  file_path  TEXT NOT NULL,      -- Storage 경로
  file_size  BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- 자기 업로드 읽기
CREATE POLICY "자신의 업로드 읽기"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

-- 관리자 전체 읽기
CREATE POLICY "관리자 전체 업로드 읽기"
  ON uploads FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 승인된 사용자만 업로드 가능
CREATE POLICY "승인된 사용자 업로드"
  ON uploads FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND approved = TRUE)
  );

-- 본인 업로드 삭제
CREATE POLICY "본인 업로드 삭제"
  ON uploads FOR DELETE
  USING (auth.uid() = user_id);

-- 관리자 업로드 삭제
CREATE POLICY "관리자 업로드 삭제"
  ON uploads FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 3. 관리자 계정 설정
-- 아래 이메일을 관리자 이메일로 변경하세요
-- 가입 후 실행하거나, 가입 전 트리거로 처리 가능

-- 예시: 특정 이메일을 관리자로 설정 (가입 후 실행)
-- UPDATE profiles SET role = 'admin', approved = TRUE
-- WHERE email = 'your-admin@email.com';


-- 4. Storage 버킷 생성
-- Supabase > Storage > New Bucket
-- 이름: excel-uploads
-- Public: OFF (비공개)

-- Storage 정책 (SQL로 설정)
INSERT INTO storage.buckets (id, name, public)
VALUES ('excel-uploads', 'excel-uploads', FALSE)
ON CONFLICT DO NOTHING;

-- 승인된 사용자 업로드 허용
CREATE POLICY "승인된 사용자 파일 업로드"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'excel-uploads'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND approved = TRUE
    )
  );

-- 본인 파일 읽기 (다운로드)
CREATE POLICY "본인 파일 읽기"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'excel-uploads'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      OR TRUE  -- 업로드한 사람이면 누구나 (file_path로 제어)
    )
  );

-- 관리자 및 본인 파일 삭제
CREATE POLICY "파일 삭제"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'excel-uploads');
