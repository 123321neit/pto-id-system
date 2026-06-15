export type DemoActTypeId = 'aosr';
export type DemoAosrFormVariantId = 'aosr-1';

export interface DemoAosrFormVariantMetadata {
  readonly code: string;
  readonly id: DemoAosrFormVariantId;
  readonly printTitle: string;
  readonly title: string;
}

export interface DemoActTypeMetadata {
  readonly code: string;
  readonly defaultFormVariantId: DemoAosrFormVariantId;
  readonly formVariants: readonly DemoAosrFormVariantMetadata[];
  readonly id: DemoActTypeId;
  readonly registrySectionName: string;
  readonly title: string;
}

export const demoAosrFormVariant1: DemoAosrFormVariantMetadata = {
  code: 'АОСР 1',
  id: 'aosr-1',
  printTitle: 'ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ',
  title: 'АОСР 1',
};

export const demoAosrActType: DemoActTypeMetadata = {
  code: 'АОСР',
  defaultFormVariantId: demoAosrFormVariant1.id,
  formVariants: [demoAosrFormVariant1],
  id: 'aosr',
  registrySectionName: 'АОСР',
  title: 'Акт освидетельствования скрытых работ',
};

export const registeredDemoActTypes: readonly DemoActTypeMetadata[] = [demoAosrActType];

const demoActTypesById: Readonly<Record<DemoActTypeId, DemoActTypeMetadata>> = {
  aosr: demoAosrActType,
};

const demoAosrFormVariantsById: Readonly<
  Record<DemoAosrFormVariantId, DemoAosrFormVariantMetadata>
> = {
  'aosr-1': demoAosrFormVariant1,
};

export function getDemoActTypeById(actTypeId: DemoActTypeId): DemoActTypeMetadata {
  return demoActTypesById[actTypeId];
}

export function getDemoAosrFormVariantById(
  formVariantId: DemoAosrFormVariantId,
): DemoAosrFormVariantMetadata {
  return demoAosrFormVariantsById[formVariantId];
}
