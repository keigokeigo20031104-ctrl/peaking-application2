import HomePage from "@/pages/HomePage";
import TrackerPage from "@/pages/TrackerPage";
import SoloPage from "@/pages/SoloPage";
import AdminPage from "@/pages/AdminPage";
import FeedbackPage from "@/pages/FeedbackPage";

// React Router は使わず、location.pathname で出し分ける（v2 土台）
function resolvePage(pathname) {
  // 末尾スラッシュを正規化（/tracker と /tracker/ を同一視）
  const path = pathname.replace(/\/+$/, "") || "/";
  switch (path) {
    case "/tracker":
      return <TrackerPage />;
    case "/solo":
      return <SoloPage />;
    case "/admin":
      return <AdminPage />;
    case "/feedback":
      return <FeedbackPage />;
    case "/":
      return <HomePage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {resolvePage(window.location.pathname)}
    </div>
  );
}
