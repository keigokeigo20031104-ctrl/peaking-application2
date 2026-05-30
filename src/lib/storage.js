// v2 の体重記録を localStorage に保存する最小実装。
// データは日付をキーにしたマップ { "YYYY-MM-DD": record } として保持する。
// tracker / solo で localStorage キーを分けるため、ストアをキー指定で生成する。

export const TRACKER_STORAGE_KEY = "weight-log-v2-tracker-records";
export const SOLO_STORAGE_KEY = "weight-log-v2-solo-records";

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function createRecordStore(storageKey) {
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  return {
    loadAll,
    getRecord(date) {
      return loadAll()[date] || null;
    },
    saveRecord(record) {
      const all = loadAll();
      all[record.date] = record;
      localStorage.setItem(storageKey, JSON.stringify(all));
      return all;
    },
  };
}
