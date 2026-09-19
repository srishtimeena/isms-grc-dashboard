import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink, AlertCircle, FileText, CheckCircle2, Clock } from "lucide-react";
import { fmtDate } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead, setPage, openFinding, openRisk, openAction } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications?.filter((n) => !n.read)?.length || 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    markNotificationRead(n.id);
    setIsOpen(false);
    if (n.link?.page) {
      setPage(n.link.page);
      if (n.link.id) {
        if (n.link.page === "findings") openFinding(n.link.id);
        if (n.link.page === "risks") openRisk(n.link.id);
        if (n.link.page === "actions") openAction(n.link.id);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "finding_overdue":
        return <AlertCircle size={14} className="text-red-500 shrink-0" />;
      case "policy_approval":
        return <FileText size={14} className="text-indigo-500 shrink-0" />;
      case "evidence_request":
        return <Clock size={14} className="text-sky-500 shrink-0" />;
      default:
        return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden fade-in">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {(!notifications || notifications.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now. All caught up!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                    !n.read ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-semibold truncate ${!n.read ? "text-slate-900" : "text-slate-700"}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {fmtDate(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
