import { describe, expect, it } from 'vitest';

import {
  demoAosrWorkspace,
  getSignatoryLibraryItemFromRepresentative,
  resolveDemoAosrTemplateFields,
  returnDraftToLinkedTemplateMode,
  switchDraftToManualTemplateMode,
  updateDemoAosrDraftField,
  type SignatoryLibraryItem,
} from './demo-aosr-workspace.js';

describe('AOSR live object template model', () => {
  it('reflects signatory library edits in linked acts', () => {
    const draft = getSourceDraft();
    const signatoryLibrary = getEditedSignatoryLibrary('Иванов И.И. Исправленный');

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults: demoAosrWorkspace.objectDefaults,
      signatoryLibrary,
    });

    expect(templateFields.representatives[0]?.fullName).toBe('Иванов И.И. Исправленный');
  });

  it('does not reflect signatory library edits in manual acts', () => {
    const draft = getManualDraft();
    const signatoryLibrary = getEditedSignatoryLibrary('Иванов И.И. Исправленный');

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults: demoAosrWorkspace.objectDefaults,
      signatoryLibrary,
    });

    expect(templateFields.representatives[0]?.fullName).toBe('Иванов И.И.');
  });

  it('reflects object template edits in linked acts', () => {
    const draft = getSourceDraft();
    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      defaultComplianceStatement: 'Новый live-текст пункта 6.',
      objectName: 'Новый live-объект.',
    };

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults,
    });

    expect(templateFields.objectName).toBe('Новый live-объект.');
    expect(templateFields.complianceStatement).toBe('Новый live-текст пункта 6.');
  });

  it('does not reflect object template edits in manual acts', () => {
    const draft = getManualDraft();
    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      defaultComplianceStatement: 'Новый live-текст пункта 6.',
      objectName: 'Новый live-объект.',
    };

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults,
    });

    expect(templateFields.objectName).toBe(demoAosrWorkspace.objectDefaults.objectName);
    expect(templateFields.complianceStatement).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
  });

  it('returns manual acts to the live object template and deletes snapshot', () => {
    const manualDraft = updateDemoAosrDraftField(
      getManualDraft(),
      'objectName',
      'Ручное имя объекта.',
    );
    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      objectName: 'Актуальное имя из шаблона объекта.',
    };

    const linkedDraft = returnDraftToLinkedTemplateMode(manualDraft);
    const templateFields = resolveDemoAosrTemplateFields({
      draft: linkedDraft,
      objectDefaults,
    });

    expect(linkedDraft.templateMode).toBe('linked');
    expect(linkedDraft.manualTemplateSnapshot).toBeUndefined();
    expect(templateFields.objectName).toBe('Актуальное имя из шаблона объекта.');
  });

  it('keeps individual act data edits from switching the act to manual', () => {
    const draft = getSourceDraft();
    const editedDraft = updateDemoAosrDraftField(
      updateDemoAosrDraftField(draft, 'actNumber', 'ОВ-99'),
      'workDescription',
      'Индивидуальное описание работ.',
    );

    expect(editedDraft.templateMode).toBe('linked');
    expect(editedDraft.manualTemplateSnapshot).toBeUndefined();
    expect(editedDraft.actNumber).toBe('ОВ-99');
    expect(editedDraft.workDescription).toBe('Индивидуальное описание работ.');
  });

  it('does not switch template fields to manual without an explicit manual action', () => {
    const draft = getSourceDraft();
    const editedDraft = updateDemoAosrDraftField(
      draft,
      'complianceStatement',
      'Ручной текст без явного переключения.',
    );

    expect(editedDraft.templateMode).toBe('linked');
    expect(editedDraft.manualTemplateSnapshot).toBeUndefined();
  });
});

function getManualDraft() {
  return switchDraftToManualTemplateMode({
    draft: getSourceDraft(),
    objectDefaults: demoAosrWorkspace.objectDefaults,
    signatoryLibrary: demoAosrWorkspace.objectDefaults.representativeLibrary.map(
      getSignatoryLibraryItemFromRepresentative,
    ),
  });
}

function getSourceDraft() {
  const draft = demoAosrWorkspace.drafts[0];

  if (draft === undefined) {
    throw new Error('Expected the demo workspace to have a source draft.');
  }

  return draft;
}

function getEditedSignatoryLibrary(fullName: string): readonly SignatoryLibraryItem[] {
  return demoAosrWorkspace.objectDefaults.representativeLibrary.map((representative) => {
    const libraryItem = getSignatoryLibraryItemFromRepresentative(representative);

    if (representative.id !== 'representative-contractor-001') {
      return libraryItem;
    }

    return {
      ...libraryItem,
      displayName: fullName,
      fullName,
      introDisplayText: `Производитель работ ООО "ПТО Монтаж", ${fullName}`,
      signatureName: fullName,
    };
  });
}
