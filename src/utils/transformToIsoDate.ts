export function transformToIsoDate(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}
