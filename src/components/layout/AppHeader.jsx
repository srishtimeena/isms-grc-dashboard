import { useState, useRef, useEffect } from "react";
import { ChevronRight, RefreshCw, Search, Shield, User, Play, Sparkles, ChevronDown } from "lucide-react";
import { ROLES, DEMO_PERSONAS, VIVA_SCENARIOS, ROLE_INFO } from "../../constants/permissions.js";
import { NAV_GROUPS } from "./Sidebar.jsx";
import { NotificationCenter } from "./NotificationCenter.jsx";
import { useApp } from "../../context/AppContext.jsx";

/** Build breadcrumb segments from current page */
function getBreadcrumb(page) {
  for (const g of NAV_GROUPS) {
    const item = g.items.find((i) => i.id === page);
    if (item) return [g.group, item.label];
  }
  return ["Platform", page];
}

export function AppHeader({ onOpenSearch }) {
  const { page, role, currentUser, logout, resetData, setPage } = useApp();
  const [section, label] = getBreadcrumb(page);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);
  const scenarioMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setIsRoleMenuOpen(false);
      }
      if (scenarioMenuRef.current && !scenarioMenuRef.current.contains(e.target)) {
        setIsScenarioMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const roleMeta = ROLE_INFO[role] || {
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 gap-3 select-none">
      {/* Left: Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-slate-400 font-medium text-xs truncate hidden sm:inline">{section}</span>
        <ChevronRight size={13} className="text-slate-300 shrink-0 hidden sm:inline" />
        <span className="text-slate-900 font-bold text-sm truncate">{label}</span>
      </nav>

      {/* Center: Universal Search Button */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xs transition-colors w-64 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search size={14} className="text-slate-400" />
          <span>Search ISO controls, policies...</span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions, Notifications & Demo Persona */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Search"
        >
          <Search size={16} />
        </button>


        {/* Notifications */}
        <NotificationCenter />

        {/* Active Persona & User Menu */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 sm:pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            title="User Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.initials || currentUser?.name?.slice(0, 2).toUpperCase() || "SM"}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser?.name || "Srishti Meena"}
              </div>
              <div className="text-[10px] font-medium text-slate-500 leading-tight truncate max-w-[120px]">
                {role}
              </div>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:inline" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current User Identity</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{currentUser?.name || "Srishti Meena"}</div>
                <div className="text-xs text-slate-500">{currentUser?.dept || "Internal Audit"}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                  <Shield size={11} />
                  <span>{role}</span>
                </div>
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-between"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Factory Reset */}
        <button
          onClick={resetData}
          title="Reset to initial factory demo seed"
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md p-1.5 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
}
