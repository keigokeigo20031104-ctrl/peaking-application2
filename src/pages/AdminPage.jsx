import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <main className="container max-w-3xl py-8">
      <header className="mb-6">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← ホーム
        </a>
        <h1 className="mt-2 text-2xl font-black tracking-tight">管理者画面</h1>
        <p className="text-muted-foreground">記録・サーバー状態を確認する画面（v2 土台）</p>
      </header>

      <Tabs defaultValue="home">
        <TabsList className="w-full">
          <TabsTrigger value="home" className="flex-1">
            ホーム
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-1">
            記録
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今日の管理状況</CardTitle>
              <CardDescription>取得済み記録・入力者・未読意見などの概況。</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["取得済み記録", "0"],
                ["入力者", "0"],
                ["未読意見", "0"],
                ["お知らせ", "0"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border bg-secondary/40 p-3 text-center"
                >
                  <div className="text-xs font-semibold text-muted-foreground">
                    {label}
                  </div>
                  <div className="text-2xl font-black tabular-nums">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>サーバーデータ状態</CardTitle>
              <CardDescription>自動取得の状態と取得データの操作。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                最終取得：-- ／ 今回取得：0件 ／ 状態：--
              </p>
              <div className="flex flex-wrap gap-2">
                <Button>取得データをコピー</Button>
                <Button variant="secondary">再取得</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AIからのフィードバック</CardTitle>
              <CardDescription>記録や意見をもとに確認すべき点を表示します。</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                データ未取得です。（v2 で実装予定）
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              記録一覧はまだ実装されていません。（v2 で移植予定）
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
