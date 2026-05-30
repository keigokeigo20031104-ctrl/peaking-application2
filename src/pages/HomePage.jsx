import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/tracker/", title: "入力者側へ", desc: "記録を管理者へ送信するチーム向け画面" },
  { href: "/solo/", title: "個人側へ", desc: "個人でローカルに記録する画面" },
  { href: "/admin/", title: "管理者画面へ", desc: "サーバー取得した記録を確認する画面" },
  { href: "/feedback/", title: "意見箱へ", desc: "意見・要望を送る画面" },
];

export default function HomePage() {
  return (
    <main className="container max-w-3xl py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Peaking Application v2</h1>
        <p className="mt-2 text-muted-foreground">
          体重管理アプリ v2（React + Vite + Tailwind + shadcn/ui の土台）
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <Card key={l.href}>
            <CardHeader>
              <CardTitle>{l.title}</CardTitle>
              <CardDescription>{l.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={l.href}>{l.title}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
