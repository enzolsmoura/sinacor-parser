import { BrokerageNote } from "../notes/note-parser";

export function checkNote(note: BrokerageNote): boolean {
  const buyTotal = Number(note.deals
    .filter((deal) => deal.type === "buy" && !deal.termDays)
    .reduce((sum, deal) => sum + deal.totalValue, 0).toFixed(2));

  const sellTotal = Number(note.deals
    .filter((deal) => deal.type === "sell" && !deal.termDays)
    .reduce((sum, deal) => sum + deal.totalValue, 0).toFixed(2));

  if (buyTotal !== note.buyTotal || sellTotal !== note.sellTotal) {
    return false;
  }

  return true;
}
