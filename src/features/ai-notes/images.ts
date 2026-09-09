export interface ExtractedImage {
  src: string;
  alt: string;
  caption: string;
}

export const extractPageImages = (): ExtractedImage[] => {
  const images: ExtractedImage[] = [];

  document.querySelectorAll('img').forEach((img) => {
    const src =
      img.currentSrc ||
      img.src ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-original') ||
      img.getAttribute('data-lazy-src');

    if (!src) {
      return;
    }

    const rect = img.getBoundingClientRect();

    const width = Math.max(
      rect.width,
      img.naturalWidth || 0
    );

    const height = Math.max(
      rect.height,
      img.naturalHeight || 0
    );

    // Ignore tracking pixels, tiny icons and very small decorative images.
    if (width < 100 || height < 70) {
      return;
    }

    const figure = img.closest('figure');

    const caption =
      figure?.querySelector('figcaption')?.textContent?.trim() ||
      img.getAttribute('title')?.trim() ||
      '';

    const alt = img.alt?.trim() || '';

    images.push({
      src,
      alt,
      caption,
    });
  });

  /*
   * Also preserve SVG graphics that are large enough
   * to reasonably represent diagrams.
   */
  document.querySelectorAll('svg').forEach((svg) => {
    const rect = svg.getBoundingClientRect();

    if (rect.width < 150 || rect.height < 100) {
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svg);

    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgString
    )}`;

    const figure = svg.closest('figure');

    const caption =
      figure?.querySelector('figcaption')?.textContent?.trim() || '';

    const title =
      svg.querySelector('title')?.textContent?.trim() || '';

    images.push({
      src,
      alt: title,
      caption,
    });
  });

  const uniqueImages = Array.from(
    new Map(
      images.map((image) => [image.src, image])
    ).values()
  );

  console.log(
    '[AI Notes] Extracted visual elements:',
    uniqueImages.length
  );

  return uniqueImages;
};