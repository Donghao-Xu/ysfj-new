import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { BuddhistRealmPage } from "@/pages/BuddhistRealmPage";
import { BuildingDetailPage } from "@/pages/BuildingDetailPage";
import { ClassicsPage } from "@/pages/ClassicsPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { DaoistRealmPage } from "@/pages/DaoistRealmPage";
import { HomePage } from "@/pages/HomePage";
import { MeditationPage } from "@/pages/MeditationPage";
import { MinePage } from "@/pages/MinePage";
import { ParkHomePage } from "@/pages/ParkHomePage";
import { PilgrimagePage } from "@/pages/PilgrimagePage";
import { PlaceDetailPage } from "@/pages/PlaceDetailPage";
import { WorldsPage } from "@/pages/WorldsPage";

const SpatialWalkLabPage = lazy(() =>
  import("@/pages/SpatialWalkLabPage").then((m) => ({
    default: m.SpatialWalkLabPage,
  })),
);

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/worlds" element={<WorldsPage />} />
            <Route path="/worlds/buddhist" element={<BuddhistRealmPage />} />
            <Route path="/worlds/daoist" element={<DaoistRealmPage />} />
            <Route path="/classics" element={<ClassicsPage />} />
            <Route path="/meditation" element={<MeditationPage />} />
            <Route path="/chanting" element={<MeditationPage />} />
            <Route path="/pilgrimage" element={<PilgrimagePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/parks/buildings/:id"
              element={<BuildingDetailPage />}
            />
            <Route path="/parks/:slug" element={<ParkHomePage />} />
            <Route path="/places/:slug" element={<PlaceDetailPage />} />
            <Route
              path="/spatial-lab"
              element={
                <Suspense
                  fallback={
                    <div className="flex min-h-screen items-center justify-center bg-[#14110f] text-xs text-[#e5c17c]">
                      正在加载 3DGS 空间漫游实验室…
                    </div>
                  }
                >
                  <SpatialWalkLabPage />
                </Suspense>
              }
            />
            <Route path="/sign-in" element={<AuthPage mode="sign-in" />} />
            <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
