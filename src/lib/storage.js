// v2 の体重記録を localStorage に保存する。
// 記録は record の配列として保持する（date でユニーク）。
// tracker / solo でキーを分ける。

export const TRACKER_STORAGE_KEY = "weight-log-v2-tracker-records";
export const SOLO_STORAGE_KEY = "weight-log-v2-solo-records";

export function loadRecords(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(raw)) return raw;
    // 旧マップ形式 { "YYYY-MM-DD": record } との互換
    if (raw && typeof raw === "object") return Object.values(raw);
    return [];
  } catch {
    return [];
  }
}

export function saveRecords(key, records) {
  localStorage.setItem(key, JSON.stringify(records));
  return records;
}

export function getRecordByDate(key, date) {
  return loadRecords(key).find((r) => r.date === date) || null;
}

export function upsertRecord(key, record) {
  const records = loadRecords(key).filter((r) => r.date !== record.date);
  records.push(record);
  records.sort((a, b) => a.date.localeCompare(b.date));
  saveRecords(key, records);
  return records;
}

export function deleteRecord(key, date) {
  const records = loadRecords(key).filter((r) => r.date !== date);
  saveRecords(key, records);
  return records;
}

export function deleteAllRecords(key) {
  localStorage.removeItem(key);
  return [];
}
