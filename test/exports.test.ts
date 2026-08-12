import { describe, expect, it } from 'vitest';

import * as root from '../src/index.js';
import * as nest from '../src/nest/index.js';

describe('public exports', () => {
  it('exports root SDK symbols', () => {
    expect(root.MakeCommerceClient).toBeDefined();
    expect(root.MakeCommerceApiError).toBeDefined();
    expect(root.createMakeCommerceClient).toBeDefined();
  });

  it('exports NestJS adapter symbols', () => {
    expect(nest.MakeCommerceModule).toBeDefined();
    expect(nest.MAKECOMMERCE_CLIENT).toBeDefined();
    expect(nest.InjectMakeCommerceClient).toBeDefined();
  });
});
