import { useMemo } from "react";
import { CONTROLS, ANNEX_A, CLAUSES } from "../constants/iso27001.js";

/**
 * Compute compliance statistics from the assessments object.
 * All calculations are derived from live data — never hard-coded.
 *
 * Score formula:
 *   percent = (compliant × 100 + partial × 50) / (assessed-applicable × 100) × 100
 *
 * Not Applicable and Not Assessed controls are excluded from the score.
 */
export function useCompliance(assessments) {
  return useMemo(() => {
    /** Aggregate compliance counts for a list of controls/clauses */
    const byGroup = (list) => {
      let compliant = 0, partial = 0, nonCompliant = 0, na = 0, notAssessed = 0;
      list.forEach((c) => {
        const a = assessments[c.id];
        if (!a)                              notAssessed++;
        else if (a.status === "Compliant")           compliant++;
        else if (a.status === "Partially Compliant") partial++;
        else if (a.status === "Non-Compliant")       nonCompliant++;
        else if (a.status === "Not Applicable")      na++;
      });
      const applicable = list.length - na;
      const assessed   = compliant + partial + nonCompliant;
      const percent    = assessed > 0
        ? ((compliant * 100 + partial * 50) / (assessed * 100)) * 100
        : 0;
      return { total: list.length, compliant, partial, nonCompliant, na, notAssessed, applicable, assessed, percent };
    };

    const overall       = byGroup(CONTROLS);
    const clauseOverall = byGroup(CLAUSES);

    const byDomain = ANNEX_A.map(([domain, name, items]) => ({
      domain,
      name,
      ...byGroup(items.map(([id]) => ({ id }))),
    }));

    const byClauseGroup = ["4", "5", "6", "7", "8", "9", "10"].map((clause) => ({
      clause,
      ...byGroup(CLAUSES.filter((c) => c.clause === clause)),
    }));

    /** Bottom 8 assessed controls by score (excluding N/A) */
    const lowest = CONTROLS
      .filter((c) => assessments[c.id] && assessments[c.id].status !== "Not Applicable")
      .map((c) => ({ ...c, score: assessments[c.id].score ?? 0 }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 8);

    return { overall, clauseOverall, byDomain, byClauseGroup, lowest };
  }, [assessments]);
}
