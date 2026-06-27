import {
  demoAosrWorkspace,
  type DemoSectionTemplateSettings,
} from '../aosr-demo/demo-aosr-workspace.js';
import type {
  DemoDocumentationSection,
  DemoSectionTemplateSettingsId,
} from './object-documentation-sections.js';

export type DemoSectionTemplateSettingsById = Readonly<
  Record<DemoSectionTemplateSettingsId, DemoSectionTemplateSettings>
>;

const defaultDemoNumberingPrefixes: Readonly<Record<DemoSectionTemplateSettingsId, string>> = {
  'section-template-settings-heating': 'ОТ-',
  'section-template-settings-ventilation': 'ОВ-',
};

export function createSectionTemplateSettings(
  section: DemoDocumentationSection,
): DemoSectionTemplateSettings {
  const baseSettings = demoAosrWorkspace.sectionTemplateSettings;
  const sectionTemplate = {
    ...baseSettings.sectionTemplate,
    id: section.templateSettingsId,
    numberingPrefix: getInitialSectionNumberingPrefix(section),
    sectionId: section.id,
  };

  return {
    ...baseSettings,
    objectTemplate: sectionTemplate,
    sectionTemplate,
  };
}

export function copySectionTemplateSettingsToTarget(
  sourceSettings: DemoSectionTemplateSettings,
  targetSection: DemoDocumentationSection,
  currentTargetSettings = createSectionTemplateSettings(targetSection),
): DemoSectionTemplateSettings {
  const sectionTemplate = {
    ...sourceSettings.sectionTemplate,
    id: targetSection.templateSettingsId,
    numberingPrefix: currentTargetSettings.sectionTemplate.numberingPrefix,
    sectionId: targetSection.id,
  };

  return {
    ...sourceSettings,
    objectTemplate: sectionTemplate,
    sectionTemplate,
  };
}

function getInitialSectionNumberingPrefix(section: DemoDocumentationSection): string {
  return defaultDemoNumberingPrefixes[section.templateSettingsId] ?? '';
}
