import { describe, expect, it } from 'vitest';

import {
  demoAosrFormVariant1,
  getDemoActTypeById,
  getDemoAosrFormVariantById,
  registeredDemoActTypes,
} from './act-types.js';

describe('frontend demo act type metadata', () => {
  it('registers AOSR as the only current act type', () => {
    expect(registeredDemoActTypes).toHaveLength(1);
    expect(getDemoActTypeById('aosr')).toEqual({
      code: 'АОСР',
      defaultFormVariantId: 'aosr-1',
      formVariants: [demoAosrFormVariant1],
      id: 'aosr',
      registrySectionName: 'АОСР',
      title: 'Акт освидетельствования скрытых работ',
    });
  });

  it('registers the default AOSR 1 form variant for current demo documents', () => {
    expect(getDemoAosrFormVariantById('aosr-1')).toEqual({
      code: 'АОСР 1',
      id: 'aosr-1',
      printTitle: 'ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ',
      title: 'АОСР 1',
    });
  });
});
