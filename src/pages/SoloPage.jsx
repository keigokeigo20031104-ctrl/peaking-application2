import RecordApp from "@/components/RecordApp";
import { SOLO_STORAGE_KEY } from "@/lib/storage";

export default function SoloPage() {
  return (
    <RecordApp
      storageKey={SOLO_STORAGE_KEY}
      title="個人側"
      subtitle="個人用の記録（v2・ローカル保存）"
    />
  );
}
