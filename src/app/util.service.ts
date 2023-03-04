/**
 * Await a certain number of milliseconds
 * @param  {number} ms Number of milliseconds
 * @returns Promise
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getStringFrom(data: string, start: string, end: string): string | undefined {
  const foundIdx = data.lastIndexOf(start);
  if (foundIdx == -1) {
    return undefined;
  }
  const idx = foundIdx + start.length;
  const edx = data.indexOf(end, idx);
  if (edx == -1) return data.substring(idx);
  return data.substring(idx, edx);
}
