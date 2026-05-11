import DOMPurify from 'dompurify';

export const sanitizePersonalityIconSvg = (iconSvg: string): string =>
  DOMPurify.sanitize(iconSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
