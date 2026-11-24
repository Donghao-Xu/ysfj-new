import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { BuildingDetailPage } from "@/pages/BuildingDetailPage";
import { ChantingPage } from "@/pages/ChantingPage";
import { ClassicsPage } from "@/pages/ClassicsPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { HomePage } from "@/pages/HomePage";
import { MinePage } from "@/pages/MinePage";
import { ParkHomePage } from "@/pages/ParkHomePage";
import { PlaceDetailPage } from "@/pages/PlaceDetailPage";

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/classics" element={<ClassicsPage />} />
            <Route path="/chanting" element={<ChantingPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/parks/buildings/:id"
              element={<BuildingDetailPage />}
            />
            <Route path="/parks/:slug" element={<ParkHomePage />} />
            <Route path="/places/:slug" element={<PlaceDetailPage />} />
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
