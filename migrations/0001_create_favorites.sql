-- 즐겨찾기를 서버로 옮길 때 쓸 표 (개발용 DB에서 먼저 실행한다).
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, restaurant_id)
);
