export interface MockObjectCard {
  readonly id: string;
  readonly title: string;
  readonly address: string;
  readonly status: 'active' | 'paused';
  readonly statusLabel: string;
  readonly documentsCount: number;
  readonly aosrCount: number;
  readonly objectDocumentCount: number;
  readonly representativeCount: number;
  readonly updatedAtLabel: string;
  readonly summary: string;
}

export interface MockRecentDocument {
  readonly id: string;
  readonly title: string;
  readonly objectTitle: string;
  readonly updatedAtLabel: string;
}

export type MockDashboardPanel = 'objects' | 'certificates' | 'representatives';

export const mockObjectCards: readonly MockObjectCard[] = [
  {
    address: 'г. Екатеринбург, ул. Демонстрационная, 10',
    aosrCount: 12,
    documentsCount: 24,
    id: 'object-polyclinic-demo',
    objectDocumentCount: 17,
    representativeCount: 6,
    status: 'active',
    statusLabel: 'В работе',
    summary: 'Демо-объект для проверки АОСР, сертификатов и подписантов.',
    title: 'Реконструкция поликлиники, демонстрационный проект',
    updatedAtLabel: 'сегодня',
  },
  {
    address: 'г. Екатеринбург, ул. Северная, 18',
    aosrCount: 8,
    documentsCount: 18,
    id: 'object-northern-demo',
    objectDocumentCount: 14,
    representativeCount: 5,
    status: 'active',
    statusLabel: 'В работе',
    summary: 'Жилой комплекс с несколькими очередями исполнительной документации.',
    title: 'Жилой комплекс "Северный"',
    updatedAtLabel: 'вчера',
  },
  {
    address: 'г. Екатеринбург, пр. Горизонт, 4',
    aosrCount: 15,
    documentsCount: 31,
    id: 'object-horizon-demo',
    objectDocumentCount: 22,
    representativeCount: 8,
    status: 'paused',
    statusLabel: 'На паузе',
    summary: 'Торговый центр: подготовка актов и приложений по инженерным системам.',
    title: 'Торговый центр "Горизонт"',
    updatedAtLabel: '2 дня назад',
  },
];

export const mockRecentDocuments: readonly MockRecentDocument[] = [
  {
    id: 'recent-aosr-001',
    objectTitle: 'Реконструкция поликлиники',
    title: 'ОВ-1 от 01.06.2026',
    updatedAtLabel: 'сегодня',
  },
  {
    id: 'recent-aosr-002',
    objectTitle: 'ЖК "Северный"',
    title: 'АОСР-024 от 31.05.2026',
    updatedAtLabel: 'вчера',
  },
  {
    id: 'recent-registry-demo',
    objectTitle: 'ТЦ "Горизонт"',
    title: 'Реестр ОВ',
    updatedAtLabel: '2 дня назад',
  },
];
