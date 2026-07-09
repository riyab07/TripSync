import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const links = [
    { to: "/trips", label: "My Trips", icon: "🗺️" },
    { to: "/explore", label: "Explore", icon: "🌍" },
    { to: "/feed", label: "Feed", icon: "📸" },
    { to: "/profile", label: "Profile", icon: "👤" },
    { to: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div
      className={`min-h-screen bg-white shadow-md flex flex-col justify-between sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16 p-3" : "w-60 p-5"
      }`}
    >
      <div>
        {/* Toggle + Logo */}
        <div className={`flex items-center mb-8 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <h2 className="text-xl font-bold text-indigo-600">TripSync ✈️</h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-indigo-600 transition text-lg"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              title={link.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="text-lg">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div>
        {!collapsed && (
          <p className="mb-2 px-1 text-sm font-medium text-gray-700 truncate">
            👋 {user || "Traveler"}
          </p>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span>🚪</span>
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;