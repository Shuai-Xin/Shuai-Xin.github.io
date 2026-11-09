import justifiedLayout from './vendor/justified-layout.js';

/** Group arbitrary image sizes into justified rows without cropping. */
export function makeRows(photos, width) {
  if (!photos.length || !Number.isFinite(width) || width <= 0) return [];
  if (photos.some(photo => !Number.isFinite(photo.width) || !Number.isFinite(photo.height) || photo.width <= 0 || photo.height <= 0)) {
    throw new RangeError('Photos must have positive, finite original dimensions');
  }
  const target = width < 700 ? 220 : 300;
  const geometry = justifiedLayout(photos, {
    containerWidth: width,
    containerPadding: 0,
    boxSpacing: 0,
    targetRowHeight: target,
    targetRowHeightTolerance: .25,
    forceAspectRatio: false,
    showWidows: true
  });
  const groups = [];
  geometry.boxes.forEach((box, index) => {
    if (!groups.length || groups[groups.length - 1].top !== box.top) groups.push({ top: box.top, items: [] });
    groups[groups.length - 1].items.push(photos[index]);
  });
  return groups.map((group, index) => {
    const sum = group.items.reduce((total, photo) => total + photo.width / photo.height, 0);
    const justified = index < groups.length - 1 || geometry.widowCount === 0;
    // The library caps extreme row heights, which can change its box ratios.
    // Recompute from original dimensions to preserve even very wide panoramas.
    // An unfinished final row stays at a natural height rather than stretching.
    const height = justified ? width / sum : Math.min(target, width / sum);
    return { items: group.items, height, width: height * sum, justified };
  });
}
