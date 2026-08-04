import type {
  DemoAosrDraft,
  DemoDocumentNumberingSequences,
  DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type { DemoDocumentationSection } from './object-documentation-sections.js';
import { getDemoIdFolderById, type DemoIdFolders } from './object-id-folders.js';

function formatSectionDocumentNumber(
  sectionTemplateSettings: DemoSectionTemplateSettings,
  sequence: number,
): string {
  return `${sectionTemplateSettings.sectionTemplate.numberingPrefix}${String(sequence)}${sectionTemplateSettings.sectionTemplate.numberingSuffix}`;
}

function normalizeNumberingStart(numberingStart: number): number {
  return Number.isInteger(numberingStart) && numberingStart > 0 ? numberingStart : 1;
}

export function renumberSectionDraftsByFolderOrder({
  currentDrafts,
  currentFolders,
  section,
  sectionTemplateSettings,
}: {
  readonly currentDrafts: readonly DemoAosrDraft[];
  readonly currentFolders: DemoIdFolders;
  readonly section: DemoDocumentationSection;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
}): readonly DemoAosrDraft[] {
  const numberingStart = normalizeNumberingStart(
    sectionTemplateSettings.sectionTemplate.numberingStart,
  );
  const nextNumberingByDraftId = new Map<
    string,
    { readonly actNumber: string; readonly sequences: DemoDocumentNumberingSequences }
  >();
  let sectionSequence = numberingStart;

  for (const folderId of section.folderIds) {
    const folder = getDemoIdFolderById(folderId, currentFolders);
    let folderSequence = numberingStart;

    for (const draftId of folder.draftIds) {
      const draft = currentDrafts.find((currentDraft) => currentDraft.id === draftId);

      if (
        draft?.sectionId !== section.id ||
        draft.numberingAssignment.source !== 'automatic'
      ) {
        continue;
      }

      const sequences = {
        folder: folderSequence,
        section: sectionSequence,
      };
      const selectedSequence =
        sectionTemplateSettings.sectionTemplate.numberingScope === 'section-wide'
          ? sectionSequence
          : folderSequence;

      nextNumberingByDraftId.set(draft.id, {
        actNumber: formatSectionDocumentNumber(sectionTemplateSettings, selectedSequence),
        sequences,
      });
      sectionSequence += 1;
      folderSequence += 1;
    }
  }

  return currentDrafts.map((draft) => {
    const nextNumbering = nextNumberingByDraftId.get(draft.id);

    if (nextNumbering === undefined) {
      return draft;
    }

    return {
      ...draft,
      actNumber: nextNumbering.actNumber,
      numberingAssignment: {
        automaticSequences: nextNumbering.sequences,
        source: 'automatic',
      },
    };
  });
}

export function maybeRenumberAutomaticSectionDrafts({
  currentDrafts,
  currentFolders,
  section,
  sectionTemplateSettings,
}: {
  readonly currentDrafts: readonly DemoAosrDraft[];
  readonly currentFolders: DemoIdFolders;
  readonly section: DemoDocumentationSection | undefined;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
}): readonly DemoAosrDraft[] {
  if (
    section === undefined ||
    sectionTemplateSettings.sectionTemplate.numberingMode !== 'automatic'
  ) {
    return currentDrafts;
  }

  return renumberSectionDraftsByFolderOrder({
    currentDrafts,
    currentFolders,
    section,
    sectionTemplateSettings,
  });
}
