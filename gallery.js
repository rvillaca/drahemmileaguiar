const galleryPhotos = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47,
  48, 49, 50, 51, 52, 54, 55
];

const gallery = document.querySelector('[data-photo-gallery]');

if (gallery) {
  const base = document.body.dataset.galleryBase || '';
  gallery.innerHTML = galleryPhotos.map((number, index) => {
    const loading = index < 3 ? 'eager' : 'lazy';
    const priority = index === 0 ? ' fetchpriority="high"' : '';
    return `<figure class="gallery-item"><img src="${base}assets/images/galeria/hemmile-${number}.jpg" width="1400" height="1400" loading="${loading}"${priority} alt="Dra. Hemmile Aguiar em foto profissional"><figcaption>Dra. Hemmile Aguiar</figcaption></figure>`;
  }).join('');
}
