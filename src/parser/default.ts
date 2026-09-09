import Defuddle, { createMarkdownContent } from 'defuddle/full';

const addImageMarkers = (content: string): string => {
  let imageIndex = 0;

  /*
   * Defuddle may produce image references such as:
   * [image](image-url)
   * or standard Markdown image syntax:
   * ![alt](image-url)
   *
   * Wikipedia URLs can contain parentheses, so we cannot safely
   * parse them with a simple regex that stops at the first ")".
   *
   * Instead, process complete Markdown link/image lines.
   */
  const lines = content.split('\n');

  return lines
    .map((line) => {
      const trimmed = line.trim();

      if (
        /^\[image\]\(.+\)$/i.test(trimmed) ||
        /^!\[[^\]]*\]\(.+\)$/i.test(trimmed)
      ) {
        const marker = `[[IMAGE:${imageIndex}]]`;
        imageIndex += 1;

        return marker;
      }

      return line;
    })
    .join('\n');
};
export const defaultExtractContent = (
  html: string,
  url: string = ''
): string => {
  if (!html) return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const result = new Defuddle(doc as unknown as Document, { url }).parse();

    if (result?.content && result.content.trim().length > 0) {
      const markdown = createMarkdownContent(
        result.content,
        url
      ).trim();

      return addImageMarkers(markdown);
    }
  } catch (error) {
    console.warn(
      '[defaultExtractContent] Defuddle extraction failed, falling back:',
      error
    );
  }

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc
      .querySelectorAll(
        'script, style, link, noscript, svg, [aria-hidden="true"]'
      )
      .forEach((el) => el.remove());

    const body =
      doc.querySelector('[role="main"]') ||
      doc.querySelector('main') ||
      doc.querySelector('article') ||
      doc.body;

    const markdown = createMarkdownContent(
      body?.innerHTML || html,
      url
    ).trim();

    return addImageMarkers(markdown);
  } catch (error) {
    console.warn(
      '[defaultExtractContent] Fallback markdown conversion failed:',
      error
    );

    return '';
  }
};