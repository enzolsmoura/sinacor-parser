const dateRegex = /Data pregãoFolhaNr\.Nota\n(\d{2}\/\d{2}\/\d{4})/;
const noteNumberRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d(\d+)/;
const holderRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d+\n(.*)/;
const buyTotalRegex = /([\d.,]+)Compras à vista[CD]/;
const sellTotalRegex = /([\d.,]+)Vendas à vista[CD]/;
const settlementDateRegex = /Líquido para\s+(\d{2}\/\d{2}\/\d{4})/;
const totalRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}([\d.,]+)/;
const debitCreditRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}[\d.,]+ ([CD])/;
const termDaysRegex = /[\d]*$/;

const bradescoDealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[CD](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(?:\w{0,3})\W+(?:\w{0,3})?\W{2,}(.*?)\d{0,2}\/?\d{0,2}(?:FRACIONARIO|VISTA|TERMO)([CV])(?=BOVESPA|1-BOVESPA)/g;
const agoraDealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[CD](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(?:\w{0,3})\W+(?:\w{0,3}\W{2,})?(.*)(FRACIONARIO|VISTA|TERMO)([CV])(?=BOVESPA|1-BOVESPA)/g;

export {
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
};
