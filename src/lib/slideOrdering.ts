/**
 * 依「選檔順序」決定每張 slide 的 order，再併發寫入。
 *
 * 重點：order 在進入併發前、依陣列索引就先算好（baseOrder + index），
 * 不能等到 persist（上傳 / 寫 DB）完成後才遞增計數器 —— 否則併發時
 * order 會被「誰先完成」打亂，導致重整後（後端以 order asc 讀取）順序亂掉。
 */
export function createSlidesInOrder<T, R>(
  files: T[],
  baseOrder: number,
  persist: (file: T, order: number) => Promise<R>
): Promise<R[]> {
  return Promise.all(files.map((file, i) => persist(file, baseOrder + i)))
}
