import type { DemoSectionTemplateSettings } from '../aosr-demo/demo-aosr-workspace.js';

export interface SectionTemplateClipboard {
  readonly sourceObjectId: string;
  readonly sourceObjectTitle: string;
  readonly sourceSectionId: string;
  readonly sourceSectionName: string;
  readonly sectionTemplateSettings: DemoSectionTemplateSettings;
}
