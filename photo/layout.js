// Justified rows: every photo keeps its supplied aspect ratio; rows fill the width.
// Optimize the whole sequence so the last row cannot become an oversized orphan.
export function makeRows(photos, width, spacious = false) {
  if (!photos.length || width <= 0) return [];
  const target = width < 700 ? (spacious ? 330 : 245) : (spacious ? 440 : 310);
  const n = photos.length, cost = Array(n + 1).fill(Infinity), next = Array(n);
  cost[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i; j < Math.min(n, i + 9); j++) {
      sum += photos[j].width / photos[j].height;
      const height = width / sum;
      const score = Math.pow(Math.log(height / target), 2) + cost[j + 1];
      if (score < cost[i]) { cost[i] = score; next[i] = j + 1; }
    }
  }
  const rows = [];
  for (let i = 0; i < n; i = next[i]) {
    const items = photos.slice(i, next[i]);
    const sum = items.reduce((total, p) => total + p.width / p.height, 0);
    rows.push({ items, height: width / sum, sum });
  }
  return rows;
}
