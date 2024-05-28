import {
  noteNumberRegex,
  dateRegex,
  brokerRegex,
  buyTotalRegex,
  sellTotalRegex,
  settlementDateRegex,
  debitCreditRegex,
  netTotalRegex,
  termDaysRegex,
  bradescoDealRegex,
  agoraDealRegex,
  pageNumberRegex,
  alternativeBradescoDealRegex,
  absoluteTotalRegex,
} from "../regex/regexes";
import { checkNote } from "../utils/checkNotes";
import { cleanAssetName } from "../utils/cleanAssetName";
import { groupDeals } from "../utils/groupDeals";
import { transformToIsoDate } from "../utils/transformToIsoDate";

export enum DealType {
  BUY = "buy",
  SELL = "sell",
}

export interface Deal {
  type: DealType;
  asset: string;
  termDays: number | null;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  operationalCost: number;
}

export interface GroupDeal {
  type: DealType;
  asset: string;
  termDays: number | null;
  quantity: number;
  avgUnitPrice: number;
  totalValue: number;
  operationalCost: number;
}

export interface BrokerageNote {
  noteNumber: string;
  absoluteTotal: number;
  netTotal: number;
  buyTotal: number;
  sellTotal: number;
  fees: number;
  date: string;
  settlementDate: string;
  broker: string;
  deals: Deal[];
  groupedDeals: GroupDeal[];
}

export interface DealParserResponseType {
  deals: Deal[];
  groupedDeals: GroupDeal[];
}

export function parseNote(input: string): BrokerageNote {
  const date = transformToIsoDate(dateRegex.exec(input)?.[1]);
  const noteNumber = noteNumberRegex.exec(input)?.[1];
  const pageNumber = Number(pageNumberRegex.exec(input)?.[1]);
  const broker = brokerRegex.exec(input)?.[1].trim();
  const buyTotal = Number(
    buyTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const sellTotal = Number(
    sellTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const settlementDate = transformToIsoDate(
    settlementDateRegex.exec(input)?.[1]
  );
  const debitCreditIndicator = debitCreditRegex.exec(input)?.[1].trim();
  const absoluteTotal = Number(
    absoluteTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const netTotal =
    debitCreditIndicator === "C"
      ? Number(
          netTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
        )
      : -Number(
          netTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
        );
  const fees = Number((sellTotal - buyTotal - netTotal).toFixed(2));

  if (!date || !noteNumber || !broker || !pageNumber) {
    throw new Error("Error parsing brokerage note. Note number: " + noteNumber);
  } else if (
    !netTotal ||
    buyTotal === undefined ||
    sellTotal === undefined ||
    fees === undefined ||
    !settlementDate
  ) {
    console.log(
      `Page overflow at note ${noteNumber}, page ${pageNumber}. Will parse next page for note details.`
    );
    const parsedDeals = broker.startsWith("AGORA")
      ? parseAgoraDeals(input)
      : parseBradescoDeals(input);
    return {
      noteNumber,
      absoluteTotal: 0,
      netTotal: 0,
      buyTotal: 0,
      sellTotal: 0,
      fees: 0,
      date,
      settlementDate: "",
      broker,
      deals: parsedDeals.deals,
      groupedDeals: parsedDeals.groupedDeals,
    };
  }

  let parsedDeals = broker.startsWith("AGORA")
    ? parseAgoraDeals(input)
    : parseBradescoDeals(input);

  let parsedNote = {
    noteNumber,
    absoluteTotal,
    netTotal,
    buyTotal,
    sellTotal,
    fees,
    date,
    settlementDate,
    broker,
    deals: parsedDeals.deals,
    groupedDeals: parsedDeals.groupedDeals,
  };

  if (!checkNote(parsedNote) && broker.startsWith("BRADESCO")) {
    console.error(
      "Error parsing note " + noteNumber + ". Trying alternative regex..."
    );
    parsedDeals = parseAlternativeBradescoDeals(input);
    parsedNote = {
      noteNumber,
      absoluteTotal,
      netTotal,
      buyTotal,
      sellTotal,
      fees,
      date,
      settlementDate,
      broker,
      deals: parsedDeals.deals,
      groupedDeals: parsedDeals.groupedDeals,
    };

    if (!checkNote(parsedNote)) {
      console.error(
        "Error parsing note " + noteNumber + ". Could not parse deals."
      );
    } else {
      console.log(
        "Note " + noteNumber + " parsed successfully with alternative regex."
      );
    }
  }

  return parsedNote;
}

function parseBradescoDeals(input: string): DealParserResponseType {
  const deals: Deal[] = [];
  let deal;
  while ((deal = bradescoDealRegex.exec(input))) {
    const unitPrice = Number(deal[1].replace(".", "").replace(",", "."));
    const totalValue = Number(deal[2].replace(".", "").replace(",", "."));
    const quantity = Number(deal[3].replace(".", ""));
    const asset = deal[4].trim().substring(2);
    const type = deal[5].trim();

    deals.push({
      type: type === "C" ? DealType.BUY : DealType.SELL,
      asset,
      termDays: null,
      quantity,
      unitPrice,
      totalValue,
      operationalCost: 0,
    });
  }

  const groupedDeals = groupDeals(deals);

  return { deals, groupedDeals };
}

function parseAlternativeBradescoDeals(input: string): DealParserResponseType {
  const deals: Deal[] = [];
  let deal;

  while ((deal = alternativeBradescoDealRegex.exec(input))) {
    const unitPrice = Number(deal[1].replace(".", "").replace(",", "."));
    const totalValue = Number(deal[2].replace(".", "").replace(",", "."));
    const quantity = Number(deal[3].replace(".", ""));
    const asset = deal[4].trim().substring(2);
    const type = deal[5].trim();

    deals.push({
      type: type === "C" ? DealType.BUY : DealType.SELL,
      asset,
      termDays: null,
      quantity,
      unitPrice,
      totalValue,
      operationalCost: 0,
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
    const totalValue = Number(deal[2].replace(".", "").replace(",", "."));
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
      termDays: termDeal ? Number(termDays) : null,
      quantity,
      unitPrice,
      totalValue,
      operationalCost: 0,
    });
  }

  const groupedDeals = groupDeals(deals);

  return { deals, groupedDeals };
}


