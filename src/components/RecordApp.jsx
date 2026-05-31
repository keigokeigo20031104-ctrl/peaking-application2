import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecordForm from "@/components/RecordForm";
import MealForm from "@/components/MealForm";
import TrainingForm from "@/components/TrainingForm";
import WeightChart from "@/components/WeightChart";
import DataList from "@/components/DataList";
import {
  loadRecords,
  getRecordByDate,
  upsertRecord,
  deleteRecord,
  deleteAllRecords,
} from "@/lib/storage";
import { todayString } from "@/lib/date";

const TABS = [
  { value: "record", label: "今日の記録" },
  { value: "meals", label: "食事" },
  { value: "training", label: "トレーニング" },
  { value: "chart", label: "グラフ" },
  { value: "data", label: "データ" },
];

function emptyDraft(date, user = "") {
  return { user, date, weight: "", calories: "", note: "", meals: [], training: [] };
}

function toDraft(rec) {
  return {
    user: rec.user || "",
    date: rec.date,
    weight: rec.weight != null ? String(rec.weight) : "",
    calories: rec.calories != null ? String(rec.calories) : "",
    note: rec.note || "",
    meals: rec.meals || [],
    training: rec.training || [],
  };
}

function toRecord(d) {
  const weightStr = (d.weight || "").trim();
  const w = Number(weightStr);
  const c = Number(d.calories);
  return {
    user: (d.user || "").trim() || "unknown",
    date: d.date,
    weight: weightStr !== "" && Number.isFinite(w) ? Math.round(w * 10) / 10 : null,
    calories: d.calories !== "" && Number.isFinite(c) ? Math.round(c) : null,
    note: (d.note || "").trim(),
    meals: d.meals || [],
    training: d.training || [],
  };
}

export default function RecordApp({ storageKey, title, subtitle }) {
  const [date, setDate] = useState(todayString());
  const [draft, setDraft] = useState(() => {
    const rec = getRecordByDate(storageKey, todayString());
    return rec ? toDraft(rec) : emptyDraft(todayString());
  });
  const [records, setRecords] = useState(() => loadRecords(storageKey));
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const savedRecord = records.find((r) => r.date === date) || null;

  function persist(nextDraft) {
    const record = toRecord(nextDraft);
    setRecords(upsertRecord(storageKey, record));
    return record;
  }

  function handleField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleDateChange(newDate) {
    setDate(newDate);
    const rec = getRecordByDate(storageKey, newDate);
    setDraft((prev) => (rec ? toDraft(rec) : emptyDraft(newDate, prev.user)));
  }

  function handleSaveRecord() {
    if (!draft.date) {
      setToast("日付を入力してください");
      return;
    }
    const weightStr = (draft.weight || "").trim();
    if (weightStr !== "") {
      const w = Number(weightStr);
      if (!Number.isFinite(w) || w <= 0) {
        setToast("体重は正の数値を入力してください");
        return;
      }
    }
    persist(draft);
    setToast("保存しました");
  }

  function handleMealsChange(meals) {
    const next = { ...draft, meals };
    setDraft(next);
    persist(next);
  }

  function handleTrainingChange(training) {
    const next = { ...draft, training };
    setDraft(next);
    persist(next);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(records, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${storageKey}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
  }

  function handleExportCsv() {
    const header = ["date", "user", "weight", "calories", "meals", "training", "note"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [...records]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) =>
        [
          r.date,
          r.user,
          r.weight ?? "",
          r.calories ?? "",
          (r.meals || []).length,
          (r.training || []).length,
          r.note,
        ]
          .map(escape)
          .join(",")
      );
    const csv = [header.join(","), ...rows].join("\r\n");
    // Excel で文字化けしないよう BOM を付与する。
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${storageKey}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
  }

  function handleDeleteOne(targetDate) {
    if (!window.confirm(`${targetDate} の記録を削除しますか？`)) {
      return false;
    }
    const next = deleteRecord(storageKey, targetDate);
    setRecords(next);
    if (targetDate === date) {
      setDraft(emptyDraft(date, draft.user));
    }
    setToast("削除しました");
    return true;
  }

  function handleDeleteAll() {
    if (!window.confirm("すべての記録を削除しますか？この操作は元に戻せません。")) {
      return;
    }
    deleteAllRecords(storageKey);
    setRecords([]);
    setDraft(emptyDraft(date, draft.user));
    setToast("すべて削除しました");
  }

  // クイック統計（記録が2件以上あるときだけ前日比を出す）
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const latestRec = sortedRecords[0] ?? null;
  const prevRec = sortedRecords[1] ?? null;
  const weightChange =
    latestRec?.weight != null && prevRec?.weight != null
      ? latestRec.weight - prevRec.weight
      : null;

  return (
    <main className="container max-w-xl py-8">
      <header className="mb-4">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← ホーム
        </a>
        <h1 className="mt-2 text-2xl font-black tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </header>

      {/* クイック統計ストリップ */}
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground">最新体重</span>
          <span className="text-base font-black tabular-nums">
            {latestRec?.weight != null ? `${latestRec.weight} kg` : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center border-x">
          <span className="text-[10px] font-semibold text-muted-foreground">前日比</span>
          <span
            className={`text-base font-black tabular-nums ${
              weightChange == null
                ? ""
                : weightChange > 0.05
                ? "text-red-500"
                : weightChange < -0.05
                ? "text-blue-500"
                : ""
            }`}
          >
            {weightChange == null
              ? "--"
              : `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg`}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground">総記録</span>
          <span className="text-base font-black tabular-nums">{records.length} 日</span>
        </div>
      </div>

      <Tabs defaultValue="record">
        <TabsList className="grid h-auto w-full grid-cols-5 gap-1">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="whitespace-normal px-1 py-2 text-[11px] leading-tight"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="record">
          <RecordForm
            draft={draft}
            onField={handleField}
            onDateChange={handleDateChange}
            onSave={handleSaveRecord}
            savedRecord={savedRecord}
          />
        </TabsContent>

        <TabsContent value="meals">
          <MealForm key={draft.date} meals={draft.meals} onChange={handleMealsChange} />
        </TabsContent>

        <TabsContent value="training">
          <TrainingForm key={draft.date} training={draft.training} onChange={handleTrainingChange} />
        </TabsContent>

        <TabsContent value="chart">
          <WeightChart records={records} />
        </TabsContent>

        <TabsContent value="data">
          <DataList
            records={records}
            onExport={handleExport}
            onExportCsv={handleExportCsv}
            onDeleteOne={handleDeleteOne}
            onDeleteAll={handleDeleteAll}
          />
        </TabsContent>
      </Tabs>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
