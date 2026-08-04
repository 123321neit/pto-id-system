import { describe, expect, it } from 'vitest';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { mockObjectCards } from './mock-dashboard.js';
import { demoDocumentationSections } from './object-documentation-sections.js';
import { demoIdFolders } from './object-id-folders.js';
import { createSectionTemplateSettings } from './object-section-template-settings.js';
import type { DemoObjectWorkspaceSession } from './object-workspace-session.js';
import {
  resolveRouteDraft,
  resolveRouteFolder,
  resolveRouteObject,
  resolveRouteSection,
} from './route-entity-resolution.js';

const workspace: DemoObjectWorkspaceSession = {
  drafts: demoAosrWorkspace.drafts,
  folders: demoIdFolders,
  nextAosrOrdinal: 1,
  nextFolderOrdinal: 1,
  nextSectionOrdinal: 1,
  sections: demoDocumentationSections,
  sectionTemplateSettingsById: Object.fromEntries(
    demoDocumentationSections.map((section) => [
      section.templateSettingsId,
      createSectionTemplateSettings(section),
    ]),
  ),
};

describe('route entity resolution', () => {
  it('resolves known objects without falling back for an unknown ID', () => {
    expect(resolveRouteObject('object-polyclinic-demo')).toBe(mockObjectCards[0]);
    expect(resolveRouteObject('object-missing')).toBeUndefined();
    expect(resolveRouteObject(undefined)).toBeUndefined();
  });

  it('resolves a section only inside the current object workspace', () => {
    expect(resolveRouteSection('section-ventilation', workspace)).toBe(
      demoDocumentationSections[0],
    );
    expect(resolveRouteSection('section-from-another-object', workspace)).toBeUndefined();
  });

  it('rejects folders that do not belong to the resolved section', () => {
    const ventilation = demoDocumentationSections[0];
    const heating = demoDocumentationSections[1];

    if (ventilation === undefined || heating === undefined) {
      throw new Error('Demo sections are required for route tests.');
    }

    expect(resolveRouteFolder('folder-2026-09', ventilation, workspace)).toBe(demoIdFolders[0]);
    expect(resolveRouteFolder('folder-2026-09', heating, workspace)).toBeUndefined();
    expect(resolveRouteFolder('folder-missing', ventilation, workspace)).toBeUndefined();
  });

  it('validates the full draft to folder and section chain', () => {
    const section = demoDocumentationSections[0];
    const september = demoIdFolders[0];
    const october = demoIdFolders[1];

    if (section === undefined || september === undefined || october === undefined) {
      throw new Error('Demo route chain is required for route tests.');
    }

    expect(resolveRouteDraft('aosr-draft-001', september, section, workspace)).toBe(
      demoAosrWorkspace.drafts[0],
    );
    expect(resolveRouteDraft('aosr-draft-001', october, section, workspace)).toBeUndefined();
    expect(resolveRouteDraft('aosr-draft-missing', september, section, workspace)).toBeUndefined();
  });
});
