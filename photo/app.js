import { makeRows } from './layout.js';
import { shufflePhotos } from './shuffle.js';
const $ = s => document.querySelector(s);
const gallery = $('#gallery'), dialog = $('#lightbox'), sentinel = $('#scroll-sentinel');
let photos = [], rows = [], renderedRows = 0, activeIndex = 0, observer, previousWidth = 0, resizeFrame, openerId;
const number = n => String(n).padStart(2, '0');

function createPhoto(photo) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'photo'; button.dataset.id = photo.id;
  const index = photos.indexOf(photo), orientation = photo.width >= photo.height ? '橫幅' : '直幅';
  button.setAttribute('aria-label', `放大第 ${index + 1} 張照片（${orientation}）`);
  const img = new Image();
  img.src = photo.thumbnail || photo.src;
  img.alt = `第 ${index + 1} 張${orientation}照片`;
  img.width = photo.width; img.height = photo.height;
  img.loading = renderedRows === 0 ? 'eager' : 'lazy'; img.decoding = 'async';
  if (renderedRows === 0) img.fetchPriority = 'high';
  img.onerror = () => button.classList.add('failed');
  button.append(img);
  button.addEventListener('click', () => openPhoto(index));
  return button;
}

function appendRows(amount = 3) {
  const end = Math.min(rows.length, renderedRows + amount);
  const fragment = document.createDocumentFragment();
  for (; renderedRows < end; renderedRows++) {
    const row = rows[renderedRows], element = document.createElement('div');
    element.className = 'photo-row'; element.style.height = `${row.height}px`;
    for (const photo of row.items) {
      const button = createPhoto(photo);
      button.style.width = `${(photo.width / photo.height) / row.sum * 100}%`;
      element.append(button);
    }
    fragment.append(element);
  }
  gallery.append(fragment);
  if (renderedRows >= rows.length) observer?.unobserve(sentinel);
  else requestAnimationFrame(fillViewport);
}

function fillViewport() {
  if (renderedRows < rows.length && sentinel.getBoundingClientRect().top < innerHeight + 600) appendRows();
}

function rebuild(preserveCount = 0) {
  previousWidth = gallery.clientWidth;
  rows = makeRows(photos, previousWidth);
  gallery.replaceChildren(); renderedRows = 0;
  let amount = 3, count = 0;
  if (preserveCount) {
    amount = 0;
    while (amount < rows.length && count < preserveCount) count += rows[amount++].items.length;
    amount = Math.max(3, amount);
  }
  appendRows(amount);
  if (renderedRows < rows.length) observer?.observe(sentinel);
}

async function init() {
  try {
    const { default: data } = await import('./photos.generated.js');
    if (!Array.isArray(data) || data.some(p => !p.src || !p.width || !p.height)) throw new Error('Invalid photo index');
    photos = shufflePhotos(data);
    if (!photos.length) { $('#gallery-message').hidden = false; $('#gallery-message').textContent = '還沒有照片，先去拍一些！'; return; }
    if ('IntersectionObserver' in window) observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting) && renderedRows < rows.length) appendRows();
    }, { rootMargin: '600px 0px' });
    // Scroll also covers older browsers and a sentinel that stays in the viewport.
    window.addEventListener('scroll', fillViewport, { passive: true });
    rebuild();
  } catch {
    $('#gallery-message').hidden = false;
    $('#gallery-message').textContent = '照片暫時無法載入，請重新整理再試。';
  }
}

$('#back-to-top').addEventListener('click', () => window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
new ResizeObserver(() => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (photos.length && Math.abs(previousWidth - gallery.clientWidth) > 1) rebuild(gallery.querySelectorAll('.photo').length);
  });
}).observe(gallery);

function showPhoto(index) {
  activeIndex = Math.max(0, Math.min(photos.length - 1, index));
  const photo = photos[activeIndex], img = $('#lightbox-image');
  $('#lightbox-error').hidden = true;
  img.alt = `第 ${activeIndex + 1} 張${photo.width >= photo.height ? '橫幅' : '直幅'}照片`;
  img.src = photo.src;
  $('#lightbox-count').textContent = `${number(activeIndex + 1)} / ${number(photos.length)}`;
  const credit = $('#photo-credit');
  if (photo.source) {
    credit.hidden = false; credit.href = photo.source;
    credit.textContent = `示範照片：${photo.author ? photo.author + ' / ' : ''}Unsplash ↗`;
  } else { credit.hidden = true; }
  $('#previous-photo').disabled = activeIndex === 0;
  $('#next-photo').disabled = activeIndex === photos.length - 1;
}
function openPhoto(index) {
  openerId = photos[index].id;
  showPhoto(index);
  document.body.classList.add('modal-open'); dialog.showModal(); $('#close-lightbox').focus();
}
$('#lightbox-image').onerror = () => { $('#lightbox-error').hidden = false; };
$('#lightbox-image').onload = () => { $('#lightbox-error').hidden = true; };
$('#close-lightbox').onclick = () => dialog.close();
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  [...gallery.querySelectorAll('.photo')].find(button => button.dataset.id === openerId)?.focus({preventScroll:true});
});
$('#previous-photo').onclick = () => showPhoto(activeIndex - 1);
$('#next-photo').onclick = () => showPhoto(activeIndex + 1);
dialog.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {e.preventDefault(); showPhoto(activeIndex - 1);}
  if (e.key === 'ArrowRight') {e.preventDefault(); showPhoto(activeIndex + 1);}
});
let touchStart;
$('.lightbox-stage').addEventListener('touchstart', e => { if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}; }, {passive:true});
$('.lightbox-stage').addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx=e.changedTouches[0].clientX-touchStart.x, dy=e.changedTouches[0].clientY-touchStart.y;
  if (Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) showPhoto(activeIndex+(dx<0?1:-1));
  touchStart=null;
}, {passive:true});
init();
