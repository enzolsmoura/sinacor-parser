import * as fs from "fs";
import {
  noteNumberRegex,
  dateRegex,
  holderRegex,
  buyTotalRegex,
  sellTotalRegex,
  liquidationDateRegex,
  debitCreditRegex,
  totalRegex,
  dealRegex,
} from "./regex/regexes";
import { parse } from "path";

enum DealType {
  BUY = "buy",
  SELL = "sell",
}

interface Deal {
  type: DealType;
  asset: string;
  quantity: number;
  avgUnitPrice: number;
  totalPrice: number;
}

interface BrokerageNote {
  noteNumber: string;
  total: number;
  buyTotal: number;
  sellTotal: number;
  fees: number;
  date: string;
  liquidationDate: string;
  holder: string;
  deals: Deal[];
}

function parseNotes(input: string): BrokerageNote[] {
  const notes: BrokerageNote[] = [];
  // Extracting the brokerage notes
  const date = dateRegex.exec(input)?.[1];
  const noteNumber = noteNumberRegex.exec(input)?.[1];
  const holder = holderRegex.exec(input)?.[1].trim();
  const buyTotal = Number(
    buyTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const sellTotal = Number(
    sellTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".")
  );
  const liquidationDate = liquidationDateRegex.exec(input)?.[1];
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
    !liquidationDate ||
    !debitCreditIndicator ||
    !total?.toString()
  ) {
    throw new Error("Error parsing brokerage note. Note number: " + noteNumber);
  }

  const deals = parseDeals(input);

  notes.push({
    noteNumber,
    total,
    buyTotal,
    sellTotal,
    fees,
    date,
    liquidationDate,
    holder,
    deals,
  });

  return notes;
}

function parseDeals(input: string): Deal[] {
  const deals: Deal[] = [];
  let deal;
  while ((deal = dealRegex.exec(input))) {
    const unitPrice = Number(deal[1].replace(".", "").replace(",", "."));
    const totalPrice = Number(deal[2].replace(".", "").replace(",", "."));
    const quantity = Number(deal[3].replace(".", ""));
    const asset = deal[4].trim().substring(2);
    const type = deal[5].trim();
    deals.push({
      type: type === "C" ? DealType.BUY : DealType.SELL,
      asset,
      quantity,
      avgUnitPrice: unitPrice,
      totalPrice,
    });
  }

  const reducedDeals = deals.reduce((acc, deal) => {
    if (acc[deal.asset] && acc[deal.asset].type === deal.type) {
      acc[deal.asset].quantity += deal.quantity;
      acc[deal.asset].totalPrice += deal.totalPrice;
    } else {
      acc[deal.asset] = {
        asset: deal.asset,
        type: deal.type,
        quantity: deal.quantity,
        totalPrice: deal.totalPrice,
        avgUnitPrice: 0,
      };
    }
    return acc;
  }, {} as { [key: string]: Deal });

  const groupedDeals = Object.values(reducedDeals);
  groupedDeals.forEach((deal) => {
    deal.totalPrice = Number(deal.totalPrice.toFixed(2));
    deal.avgUnitPrice = Number((deal.totalPrice / deal.quantity).toFixed(2));
  });

  return groupedDeals;
}

function saveToJson(notes: BrokerageNote[], filePath: string) {
  fs.writeFileSync(filePath, JSON.stringify(notes), "utf-8");
}

const input = `


NOTA DE CORRETAGEM
Data pregãoFolhaNr.Nota
19/09/20171412079
BRADESCO S/A CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS 
01310-917 SAO PAULO - SPAV. PAULISTA, 1450, 1450 - 7ºANDARBELA VISTA
Tel.  4020-1414  
e-mail :www.bradescocorretora.com.brInternet :
C.N.P.J.: 61.855.045/0001-32Carta Patente: A-67/801
e-mail ouvidoria:Tel. 0800727-9933Ouvidoria :
 
C.P.F./C.N.P.J./C.V.M./C.O.B.Cliente
029.256.683-21MARCUS PINTO ROLA FILHO3000366685-
 AssessorCódigo clienteR DR EDUARDO DE SOUZA ARANHA, 255 - AP 150   VL NOVA CONCEICAO
(011) 98932-427710553-3666858-7204543-120  SAO PAULO - SP 
Participante destino do repasseC.I.ValorClienteCustodiante
N- C0,00
P. VincComplemento nomeAdministradorAcionistaConta correnteAgênciaBanco
N1378551217237
Negócios realizados
QD/CValor Operação / AjustePreço / AjusteQuantidadeObs. (*)Especificação do títuloPrazoTipo mercadoC/VNegociação
46,32D2.177,0447ON      NMBRF S.A.01/00FRACIONARIOC1-BOVESPA
10,68D85,448ON      NMINTERNATIONA01/00FRACIONARIOC1-BOVESPA
10,60D773,8073ON      NMRUMO S.A.01/00FRACIONARIOC1-BOVESPA
29,65D29.650,001.000PN      N2AZUL S.A.01/00VISTAC1-BOVESPA
46,32D27.792,00600ON      NMBRF S.A.01/00VISTAC1-BOVESPA
10,67D13.871,001.300ON      NMINTERNATIONA01/00VISTAC1-BOVESPA
10,68D16.020,001.500ON      NMINTERNATIONA01/00VISTAC1-BOVESPA
10,60D39.220,003.700ON      NMRUMO S.A.01/00VISTAC1-BOVESPA
Resumo dos NegóciosResumo FinanceiroD/C
0,00DebênturesClearing
0,00Vendas à vistaD129.589,28Valor líquido das operações
129.589,28Compras à vistaD35,63Taxa de liquidação
0,00Opções - comprasD0,00Taxa de Registro
0,00Opções - vendasD129.624,91Total  CBLC
0,00Operações à termoBolsa
0,00Valor das oper. c/ títulos públ. (v. nom.)D0,00Taxa de termo/opções
129.589,28Valor das operaçõesD0,00Taxa A.N.A.
D6,47Emolumentos
6,47 DTotal Bovespa / Soma
Especificações diversasCorretagem / Despesas
ClearingD194,38
Execução0,00 DA coluna Q indica liquidação no Agente do Qualificado.
0,00Execução casaD
D0,00Outras
194,38DTotal corretagem / Despesas
T - Liquidação pelo BrutoA - Posição Futuro(*) - Observações:Líquido para  22/09/2017129.825,76 D
I - POPObservação:  (1) As operações a termo não são computadas no líquido da faturaC - Clubes e Fundos de Ações 2 - Corretora ou pessoa vinculada atuou na contra parte.
P - Carteira Própria # - Negócio direto
H - Home Broker 8 - Liquidação Institucional.
X - Box D - Day-Trade
Y - Desmanche de Box F - Cobertura________________________________________________________________________________________________
L - Precatório B - DebênturesBRADESCO S/A CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS 
Obs: Sobre a taxa de corretagem são aplicados os seguintes impostos: ISS, PIS e COFINS, no total de 9,65%, previstos na Lei nº 12.741, de 8/12/2012. Esse valor está consolidado acima com a descrição ISS (SÃO PAULO).
orrlnota.qrp



`;

const parsedNotes = parseNotes(input);
saveToJson(parsedNotes, "./src/assets/json/transaction_bradesco.json");

console.log("JSON file created successfully.");
