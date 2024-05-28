import { termDaysRegex } from "../regex/regexes";

export function cleanAssetName(assetName: string): string {
  return assetName.replace(/\W+[\d,.]*/, "").replace(termDaysRegex, "").trim();
}