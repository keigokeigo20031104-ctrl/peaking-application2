// v2 入力者側の体重記録を localStorage に保存する最小実装。
// データは日付をキーにしたマップ { "YYYY-MM-DD": record } として保持する。

const STORAGE_KEY = "weight-log-v2-tracker-records";

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getRecord(date) {
  return loadRecords()[date] || null;
}

export function saveRecord(record) {
  const all = loadRecords();
  all[record.date] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}
