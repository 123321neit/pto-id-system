import { describe, expect, it } from 'vitest';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { initialDemoCertificates } from '../demo-store/demo-store.js';
import { defaultDemoIdFolder, demoIdFolders } from './object-id-folders.js';
import {
  buildFolderIdRegisterPrintState,
  buildSectionIdRegisterPrintState,
} from './id-register-print-state.js';

describe('ID register print state', () => {
  it('builds an intermediate folder register from the selected folder documents', () => {
    const printState = buildFolderIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folder: defaultDemoIdFolder,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    expect(printState.scope.kind).toBe('folder');
    expect(printState.scope.folderName).toBe('Сентябрь 2026');
    expect(printState.work.name).toBe('Вентиляция');
    expect(printState.executionDocuments.rows).toHaveLength(1);
    expect(printState.executionDocuments.rows[0]).toMatchObject({
      documentDateDisplay: '04.09.2026',
      documentNumberDisplay: '№ ОВ-1',
      folderName: 'Сентябрь 2026',
    });
    expect(printState.qualityDocuments.rows.map((row) => row.registrationNumber)).toEqual([
      'СТ-ОВ-2026-017',
      'ПС-КМ-48',
    ]);
    expect(printState.executiveSchemes.rows.map((row) => row.registrationNumber)).toEqual([
      '№ ИС-ОВ-04',
    ]);
    expect(printState.journals.rows.map((row) => row.registrationNumberAndDate)).toEqual([
      '№ ЖВК-2026-05, 31.05.2026',
    ]);
  });

  it('builds a final section register from all section folders without duplicated libraries', () => {
    const printState = buildSectionIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folders: demoIdFolders,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    expect(printState.scope.kind).toBe('section');
    expect(printState.executionDocuments.rows.map((row) => row.documentNumberDisplay)).toEqual([
      '№ ОВ-1',
      '№ ОВ-2',
    ]);
    expect(printState.qualityDocuments.rows.map((row) => row.registrationNumber)).toEqual([
      'СТ-ОВ-2026-017',
      'ПС-КМ-48',
      'ПП-ОГН-22',
    ]);
    expect(printState.drawingSets.rows.map((row) => row.reference)).toEqual(['РД-ОВ-12']);
    expect(printState.executiveSchemes.rows).toHaveLength(1);
    expect(printState.journals.rows).toHaveLength(1);
  });

  it('keeps each act row but deduplicates repeated certificates and object documents', () => {
    const [sourceDraft] = demoAosrWorkspace.drafts;

    if (sourceDraft === undefined) {
      throw new Error('Expected demo AOSR draft.');
    }

    const repeatedDraft = {
      ...sourceDraft,
      actNumber: 'ОВ-1а',
      id: 'aosr-draft-repeated-sources',
    };
    const folder = {
      ...defaultDemoIdFolder,
      draftIds: [sourceDraft.id, repeatedDraft.id],
    };
    const printState = buildFolderIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: [sourceDraft, repeatedDraft],
      folder,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    expect(printState.executionDocuments.rows.map((row) => row.documentNumberDisplay)).toEqual([
      '№ ОВ-1',
      '№ ОВ-1а',
    ]);
    expect(printState.qualityDocuments.rows).toHaveLength(2);
    expect(printState.executiveSchemes.rows).toHaveLength(1);
    expect(printState.journals.rows).toHaveLength(1);
  });
});
