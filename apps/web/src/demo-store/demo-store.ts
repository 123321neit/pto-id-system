import { createContext, useContext } from 'react';

import {
  demoAosrWorkspace,
  type DemoObjectDocument,
  type DemoObjectDocumentType,
} from '../aosr-demo/demo-aosr-workspace.js';

export type DemoCertificateStatus = 'Действует' | 'Истекает' | 'Требует проверки';

export interface DemoCertificateMaterial {
  readonly id: string;
  readonly name: string;
}

export interface DemoCertificate {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly manufacturer: string;
  readonly materials: readonly DemoCertificateMaterial[];
  readonly status: DemoCertificateStatus;
  readonly validUntil: string;
}

export interface DemoCertificateInput {
  readonly documentNumber: string;
  readonly documentType: string;
  readonly issuedAt: string;
  readonly issuer: string;
  readonly manufacturer: string;
  readonly materialName: string;
  readonly status: DemoCertificateStatus;
  readonly validUntil: string;
}

export interface DemoOrganization {
  readonly id: string;
  readonly caption: string;
  readonly details: string;
  readonly name: string;
  readonly usageNote: string;
}

export interface DemoOrganizationInput {
  readonly details: string;
  readonly name: string;
  readonly usageNote: string;
}

export interface DemoRepresentative {
  readonly id: string;
  readonly authorityBasis: string;
  readonly details?: string;
  readonly fullName: string;
  readonly nrsDetails?: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

export interface DemoRepresentativeInput {
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly nrsDetails: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

export interface DemoObjectDocumentInput {
  readonly documentDate: string;
  readonly reference: string;
  readonly title: string;
  readonly type: DemoObjectDocumentType;
}

export interface DemoStoreValue {
  readonly certificates: readonly DemoCertificate[];
  readonly objectDocuments: readonly DemoObjectDocument[];
  readonly organizations: readonly DemoOrganization[];
  readonly representatives: readonly DemoRepresentative[];
  readonly addCertificate: (certificate: DemoCertificateInput) => void;
  readonly addObjectDocument: (document: DemoObjectDocumentInput) => void;
  readonly addOrganization: (organization: DemoOrganizationInput) => DemoOrganization;
  readonly addRepresentative: (representative: DemoRepresentativeInput) => DemoRepresentative;
  readonly updateOrganization: (
    organizationId: string,
    field: 'details' | 'name',
    value: string,
  ) => void;
  readonly updateRepresentative: (
    representativeId: string,
    field: 'authorityBasis' | 'fullName' | 'nrsDetails' | 'organization' | 'position',
    value: string,
  ) => void;
}

export const demoCertificateStatuses: readonly DemoCertificateStatus[] = [
  'Действует',
  'Истекает',
  'Требует проверки',
];

export const initialDemoObjectDocuments: readonly DemoObjectDocument[] =
  demoAosrWorkspace.objectDocumentLibrary;

export const initialDemoCertificates: readonly DemoCertificate[] = [
  {
    documentNumber: 'СТ-ОВ-2026-017',
    documentType: 'Сертификат соответствия',
    id: 'global-certificate-ducts-001',
    issuedAt: '12.05.2026',
    issuer: 'ООО "Эксперт-С"',
    manufacturer: 'ООО "ВентПрофиль"',
    materials: [
      {
        id: 'certificate-ducts-001',
        name: 'Воздуховоды оцинкованные 0,7 мм',
      },
      {
        id: 'certificate-duct-elbows-001',
        name: 'Отводы оцинкованные',
      },
      {
        id: 'certificate-duct-transitions-001',
        name: 'Переходы оцинкованные',
      },
    ],
    status: 'Действует',
    validUntil: '11.05.2029',
  },
  {
    documentNumber: 'ДС-ИЗ-2026-04',
    documentType: 'Декларация о соответствии',
    id: 'global-certificate-insulation-001',
    issuedAt: '20.05.2026',
    issuer: 'Реестр деклараций ЕАЭС',
    manufacturer: 'АО "ТеплоМат"',
    materials: [
      {
        id: 'certificate-insulation-001',
        name: 'Теплоизоляционные маты ИЗ-50',
      },
    ],
    status: 'Действует',
    validUntil: '19.05.2027',
  },
  {
    documentNumber: 'ПП-ОГН-22',
    documentType: 'Паспорт партии',
    id: 'global-certificate-firestop-001',
    issuedAt: '21.05.2026',
    issuer: 'Лаборатория входного контроля',
    manufacturer: 'ООО "ОгнеСтоп"',
    materials: [
      {
        id: 'certificate-firestop-001',
        name: 'Противопожарный состав для проходок',
      },
    ],
    status: 'Истекает',
    validUntil: '31.12.2026',
  },
  {
    documentNumber: 'ПС-КМ-48',
    documentType: 'Паспорт качества',
    id: 'global-certificate-fasteners-001',
    issuedAt: '18.05.2026',
    issuer: 'Заводская служба качества',
    manufacturer: 'ООО "Крепеж Комплект"',
    materials: [
      {
        id: 'certificate-fasteners-001',
        name: 'Крепежные элементы КМ-12',
      },
    ],
    status: 'Требует проверки',
    validUntil: 'Проверить по партии',
  },
];

export const initialDemoOrganizations: readonly DemoOrganization[] = [
  {
    caption: 'Наименование, ОГРН, ИНН, место нахождения, телефон/факс и иные реквизиты участника.',
    details:
      'ОГРН 1026600000000; ИНН 6670000000; 620000, г. Екатеринбург, ул. Демонстрационная, 10.',
    id: 'global-organization-customer',
    name: 'ГАУЗ СО "Демо-заказчик"',
    usageNote: 'Используется как заказчик в объекте "Реконструкция поликлиники".',
  },
  {
    caption: 'Реквизиты лица, осуществляющего строительство, включая СРО при наличии.',
    details: 'ОГРН 1206600007877; ИНН 6670490954; АСРО "Гильдия строителей демо-объекта".',
    id: 'global-organization-contractor',
    name: 'ООО "ПТО Монтаж"',
    usageNote: 'Подрядчик в текущих АОСР и шапке объекта.',
  },
  {
    caption: 'Наименование, ОГРН, ИНН, адрес и сведения о договоре строительного контроля.',
    details: 'Договор строительного контроля N СК-7; 620100, г. Екатеринбург, ул. Контрольная, 4.',
    id: 'global-organization-control',
    name: 'ООО "СтройКонтроль"',
    usageNote: 'Технический заказчик / строительный контроль в шапке объекта.',
  },
  {
    caption: 'Реквизиты лица, осуществляющего подготовку проектной документации, и сведения о СРО.',
    details: 'ОГРН 1146678008509; ИНН 6678044711; СРО проектировщиков N П-140-27022010.',
    id: 'global-organization-designer',
    name: 'АО "Проектный институт"',
    usageNote: 'Проектная организация и авторский надзор.',
  },
  {
    caption: 'Объектовый блок можно подписать любым пользовательским названием.',
    details: 'ОГРН 1096600000001; ИНН 6671000001; 620075, г. Екатеринбург, ул. Генподрядная, 8.',
    id: 'global-organization-general-contractor',
    name: 'ООО "Демо-генподряд"',
    usageNote: 'Может быть добавлен в объект отдельным пользовательским блоком.',
  },
];

export const initialDemoRepresentatives: readonly DemoRepresentative[] = [
  {
    authorityBasis: 'Приказ N 12-П от 10.05.2026',
    fullName: 'Иванов И.И.',
    id: 'representative-contractor-001',
    organization: 'ООО "ПТО Монтаж"',
    position: 'Производитель работ',
    roleLabel: 'Представитель подрядчика',
  },
  {
    authorityBasis: 'Договор строительного контроля N СК-7',
    fullName: 'Петров П.П.',
    id: 'representative-builder-control-001',
    nrsDetails: 'С-66-212868',
    organization: 'ООО "СтройКонтроль"',
    position: 'Ведущий инженер строительного контроля',
    roleLabel: 'Стройконтроль',
  },
  {
    authorityBasis: 'Приказ N АН-3 от 15.05.2026',
    fullName: 'Смирнова С.С.',
    id: 'representative-author-001',
    organization: 'АО "Проектный институт"',
    position: 'Главный специалист авторского надзора',
    roleLabel: 'Авторский надзор',
  },
  {
    authorityBasis: 'Доверенность N З-44 от 01.05.2026',
    fullName: 'Кузнецова А.А.',
    id: 'representative-customer-001',
    organization: 'ГАУЗ СО "Демо-заказчик"',
    position: 'Руководитель проекта',
    roleLabel: 'Представитель заказчика',
  },
  {
    authorityBasis: 'Приказ N ЛК-9 от 12.05.2026',
    details: 'Для объекта полномочия и НРС можно отредактировать перед добавлением.',
    fullName: 'Лебедев Л.Л.',
    id: 'representative-laboratory-001',
    organization: 'ООО "Лаборатория контроля"',
    position: 'Инженер лаборатории',
    roleLabel: 'Стройконтроль лаборатории',
  },
  {
    authorityBasis: 'Доверенность N ГП-18 от 15.05.2026',
    fullName: 'Николаев Н.Н.',
    id: 'representative-general-contractor-001',
    organization: 'ООО "Демо-генподряд"',
    position: 'Главный инженер проекта',
    roleLabel: 'Представитель генподрядчика',
  },
];

export const DemoStoreContext = createContext<DemoStoreValue | undefined>(undefined);

export function useDemoStore(): DemoStoreValue {
  const store = useContext(DemoStoreContext);

  if (store === undefined) {
    throw new Error('useDemoStore must be used within DemoStoreProvider.');
  }

  return store;
}

export function getCertificateMaterialNames(certificate: DemoCertificate): readonly string[] {
  return certificate.materials.map((material) => material.name);
}

export function getCertificateDocumentName(certificate: DemoCertificate): string {
  return `${certificate.documentType} N ${certificate.documentNumber} от ${certificate.issuedAt}`;
}
