// @vitest-environment jsdom
import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it, vi } from 'vitest';

import { demoAosrWorkspace } from '../aosr-demo/demo-aosr-workspace.js';
import { initialDemoCertificates } from '../demo-store/demo-store.js';
import { defaultDemoIdFolder, demoIdFolders } from './object-id-folders.js';
import {
  buildFolderIdRegisterPrintState,
  buildSectionIdRegisterPrintState,
} from './id-register-print-state.js';
import {
  buildIdRegisterDocxFileName,
  downloadIdRegisterDocx,
  generateIdRegisterDocxBlob,
  generateIdRegisterDocxBytes,
} from './id-register-docx-generator.js';

describe('ID register DOCX generator', () => {
  it('renders a section register DOCX from structured print state', () => {
    const printState = buildSectionIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folders: demoIdFolders,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    const entries = unzipSync(generateIdRegisterDocxBytes(printState));
    const documentXml = strFromU8(entries['word/document.xml'] ?? new Uint8Array());

    expect(entries['[Content_Types].xml']).toBeDefined();
    expect(entries['word/styles.xml']).toBeDefined();
    expect(documentXml).toContain('РЕЕСТР');
    expect(documentXml).toContain('Итоговый реестр раздела');
    expect(documentXml).toContain('Реконструкция поликлиники, корпус Б');
    expect(documentXml).toContain('№ ОВ-1');
    expect(documentXml).toContain('№ ОВ-2');
    expect(documentXml).toContain('СТ-ОВ-2026-017');
    expect(documentXml).toContain('Исполнительная схема скрытых участков вентиляции');
    expect(documentXml).toContain('Запись журнала входного контроля материалов');
    expect(documentXml).toContain('<w:tblHeader/>');
    expect(documentXml).toContain('w:orient="landscape"');
    expect(documentXml).not.toContain('undefined');
    expect(documentXml).not.toContain('<<');
    expect(documentXml).not.toContain('>>');
  });

  it('renders a folder register DOCX with only selected folder acts', () => {
    const printState = buildFolderIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folder: defaultDemoIdFolder,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    const entries = unzipSync(generateIdRegisterDocxBytes(printState));
    const documentXml = strFromU8(entries['word/document.xml'] ?? new Uint8Array());

    expect(documentXml).toContain('Реестр папки «Сентябрь 2026»');
    expect(documentXml).toContain('№ ОВ-1');
    expect(documentXml).not.toContain('№ ОВ-2');
  });

  it('builds safe DOCX filenames for section and folder registers', () => {
    const folderPrintState = buildFolderIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folder: defaultDemoIdFolder,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });
    const sectionPrintState = buildSectionIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folders: demoIdFolders,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });

    expect(buildIdRegisterDocxFileName(folderPrintState)).toBe('Реестр_Сентябрь_2026.docx');
    expect(buildIdRegisterDocxFileName(sectionPrintState)).toBe('Реестр_Вентиляция.docx');
  });

  it('downloads the generated register as a DOCX blob', () => {
    const printState = buildFolderIdRegisterPrintState({
      certificates: initialDemoCertificates,
      drafts: demoAosrWorkspace.drafts,
      folder: defaultDemoIdFolder,
      objectDocuments: demoAosrWorkspace.objectDocumentLibrary,
      sectionTemplateSettings: demoAosrWorkspace.sectionTemplateSettings,
      workName: 'Вентиляция',
    });
    const createObjectUrl = vi.fn((blob: Blob) => {
      expect(blob).toBeInstanceOf(Blob);

      return 'blob:id-register';
    });
    const revokeObjectUrl = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    downloadIdRegisterDocx(printState, {
      browserDocument: document,
      browserUrl: {
        createObjectURL: createObjectUrl,
        revokeObjectURL: revokeObjectUrl,
      },
    });

    const downloadBlob = createObjectUrl.mock.calls[0]?.[0];

    expect(downloadBlob).toBeInstanceOf(Blob);
    expect(downloadBlob?.type).toBe(generateIdRegisterDocxBlob(printState).type);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:id-register');

    clickSpy.mockRestore();
  });
});
