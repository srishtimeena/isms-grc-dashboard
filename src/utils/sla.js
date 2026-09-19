import { NOW, iso } from "./date.js";

/**
 * Calculate SLA status for an ITSM ticket.
 * Uses a static reference time (NOW) for demo consistency.
 *
 * @param {object} ticket
 * @returns {{ due: string, status: "Within SLA"|"At Risk"|"Breached", hoursLeft: number }}
 */
export const ticketSLA = (ticket) => {
  const due = new Date(ticket.createdDate);
  due.setHours(due.getHours() + ticket.slaHours);

  const hoursLeft = (due - NOW) / 3_600_000;
  const isClosed = ticket.status === "Closed" || ticket.status === "Resolved";

  let status = "Within SLA";
  if (hoursLeft < 0) {
    status = "Breached";
  } else if (!isClosed && hoursLeft < ticket.slaHours * 0.2) {
    status = "At Risk";
  }

  return {
    due: iso(due),
    status,
    hoursLeft: Math.round(hoursLeft),
  };
};
