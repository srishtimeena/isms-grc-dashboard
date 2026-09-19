import { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { fmtDate } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";
import { Btn } from "./Btn.jsx";
import { inputCls } from "./Field.jsx";

/**
 * CommentsSection — Universal threaded collaboration component
 * Embedded into Policy, Control, Finding, Risk, Evidence, and Action slide-overs.
 */
export function CommentsSection({ comments = [], onAddComment, title = "Comments & Collaboration" }) {
  const { currentUser, role } = useApp();
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    onAddComment(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-indigo-600" />
          <span>{title}</span>
        </h4>
        <span className="text-[11px] font-medium text-slate-400">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Existing Comments List */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center bg-slate-50/70 rounded-md border border-dashed border-slate-200">
            No comments yet. Start a discussion or add review notes below.
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px]">
                    {c.user?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                  <span>{c.user}</span>
                  {c.role && (
                    <span className="text-[10px] font-normal text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {c.role}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[10px] font-mono">{fmtDate(c.timestamp)}</span>
              </div>
              <p className="text-slate-700 pl-6 leading-relaxed whitespace-pre-wrap">{c.text}</p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add a comment as ${currentUser?.name || role}...`}
            className={`${inputCls} resize-none text-xs`}
          />
        </div>
        <div className="flex justify-end">
          <Btn size="sm" type="submit" disabled={!text.trim()}>
            <Send size={12} />
            <span>Post Comment</span>
          </Btn>
        </div>
      </form>
    </div>
  );
}
