import {
  noteNumberRegex,
  dateRegex,
  holderRegex,
  buyTotalRegex,
  sellTotalRegex,
  settlementDateRegex,
  debitCreditRegex,
  totalRegex,
  termDaysRegex,
  bradescoDealRegex,
  agoraDealRegex,
  pageNumberRegex,
} from "../regex/regexes";
import { cleanAssetName } from "../utils/cleanAssetName";
import { groupDeals } from "../utils/groupDeals";

export enum DealType {
  BUY = "buy",
  SELL = "sell",
}

export interface Deal {
  type: DealType;
  asset: string;
  termDeal: boolean;
  termDays: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface GroupDeal {
  type: DealType;
  asset: string;
  termDeal: boolean;
  termDays: number | null;
  quantity: number;
  avgUnitPrice: number;
  totalPrice: number;
}

export interface BrokerageNote {
  noteNumber: string;
  total: number;
  buyTotal: number;
  sellTotal: number;
  fees: number;
  date: string;
  settlementDate: string;
  holder: string;
  deals: Deal[];
  groupedDeals: GroupDeal[];
}

export interface DealParserResponseType {
  deals: Deal[];
  groupedDeals: GroupDeal[];
}

export function parseNote(input: string): BrokerageNote {
  const date = dateRegex.exec(input)?.[1];
  const noteNumber = noteNumberRegex.exec(input)?.[1];
  const pageNumber = Number(pageNumberRegex.exec(input)?.[1]);
  const holder = holderRegex.exec(input)?.[1].trim();
  const buyTotal = Number(
    buyTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const sellTotal = Number(
    sellTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const settlementDate = settlementDateRegex.exec(input)?.[1];
  const debitCreditIndicator = debitCreditRegex.exec(input)?.[1].trim();
  const total =
    debitCreditIndicator === "C"
      ? Number(totalRegex.exec(input)?.[1].replace(".", "").replace(",", "."))
      : -Number(totalRegex.exec(input)?.[1].replace(".", "").replace(",", "."));
  const fees = Number((sellTotal - buyTotal - total).toFixed(2));

  if (!date || !noteNumber || !holder || !pageNumber) {
    throw new Error("Error parsing brokerage note. Note number: " + noteNumber);
  } else if (
    !total ||
    buyTotal === undefined ||
    sellTotal === undefined ||
    fees === undefined ||
    !settlementDate
  ) {
    console.log(`Page overflow at note ${noteNumber}, page ${pageNumber}`);
    const parsedDeals = holder.startsWith("AGORA")
      ? parseAgoraDeals(input)
      : parseBradescoDeals(input);
    return {
      noteNumber,
      total: 0,
      buyTotal: 0,
      sellTotal: 0,
      fees: 0,
      date,
      settlementDate: "",
      holder,
      deals: parsedDeals.deals,
      groupedDeals: parsedDeals.groupedDeals,
    };
  }

  const parsedDeals = holder.startsWith("AGORA")
    ? parseAgoraDeals(input)
    : parseBradescoDeals(input);

  return {
    noteNumber,
    total,
    buyTotal,
    sellTotal,
    fees,
    date,
    settlementDate,
    holder,
    deals: parsedDeals.deals,
    groupedDeals: parsedDeals.groupedDeals,
  };
}

function parseBradescoDeals(input: string): DealParserResponseType {
  const deals: Deal[] = [];
  let deal;

  while ((deal = bradescoDealRegex.exec(input))) {
    const unitPrice = Number(deal[1].replace(".", "").replace(",", "."));
    const totalPrice = Number(deal[2].replace(".", "").replace(",", "."));
    const quantity = Number(deal[3].replace(".", ""));
    const asset = deal[4].trim().substring(2);
    const type = deal[5].trim();

    deals.push({
      type: type === "C" ? DealType.BUY : DealType.SELL,
      asset,
      termDeal: false,
      termDays: null,
      quantity,
      unitPrice,
      totalPrice,
    });
  }

  const groupedDeals = groupDeals(deals);

  return { deals, groupedDeals };
}

function parseAgoraDeals(input: string): DealParserResponseType {
  const deals: Deal[] = [];
  let deal;

  while ((deal = agoraDealRegex.exec(input))) {
    const unitPrice = Number(deal[1].replace(".", "").replace(",", "."));
    const totalPrice = Number(deal[2].replace(".", "").replace(",", "."));
    const quantity = Number(deal[3].replace(".", ""));
    let asset = deal[4];
    const termDeal = deal[5].trim() === "TERMO";
    let termDays = null;
    if (termDeal) {
      termDays = termDaysRegex.exec(asset)?.[0];
      if (!termDays) {
        throw new Error("Error parsing term days for asset: " + asset);
      }
    }
    asset = cleanAssetName(asset);
    const type = deal[6].trim();

    deals.push({
      type: type === "C" ? DealType.BUY : DealType.SELL,
      asset,
      termDeal,
      termDays: termDeal ? Number(termDays) : null,
      quantity,
      unitPrice,
      totalPrice,
    });
  }

  const groupedDeals = groupDeals(deals);

  return { deals, groupedDeals };
}
