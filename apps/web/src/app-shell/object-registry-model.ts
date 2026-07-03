import { getDemoActTypeById, type DemoActTypeId } from '../act-types/act-types.js';
import type { DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import {
  getDemoIdFolderDrafts,
  getDemoIdFolderForDraftId,
  type DemoIdFolder,
  type DemoIdFolders,
} from './object-id-folders.js';

export type DerivedRegistryScope = 'folder' | 'final';

export interface RegistrySourceDocument {
  readonly actTypeId: DemoActTypeId;
  readonly documentDate: string;
  readonly documentNumber: string;
  readonly confirmationDocumentCount?: number;
  readonly id: string;
  readonly folderName: string;
  readonly materialCount?: number;
  readonly workDescription: string;
}

export interface DerivedRegistryRow {
  readonly actTypeId: DemoActTypeId;
  readonly documentDate: string;
  readonly documentDateDisplay: string;
  readonly documentName: string;
  readonly documentNumber: string;
  readonly documentNumberDisplay: string;
  readonly documentTypeCode: string;
  readonly documentTypeTitle: string;
  readonly id: string;
  readonly folderName: string;
  readonly rowNumber: number;
  readonly statusMessages: readonly string[];
  readonly statusText: string;
  readonly workDescription: string;
}

export interface DerivedRegistryModel {
  readonly description: string;
  readonly id: string;
  readonly rows: readonly DerivedRegistryRow[];
  readonly scope: DerivedRegistryScope;
  readonly title: string;
}

export function buildFolderRegistryModel(
  folder: DemoIdFolder,
  drafts: readonly DemoAosrDraft[],
): DerivedRegistryModel {
  const folderDrafts = getDemoIdFolderDrafts(folder, drafts);

  return {
    description:
      'Построен из текущих документов папки. Реестр не сохраняется, не блокируется и не закрывает папку.',
    id: `folder-registry-${folder.id}`,
    rows: buildDerivedRegistryRows(
      folderDrafts.map((draft) => mapAosrDraftToRegistryDocument(draft, folder.name)),
    ),
    scope: 'folder',
    title: folder.registryTitle,
  };
}

export function buildFinalRegistryModel(
  drafts: readonly DemoAosrDraft[],
  folders: DemoIdFolders,
): DerivedRegistryModel {
  return {
    description:
      'Построен из документов всех папок выбранного раздела. Финальный реестр не сохраняется как сущность, не блокируется и не архивируется.',
    id: 'final-registry',
    rows: buildDerivedRegistryRows(
      drafts.map((draft) => {
        const folder = getDemoIdFolderForDraftId(draft.id, folders);

        return mapAosrDraftToRegistryDocument(draft, folder.name);
      }),
    ),
    scope: 'final',
    title: 'Финальный реестр итоговой ИД раздела',
  };
}

export function buildDerivedRegistryRows(
  documents: readonly RegistrySourceDocument[],
): readonly DerivedRegistryRow[] {
  return documents.map((document, index) => {
    const actType = getDemoActTypeById(document.actTypeId);

    return {
      actTypeId: document.actTypeId,
      documentDate: document.documentDate,
      documentDateDisplay: formatRegistryDate(document.documentDate),
      documentName: formatRegistryDocumentName(actType.code, document.workDescription),
      documentNumber: document.documentNumber,
      documentNumberDisplay: formatRegistryDocumentNumber(document.documentNumber),
      documentTypeCode: actType.code,
      documentTypeTitle: actType.title,
      id: `registry-row-${document.id}`,
      folderName: document.folderName,
      rowNumber: index + 1,
      statusMessages: getRegistryStatusMessages(document),
      statusText: formatRegistryStatus(document),
      workDescription: document.workDescription,
    };
  });
}

function mapAosrDraftToRegistryDocument(
  draft: DemoAosrDraft,
  folderName: string,
): RegistrySourceDocument {
  return {
    actTypeId: 'aosr',
    confirmationDocumentCount: draft.objectDocumentIds.length,
    documentDate: draft.actDate,
    documentNumber: draft.actNumber,
    id: draft.id,
    folderName,
    materialCount: draft.materialCertificateIds.length,
    workDescription: draft.workDescription,
  };
}

function formatRegistryDocumentNumber(value: string): string {
  return value.trim() === '' ? 'Без номера' : value;
}

function formatRegistryDate(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return 'Не заполнена';
  }

  const [year, month, day] = trimmedValue.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return trimmedValue;
  }

  return `${day}.${month}.${year}`;
}

function formatRegistryDocumentName(documentTypeCode: string, workDescription: string): string {
  const workDescriptionPreview =
    workDescription.trim() === '' ? 'работы не заполнены' : workDescription;

  return `${documentTypeCode} — ${workDescriptionPreview}`;
}

function formatRegistryStatus(document: RegistrySourceDocument): string {
  const messages = getRegistryStatusMessages(document);

  return messages.length === 0 ? 'Готово' : messages.join('; ');
}

function getRegistryStatusMessages(document: RegistrySourceDocument): readonly string[] {
  const messages: string[] = [];

  if (document.documentNumber.trim() === '') {
    messages.push('Нет номера');
  }

  if (document.documentDate.trim() === '') {
    messages.push('Нет даты');
  }

  if (document.workDescription.trim() === '') {
    messages.push('Не заполнено описание работ');
  }

  if (document.materialCount !== undefined && document.materialCount === 0) {
    messages.push('Нет материалов');
  }

  if (
    document.confirmationDocumentCount !== undefined &&
    document.confirmationDocumentCount === 0
  ) {
    messages.push('Нет документов');
  }

  return messages;
}
