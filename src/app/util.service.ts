/**
 * Await a certain number of milliseconds
 * @param  {number} ms Number of milliseconds
 * @returns Promise
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
