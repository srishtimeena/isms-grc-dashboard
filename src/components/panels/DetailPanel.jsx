import { FindingPanel } from "./FindingPanel.jsx";
import { RiskPanel } from "./RiskPanel.jsx";
import { ActionPanel } from "./ActionPanel.jsx";
import { TicketPanel } from "./TicketPanel.jsx";
import { PolicyPanel } from "./PolicyPanel.jsx";
import { EvidencePanel } from "./EvidencePanel.jsx";

/** Routes panel.type to the correct detail panel component */
export function DetailPanel({ panel, onClose }) {
  if (!panel) return null;
  if (panel.type === "finding") return <FindingPanel id={panel.id} onClose={onClose} />;
  if (panel.type === "risk") return <RiskPanel id={panel.id} onClose={onClose} />;
  if (panel.type === "action") return <ActionPanel id={panel.id} onClose={onClose} />;
  if (panel.type === "ticket") return <TicketPanel id={panel.id} onClose={onClose} />;
  if (panel.type === "policy") return <PolicyPanel id={panel.id} onClose={onClose} />;
  if (panel.type === "evidence") return <EvidencePanel id={panel.id} onClose={onClose} />;
  return null;
}
