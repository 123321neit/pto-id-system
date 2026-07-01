import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

import { getDemoActTypeById, registeredDemoActTypes } from '../act-types/act-types.js';
import { DemoAosrWorkspacePage } from '../aosr-demo/DemoAosrWorkspacePage.js';
import {
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  type DemoAosrDraft,
  type DemoDocumentNumberingSequences,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import { ObjectDocumentsPage } from './ObjectDocumentsPage.js';
import { ObjectFinalPackagePage, ObjectIntermediatePackagePage } from './ObjectFinalPackagePage.js';
import type { MockObjectCard } from './mock-dashboard.js';
import {
  addDemoDocumentationSectionFolder,
  createDemoDocumentationSection,
  demoDocumentationSections,
  getDemoDocumentationSectionById,
  getDemoDocumentationSectionDrafts,
  getDemoDocumentationSectionForFolderId,
  getDemoDocumentationSectionFolders,
  type DemoDocumentationSection,
  type DemoDocumentationSectionId,
  type DemoDocumentationSections,
} from './object-documentation-sections.js';
import { getProposedDemoDocumentNumberDetails } from './object-document-numbering.js';
import {
  addDemoIdFolderDraft,
  createDemoIdFolder,
  demoIdFolders,
  getDemoIdFolderById,
  getDemoIdFolderDrafts,
  moveDemoIdFolderDraft,
  removeDemoIdFolderDraft,
  type DemoIdFolder,
  type DemoIdFolderDraftPlacement,
  type DemoIdFolderId,
  type DemoIdFolders,
} from './object-id-folders.js';
import {
  copySectionTemplateSettingsToTarget,
  createSectionTemplateSettings,
  type DemoSectionTemplateSettingsById,
} from './object-section-template-settings.js';
import {
  cloneSectionTemplateSettingsForClipboard,
  type SectionTemplateClipboard,
} from './section-template-clipboard.js';

const aosrActType = getDemoActTypeById('aosr');
const untitledDocumentLabel = 'Без номера';

function getDocumentDisplayNumber(documentNumber: string): string {
  return documentNumber.trim() === '' ? untitledDocumentLabel : documentNumber;
}

function formatSectionDocumentNumber(
  sectionTemplateSettings: DemoSectionTemplateSettings,
  sequence: number,
): string {
  return `${sectionTemplateSettings.sectionTemplate.numberingPrefix}${String(sequence)}${sectionTemplateSettings.sectionTemplate.numberingSuffix}`;
}

function normalizeNumberingStart(numberingStart: number): number {
  return Number.isInteger(numberingStart) && numberingStart > 0 ? numberingStart : 1;
}

function formatRenumberedActCount(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${String(count)} актов`;
  }

  if (mod10 === 1) {
    return `${String(count)} акт`;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${String(count)} акта`;
  }

  return `${String(count)} актов`;
}

function renumberSectionDraftsByFolderOrder({
  currentDrafts,
  currentFolders,
  mode = 'all',
  section,
  sectionTemplateSettings,
}: {
  readonly currentDrafts: readonly DemoAosrDraft[];
  readonly currentFolders: DemoIdFolders;
  readonly mode?: 'all' | 'automatic-only';
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
        (mode === 'automatic-only' && draft.numberingAssignment.source !== 'automatic')
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

function maybeRenumberAutomaticSectionDrafts({
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
    mode: 'automatic-only',
    section,
    sectionTemplateSettings,
  });
}

function buildInitialSectionTemplateSettings(
  hasDemoContent: boolean,
): DemoSectionTemplateSettingsById {
  if (!hasDemoContent) {
    return {};
  }

  return Object.fromEntries(
    demoDocumentationSections.map((section) => [
      section.templateSettingsId,
      createSectionTemplateSettings(section),
    ]),
  );
}

function FolderGripIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
      <path d="M7 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}

type WorkspaceNavIconName =
  | 'documents'
  | 'final-package'
  | 'folder'
  | 'home'
  | 'section'
  | 'sections'
  | 'settings';

function WorkspaceNavIcon({ name }: { readonly name: WorkspaceNavIconName }): React.JSX.Element {
  switch (name) {
    case 'documents':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M7 4.75h7.2L18 8.55v10.7H7z" />
          <path d="M14 4.75v4h4" />
          <path d="M9.5 12h6M9.5 15h5" />
        </svg>
      );
    case 'final-package':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 7.25h11v12h-11z" />
          <path d="M8.5 4.75h7v2.5h-7zM9.5 11h5M9.5 14h4" />
          <path d="m15.2 15.7 1.1 1.1 2-2.4" />
        </svg>
      );
    case 'folder':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M4.75 8.25h5l1.55 2h7.95v8H4.75z" />
          <path d="M4.75 8.25v-1.5h4.2l1.45 1.5" />
        </svg>
      );
    case 'home':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="m5 11.2 7-5.7 7 5.7" />
          <path d="M7.25 10.25v8.5h9.5v-8.5" />
          <path d="M10.25 18.75v-4h3.5v4" />
        </svg>
      );
    case 'section':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 5.75h11v12.5h-11z" />
          <path d="M9 9h6M9 12h6M9 15h3.5" />
        </svg>
      );
    case 'sections':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M5.5 6h5.25v5.25H5.5zM13.25 6h5.25v5.25h-5.25zM5.5 13.25h5.25v5.25H5.5zM13.25 13.25h5.25v5.25h-5.25z" />
        </svg>
      );
    case 'settings':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M6 8.25h12M6 15.75h12" />
          <path d="M9.25 6.5v3.5M14.75 14v3.5" />
        </svg>
      );
  }
}

function getPointerTargetFolderDraftId(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): { readonly draftId: string; readonly placement: DemoIdFolderDraftPlacement } | null {
  const targetElement = element.ownerDocument.elementFromPoint(clientX, clientY);
  const targetDraft = targetElement?.closest<HTMLElement>('[data-folder-draft-id]');
  const draftId = targetDraft?.dataset['folderDraftId'];

  if (targetDraft === null || targetDraft === undefined || draftId === undefined) {
    return null;
  }

  const targetRect = targetDraft.getBoundingClientRect();
  const placement = clientY > targetRect.top + targetRect.height / 2 ? 'after' : 'before';

  return { draftId, placement };
}

function animateDraftListReorder(
  listElement: HTMLElement | null,
  previousRects: { current: Map<string, DOMRect> },
  selector: string,
  idAttribute: string,
): void {
  if (listElement === null || !('animate' in HTMLElement.prototype)) {
    return;
  }

  const draftElements = Array.from(listElement.querySelectorAll<HTMLElement>(selector));
  const nextRects = new Map<string, DOMRect>();

  draftElements.forEach((draftElement) => {
    const draftId = draftElement.dataset[idAttribute];

    if (draftId === undefined) {
      return;
    }

    const nextRect = draftElement.getBoundingClientRect();
    const previousRect = previousRects.current.get(draftId);

    nextRects.set(draftId, nextRect);

    if (previousRect === undefined) {
      return;
    }

    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
      return;
    }

    draftElement.animate(
      [
        { transform: `translate(${String(deltaX)}px, ${String(deltaY)}px)` },
        { transform: 'translate(0, 0)' },
      ],
      {
        duration: 260,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    );
  });

  previousRects.current = nextRects;
}

type ObjectWorkspaceSection =
  | 'overview'
  | 'sections'
  | 'section'
  | 'folder'
  | 'intermediate-package'
  | 'aosr'
  | 'documents'
  | 'final-package'
  | 'settings';

interface ObjectWorkspacePageProps {
  readonly object: MockObjectCard;
  readonly sectionTemplateClipboard: SectionTemplateClipboard | null;
  readonly onBackToObjects: () => void;
  readonly onSectionTemplateClipboardChange: (clipboard: SectionTemplateClipboard | null) => void;
}

export function ObjectWorkspacePage({
  object,
  sectionTemplateClipboard,
  onBackToObjects,
  onSectionTemplateClipboardChange,
}: ObjectWorkspacePageProps): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<ObjectWorkspaceSection>('overview');
  const hasDemoContent = object.workspaceSeed === 'demo-content';
  const [drafts, setDrafts] = useState<readonly DemoAosrDraft[]>(
    hasDemoContent ? demoAosrWorkspace.drafts : [],
  );
  const [sections, setSections] = useState<DemoDocumentationSections>(
    hasDemoContent ? demoDocumentationSections : [],
  );
  const [selectedSectionId, setSelectedSectionId] = useState<DemoDocumentationSectionId | null>(
    hasDemoContent ? (demoDocumentationSections[0]?.id ?? null) : null,
  );
  const [sectionTemplateSettingsById, setSectionTemplateSettingsById] =
    useState<DemoSectionTemplateSettingsById>(() =>
      buildInitialSectionTemplateSettings(hasDemoContent),
    );
  const [folders, setFolders] = useState<DemoIdFolders>(hasDemoContent ? demoIdFolders : []);
  const [selectedFolderId, setSelectedFolderId] = useState<DemoIdFolderId | null>(
    hasDemoContent ? (demoIdFolders[0]?.id ?? null) : null,
  );
  const [selectedDraftId, setSelectedDraftId] = useState(
    hasDemoContent ? (demoAosrWorkspace.drafts[0]?.id ?? '') : '',
  );
  const [createdAosrDraftCount, setCreatedAosrDraftCount] = useState(1);
  const [createdFolderCount, setCreatedFolderCount] = useState(1);
  const [createdSectionCount, setCreatedSectionCount] = useState(1);
  const [isCreateDocumentPanelOpen, setCreateDocumentPanelOpen] = useState(false);
  const [isCreateFolderPanelOpen, setCreateFolderPanelOpen] = useState(false);
  const [isCreateSectionPanelOpen, setCreateSectionPanelOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [lastTemplateCopyMessage, setLastTemplateCopyMessage] = useState('');
  const isAosrVisible = activeSection === 'aosr' || activeSection === 'settings';
  const selectedSection =
    selectedSectionId === null
      ? undefined
      : getDemoDocumentationSectionById(selectedSectionId, sections);
  const selectedSectionFolders =
    selectedSection === undefined
      ? []
      : getDemoDocumentationSectionFolders(selectedSection, folders);
  const selectedFolder =
    selectedFolderId === null ? undefined : getDemoIdFolderById(selectedFolderId, folders);
  const selectedSectionDrafts = useMemo(
    () =>
      selectedSection === undefined
        ? []
        : getDemoDocumentationSectionDrafts(selectedSection, folders, drafts),
    [drafts, folders, selectedSection],
  );
  const selectedFolderDrafts =
    selectedFolder === undefined ? [] : getDemoIdFolderDrafts(selectedFolder, drafts);
  const selectedSectionTemplateSettings =
    selectedSection === undefined
      ? demoAosrWorkspace.sectionTemplateSettings
      : (sectionTemplateSettingsById[selectedSection.templateSettingsId] ??
        createSectionTemplateSettings(selectedSection));
  const proposedAosrNumberDetails = useMemo(() => {
    if (selectedFolderId === null || selectedSection === undefined) {
      return undefined;
    }

    return getProposedDemoDocumentNumberDetails({
      documentTypeId: 'aosr',
      drafts,
      folderId: selectedFolderId,
      folders,
      sectionId: selectedSection.id,
      setting: {
        documentTypeId: 'aosr',
        mode: selectedSectionTemplateSettings.sectionTemplate.numberingMode,
        prefix: selectedSectionTemplateSettings.sectionTemplate.numberingPrefix,
        scope: selectedSectionTemplateSettings.sectionTemplate.numberingScope,
        start: selectedSectionTemplateSettings.sectionTemplate.numberingStart,
        suffix: selectedSectionTemplateSettings.sectionTemplate.numberingSuffix,
        template: '{prefix}{number}{suffix}',
      },
    });
  }, [
    drafts,
    folders,
    selectedFolderId,
    selectedSection,
    selectedSectionTemplateSettings.sectionTemplate.numberingMode,
    selectedSectionTemplateSettings.sectionTemplate.numberingPrefix,
    selectedSectionTemplateSettings.sectionTemplate.numberingScope,
    selectedSectionTemplateSettings.sectionTemplate.numberingStart,
    selectedSectionTemplateSettings.sectionTemplate.numberingSuffix,
  ]);
  const proposedAosrNumber = proposedAosrNumberDetails?.renderedNumber ?? '';

  const openCreateDocumentPanel = (): void => {
    if (selectedFolder === undefined) {
      return;
    }

    setActiveSection('folder');
    setCreateDocumentPanelOpen(true);
  };

  const openCreateSectionPanel = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setSectionNameInput('');
    setCreateSectionPanelOpen(true);
    setActiveSection('sections');
  };

  const openSectionsPage = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('sections');
  };

  const openObjectDocumentsPage = (): void => {
    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('documents');
  };

  const createSection = (): void => {
    const sectionName = sectionNameInput.trim();

    if (sectionName === '') {
      return;
    }

    const section = createDemoDocumentationSection(
      `section-created-${String(createdSectionCount)}`,
      sectionName,
    );

    setSections((currentSections) => [...currentSections, section]);
    setSectionTemplateSettingsById((currentDefaults) => ({
      ...currentDefaults,
      [section.templateSettingsId]: createSectionTemplateSettings(section),
    }));
    setSelectedSectionId(section.id);
    setSelectedFolderId(null);
    setSelectedDraftId('');
    setCreatedSectionCount((currentCount) => currentCount + 1);
    setCreateSectionPanelOpen(false);
    setSectionNameInput('');
    setActiveSection('section');
  };

  const openCreateFolderPanel = (): void => {
    if (selectedSection === undefined) {
      openCreateSectionPanel();
      return;
    }

    setCreateDocumentPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setFolderNameInput('');
    setCreateFolderPanelOpen(true);
    setActiveSection('section');
  };

  const createFolder = (): void => {
    if (selectedSectionId === null) {
      return;
    }

    const folderName = folderNameInput.trim();

    if (folderName === '') {
      return;
    }

    const folder = createDemoIdFolder(`folder-created-${String(createdFolderCount)}`, folderName);

    setFolders((currentFolders) => [...currentFolders, folder]);
    setSections((currentSections) =>
      addDemoDocumentationSectionFolder(currentSections, selectedSectionId, folder.id),
    );
    setSelectedFolderId(folder.id);
    setSelectedDraftId('');
    setCreatedFolderCount((currentCount) => currentCount + 1);
    setCreateFolderPanelOpen(false);
    setFolderNameInput('');
    setActiveSection('folder');
  };

  const openSection = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(sectionId);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setLastTemplateCopyMessage('');
    setActiveSection('section');
  };

  const openFolder = (folderId: DemoIdFolderId): void => {
    const section = getDemoDocumentationSectionForFolderId(folderId, sections);

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(folderId);
    const folder = getDemoIdFolderById(folderId, folders);
    setSelectedDraftId(folder.draftIds[0] ?? '');
    setLastTemplateCopyMessage('');
    setActiveSection('folder');
  };

  const openAosr = (folderId: DemoIdFolderId | null = selectedFolderId, draftId?: string): void => {
    if (folderId === null) {
      return;
    }

    const folder = getDemoIdFolderById(folderId, folders);
    const section = getDemoDocumentationSectionForFolderId(folderId, sections);

    setCreateDocumentPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(folderId);
    setSelectedDraftId(draftId ?? folder.draftIds[0] ?? '');
    setActiveSection('aosr');
  };

  const createAosrDraft = (): void => {
    if (
      selectedFolderId === null ||
      selectedSection === undefined ||
      proposedAosrNumberDetails === undefined
    ) {
      return;
    }

    const draft = createEmptyDemoAosrDraft({
      actNumber: proposedAosrNumber,
      folderId: selectedFolderId,
      id: `aosr-draft-created-${String(createdAosrDraftCount)}`,
      numberingAssignment: proposedAosrNumberDetails.numberingAssignment,
      sectionTemplateSettings: selectedSectionTemplateSettings,
      sectionId: selectedSection.id,
      sectionTemplateSettingsId: selectedSection.templateSettingsId,
    });

    setDrafts((currentDrafts) => [...currentDrafts, draft]);
    setFolders((currentFolders) =>
      addDemoIdFolderDraft(currentFolders, selectedFolderId, draft.id),
    );
    setCreatedAosrDraftCount((currentCount) => currentCount + 1);
    setCreateDocumentPanelOpen(false);
    setSelectedDraftId(draft.id);
    setActiveSection('aosr');
  };

  const deleteAosrDraftFromCurrentFolder = (draftId: string, nextSelectedDraftId: string): void => {
    const nextFolders = removeDemoIdFolderDraft(folders, draftId);

    setFolders(nextFolders);
    setDrafts((currentDrafts) =>
      maybeRenumberAutomaticSectionDrafts({
        currentDrafts: currentDrafts.filter((currentDraft) => currentDraft.id !== draftId),
        currentFolders: nextFolders,
        section: selectedSection,
        sectionTemplateSettings: selectedSectionTemplateSettings,
      }),
    );
    setSelectedDraftId(nextSelectedDraftId);

    if (nextSelectedDraftId === '') {
      setActiveSection('folder');
    }
  };

  const deleteAosrDraftFromFolder = (draftId: string): void => {
    const draft = drafts.find((currentDraft) => currentDraft.id === draftId);

    if (draft === undefined) {
      return;
    }

    const draftLabel = getDocumentDisplayNumber(draft.actNumber);
    const shouldDelete = window.confirm(
      `Удалить акт ${draftLabel}? Акт будет удалён из текущей папки.`,
    );

    if (!shouldDelete) {
      return;
    }

    const nextSelectedDraftId = selectedFolderDrafts.find(({ id }) => id !== draftId)?.id ?? '';

    deleteAosrDraftFromCurrentFolder(draftId, nextSelectedDraftId);
  };

  const reorderAosrDraftInSelectedFolder = (
    draggedDraftId: string,
    targetDraftId: string,
    placement: DemoIdFolderDraftPlacement = 'before',
  ): void => {
    if (
      selectedFolderId === null ||
      selectedSection === undefined ||
      draggedDraftId === targetDraftId
    ) {
      return;
    }

    setFolders((currentFolders) => {
      const nextFolders = moveDemoIdFolderDraft(
        currentFolders,
        selectedFolderId,
        draggedDraftId,
        targetDraftId,
        placement,
      );

      setDrafts((currentDrafts) =>
        maybeRenumberAutomaticSectionDrafts({
          currentDrafts,
          currentFolders: nextFolders,
          section: selectedSection,
          sectionTemplateSettings: selectedSectionTemplateSettings,
        }),
      );

      return nextFolders;
    });
  };

  const openObjectSettings = (): void => {
    if (selectedSection === undefined) {
      openCreateSectionPanel();
      return;
    }

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setActiveSection('settings');
  };

  const openSectionTemplateSettings = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setActiveSection('settings');
  };

  const openSectionFinalPackage = (sectionId: DemoDocumentationSectionId): void => {
    const section = getDemoDocumentationSectionById(sectionId, sections);
    const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
    const firstFolder = sectionFolders[0];

    setCreateDocumentPanelOpen(false);
    setCreateFolderPanelOpen(false);
    setCreateSectionPanelOpen(false);
    setSelectedSectionId(section.id);
    setSelectedFolderId(firstFolder?.id ?? null);
    setSelectedDraftId(firstFolder?.draftIds[0] ?? '');
    setActiveSection('final-package');
  };

  const updateSelectedSectionTemplateSettings = (
    nextSectionTemplateSettings: DemoSectionTemplateSettings,
  ): void => {
    if (selectedSection === undefined) {
      return;
    }

    setSectionTemplateSettingsById((currentDefaults) => ({
      ...currentDefaults,
      [selectedSection.templateSettingsId]: nextSectionTemplateSettings,
    }));
  };

  const copySelectedSectionTemplateToClipboard = (): void => {
    if (selectedSection === undefined) {
      return;
    }

    onSectionTemplateClipboardChange({
      sectionTemplateSettings: cloneSectionTemplateSettingsForClipboard(
        selectedSectionTemplateSettings,
      ),
      sourceObjectId: object.id,
      sourceObjectTitle: object.title,
      sourceSectionId: selectedSection.id,
      sourceSectionName: selectedSection.name,
    });
    setLastTemplateCopyMessage('Шаблонные значения скопированы.');
  };

  const pasteSectionTemplateFromClipboard = (): void => {
    if (
      selectedSection === undefined ||
      sectionTemplateClipboard === null ||
      (sectionTemplateClipboard.sourceObjectId === object.id &&
        sectionTemplateClipboard.sourceSectionId === selectedSection.id)
    ) {
      return;
    }

    const shouldPaste = window.confirm(
      `Вставить шаблонные значения из раздела «${sectionTemplateClipboard.sourceSectionName}» объекта «${sectionTemplateClipboard.sourceObjectTitle}»?\n` +
        'Будут заменены шаблонные значения текущего раздела.\n' +
        'Папки, акты, выпущенные комплекты и файлы не изменятся.\n' +
        'Префикс текущего раздела сохранится.\n' +
        'Продолжить?',
    );

    if (!shouldPaste) {
      return;
    }

    setSectionTemplateSettingsById((currentDefaults) => {
      const currentTargetSettings = currentDefaults[selectedSection.templateSettingsId];

      return {
        ...currentDefaults,
        [selectedSection.templateSettingsId]: copySectionTemplateSettingsToTarget(
          sectionTemplateClipboard.sectionTemplateSettings,
          selectedSection,
          currentTargetSettings,
        ),
      };
    });
    setLastTemplateCopyMessage('Шаблонные значения вставлены. Префикс текущего раздела сохранён.');
  };

  const renumberSelectedSectionDrafts = (): void => {
    if (
      selectedSection === undefined ||
      selectedSectionDrafts.length === 0 ||
      selectedSectionTemplateSettings.sectionTemplate.numberingMode !== 'automatic'
    ) {
      return;
    }

    const shouldRenumber = window.confirm(
      'Задать автоматическую нумерацию для всех актов раздела?\n' +
        `Будут изменены номера актов выбранного раздела: ${formatRenumberedActCount(
          selectedSectionDrafts.length,
        )}.\n` +
        'Шаблонные значения акта и ручной/связанный режим шаблона не изменятся.\n' +
        'Продолжить?',
    );

    if (!shouldRenumber) {
      return;
    }

    setDrafts((currentDrafts) =>
      renumberSectionDraftsByFolderOrder({
        currentDrafts,
        currentFolders: folders,
        section: selectedSection,
        sectionTemplateSettings: selectedSectionTemplateSettings,
      }),
    );
    setLastTemplateCopyMessage('Автоматическая нумерация применена ко всем актам раздела.');
  };

  return (
    <main className="object-workspace-shell">
      <aside className="object-workspace-nav" aria-label="Навигация объекта">
        <button
          aria-label="Назад к объектам"
          className="object-workspace-nav__back"
          onClick={onBackToObjects}
          type="button"
        >
          ← Назад к объектам
        </button>

        <div className="object-workspace-nav__identity">
          <p className="section-kicker">Объект</p>
          <strong>{object.title}</strong>
          <small>{object.address}</small>
        </div>

        <nav className="object-workspace-nav__sections" aria-label="Разделы объекта">
          <div className="object-workspace-nav__group" aria-labelledby="object-nav-work-title">
            <p className="object-workspace-nav__group-label" id="object-nav-work-title">
              Работа
            </p>
            <button
              aria-current={activeSection === 'overview' ? 'page' : undefined}
              aria-label="Обзор объекта"
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('overview');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                <WorkspaceNavIcon name="home" />
              </span>
              <span className="object-workspace-nav__label">
                <strong>Обзор объекта</strong>
                <small>Общая картина</small>
              </span>
            </button>
            <button
              aria-label="Разделы ИД"
              aria-current={activeSection === 'sections' ? 'page' : undefined}
              onClick={() => {
                setCreateDocumentPanelOpen(false);
                setCreateFolderPanelOpen(false);
                setCreateSectionPanelOpen(false);
                setActiveSection('sections');
              }}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                <WorkspaceNavIcon name="sections" />
              </span>
              <span className="object-workspace-nav__label">
                <strong>Разделы ИД</strong>
                <small>Список разделов</small>
              </span>
            </button>
          </div>

          <div
            className="object-workspace-nav__group object-workspace-nav__group--tree"
            aria-labelledby="object-nav-current-title"
          >
            <p className="object-workspace-nav__group-label" id="object-nav-current-title">
              Объект
            </p>
            {sections.length === 0 ? (
              <div className="object-workspace-nav__empty-current">
                <strong>Разделов пока нет</strong>
                <small>Создайте первый раздел в «Разделы ИД».</small>
              </div>
            ) : (
              <ul className="object-workspace-tree" aria-label="Дерево разделов и папок объекта">
                {sections.map((section) => {
                  const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
                  const isSelectedSection = selectedSectionId === section.id;

                  return (
                    <li className="object-workspace-tree__section" key={section.id}>
                      <button
                        aria-current={
                          isSelectedSection && activeSection === 'section' ? 'page' : undefined
                        }
                        aria-label={`Открыть раздел ${section.name}`}
                        onClick={() => {
                          openSection(section.id);
                        }}
                        type="button"
                      >
                        <span className="object-workspace-nav__icon" aria-hidden="true">
                          <WorkspaceNavIcon name="section" />
                        </span>
                        <span className="object-workspace-nav__label">
                          <strong>{section.name}</strong>
                          <small>
                            {sectionFolders.length === 0
                              ? 'Папок пока нет'
                              : `${String(sectionFolders.length)} ${getFolderCountLabel(
                                  sectionFolders.length,
                                )}`}
                          </small>
                        </span>
                      </button>

                      <ul className="object-workspace-tree__children">
                        <li>
                          <button
                            aria-current={
                              isSelectedSection && activeSection === 'settings' ? 'page' : undefined
                            }
                            aria-label={`Шаблонные значения раздела ${section.name}`}
                            className="object-workspace-nav__subitem"
                            onClick={() => {
                              openSectionTemplateSettings(section.id);
                            }}
                            type="button"
                          >
                            <span className="object-workspace-nav__icon" aria-hidden="true">
                              <WorkspaceNavIcon name="settings" />
                            </span>
                            <span className="object-workspace-nav__label">
                              <strong>Шаблонные значения раздела</strong>
                              <small>{section.name}</small>
                            </span>
                          </button>
                        </li>
                        {sectionFolders.map((folder) => (
                          <li key={folder.id}>
                            <button
                              aria-current={
                                selectedFolderId === folder.id &&
                                (activeSection === 'folder' ||
                                  activeSection === 'intermediate-package' ||
                                  activeSection === 'aosr')
                                  ? 'page'
                                  : undefined
                              }
                              aria-label={`Открыть папку ${folder.name}`}
                              className="object-workspace-nav__subitem"
                              onClick={() => {
                                openFolder(folder.id);
                              }}
                              type="button"
                            >
                              <span className="object-workspace-nav__icon" aria-hidden="true">
                                <WorkspaceNavIcon name="folder" />
                              </span>
                              <span className="object-workspace-nav__label">
                                <strong>{folder.name}</strong>
                                <small>Папка раздела</small>
                              </span>
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            aria-current={
                              isSelectedSection && activeSection === 'final-package'
                                ? 'page'
                                : undefined
                            }
                            aria-label={`Итоговая ИД по разделу ${section.name}`}
                            className="object-workspace-nav__subitem"
                            onClick={() => {
                              openSectionFinalPackage(section.id);
                            }}
                            type="button"
                          >
                            <span className="object-workspace-nav__icon" aria-hidden="true">
                              <WorkspaceNavIcon name="final-package" />
                            </span>
                            <span className="object-workspace-nav__label">
                              <strong>Итоговая ИД по разделу</strong>
                              <small>{section.name}</small>
                            </span>
                          </button>
                        </li>
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div
            className="object-workspace-nav__group object-workspace-nav__group--service"
            aria-labelledby="object-nav-service-title"
          >
            <p className="object-workspace-nav__group-label" id="object-nav-service-title">
              Сервис
            </p>
            <button
              aria-current={activeSection === 'documents' ? 'page' : undefined}
              aria-label="Открыть документы объекта"
              onClick={openObjectDocumentsPage}
              type="button"
            >
              <span className="object-workspace-nav__icon" aria-hidden="true">
                <WorkspaceNavIcon name="documents" />
              </span>
              <span className="object-workspace-nav__label">
                <strong>Документы объекта</strong>
                <small>Схемы и журналы</small>
              </span>
            </button>
          </div>
        </nav>
      </aside>

      <section className="object-workspace-main" aria-labelledby="object-workspace-title">
        <ObjectWorkspaceHeader object={object} activeSection={activeSection} />

        {activeSection === 'overview' ? (
          <ObjectOverview
            sections={sections}
            selectedSection={selectedSection}
            selectedSectionFolders={selectedSectionFolders}
            onCreateSection={openCreateSectionPanel}
            onOpenSection={openSection}
            onOpenSectionsPage={openSectionsPage}
          />
        ) : null}

        {activeSection === 'sections' ? (
          <ObjectSectionsPage
            drafts={drafts}
            isCreateSectionPanelOpen={isCreateSectionPanelOpen}
            sectionName={sectionNameInput}
            folders={folders}
            sections={sections}
            onChangeSectionName={setSectionNameInput}
            onCloseCreateSectionPanel={() => {
              setCreateSectionPanelOpen(false);
            }}
            onCreateSection={createSection}
            onOpenCreateSectionPanel={openCreateSectionPanel}
            onOpenSection={openSection}
            onOpenSectionTemplateSettings={(sectionId) => {
              setSelectedSectionId(sectionId);
              setActiveSection('settings');
            }}
          />
        ) : null}

        {activeSection === 'section' ? (
          <ObjectSectionPage
            drafts={drafts}
            folderName={folderNameInput}
            isCreateFolderPanelOpen={isCreateFolderPanelOpen}
            selectedSection={selectedSection}
            selectedSectionFolders={selectedSectionFolders}
            onChangeFolderName={setFolderNameInput}
            onCloseCreateFolderPanel={() => {
              setCreateFolderPanelOpen(false);
            }}
            onCreateFolder={createFolder}
            onOpenCreateFolderPanel={openCreateFolderPanel}
            onOpenFinalPackage={() => {
              setActiveSection('final-package');
            }}
            onOpenFolder={openFolder}
            onOpenSectionTemplateSettings={openObjectSettings}
          />
        ) : null}

        {activeSection === 'folder' && selectedFolder !== undefined ? (
          <ObjectFolderPage
            drafts={selectedFolderDrafts}
            isCreateDocumentPanelOpen={isCreateDocumentPanelOpen}
            folder={selectedFolder}
            sectionName={selectedSection?.name}
            onCloseCreateDocumentPanel={() => {
              setCreateDocumentPanelOpen(false);
            }}
            onCreateAosr={createAosrDraft}
            onDeleteAosr={deleteAosrDraftFromFolder}
            onOpenAosr={(draftId) => {
              openAosr(selectedFolder.id, draftId);
            }}
            onOpenCreateDocumentPanel={openCreateDocumentPanel}
            onOpenIntermediatePackage={() => {
              setCreateDocumentPanelOpen(false);
              setActiveSection('intermediate-package');
            }}
            onReorderAosr={reorderAosrDraftInSelectedFolder}
          />
        ) : null}

        {activeSection === 'intermediate-package' && selectedFolder !== undefined ? (
          <ObjectIntermediatePackagePage drafts={drafts} folder={selectedFolder} />
        ) : null}

        {isAosrVisible && (selectedFolder !== undefined || activeSection === 'settings') ? (
          <DemoAosrWorkspacePage
            drafts={drafts}
            initialSelectedDraftId={selectedDraftId}
            isEmbeddedInObjectWorkspace
            isSectionTemplateSettingsPage={activeSection === 'settings'}
            sectionTemplateSettings={selectedSectionTemplateSettings}
            onDraftsChange={setDrafts}
            onDeleteDraft={deleteAosrDraftFromCurrentFolder}
            onSectionTemplateSettingsChange={updateSelectedSectionTemplateSettings}
            lastTemplateCopyMessage={lastTemplateCopyMessage}
            folderName={selectedFolder?.name}
            objectId={object.id}
            objectTitle={object.title}
            sectionDraftCount={selectedSectionDrafts.length}
            sectionId={selectedSection?.id}
            sectionName={selectedSection?.name}
            sectionTemplateClipboard={sectionTemplateClipboard}
            visibleDraftIds={selectedFolder?.draftIds ?? []}
            onCopySectionTemplate={copySelectedSectionTemplateToClipboard}
            onCreateActInFolder={openCreateDocumentPanel}
            onObjectSettingsClosed={() => {
              setActiveSection('section');
            }}
            onPasteSectionTemplate={pasteSectionTemplateFromClipboard}
            onRenumberSectionDrafts={renumberSelectedSectionDrafts}
            onReorderDrafts={reorderAosrDraftInSelectedFolder}
          />
        ) : null}

        {activeSection === 'documents' ? <ObjectDocumentsPage /> : null}

        {activeSection === 'final-package' ? (
          <ObjectFinalPackagePage
            drafts={selectedSectionDrafts}
            folders={selectedSectionFolders}
            sectionName={selectedSection?.name}
          />
        ) : null}
      </section>
    </main>
  );
}

interface ObjectWorkspaceHeaderProps {
  readonly activeSection: ObjectWorkspaceSection;
  readonly object: MockObjectCard;
}

function ObjectWorkspaceHeader({
  activeSection,
  object,
}: ObjectWorkspaceHeaderProps): React.JSX.Element {
  const sectionBreadcrumb = getSectionBreadcrumb(activeSection);

  return (
    <header className="object-workspace-header">
      <div className="object-workspace-header__title">
        <p className="object-workspace-breadcrumbs">
          Объекты / {object.title} / {sectionBreadcrumb}
        </p>
        <h1 id="object-workspace-title">{object.title}</h1>
        <p>{object.address}</p>
      </div>
    </header>
  );
}

function getSectionBreadcrumb(section: ObjectWorkspaceSection): string {
  switch (section) {
    case 'overview':
      return 'Обзор';
    case 'sections':
      return 'Разделы ИД';
    case 'section':
      return 'Разделы ИД / Обзор раздела';
    case 'folder':
      return 'Разделы ИД / Папка';
    case 'intermediate-package':
      return 'Разделы ИД / Промежуточная ИД по папке';
    case 'aosr':
      return `Разделы ИД / ${aosrActType.code}`;
    case 'settings':
      return 'Шаблонные значения раздела';
    case 'documents':
      return 'Документы объекта';
    case 'final-package':
      return 'Итоговая ИД по разделу';
  }
}

interface ObjectOverviewProps {
  readonly sections: readonly DemoDocumentationSection[];
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onCreateSection: () => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionsPage: () => void;
}

function ObjectOverview({
  sections,
  selectedSection,
  selectedSectionFolders,
  onCreateSection,
  onOpenSection,
  onOpenSectionsPage,
}: ObjectOverviewProps): React.JSX.Element {
  return (
    <section className="object-overview" aria-labelledby="object-overview-title">
      <div className="object-overview__heading">
        <p className="section-kicker">Обзор</p>
        <h2 id="object-overview-title">Обзор объекта</h2>
      </div>

      {selectedSection === undefined ? (
        <section
          className="object-overview__focus object-overview__focus--empty"
          aria-labelledby="overview-focus-title"
        >
          <div className="object-overview__focus-main">
            <p className="section-kicker">Начало работы</p>
            <h3 id="overview-focus-title">Создайте первый раздел ИД</h3>
            <p>
              Раздел объединяет свои папки, промежуточные комплекты и итоговую ИД. Например:
              «Вентиляция» или «Отопление».
            </p>
          </div>
          <div className="object-overview__focus-actions">
            <button
              className="action-button action-button--primary"
              onClick={onCreateSection}
              type="button"
            >
              Создать раздел
            </button>
          </div>
        </section>
      ) : (
        <section className="object-overview__focus" aria-labelledby="overview-focus-title">
          <div className="object-overview__focus-main">
            <p className="section-kicker">Продолжить работу</p>
            <h3 id="overview-focus-title">{selectedSection.name}</h3>
            <p>
              Раздел содержит {selectedSectionFolders.length}{' '}
              {getFolderCountLabel(selectedSectionFolders.length)}. Итоговая ИД по разделу
              собирается именно из папок выбранного раздела.
            </p>
          </div>
          <div className="object-overview__focus-actions">
            <button
              className="action-button action-button--primary"
              onClick={() => {
                onOpenSection(selectedSection.id);
              }}
              type="button"
            >
              Открыть раздел
            </button>
            <button className="compact-toggle" onClick={onOpenSectionsPage} type="button">
              Перейти к разделам ИД
            </button>
          </div>
        </section>
      )}

      {sections.length > 0 ? (
        <section className="object-overview__panel" aria-labelledby="overview-sections-title">
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Разделы ИД</p>
            <h3 id="overview-sections-title">Рабочие разделы объекта</h3>
          </div>
          <ul className="object-overview__recent-list object-overview__recent-list--wide">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => {
                    onOpenSection(section.id);
                  }}
                  type="button"
                >
                  <span>
                    <strong>{section.name}</strong>
                    <small>
                      {section.folderIds.length} {getFolderCountLabel(section.folderIds.length)}
                    </small>
                  </span>
                  <span>
                    <small>Итоговая ИД</small>
                    <strong>по разделу</strong>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="object-overview__panel" aria-labelledby="overview-workflow-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Порядок работы</p>
          <h3 id="overview-workflow-title">Объект → раздел → папка → акт</h3>
        </div>
        <ol className="object-workspace-help-list">
          <li>Выберите или создайте раздел ИД.</li>
          <li>Внутри раздела создайте папку.</li>
          <li>Акты создаются только внутри выбранной папки.</li>
        </ol>
      </section>
    </section>
  );
}

interface ObjectSectionsPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly isCreateSectionPanelOpen: boolean;
  readonly sectionName: string;
  readonly folders: readonly DemoIdFolder[];
  readonly sections: readonly DemoDocumentationSection[];
  readonly onChangeSectionName: (value: string) => void;
  readonly onCloseCreateSectionPanel: () => void;
  readonly onCreateSection: () => void;
  readonly onOpenCreateSectionPanel: () => void;
  readonly onOpenSection: (sectionId: DemoDocumentationSectionId) => void;
  readonly onOpenSectionTemplateSettings: (sectionId: DemoDocumentationSectionId) => void;
}

function ObjectSectionsPage({
  drafts,
  isCreateSectionPanelOpen,
  sectionName,
  folders,
  sections,
  onChangeSectionName,
  onCloseCreateSectionPanel,
  onCreateSection,
  onOpenCreateSectionPanel,
  onOpenSection,
  onOpenSectionTemplateSettings,
}: ObjectSectionsPageProps): React.JSX.Element {
  return (
    <section className="object-folders" aria-labelledby="object-folders-title">
      <div className="object-folders__topline">
        <div className="object-folders__heading">
          <p className="section-kicker">Разделы ИД — список разделов</p>
          <h2 id="object-folders-title">Разделы исполнительной документации</h2>
          <p>
            Раздел — это направление или часть работ на объекте. Например: Вентиляция, Отопление,
            ВК, Дымоудаление, Система В1.
          </p>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateSectionPanel}
            type="button"
          >
            Создать раздел
          </button>
        </div>
      </div>

      {isCreateSectionPanelOpen ? (
        <form
          className="object-folder-create-panel"
          aria-label="Создать раздел ИД"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateSection();
          }}
        >
          <div>
            <p className="section-kicker">Новый раздел</p>
            <h3>Как назвать раздел?</h3>
            <p>Например: «Вентиляция», «Отопление», «Водоснабжение» или «Система В1».</p>
          </div>
          <label>
            Название раздела
            <input
              autoFocus
              onChange={(event) => {
                onChangeSectionName(event.currentTarget.value);
              }}
              placeholder="Введите произвольное название раздела"
              value={sectionName}
            />
          </label>
          <div className="object-folder-create-panel__actions">
            <button className="compact-toggle" onClick={onCloseCreateSectionPanel} type="button">
              Отмена
            </button>
            <button
              className="action-button action-button--primary"
              disabled={sectionName.trim() === ''}
              type="submit"
            >
              Создать раздел
            </button>
          </div>
        </form>
      ) : null}

      {sections.length === 0 ? (
        <section className="object-folders__empty" aria-label="Разделов ИД пока нет">
          <span aria-hidden="true">◧</span>
          <div>
            <h3>Разделов ИД пока нет</h3>
            <p>Создайте первый раздел, затем добавьте в него папку и акты.</p>
          </div>
        </section>
      ) : (
        <>
          <div className="object-section-card-list" aria-label="Все разделы ИД">
            {sections.map((section) => {
              const sectionFolders = getDemoDocumentationSectionFolders(section, folders);
              const sectionDrafts = getDemoDocumentationSectionDrafts(section, folders, drafts);
              const lastDraft = getLatestDraft(sectionDrafts);

              return (
                <article className="object-section-card" key={section.id}>
                  <span className="object-section-card__icon" aria-hidden="true">
                    ◧
                  </span>
                  <div className="object-section-card__body">
                    <h3>{section.name}</h3>
                    <p className="object-section-card__meta">
                      {sectionFolders.length === 0
                        ? 'Папок пока нет'
                        : `${String(sectionFolders.length)} ${getFolderCountLabel(
                            sectionFolders.length,
                          )} · ${String(sectionDrafts.length)} ${getActCountLabel(
                            sectionDrafts.length,
                          )}`}
                    </p>
                    {lastDraft === undefined ? (
                      <p className="object-section-card__hint">Акты пока не созданы</p>
                    ) : (
                      <p className="object-section-card__hint">
                        Последний акт: {getDocumentDisplayNumber(lastDraft.actNumber)} от{' '}
                        {formatShortDate(lastDraft.actDate)}
                      </p>
                    )}
                  </div>
                  <div className="object-section-card__actions">
                    <button
                      aria-label={`Открыть раздел ${section.name}`}
                      className="compact-toggle compact-toggle--accent"
                      onClick={() => {
                        onOpenSection(section.id);
                      }}
                      type="button"
                    >
                      Открыть раздел
                    </button>
                    <button
                      aria-label={`Шаблонные значения раздела ${section.name}`}
                      className="compact-toggle"
                      onClick={() => {
                        onOpenSectionTemplateSettings(section.id);
                      }}
                      type="button"
                    >
                      Шаблонные значения раздела
                    </button>
                    <button
                      aria-label={`Дополнительные действия раздела ${section.name}`}
                      className="compact-toggle compact-toggle--icon"
                      type="button"
                    >
                      …
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="object-overview__panel" aria-labelledby="sections-start-title">
            <div className="object-overview__panel-heading">
              <p className="section-kicker">С чего начать?</p>
              <h3 id="sections-start-title">Простой порядок работы</h3>
            </div>
            <ol className="object-workspace-help-list">
              <li>Создайте раздел.</li>
              <li>Создайте папку внутри раздела.</li>
              <li>Создайте акт уже внутри папки.</li>
            </ol>
          </section>
        </>
      )}
    </section>
  );
}

interface ObjectSectionPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly folderName: string;
  readonly isCreateFolderPanelOpen: boolean;
  readonly selectedSection: DemoDocumentationSection | undefined;
  readonly selectedSectionFolders: readonly DemoIdFolder[];
  readonly onChangeFolderName: (value: string) => void;
  readonly onCloseCreateFolderPanel: () => void;
  readonly onCreateFolder: () => void;
  readonly onOpenCreateFolderPanel: () => void;
  readonly onOpenFinalPackage: () => void;
  readonly onOpenFolder: (folderId: DemoIdFolderId) => void;
  readonly onOpenSectionTemplateSettings: () => void;
}

function ObjectSectionPage({
  drafts,
  folderName,
  isCreateFolderPanelOpen,
  selectedSection,
  selectedSectionFolders,
  onChangeFolderName,
  onCloseCreateFolderPanel,
  onCreateFolder,
  onOpenCreateFolderPanel,
  onOpenFinalPackage,
  onOpenFolder,
  onOpenSectionTemplateSettings,
}: ObjectSectionPageProps): React.JSX.Element {
  if (selectedSection === undefined) {
    return (
      <section className="object-folders__empty" aria-label="Раздел не выбран">
        <span aria-hidden="true">◧</span>
        <div>
          <h2>Раздел не выбран</h2>
          <p>Откройте раздел на экране «Разделы ИД».</p>
        </div>
      </section>
    );
  }

  return (
    <section className="object-folders" aria-labelledby="section-overview-title">
      <div className="object-folders__topline">
        <div className="object-folders__heading">
          <p className="object-workspace-breadcrumbs">Разделы ИД / {selectedSection.name}</p>
          <h2 id="section-overview-title">{selectedSection.name}</h2>
          <p>
            Раздел исполнительной документации. Внутри раздела создаются папки, а акты создаются уже
            внутри папок.
          </p>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateFolderPanel}
            type="button"
          >
            Создать папку
          </button>
          <button className="compact-toggle" onClick={onOpenFinalPackage} type="button">
            Итоговая ИД по разделу
          </button>
          <button className="compact-toggle" onClick={onOpenSectionTemplateSettings} type="button">
            Шаблонные значения раздела
          </button>
          <button
            aria-label={`Дополнительные действия раздела ${selectedSection.name}`}
            className="compact-toggle compact-toggle--icon"
            type="button"
          >
            …
          </button>
        </div>
      </div>

      {isCreateFolderPanelOpen ? (
        <form
          className="object-folder-create-panel"
          aria-label="Создать папку ИД"
          onSubmit={(event) => {
            event.preventDefault();
            onCreateFolder();
          }}
        >
          <div>
            <p className="section-kicker">Новая папка</p>
            <h3>Как назвать папку?</h3>
            <p>
              Папка будет создана внутри раздела <strong>{selectedSection.name}</strong>. Например:
              «Сентябрь 2026», «Монтаж воздуховодов» или «Этап 1».
            </p>
          </div>
          <label>
            Название папки
            <input
              autoFocus
              onChange={(event) => {
                onChangeFolderName(event.currentTarget.value);
              }}
              placeholder="Введите произвольное название"
              value={folderName}
            />
          </label>
          <div className="object-folder-create-panel__actions">
            <button className="compact-toggle" onClick={onCloseCreateFolderPanel} type="button">
              Отмена
            </button>
            <button
              className="action-button action-button--primary"
              disabled={folderName.trim() === ''}
              type="submit"
            >
              Создать папку
            </button>
          </div>
        </form>
      ) : null}

      <section className="object-overview__panel" aria-labelledby="section-folders-title">
        <div className="object-overview__panel-heading">
          <p className="section-kicker">Папки раздела</p>
          <h3 id="section-folders-title">Папки раздела</h3>
        </div>
        {selectedSectionFolders.length === 0 ? (
          <div className="object-folder-panel__empty">
            <strong>В этом разделе пока нет папок.</strong>
            <p>
              Папка — это этап, месяц или комплект документов внутри раздела. Например: «Сентябрь
              2026», «Монтаж воздуховодов», «Этап 1».
            </p>
            <button
              className="action-button action-button--primary"
              onClick={onOpenCreateFolderPanel}
              type="button"
            >
              Создать папку
            </button>
          </div>
        ) : (
          <div className="object-folder-directory" aria-label="Папки раздела">
            {selectedSectionFolders.map((folder) => {
              const folderDrafts = getDemoIdFolderDrafts(folder, drafts);
              const lastDraft = getLatestDraft(folderDrafts);

              return (
                <button
                  aria-label={`Открыть папку ${folder.name}`}
                  className="object-folder-row"
                  key={folder.id}
                  onClick={() => {
                    onOpenFolder(folder.id);
                  }}
                  type="button"
                >
                  <span className="object-folder-row__icon" aria-hidden="true">
                    ▣
                  </span>
                  <span className="object-folder-row__main">
                    <strong>{folder.name}</strong>
                    <small>
                      {folderDrafts.length} {getActCountLabel(folderDrafts.length)}
                    </small>
                  </span>
                  <span className="object-folder-row__count">
                    {lastDraft === undefined
                      ? 'Обновлений нет'
                      : `Обновлено: ${formatShortDate(lastDraft.actDate)}`}
                  </span>
                  <span className="object-folder-row__action">Открыть</span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function getFolderCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'папок';
  }

  if (remainder10 === 1) {
    return 'папка';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'папки';
  }

  return 'папок';
}

function getActCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'актов';
  }

  if (remainder10 === 1) {
    return 'акт';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'акта';
  }

  return 'актов';
}

function getLatestDraft(drafts: readonly DemoAosrDraft[]): DemoAosrDraft | undefined {
  return [...drafts].sort((left, right) => right.actDate.localeCompare(left.actDate))[0];
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}

interface CreateDocumentPanelProps {
  readonly selectedSectionName: string | undefined;
  readonly selectedFolder: DemoIdFolder;
  readonly onClose: () => void;
  readonly onCreateAosr: () => void;
}

function CreateDocumentPanel({
  selectedSectionName,
  selectedFolder,
  onClose,
  onCreateAosr,
}: CreateDocumentPanelProps): React.JSX.Element {
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<string>(aosrActType.id);

  return (
    <section
      className="object-overview__create-panel"
      role="dialog"
      aria-labelledby="create-document-title"
    >
      <div className="object-overview__create-panel-header">
        <p className="section-kicker">Новый акт</p>
        <h3 id="create-document-title">Создание акта</h3>
        <p>
          Акт будет сохранён в папке <strong>«{selectedFolder.name}»</strong>
          {selectedSectionName === undefined ? '.' : ` раздела «${selectedSectionName}».`}
        </p>
      </div>
      <div className="object-overview__numbering-note">
        <h4>Номер будет присвоен после создания</h4>
        <p>
          Номер будет назначен после создания акта, если автоматическая нумерация включена в
          шаблонных значениях раздела. Если нумерация ручная — номер можно указать в редактировании
          акта.
        </p>
      </div>
      <ul className="document-type-card-list" role="radiogroup" aria-label="Тип акта">
        {registeredDemoActTypes.map((actType) => {
          const isSelected = selectedDocumentTypeId === actType.id;

          return (
            <li key={actType.id}>
              <button
                aria-checked={isSelected}
                className={`document-type-card document-type-card--available${
                  isSelected ? ' document-type-card--selected' : ''
                }`}
                onClick={() => {
                  setSelectedDocumentTypeId(actType.id);
                }}
                role="radio"
                type="button"
              >
                <span className="document-type-card__icon" aria-hidden="true">
                  {isSelected ? '✓' : actType.code}
                </span>
                <span className="document-type-card__body">
                  <strong>{actType.code}</strong>
                  <small>
                    {actType.code} — {actType.title}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
        <li className="document-type-card document-type-card--disabled" aria-disabled="true">
          <span className="document-type-card__icon" aria-hidden="true">
            АИ
          </span>
          <span className="document-type-card__body">
            <strong>Акт испытаний</strong>
            <small>Будущий тип документа — скоро</small>
          </span>
          <button className="compact-toggle" disabled type="button">
            Скоро
          </button>
        </li>
        <li className="document-type-card document-type-card--disabled" aria-disabled="true">
          <span className="document-type-card__icon" aria-hidden="true">
            ИС
          </span>
          <span className="document-type-card__body">
            <strong>Исполнительная схема</strong>
            <small>Будущий тип документа — скоро</small>
          </span>
          <button className="compact-toggle" disabled type="button">
            Скоро
          </button>
        </li>
      </ul>
      <div className="object-folder-create-panel__actions">
        <button
          className="action-button action-button--primary"
          onClick={() => {
            if (selectedDocumentTypeId === 'aosr') {
              onCreateAosr();
            }
          }}
          type="button"
        >
          Создать акт
        </button>
        <button className="compact-toggle" onClick={onClose} type="button">
          Отмена
        </button>
      </div>
    </section>
  );
}

interface ObjectFolderPageProps {
  readonly drafts: readonly DemoAosrDraft[];
  readonly isCreateDocumentPanelOpen: boolean;
  readonly folder: DemoIdFolder;
  readonly sectionName: string | undefined;
  readonly onCloseCreateDocumentPanel: () => void;
  readonly onCreateAosr: () => void;
  readonly onDeleteAosr: (draftId: string) => void;
  readonly onOpenAosr: (draftId: string) => void;
  readonly onOpenCreateDocumentPanel: () => void;
  readonly onOpenIntermediatePackage: () => void;
  readonly onReorderAosr: (
    draggedDraftId: string,
    targetDraftId: string,
    placement: DemoIdFolderDraftPlacement,
  ) => void;
}

function ObjectFolderPage({
  drafts,
  isCreateDocumentPanelOpen,
  folder,
  sectionName,
  onCloseCreateDocumentPanel,
  onCreateAosr,
  onDeleteAosr,
  onOpenAosr,
  onOpenCreateDocumentPanel,
  onOpenIntermediatePackage,
  onReorderAosr,
}: ObjectFolderPageProps): React.JSX.Element {
  const draftListRef = useRef<HTMLUListElement | null>(null);
  const previousDraftRectsRef = useRef(new Map<string, DOMRect>());
  const currentDropTargetRef = useRef<{
    readonly draftId: string;
    readonly placement: DemoIdFolderDraftPlacement;
  } | null>(null);
  const draggedDraftIdRef = useRef<string | null>(null);
  const [draggedDraftId, setDraggedDraftId] = useState<string | null>(null);
  const [dropTargetDraftId, setDropTargetDraftId] = useState<string | null>(null);
  const [dropPlacement, setDropPlacement] = useState<DemoIdFolderDraftPlacement>('before');

  useLayoutEffect(() => {
    animateDraftListReorder(
      draftListRef.current,
      previousDraftRectsRef,
      '[data-folder-draft-id]',
      'folderDraftId',
    );
  }, [drafts]);

  const clearDragState = (): void => {
    draggedDraftIdRef.current = null;
    currentDropTargetRef.current = null;
    setDraggedDraftId(null);
    setDropTargetDraftId(null);
    setDropPlacement('before');
  };

  const startDraggingDraft = (draftId: string): void => {
    draggedDraftIdRef.current = draftId;
    setDraggedDraftId(draftId);
  };

  const reorderDraggedDraft = (
    targetDraftId: string,
    placement: DemoIdFolderDraftPlacement,
    fallbackDraggedDraftId = '',
  ): void => {
    const currentDraggedDraftId =
      fallbackDraggedDraftId === ''
        ? (draggedDraftIdRef.current ?? draggedDraftId ?? '')
        : fallbackDraggedDraftId;

    if (currentDraggedDraftId !== '' && currentDraggedDraftId !== targetDraftId) {
      onReorderAosr(currentDraggedDraftId, targetDraftId, placement);
      currentDropTargetRef.current = { draftId: targetDraftId, placement };
      setDropTargetDraftId(targetDraftId);
      setDropPlacement(placement);
    }
  };

  const updatePointerDropTarget = (event: PointerEvent<HTMLElement>): void => {
    const dropTarget = getPointerTargetFolderDraftId(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (dropTarget !== null) {
      reorderDraggedDraft(dropTarget.draftId, dropTarget.placement);
    }
  };

  const finishPointerReorder = (event: PointerEvent<HTMLElement>): void => {
    const dropTarget = getPointerTargetFolderDraftId(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );

    if (dropTarget !== null) {
      reorderDraggedDraft(dropTarget.draftId, dropTarget.placement);
    }

    clearDragState();
  };

  const getDefaultDropPlacement = (
    targetDraftId: string,
    fallbackDraggedDraftId: string,
  ): DemoIdFolderDraftPlacement => {
    const currentDraggedDraftId =
      fallbackDraggedDraftId === ''
        ? (draggedDraftIdRef.current ?? draggedDraftId ?? '')
        : fallbackDraggedDraftId;
    const draggedDraftIndex = drafts.findIndex((draft) => draft.id === currentDraggedDraftId);
    const targetDraftIndex = drafts.findIndex((draft) => draft.id === targetDraftId);

    return draggedDraftIndex >= 0 && targetDraftIndex >= 0 && draggedDraftIndex < targetDraftIndex
      ? 'after'
      : 'before';
  };

  const getNativeDropPlacement = (
    targetElement: HTMLElement,
    clientY: number,
    fallbackPlacement: DemoIdFolderDraftPlacement,
  ): DemoIdFolderDraftPlacement => {
    const targetRect = targetElement.getBoundingClientRect();

    if (!Number.isFinite(clientY) || targetRect.height <= 0) {
      return fallbackPlacement;
    }

    return clientY > targetRect.top + targetRect.height / 2 ? 'after' : 'before';
  };

  return (
    <section className="object-folder-workspace" aria-labelledby="object-folder-title">
      <div className="object-folder-hero">
        <div className="object-folder-hero__title">
          <span className="object-folder-hero__icon" aria-hidden="true">
            ▣
          </span>
          <div>
            <p className="section-kicker">Рабочая папка ИД</p>
            <h2 id="object-folder-title">{folder.name}</h2>
            <p>
              Разделы ИД / <strong>{sectionName ?? 'без названия'}</strong> / {folder.name}
            </p>
            <p>Папка содержит документы одного этапа, месяца или комплекта работ.</p>
          </div>
        </div>
        <div className="object-folder-create-panel__actions">
          <button
            className="action-button action-button--primary"
            onClick={onOpenCreateDocumentPanel}
            type="button"
          >
            Создать акт
          </button>
          <button className="compact-toggle" onClick={onOpenIntermediatePackage} type="button">
            Промежуточная ИД по папке
          </button>
          <button
            aria-label={`Дополнительные действия папки ${folder.name}`}
            className="compact-toggle compact-toggle--icon"
            type="button"
          >
            …
          </button>
        </div>
      </div>

      {isCreateDocumentPanelOpen ? (
        <CreateDocumentPanel
          selectedSectionName={sectionName}
          selectedFolder={folder}
          onClose={onCloseCreateDocumentPanel}
          onCreateAosr={onCreateAosr}
        />
      ) : null}

      <div className="object-folder-grid">
        <section
          className="object-folder-panel object-folder-panel--documents object-folder-panel--primary"
          aria-labelledby="folder-documents-title"
        >
          <div className="object-overview__panel-heading">
            <p className="section-kicker">Состав папки</p>
            <h3 id="folder-documents-title">Акты в папке</h3>
          </div>
          {drafts.length === 0 ? (
            <div className="object-folder-panel__empty">
              <strong>В этой папке пока нет актов</strong>
              <p>Создайте первый акт — он сразу появится в составе папки.</p>
            </div>
          ) : (
            <ul
              ref={draftListRef}
              className="object-folder-draft-list"
              aria-label={`Акты в папке ${folder.name}`}
            >
              {drafts.map((draft) => (
                <li
                  className="object-folder-draft-card"
                  data-dragging={draggedDraftId === draft.id ? 'true' : undefined}
                  data-drop-target={dropTargetDraftId === draft.id ? 'true' : undefined}
                  data-drop-placement={dropTargetDraftId === draft.id ? dropPlacement : undefined}
                  data-folder-draft-id={draft.id}
                  draggable
                  key={draft.id}
                  onDragEnd={clearDragState}
                  onDragEnter={() => {
                    if (draggedDraftId !== null && draggedDraftId !== draft.id) {
                      setDropTargetDraftId(draft.id);
                      setDropPlacement('before');
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    const placement = getNativeDropPlacement(
                      event.currentTarget,
                      event.clientY,
                      getDefaultDropPlacement(draft.id, event.dataTransfer.getData('text/plain')),
                    );

                    currentDropTargetRef.current = { draftId: draft.id, placement };
                    setDropTargetDraftId(draft.id);
                    setDropPlacement(placement);
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', draft.id);
                    startDraggingDraft(draft.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const savedDropTarget = currentDropTargetRef.current;
                    const fallbackDraggedDraftId = event.dataTransfer.getData('text/plain');
                    const fallbackPlacement = getDefaultDropPlacement(
                      draft.id,
                      fallbackDraggedDraftId,
                    );
                    const savedPlacement =
                      savedDropTarget?.draftId === draft.id
                        ? savedDropTarget.placement
                        : fallbackPlacement;
                    const placement = getNativeDropPlacement(
                      event.currentTarget,
                      event.clientY,
                      savedPlacement,
                    );

                    reorderDraggedDraft(draft.id, placement, fallbackDraggedDraftId);
                    clearDragState();
                  }}
                  onPointerEnter={() => {
                    if (draggedDraftId !== null && draggedDraftId !== draft.id) {
                      setDropTargetDraftId(draft.id);
                    }
                  }}
                >
                  <button
                    className="object-folder-draft-card__handle"
                    aria-label="Перетащить акт"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', draft.id);
                      startDraggingDraft(draft.id);
                    }}
                    onPointerDown={(event) => {
                      if (event.button !== 0) {
                        return;
                      }

                      event.preventDefault();
                      startDraggingDraft(draft.id);

                      if (typeof event.currentTarget.setPointerCapture === 'function') {
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }
                    }}
                    onPointerMove={updatePointerDropTarget}
                    onPointerUp={finishPointerReorder}
                    title={`Перетащить акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                    type="button"
                  >
                    <FolderGripIcon />
                  </button>
                  <button
                    aria-label={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                    className="object-folder-draft-card__open"
                    onClick={() => {
                      onOpenAosr(draft.id);
                    }}
                    title={`Открыть акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                    type="button"
                  >
                    <span>
                      <strong>{getDocumentDisplayNumber(draft.actNumber)}</strong>
                      <small>
                        {aosrActType.code} — {aosrActType.title}
                      </small>
                    </span>
                    <span>
                      <small>Дата</small>
                      <strong>{formatShortDate(draft.actDate)}</strong>
                    </span>
                    <span>
                      <small>Открыть</small>
                      <strong aria-hidden="true">→</strong>
                    </span>
                  </button>
                  <button
                    aria-label="Удалить акт"
                    className="compact-toggle compact-toggle--danger object-folder-draft-card__delete"
                    onClick={() => {
                      onDeleteAosr(draft.id);
                    }}
                    title={`Удалить акт ${getDocumentDisplayNumber(draft.actNumber)}`}
                    type="button"
                  >
                    Удалить акт
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="object-folder-panel__note">
            Перетаскивайте акты за ручку. При автоматической нумерации порядок сразу пересчитывает
            номера.
          </p>
        </section>

        <div className="object-folder-generated-views" aria-label="Действия папки">
          <section
            className="object-folder-panel object-folder-placeholder object-folder-panel--secondary"
            aria-labelledby="folder-package-title"
          >
            <span className="object-folder-placeholder__icon" aria-hidden="true">
              ◫
            </span>
            <div>
              <p className="section-kicker">Комплект папки</p>
              <h3 id="folder-package-title">Промежуточная ИД по папке</h3>
              <p>Реестр и печатный состав открываются в промежуточной ИД этой папки.</p>
              <button className="compact-toggle" onClick={onOpenIntermediatePackage} type="button">
                Открыть промежуточную ИД по папке
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
