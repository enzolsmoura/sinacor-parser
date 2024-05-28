const dateRegex = /Data pregãoFolhaNr\.Nota\n(\d{2}\/\d{2}\/\d{4})/;
const pageNumberRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}(\d)\d+/;
const noteNumberRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d(\d+)/;
const brokerRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d+\n(.*)/;
const buyTotalRegex = /([\d.,]+)Compras à vista[CD]/;
const sellTotalRegex = /([\d.,]+)Vendas à vista[CD]/;
const settlementDateRegex = /Líquido para\s+(\d{2}\/\d{2}\/\d{4})/;
const netTotalRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}([\d.,]+)/;
const debitCreditRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}[\d.,]+ ([CD])/;
const termDaysRegex = /\W+\d*$/;
const absoluteTotalRegex = /([\d.,]+)Valor das operações[CD]/;

const bradescoDealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[CD](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(.*?)\d{0,2}\/?\d{0,2}(?:FRACIONARIO|VISTA|TERMO)([CV])(?=BOVESPA|1-BOVESPA)/g;
const alternativeBradescoDealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[CD](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(.*?)\d{0,2}\/?\d{0,2}(?:FRACIONARIO|VISTA|TERMO)([CV])(?=BOVESPA|1-BOVESPA)/g;

const agoraDealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[CD](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(.*)(FRACIONARIO|VISTA|TERMO)([CV])(?=BOVESPA|1-BOVESPA)/g;

export {
  noteNumberRegex,
  dateRegex,
  pageNumberRegex,
  brokerRegex,
  buyTotalRegex,
  sellTotalRegex,
  settlementDateRegex,
  debitCreditRegex,
  netTotalRegex,
  absoluteTotalRegex,
  termDaysRegex,
  bradescoDealRegex,
  alternativeBradescoDealRegex,
  agoraDealRegex,
};
