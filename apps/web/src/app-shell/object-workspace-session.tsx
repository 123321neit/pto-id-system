import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { demoAosrWorkspace, type DemoAosrDraft } from '../aosr-demo/demo-aosr-workspace.js';
import { mockObjectCards, type MockObjectCard } from './mock-dashboard.js';
import {
  demoDocumentationSections,
  type DemoDocumentationSections,
} from './object-documentation-sections.js';
import { demoIdFolders, type DemoIdFolders } from './object-id-folders.js';
import {
  createSectionTemplateSettings,
  type DemoSectionTemplateSettingsById,
} from './object-section-template-settings.js';
import type { SectionTemplateClipboard } from './section-template-clipboard.js';

export interface DemoObjectWorkspaceSession {
  readonly drafts: readonly DemoAosrDraft[];
  readonly folders: DemoIdFolders;
  readonly nextAosrOrdinal: number;
  readonly nextFolderOrdinal: number;
  readonly nextSectionOrdinal: number;
  readonly sections: DemoDocumentationSections;
  readonly sectionTemplateSettingsById: DemoSectionTemplateSettingsById;
}

interface DemoWorkspaceSessionValue {
  readonly sectionTemplateClipboard: SectionTemplateClipboard | null;
  readonly setSectionTemplateClipboard: Dispatch<SetStateAction<SectionTemplateClipboard | null>>;
  readonly updateWorkspace: (
    objectId: string,
    updater: (current: DemoObjectWorkspaceSession) => DemoObjectWorkspaceSession,
  ) => void;
  readonly workspacesByObjectId: Readonly<Record<string, DemoObjectWorkspaceSession>>;
}

const DemoWorkspaceSessionContext = createContext<DemoWorkspaceSessionValue | undefined>(undefined);

export function DemoWorkspaceSessionProvider({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const [workspacesByObjectId, setWorkspacesByObjectId] = useState(() =>
    Object.fromEntries(
      mockObjectCards.map((object) => [object.id, createInitialWorkspace(object)]),
    ),
  );
  const [sectionTemplateClipboard, setSectionTemplateClipboard] =
    useState<SectionTemplateClipboard | null>(null);

  const updateWorkspace = (
    objectId: string,
    updater: (current: DemoObjectWorkspaceSession) => DemoObjectWorkspaceSession,
  ): void => {
    setWorkspacesByObjectId((currentWorkspaces) => {
      const currentWorkspace = currentWorkspaces[objectId];

      if (currentWorkspace === undefined) {
        return currentWorkspaces;
      }

      return {
        ...currentWorkspaces,
        [objectId]: updater(currentWorkspace),
      };
    });
  };

  return (
    <DemoWorkspaceSessionContext.Provider
      value={{
        sectionTemplateClipboard,
        setSectionTemplateClipboard,
        updateWorkspace,
        workspacesByObjectId,
      }}
    >
      {children}
    </DemoWorkspaceSessionContext.Provider>
  );
}

export function useDemoWorkspaceSession(): DemoWorkspaceSessionValue {
  const session = useContext(DemoWorkspaceSessionContext);

  if (session === undefined) {
    throw new Error('useDemoWorkspaceSession must be used within DemoWorkspaceSessionProvider.');
  }

  return session;
}

function createInitialWorkspace(object: MockObjectCard): DemoObjectWorkspaceSession {
  if (object.workspaceSeed === 'empty') {
    return createEmptyWorkspace();
  }

  if (object.id === mockObjectCards[0]?.id) {
    return {
      drafts: demoAosrWorkspace.drafts,
      folders: demoIdFolders,
      nextAosrOrdinal: 1,
      nextFolderOrdinal: 1,
      nextSectionOrdinal: 1,
      sections: demoDocumentationSections,
      sectionTemplateSettingsById: buildSectionTemplateSettings(demoDocumentationSections),
    };
  }

  return cloneDemoWorkspaceForObject(object);
}

function createEmptyWorkspace(): DemoObjectWorkspaceSession {
  return {
    drafts: [],
    folders: [],
    nextAosrOrdinal: 1,
    nextFolderOrdinal: 1,
    nextSectionOrdinal: 1,
    sections: [],
    sectionTemplateSettingsById: {},
  };
}

function cloneDemoWorkspaceForObject(object: MockObjectCard): DemoObjectWorkspaceSession {
  const suffix = object.id.replace(/^object-/u, '');
  const sectionIdBySource = new Map(
    demoDocumentationSections.map((section) => [section.id, `${section.id}-${suffix}`]),
  );
  const folderIdBySource = new Map(
    demoIdFolders.map((folder) => [folder.id, `${folder.id}-${suffix}`]),
  );
  const draftIdBySource = new Map(
    demoAosrWorkspace.drafts.map((draft) => [draft.id, `${draft.id}-${suffix}`]),
  );
  const sections = demoDocumentationSections.map((section) => ({
    ...section,
    folderIds: section.folderIds.map((folderId) => folderIdBySource.get(folderId) ?? folderId),
    id: sectionIdBySource.get(section.id) ?? section.id,
    templateSettingsId: `${section.templateSettingsId}-${suffix}`,
  }));
  const folders = demoIdFolders.map((folder) => ({
    ...folder,
    draftIds: folder.draftIds.map((draftId) => draftIdBySource.get(draftId) ?? draftId),
    id: folderIdBySource.get(folder.id) ?? folder.id,
  }));
  const templateSettingsBySourceSection = new Map(
    demoDocumentationSections.flatMap((sourceSection, index) => {
      const section = sections[index];

      if (section === undefined) {
        return [];
      }

      const sourceSettings = createSectionTemplateSettings(sourceSection);
      const sectionTemplate = {
        ...sourceSettings.sectionTemplate,
        id: section.templateSettingsId,
        objectId: object.id,
        sectionId: section.id,
      };

      return [
        [
          section.id,
          {
            ...sourceSettings,
            objectTemplate: sectionTemplate,
            sectionTemplate,
          },
        ] as const,
      ];
    }),
  );
  const drafts = demoAosrWorkspace.drafts.map((draft) => {
    const sectionId = sectionIdBySource.get(draft.sectionId) ?? draft.sectionId;
    const settings = templateSettingsBySourceSection.get(sectionId);
    const sectionTemplateSettingsId =
      settings?.sectionTemplate.id ?? draft.sectionTemplateSettingsId;

    return {
      ...draft,
      folderId: folderIdBySource.get(draft.folderId) ?? draft.folderId,
      id: draftIdBySource.get(draft.id) ?? draft.id,
      objectTemplateId: sectionTemplateSettingsId,
      sectionId,
      sectionTemplateId: sectionTemplateSettingsId,
      sectionTemplateSettingsId,
    };
  });

  return {
    drafts,
    folders,
    nextAosrOrdinal: 1,
    nextFolderOrdinal: 1,
    nextSectionOrdinal: 1,
    sections,
    sectionTemplateSettingsById: Object.fromEntries(
      [...templateSettingsBySourceSection.values()].map((settings) => [
        settings.sectionTemplate.id,
        settings,
      ]),
    ),
  };
}

function buildSectionTemplateSettings(
  sections: DemoDocumentationSections,
): DemoSectionTemplateSettingsById {
  return Object.fromEntries(
    sections.map((section) => [section.templateSettingsId, createSectionTemplateSettings(section)]),
  );
}
