import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const categories = ["バグ報告", "機能要望", "その他"];

export default function FeedbackPage() {
  const [category, setCategory] = useState(categories[0]);

  return (
    <main className="container max-w-xl py-8">
      <header className="mb-6">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← ホーム
        </a>
        <h1 className="mt-2 text-2xl font-black tracking-tight">意見箱</h1>
        <p className="text-muted-foreground">意見・要望を送る画面（v2 土台）</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>意見を送る</CardTitle>
          <CardDescription>カテゴリを選び、メッセージを入力してください。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">
              カテゴリ
            </label>
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="w-full">
                {categories.map((c) => (
                  <TabsTrigger key={c} value={c} className="flex-1">
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">
              送信者名（任意）
            </label>
            <Input placeholder="名前" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground">
              メッセージ
            </label>
            <Textarea
              className="min-h-24"
              placeholder="ご意見・ご要望を入力してください"
            />
          </div>

          <Button className="w-full">送信する</Button>
        </CardContent>
      </Card>
    </main>
  );
}
