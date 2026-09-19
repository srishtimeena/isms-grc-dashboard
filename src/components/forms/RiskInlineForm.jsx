import { useState } from "react";
import { Field, inputCls } from "../ui/Field.jsx";
import { Btn } from "../ui/Btn.jsx";
import { RISK_CATEGORY } from "../../constants/statusStyles.js";
import { daysFromNow } from "../../utils/date.js";
import { useApp } from "../../context/AppContext.jsx";

export function RiskInlineForm({ finding, onDone }) {
  const { createRisk } = useApp();
  const [r, setR] = useState({
    title: finding.title,
    description: finding.risk || finding.description,
    asset: "",
    threat: "",
    vulnerability: "",
    likelihood: 3,
    impact: 3,
    existingControls: "",
    owner: finding.owner,
    targetDate: daysFromNow(30),
  });

  const set = (k, v) => setR((prev) => ({ ...prev, [k]: v }));
  const score = Number(r.likelihood) * Number(r.impact);
  const isValid = r.title.trim() && r.asset.trim();

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
      <div className="text-xs font-semibold text-slate-600 mb-2">Convert to Risk</div>

      <Field label="Risk title" required>
        <input className={inputCls} value={r.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="Asset at risk" required>
        <input className={inputCls} value={r.asset} onChange={(e) => set("asset", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Threat">
          <input className={inputCls} value={r.threat} onChange={(e) => set("threat", e.target.value)} />
        </Field>
        <Field label="Vulnerability">
          <input className={inputCls} value={r.vulnerability} onChange={(e) => set("vulnerability", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Likelihood (1–5)">
          <input type="number" min={1} max={5} className={inputCls} value={r.likelihood}
            onChange={(e) => set("likelihood", Number(e.target.value))} />
        </Field>
        <Field label="Impact (1–5)">
          <input type="number" min={1} max={5} className={inputCls} value={r.impact}
            onChange={(e) => set("impact", Number(e.target.value))} />
        </Field>
      </div>

      <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded px-2.5 py-1.5">
        Risk score: <strong className="text-slate-800">{score}</strong>{" "}
        <span className={`font-medium ${score >= 20 ? "text-red-600" : score >= 12 ? "text-orange-600" : score >= 6 ? "text-amber-600" : "text-emerald-600"}`}>
          ({RISK_CATEGORY(score)})
        </span>
      </div>

      <Field label="Existing controls">
        <input className={inputCls} value={r.existingControls} onChange={(e) => set("existingControls", e.target.value)} />
      </Field>

      <Field label="Risk owner">
        <input className={inputCls} value={r.owner} onChange={(e) => set("owner", e.target.value)} />
      </Field>

      <div className="flex gap-2 pt-1">
        <Btn size="sm" disabled={!isValid}
          onClick={() => {
            createRisk({ ...r, findingId: finding.id, controlId: finding.controlId, treatment: "Mitigate", treatmentDetail: "" });
            onDone?.();
          }}>
          Create Risk
        </Btn>
        <Btn size="sm" variant="secondary" onClick={onDone}>Cancel</Btn>
      </div>
    </div>
  );
}
