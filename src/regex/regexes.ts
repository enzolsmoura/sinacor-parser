const dateRegex = /Data pregãoFolhaNr\.Nota\n(\d{2}\/\d{2}\/\d{4})/;
const noteNumberRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d(\d+)/;
const holderRegex = /Data pregãoFolhaNr\.Nota\n\d{2}\/\d{2}\/\d{4}\d+\n(.*)/;
const buyTotalRegex = /([\d.,]+)Compras à vistaD/;
const sellTotalRegex = /([\d.,]+)Vendas à vistaD/;
const liquidationDateRegex = /Líquido para\s+(\d{2}\/\d{2}\/\d{4})/;
const totalRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}([\d.,]+)/;
const debitCreditRegex = /Líquido para\s+\d{2}\/\d{2}\/\d{4}[\d.,]+ ([D|C])/;



export {
  noteNumberRegex,
  dateRegex,
  holderRegex,
  buyTotalRegex,
  sellTotalRegex,
  liquidationDateRegex,
  debitCreditRegex,
  totalRegex
};