import {
  defaultAosrCounterpartySubscript,
  defaultAosrRepresentativeSubscript,
  type DemoAosrRepresentative,
} from './demo-aosr-workspace.js';

export type MoveDirection = 'up' | 'down';

export interface HeaderOrganizationFormState {
  readonly label: string;
  readonly organizationName: string;
  readonly details: string;
  readonly caption: string;
  readonly globalOrganizationId: string;
}

export interface RepresentativeFormState {
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId: string;
  readonly details: string;
  readonly globalRepresentativeId: string;
}

export const emptyHeaderOrganizationForm: HeaderOrganizationFormState = {
  caption: defaultAosrCounterpartySubscript,
  details: '',
  globalOrganizationId: '',
  label: '',
  organizationName: '',
};

export const emptyRepresentativeForm: RepresentativeFormState = {
  authorityBasis: '',
  details: defaultAosrRepresentativeSubscript,
  fullName: '',
  globalRepresentativeId: '',
  nrsId: '',
  organization: '',
  position: '',
  roleLabel: '',
};

export function createRepresentativeFromForm(
  id: string,
  form: RepresentativeFormState,
): DemoAosrRepresentative {
  const details = form.details.trim();
  const globalRepresentativeId = form.globalRepresentativeId.trim();
  const nrsId = form.nrsId.trim();

  return {
    authorityBasis: form.authorityBasis.trim(),
    fullName: form.fullName.trim(),
    id,
    organization: form.organization.trim(),
    position: form.position.trim(),
    roleLabel: form.roleLabel.trim(),
    ...(details === '' ? {} : { details }),
    ...(globalRepresentativeId === '' ? {} : { globalRepresentativeId }),
    ...(nrsId === '' ? {} : { nrsId }),
  };
}

export function formatDocumentDate(dateValue: string): string {
  const [year, month, day] = dateValue.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return dateValue;
  }

  return `"${day}" ${getRussianMonthName(month)} ${year} г.`;
}

export function getRepresentativePreviewLine(representative: DemoAosrRepresentative): string {
  return [representative.position, representative.organization, representative.fullName]
    .filter(Boolean)
    .join(' ');
}

export function getRepresentativeAuthorityLine(representative: DemoAosrRepresentative): string {
  return [
    representative.authorityBasis,
    representative.nrsId === undefined
      ? ''
      : `идентификационный номер в национальном реестре специалистов ${representative.nrsId}`,
    representative.details ?? '',
  ]
    .filter(Boolean)
    .join('; ');
}

function getRussianMonthName(monthValue: string): string {
  switch (monthValue) {
    case '01':
      return 'января';
    case '02':
      return 'февраля';
    case '03':
      return 'марта';
    case '04':
      return 'апреля';
    case '05':
      return 'мая';
    case '06':
      return 'июня';
    case '07':
      return 'июля';
    case '08':
      return 'августа';
    case '09':
      return 'сентября';
    case '10':
      return 'октября';
    case '11':
      return 'ноября';
    case '12':
      return 'декабря';
    default:
      return monthValue;
  }
}
