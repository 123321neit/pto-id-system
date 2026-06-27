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
  readonly id: string;
  readonly folderName: string;
  readonly workDescription: string;
}

export interface DerivedRegistryRow {
  readonly actTypeId: DemoActTypeId;
  readonly documentDate: string;
  readonly documentNumber: string;
  readonly documentTypeCode: string;
  readonly documentTypeTitle: string;
  readonly id: string;
  readonly folderName: string;
  readonly rowNumber: number;
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
      documentNumber: document.documentNumber,
      documentTypeCode: actType.code,
      documentTypeTitle: actType.title,
      id: `registry-row-${document.id}`,
      folderName: document.folderName,
      rowNumber: index + 1,
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
    documentDate: draft.actDate,
    documentNumber: draft.actNumber,
    id: draft.id,
    folderName,
    workDescription: draft.workDescription,
  };
}
