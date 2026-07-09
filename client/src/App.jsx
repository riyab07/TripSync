import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import { useLocation } from "react-router-dom";
import TripDetail from "./pages/TripDetail";
import PublicProfile from "./pages/PublicProfile";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const noSidebar = ["/", "/login"];
  const showSidebar = !noSidebar.includes(location.pathname);

  return showSidebar ? (
    <Layout>
      <Routes>
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
        <Route path="/user/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
      </Routes>
    </Layout>
  ) : (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
export default App;