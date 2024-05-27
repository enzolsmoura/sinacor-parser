import { writeFile } from "../files/file-handler";
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
} from "../regex/regexes";
import { cleanAssetName } from "../utils/cleanAssetName";

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

  if (
    !date ||
    !noteNumber ||
    !holder ||
    !buyTotal?.toString() ||
    !sellTotal?.toString() ||
    !settlementDate ||
    !debitCreditIndicator ||
    !total?.toString()
  ) {
    throw new Error("Error parsing brokerage note. Note number: " + noteNumber);
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

  const reducedDeals = deals.reduce((acc, deal) => {
    if (
      acc[deal.asset] &&
      acc[deal.asset].type === deal.type &&
      acc[deal.asset].termDeal === deal.termDeal
    ) {
      acc[deal.asset].quantity += deal.quantity;
      acc[deal.asset].totalPrice += deal.totalPrice;
    } else {
      acc[deal.asset] = {
        asset: deal.asset,
        type: deal.type,
        termDeal: deal.termDeal,
        termDays: deal.termDays,
        quantity: deal.quantity,
        avgUnitPrice: deal.unitPrice,
        totalPrice: deal.totalPrice,
      };
    }
    return acc;
  }, {} as { [key: string]: GroupDeal });

  const groupedDeals = Object.values(reducedDeals);
  groupedDeals.forEach((deal) => {
    deal.totalPrice = Number(deal.totalPrice.toFixed(2));
    deal.avgUnitPrice = Number((deal.totalPrice / deal.quantity).toFixed(2));
  });

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

  const reducedDeals = deals.reduce((acc, deal) => {
    if (
      acc[deal.asset] &&
      acc[deal.asset].type === deal.type &&
      acc[deal.asset].termDeal === deal.termDeal
    ) {
      acc[deal.asset].quantity += deal.quantity;
      acc[deal.asset].totalPrice += deal.totalPrice;
    } else {
      acc[deal.asset] = {
        asset: deal.asset,
        type: deal.type,
        termDeal: deal.termDeal,
        termDays: deal.termDays,
        quantity: deal.quantity,
        avgUnitPrice: deal.unitPrice,
        totalPrice: deal.totalPrice,
      };
    }
    return acc;
  }, {} as { [key: string]: GroupDeal });

  const groupedDeals = Object.values(reducedDeals);
  groupedDeals.forEach((deal) => {
    deal.totalPrice = Number(deal.totalPrice.toFixed(2));
    deal.avgUnitPrice = Number((deal.totalPrice / deal.quantity).toFixed(2));
  });

  return { deals, groupedDeals };
}

const input = `



NOTA DE CORRETAGEM
Data pregãoFolhaNr.Nota
02/05/2022111026889
AGORA CORRETORA DE TITULOS E VALORES MOBILIARIOS S/A
04538-132 SÃO PAULO - SPAV. BRIGADEIRO FARIA LIMA, 3950 - 4º ANDARITAIM BIBI
Tel. (55 11) 40004-8282  
atendimento@agoraivestimentos.com.bre-mail :www.agorainvestimentos.com.brInternet :
C.N.P.J.: 74.014.747/0001-35Carta Patente: A-39
e-mail ouvidoria:Tel. Ouvidoria :
 
C.P.F./C.N.P.J./C.V.M./C.O.B.Cliente
029.256.683-21MARCUS PINTO ROLA FILHO3005406730-
 AssessorCódigo clienteDOUTOR EDUARDO DE SOUZA ARANHA, 255 - AP 150   VILA NOVA CONCEICA
 70023-54067306-3904543-120  SAO PAULO - SP 
Participante destino do repasseC.I.ValorClienteCustodiante
N- C0,00
P. VincComplemento nomeAdministradorAcionistaConta correnteAgênciaBanco
N00137855 01233-PRIVATE BANK237
Negócios realizados
QD/CValor Operação / AjustePreço / AjusteQuantidadeObs. (*)Especificação do títuloPrazoTipo mercadoC/VNegociação
#20,63D37.897,311.837PN      N2AZUL   60TERMOCBOVESPA
#20,64D13.684,32663PN      N2AZUL   60TERMOCBOVESPA
#15,01D7.264,84484UNT     N2BANCO INTER   60TERMOCBOVESPA
#15,02D24.272,321.616UNT     N2BANCO INTER   60TERMOCBOVESPA
#7,14D17.071,742.391ON      NMLOCAWEB   60TERMOCBOVESPA
#7,15D13.649,351.909ON      NMLOCAWEB   60TERMOCBOVESPA
#2,29D1.964,82858ON      NMLOJAS MARISA   60TERMOCBOVESPA
#2,30D28.846,6012.542ON      NMLOJAS MARISA   60TERMOCBOVESPA
#51,52D30.808,96598ON      NMSUZANO S.A.   60TERMOCBOVESPA
#51,53D103,062ON      NMSUZANO S.A.   60TERMOCBOVESPA
#11,39D17.996,201.580PNA ED  N1USIMINAS   60TERMOCBOVESPA
#11,40D12.768,001.120PNA ED  N1USIMINAS   60TERMOCBOVESPA
#13,74D16.323,121.188ON      NMVAMOS   60TERMOCBOVESPA
#13,75D15.290,001.112ON      NMVAMOS   60TERMOCBOVESPA
Resumo dos NegóciosResumo FinanceiroD/C
0,00DebênturesClearing
0,00Vendas à vistaC0,00Valor líquido das operações
0,00Compras à vistaD65,43Taxa de liquidação
0,00Opções - comprasD46,39Taxa de Registro
0,00Opções - vendasD111,82Total  CBLC
237.940,64Operações à termoBolsa
0,00Valor das oper. c/ títulos públ. (v. nom.)D0,00Taxa de termo/opções
237.940,64Valor das operaçõesD0,00Taxa A.N.A.
D42,82Emolumentos
42,82 DTotal Bovespa / Soma
Especificações diversasCorretagem / Despesas
ClearingD1.214,91
Execução0,00 DA coluna Q indica liquidação no Agente do Qualificado.
0,00Execução casaD
D117,23ISS  (  SAO PAULO  )
D0,00Outras
1.332,14DTotal corretagem / Despesas
T - Liquidação pelo BrutoA - Posição Futuro(*) - Observações:Líquido para  04/05/20221.486,78 D
I - POPObservação:  (1) As operações a termo não são computadas no líquido da faturaC - Clubes e Fundos de Ações 2 - Corretora ou pessoa vinculada atuou na contra parte.
P - Carteira Própria # - Negócio direto
H - Home Broker 8 - Liquidação Institucional.
X - Box D - Day-Trade
Y - Desmanche de Box F - Cobertura________________________________________________________________________________________________
L - Precatório B - DebênturesAGORA CORRETORA DE TITULOS E VALORES MOBILIARIOS S/A
Obs: Sobre a taxa de corretagem são aplicados os seguintes impostos: ISS, PIS e COFINS, no total de 9,65%, previstos na Lei nº 12.741, de 8/12/2012. Esse valor está consolidado acima com a descrição ISS (SÃO PAULO).
orrlnota.qrp
`;

const parsedNotes = parseNote(input);
writeFile(
  "./src/assets/json/transaction_agora-37.json",
  JSON.stringify(parsedNotes)
);

console.log("JSON file created successfully.");
