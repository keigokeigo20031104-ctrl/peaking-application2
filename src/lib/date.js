// 日付ユーティリティ。

export function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

// "YYYY-MM-DD" → "YYYY/MM/DD"。不正値はそのまま返す。
export function formatDate(value) {
  if (!value) return "";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(value);
  return `${m[1]}/${m[2]}/${m[3]}`;
}
