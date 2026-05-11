import { describe, expect, it } from 'vitest';
import { sanitizePersonalityIconSvg } from './pet-personality-options';

describe('sanitizePersonalityIconSvg', () => {
  it('mantem SVG valido e remove conteudo inseguro antes da renderizacao', () => {
    const sanitized = sanitizePersonalityIconSvg(
      '<svg viewBox="0 0 24 24" onload="alert(1)"><script>alert(1)</script><path d="M1 1" /></svg>',
    );

    expect(sanitized).toContain('<svg');
    expect(sanitized).toContain('viewBox');
    expect(sanitized).toContain('<path');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('<script');
  });
});
