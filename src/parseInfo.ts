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
} from "./src/regex/regexes";

interface Deal {
  type: string;
  code: string;
  quantity: number;
  average: number;
  price: number;
}

interface BrokerageNote {
  noteNumber: string | undefined;
  buyTotal: number;
  sellTotal: number;
  fees: number;
  date: string | undefined;
  liquidationDate: string | undefined;
  holder: string | undefined;
  // deals: Deal[];
}

function parseNotes(input: string): any {
  const notes: BrokerageNote[] = [];
  // Extracting the brokerage notes
  const date = dateRegex.exec(input)?.[1] ?? "";
  const noteNumber = noteNumberRegex.exec(input)?.[1] ?? "";
  const holder = holderRegex.exec(input)?.[1].trim() ?? "";
  const buyTotal = parseFloat(
    buyTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".") ?? "0"
  );
  const sellTotal = parseFloat(
    sellTotalRegex.exec(input)?.[1].replace(".", "").replace(",", ".") ?? "0"
  );
  const liquidationDate = liquidationDateRegex.exec(input)?.[1] ?? "";
  const debitCreditIndicator = debitCreditRegex.exec(input)?.[1].trim();
  const total =
    debitCreditIndicator === "C"
      ? parseFloat(
          totalRegex.exec(input)?.[1].replace(".", "").replace(",", ".") ?? "0"
        )
      : -parseFloat(
          totalRegex.exec(input)?.[1].replace(".", "").replace(",", ".") ?? "0"
        );
  const fees = sellTotal - buyTotal - total;

  notes.push({
    noteNumber,
    buyTotal,
    sellTotal,
    fees,
    date,
    liquidationDate,
    holder,
  });

  return notes;
}

function parseDeals(input: string): any {
  const deals: Deal[] = [];
}

function saveToJson(notes: BrokerageNote[], filePath: string) {
  fs.writeFileSync(filePath, JSON.stringify(notes), "utf-8");
}

const input = `
NOTA DE CORRETAGEM
Data pregãoFolhaNr.Nota
25/08/20151280403
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
Agente de CompensaçãoC.I.ValorClienteCustodiante
N- C0,00-
P. VincComplemento nomeAdministradorAcionistaConta correnteAgênciaBanco
N1378551217237
Negócios realizados
QD/CValor Operação / AjustePreço / AjusteQuantidadeObs. (*)Especificação do títuloPrazoTipo mercadoC/VNegociação
23,27D721,3731PN      N1BRADESCOFRACIONARIOC1-BOVESPA
23,30D629,1027PN      N1BRADESCOFRACIONARIOC1-BOVESPA
26,50D1.431,0054PN      N1ITAUUNIBANCOFRACIONARIOC1-BOVESPA
7,98D470,8259PNPETROBRASFRACIONARIOC1-BOVESPA
23,30D18.640,00800PN      N1BRADESCOVISTAC1-BOVESPA
26,50D18.550,00700PN      N1ITAUUNIBANCOVISTAC1-BOVESPA
7,98D29.526,003.700PNPETROBRASVISTAC1-BOVESPA
Resumo dos NegóciosResumo FinanceiroD/C
0,00DebênturesClearing
0,00Vendas à vistaD69.968,29Valor líquido das operações
69.968,29Compras à vistaD19,24Taxa de liquidação
0,00Opções - comprasD0,00Taxa de Registro
0,00Opções - vendasD69.987,53Total  CBLC
0,00Operações à termoBolsa
0,00Valor das oper. c/ títulos públ. (v. nom.)D0,00Taxa de termo/opções
69.968,29Valor das operaçõesD0,00Taxa A.N.A.
D3,49Emolumentos
3,49 DTotal Bovespa / Soma
Especificações diversasCorretagem / Despesas
CorretagemD139,94
A coluna Q indica liquidação no Agente do Qualificado.
D0,00Outras
139,94DTotal corretagem / Despesas
T - Liquidação pelo BrutoA - Posição Futuro(*) - Observações:Líquido para  28/08/201570.130,96 D
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
saveToJson(parsedNotes, "transaction.json");

console.log("JSON file created successfully.");
