import React, { useState } from "react";
import { RISK_CATEGORY } from "../../constants/statusStyles.js";
import { Card } from "../ui/Card.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { X, ArrowRight, ShieldAlert } from "lucide-react";
import { Badge } from "../ui/Badge.jsx";

const GRID = [5, 4, 3, 2, 1];

const CAT_COLOR = {
  Critical: "bg-red-500 hover:bg-red-600",
  High:     "bg-orange-400 hover:bg-orange-500",
  Medium:   "bg-amber-300 hover:bg-amber-400",
  Low:      "bg-emerald-300 hover:bg-emerald-400",
};

const CAT_TEXT = {
  Critical: "text-white",
  High:     "text-white",
  Medium:   "text-slate-700",
  Low:      "text-slate-700",
};

export function RiskMatrix({ risks = [], onRiskClick }) {
  const [selectedCell, setSelectedCell] = useState(null); // { l, i, score, cat, risks }

  const cellRisks = (l, i) =>
    risks.filter((r) => Number(r.likelihood) === l && Number(r.impact) === i);

  const handleCellClick = (l, i) => {
    const rs = cellRisks(l, i);
    const score = l * i;
    const cat = RISK_CATEGORY(score);
    setSelectedCell({ l, i, score, cat, risks: rs });
  };

  return (
    <Card className="p-4 relative">
      <SectionTitle sub="Risk Score = Likelihood × Impact (1–5 scale). Click any cell to inspect risks.">
        5×5 Risk Matrix
      </SectionTitle>

      {/* Impact axis label */}
      <div className="flex items-start gap-2">
        {/* Likelihood axis label */}
        <div className="flex flex-col justify-center items-center gap-1 pt-5">
          <span
            className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Likelihood →
          </span>
        </div>

        <div className="flex-1">
          {/* Impact header */}
          <div className="grid grid-cols-6 gap-1 mb-1">
            <div />
            {GRID.map((i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-slate-400">
                I{i}
              </div>
            ))}
          </div>

          {/* Matrix cells */}
          {GRID.map((l) => (
            <div key={l} className="grid grid-cols-6 gap-1 mb-1">
              <div className="flex items-center text-[10px] font-semibold text-slate-400">
                L{l}
              </div>
              {GRID.map((i) => {
                const score = l * i;
                const cat   = RISK_CATEGORY(score);
                const rs    = cellRisks(l, i);
                const isSelected = selectedCell?.l === l && selectedCell?.i === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleCellClick(l, i)}
                    title={`Likelihood ${l} × Impact ${i} = Score ${score} (${cat})${rs.length ? ` — ${rs.length} risk(s)` : ""}`}
                    className={`h-9 rounded ${CAT_COLOR[cat]} ${CAT_TEXT[cat]} flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected ? "ring-2 ring-indigo-600 ring-offset-2 scale-105" : ""
                    } ${rs.length ? "cursor-pointer" : "opacity-85 hover:opacity-100"}`}
                  >
                    {rs.length > 0 ? rs.length : ""}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex gap-3 mt-2 flex-wrap items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              {[["Critical", "bg-red-500"], ["High", "bg-orange-400"], ["Medium", "bg-amber-300"], ["Low", "bg-emerald-300"]].map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className={`w-3 h-3 rounded-sm ${cls} inline-block`} />
                  {label}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-400">Click a cell to drill down</span>
          </div>
        </div>
      </div>

      {/* Interactive Cell Drill-Down Popover Modal */}
      {selectedCell && (
        <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50/70 p-3 rounded-lg fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Matrix Cell: L{selectedCell.l} × I{selectedCell.i} (Score: {selectedCell.score})
              </span>
              <Badge tone={selectedCell.cat}>{selectedCell.cat}</Badge>
              <span className="text-xs text-slate-500 font-medium">
                {selectedCell.risks.length} Risk{selectedCell.risks.length === 1 ? "" : "s"}
              </span>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X size={14} />
            </button>
          </div>

          {selectedCell.risks.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">
              No registered risks in this specific Likelihood / Impact cell.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedCell.risks.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onRiskClick?.(r);
                  }}
                  className="w-full text-left p-2 rounded-md bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span>
                      <span className="text-xs font-semibold text-slate-800 truncate">{r.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Owner: <strong className="text-slate-600">{r.owner}</strong> · Treatment: <span className="text-slate-600">{r.treatment}</span> · Asset: {r.asset}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge tone={r.status === "Closed" ? "Closed" : r.status === "Treatment Overdue" ? "Overdue" : "In Progress"}>
                      {r.status}
                    </Badge>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
