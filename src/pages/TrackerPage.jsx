import RecordApp from "@/components/RecordApp";
import { TRACKER_STORAGE_KEY } from "@/lib/storage";

export default function TrackerPage() {
  return (
    <RecordApp
      storageKey={TRACKER_STORAGE_KEY}
      title="入力者側"
      subtitle="チーム入力者向けの記録（v2・ローカル保存）"
    />
  );
}
