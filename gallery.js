const galleryPhotos = [
  10, 11, 16, 18, 20,
  25, 29, 31, 32, 36,
  37, 40, 41, 42, 44,
  46, 48, 49, 52, 54, 55
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
