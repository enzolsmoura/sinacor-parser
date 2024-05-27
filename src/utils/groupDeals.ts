import { Deal, GroupDeal } from "../notes/note-parser";

export function groupDeals(deals: Deal[]): GroupDeal[] {
  const grouped: { [key: string]: GroupDeal } = {};

  deals.forEach((deal) => {
    const key = `${deal.asset}-${deal.type}-${deal.termDeal}-${deal.termDays}`;

    if (!grouped[key]) {
      grouped[key] = {
        asset: deal.asset,
        type: deal.type,
        termDeal: deal.termDeal,
        termDays: deal.termDays,
        quantity: 0,
        avgUnitPrice: 0,
        totalPrice: 0,
      };
    }

    grouped[key].quantity += deal.quantity;
    grouped[key].totalPrice += Number(deal.totalPrice);
    grouped[key].avgUnitPrice = Number(
      (grouped[key].totalPrice / grouped[key].quantity).toFixed(2)
    );
  });

  return Object.values(grouped);
}
