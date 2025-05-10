import { parse, unparse } from 'papaparse';

export function jsonToCsv(data: any): string {
  return unparse(data.metrics);
}

export default jsonToCsv;