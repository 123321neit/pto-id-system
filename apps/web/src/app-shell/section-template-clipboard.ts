import type {
  DemoSectionTemplateSettings,
  SectionTemplate,
} from '../aosr-demo/demo-aosr-workspace.js';

export interface SectionTemplateClipboard {
  readonly sourceObjectId: string;
  readonly sourceObjectTitle: string;
  readonly sourceSectionId: string;
  readonly sourceSectionName: string;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
}

export function cloneSectionTemplateSettingsForClipboard(
  sectionTemplateSettings: DemoSectionTemplateSettings,
): DemoSectionTemplateSettings {
  const sectionTemplate = cloneSectionTemplate(sectionTemplateSettings.sectionTemplate);

  return {
    ...sectionTemplateSettings,
    headerOrganizations: sectionTemplateSettings.headerOrganizations.map((organization) => ({
      ...organization,
    })),
    objectTemplate: sectionTemplate,
    representativeLibrary: sectionTemplateSettings.representativeLibrary.map((representative) => ({
      ...representative,
    })),
    sectionTemplate,
  };
}

function cloneSectionTemplate(sectionTemplate: SectionTemplate): SectionTemplate {
  return {
    ...sectionTemplate,
    counterparties: sectionTemplate.counterparties.map((counterparty) => ({ ...counterparty })),
    representativeGroups: sectionTemplate.representativeGroups.map((group) => ({
      ...group,
      members: group.members.map((member) => ({ ...member })),
    })),
  };
}
