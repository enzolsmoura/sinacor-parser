import { termDaysRegex } from "../regex/regexes";

export function cleanAssetName(assetName: string): string {
  return assetName.substring(2).replace(/^[\d,.]*/, "").replace(termDaysRegex, "").trim();
}