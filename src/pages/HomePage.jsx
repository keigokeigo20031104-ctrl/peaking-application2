import { loadRecords, SOLO_STORAGE_KEY } from "@/lib/storage";
import { todayString, formatDate } from "@/lib/date";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Users, ShieldCheck, MessageSquare } from "lucide-react";

const soloLink = {
  href: "/solo/",
  title: "体重ログ（個人）",
  desc: "個人でローカルに記録・グラフ・トレーニング管理",
  icon: User,
};

const otherLinks = [
  {
    href: "/tracker/",
    title: "体重ログ（管理者送信）",
    desc: "記録を管理者へ送信・チームで使う入力者向け",
    icon: Users,
  },
  {
    href: "/admin/",
    title: "管理者画面",
    desc: "サーバー取得した記録を入力者ごとに確認",
    icon: ShieldCheck,
  },
  {
    href: "/feedback/",
    title: "意見箱",
    desc: "届いたユーザー意見を確認・既読管理",
    icon: MessageSquare,
  },
];

function loadDashboardStats() {
  const records = loadRecords(SOLO_STORAGE_KEY);
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0] ?? null;
  const prev = sorted[1] ?? null;
  const today = todayString();
  const todayRecorded = records.some((r) => r.date === today);

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const week = records.filter((r) => r.date >= cutoffStr && r.weight != null);
  const weekAvg =
    week.length > 0
      ? week.reduce((s, r) => s + r.weight, 0) / week.length
      : null;

  const weightChange =
    latest?.weight != null && prev?.weight != null
      ? latest.weight - prev.weight
      : null;

  return { latest, weightChange, weekAvg, totalCount: records.length, todayRecorded };
}

function StatCell({ label, value, unit, colorClass, borderLeft, colSpan2 }) {
  return (
    <div
      className={`text-center${borderLeft ? " border-l border-border" : ""}${colSpan2 ? " col-span-2 border-t border-border pt-3 mt-1" : ""}`}
    >
      <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
      <p className={`text-base font-black tabular-nums leading-tight mt-0.5 ${colorClass ?? "text-foreground"}`}>
        {value}
      </p>
      <p className="text-[9px] text-muted-foreground">{unit}</p>
    </div>
  );
}

function NavCard({ link, primary }) {
  const Icon = link.icon;
  return (
    <a href={link.href} className="block no-underline group">
      <Card
        className={`transition-shadow hover:shadow-md ${
          primary ? "border-primary/40 bg-accent" : ""
        }`}
      >
        <CardContent className="py-4 px-5 flex items-center gap-4">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
              primary
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[17px] font-bold text-foreground leading-snug">
              {link.title}
            </span>
            <span className="block text-[13px] text-muted-foreground mt-0.5 leading-snug">
              {link.desc}
            </span>
          </div>
          <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </CardContent>
      </Card>
    </a>
  );
}

export default function HomePage() {
  const stats = loadDashboardStats();

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[520px]">
        <h1 className="text-[22px] font-bold text-center text-foreground mb-1">
          Weight Apps
        </h1>
        <p className="text-[13px] text-center text-muted-foreground mb-5">
          体重ログと管理者画面
        </p>

        {/* ダッシュボード統計カード */}
        <Card className="mb-4 shadow-md">
          <CardContent className="pt-4 pb-4">
            <p className="text-[11px] font-semibold text-muted-foreground mb-3">
              個人ログ — スナップショット
            </p>
            {/* 2×2 グリッド + カロリー行 */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <StatCell
                label="最新体重"
                value={stats.latest?.weight != null ? `${stats.latest.weight}` : "--"}
                unit="kg"
              />
              <StatCell
                label="前日比"
                value={
                  stats.weightChange == null
                    ? "--"
                    : `${stats.weightChange >= 0 ? "+" : ""}${stats.weightChange.toFixed(1)}`
                }
                unit="kg"
                colorClass={
                  stats.weightChange == null
                    ? "text-foreground"
                    : stats.weightChange > 0.05
                    ? "text-red-500"
                    : stats.weightChange < -0.05
                    ? "text-blue-500"
                    : "text-foreground"
                }
                borderLeft
              />
              <StatCell
                label="7日平均"
                value={stats.weekAvg != null ? stats.weekAvg.toFixed(1) : "--"}
                unit="kg"
              />
              <StatCell
                label="総記録"
                value={stats.totalCount}
                unit="日"
                borderLeft
              />
              <StatCell
                label="直近カロリー"
                value={stats.latest?.calories != null ? stats.latest.calories : "--"}
                unit="kcal"
                colSpan2
              />
            </div>

            {stats.latest && (
              <div className="mt-3 flex justify-between items-center">
                <p className="text-[11px] text-muted-foreground">
                  最終記録: {formatDate(stats.latest.date)}
                </p>
                <Badge
                  className={
                    stats.todayRecorded
                      ? "border-transparent bg-green-100 text-green-800"
                      : "border-transparent bg-yellow-100 text-yellow-800"
                  }
                >
                  {stats.todayRecorded ? "今日記録済み" : "今日未記録"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA ボタン */}
        <a href="/solo/" className="block mb-5">
          <Button className="w-full" size="lg">
            今日記録する
          </Button>
        </a>

        {/* ページナビ — 個人記録 */}
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          個人記録
        </p>
        <div className="flex flex-col gap-3 mb-5">
          <NavCard link={soloLink} primary />
        </div>

        {/* ページナビ — その他 */}
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          その他
        </p>
        <div className="flex flex-col gap-3">
          {otherLinks.map((l) => (
            <NavCard key={l.href} link={l} primary={false} />
          ))}
        </div>
      </div>
    </main>
  );
}
