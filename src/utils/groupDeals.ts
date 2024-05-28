import { Deal, GroupDeal } from "../notes/note-parser";

export function groupDeals(deals: Deal[]): GroupDeal[] {
  const grouped: { [key: string]: GroupDeal } = {};

  deals.forEach((deal) => {
    const key = `${deal.asset}-${deal.type}-${deal.termDays}`;

    if (!grouped[key]) {
      grouped[key] = {
        asset: deal.asset,
        type: deal.type,
        termDays: deal.termDays,
        quantity: 0,
        avgUnitPrice: 0,
        totalValue: 0,
        operationalCost: 0,
      };
    }

    grouped[key].quantity += deal.quantity;
    grouped[key].totalValue += deal.totalValue;
    grouped[key].avgUnitPrice = grouped[key].totalValue / grouped[key].quantity;
    grouped[key].operationalCost += deal.operationalCost;
  });

  Object.values(grouped).forEach((group) => {
    group.avgUnitPrice = Number(group.avgUnitPrice.toFixed(2));
    group.totalValue = Number(group.totalValue.toFixed(2));
    group.operationalCost = Number(group.operationalCost.toFixed(2));
  });

  return Object.values(grouped);
}
