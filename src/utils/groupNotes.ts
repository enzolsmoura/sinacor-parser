import { BrokerageNote } from "../notes/note-parser";
import { groupDeals } from "./groupDeals";

export function groupNotes(notes: BrokerageNote[]): BrokerageNote[] {
  const groupedNotes: { [key: string]: BrokerageNote } = {};

  notes.forEach((note) => {
    const noteNumber = note.noteNumber;

    if (!groupedNotes[noteNumber]) {
      groupedNotes[noteNumber] = {
        noteNumber,
        date: note.date,
        broker: note.broker,
        absoluteTotal: 0,
        netTotal: 0,
        buyTotal: 0,
        sellTotal: 0,
        fees: 0,
        settlementDate: "",
        deals: [],
        groupedDeals: [],
      };
    }

    groupedNotes[noteNumber].absoluteTotal += note.absoluteTotal;
    groupedNotes[noteNumber].netTotal += note.netTotal;
    groupedNotes[noteNumber].buyTotal += note.buyTotal;
    groupedNotes[noteNumber].sellTotal += note.sellTotal;
    groupedNotes[noteNumber].fees += note.fees;
    groupedNotes[noteNumber].settlementDate += note.settlementDate;
    groupedNotes[noteNumber].deals = groupedNotes[noteNumber].deals.concat(
      note.deals
    );
    groupedNotes[noteNumber].groupedDeals = groupedNotes[
      noteNumber
    ].groupedDeals.concat(note.groupedDeals);
  });

  // Remove the trailing comma and space from settlementDate
  Object.values(groupedNotes).forEach((group) => {
    group.absoluteTotal = Number(group.absoluteTotal.toFixed(2));
    group.buyTotal = Number(group.buyTotal.toFixed(2));
    group.sellTotal = Number(group.sellTotal.toFixed(2));
    group.netTotal = Number(group.netTotal.toFixed(2));
    group.fees = Number(group.fees.toFixed(2));
    group.groupedDeals = groupDeals(group.deals);
  });

  return Object.values(groupedNotes);
}
