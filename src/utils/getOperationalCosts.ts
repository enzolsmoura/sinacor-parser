import { BrokerageNote } from "../notes/note-parser";

export function writeOperationalCosts(notes: BrokerageNote[]): void {
  notes.forEach((note) => {
    note.deals.forEach((deal) => {
      deal.operationalCost = Number(
        ((deal.totalValue * note.fees) / note.absoluteTotal).toFixed(2)
      );
    });

    note.groupedDeals.forEach((groupedDeal) => {
      groupedDeal.operationalCost = Number(
        ((groupedDeal.totalValue * note.fees) / note.absoluteTotal).toFixed(2)
      );
    });
  });
}
