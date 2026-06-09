export type DemoActTypeId = 'aosr';

export interface DemoActTypeMetadata {
  readonly code: string;
  readonly id: DemoActTypeId;
  readonly registrySectionName: string;
  readonly title: string;
}

export const demoAosrActType: DemoActTypeMetadata = {
  code: 'АОСР',
  id: 'aosr',
  registrySectionName: 'АОСР',
  title: 'Акт освидетельствования скрытых работ',
};

export const registeredDemoActTypes: readonly DemoActTypeMetadata[] = [demoAosrActType];

const demoActTypesById: Readonly<Record<DemoActTypeId, DemoActTypeMetadata>> = {
  aosr: demoAosrActType,
};

export function getDemoActTypeById(actTypeId: DemoActTypeId): DemoActTypeMetadata {
  return demoActTypesById[actTypeId];
}
