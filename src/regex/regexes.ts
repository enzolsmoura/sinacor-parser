const dateRegex = /Data pregãoFolhaNr\.Nota\n(\d{2}\/\d{2}\/\d{4})/;
const noteNumberRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d(\d+)/;
const holderRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d+\n(.*)/;
const buyTotalRegex = /([\d.,]+)Compras à vista[C|D]/;
const sellTotalRegex = /([\d.,]+)Vendas à vista[C|D]/;
const liquidationDateRegex = /Líquido para\s+(\d{2}\/\d{2}\/\d{4})/;
const totalRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}([\d.,]+)/;
const debitCreditRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}[\d.,]+ ([D|C])/;

const dealRegex =
  /(\d{1,3}(?:\.\d{3})*,\d{2})[C|D](\d{1,3}(?:\.\d{3})*,\d{2})(\d{1,3}(?:\.\d{3})*)(?:\w{0,2})\W+(?:\w+)?\W{2,}(.*?)\d{0,2}\/?\d{0,2}(?:FRACIONARIO|VISTA|TERMO)([C|V])(?=BOVESPA|1-BOVESPA)/g;

export {
  noteNumberRegex,
  dateRegex,
  holderRegex,
  buyTotalRegex,
  sellTotalRegex,
  liquidationDateRegex,
  debitCreditRegex,
  totalRegex,
  dealRegex,
};
