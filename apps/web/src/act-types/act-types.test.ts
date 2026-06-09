import { describe, expect, it } from 'vitest';

import { getDemoActTypeById, registeredDemoActTypes } from './act-types.js';

describe('frontend demo act type metadata', () => {
  it('registers AOSR as the only current act type', () => {
    expect(registeredDemoActTypes).toHaveLength(1);
    expect(getDemoActTypeById('aosr')).toEqual({
      code: 'АОСР',
      id: 'aosr',
      registrySectionName: 'АОСР',
      title: 'Акт освидетельствования скрытых работ',
    });
  });
});
