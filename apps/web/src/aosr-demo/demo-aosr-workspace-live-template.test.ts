import { describe, expect, it } from 'vitest';

import {
  buildDemoAosrPrintState,
  demoAosrWorkspace,
  getCounterpartyLibraryItemFromGlobalOrganization,
  getSignatoryLibraryItemFromRepresentative,
  resolveDemoAosrTemplateFields,
  returnDraftToLinkedTemplateMode,
  switchDraftToManualTemplateMode,
  updateDemoAosrDraftField,
  updateDemoObjectDefaultsField,
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

  it('uses the signatory library print strings without reconstructing them', () => {
    const signatoryLibrary = getEditedSignatoryLibrary('Иванов И.И. Исправленный').map(
      (item, index) =>
        index === 0
          ? {
              ...item,
              introDisplayText: 'ГОТОВАЯ ВЕРХНЯЯ СТРОКА',
              signatureName: 'ГОТОВОЕ ИМЯ',
              signatureText: 'ГОТОВАЯ ЛЕВАЯ ПОДПИСЬ',
            }
          : item,
    );
    const printState = buildDemoAosrPrintState({
      draft: getSourceDraft(),
      finalApplications: [],
      objectDefaults: demoAosrWorkspace.objectDefaults,
      selectedMaterials: [],
      selectedObjectDocuments: [],
      signatoryLibrary,
    });
    const member = printState.representatives.groups[0]?.members[0];

    expect(member?.introDisplayText).toBe('ГОТОВАЯ ВЕРХНЯЯ СТРОКА');
    expect(member?.signatureText).toBe('ГОТОВАЯ ЛЕВАЯ ПОДПИСЬ');
    expect(member?.signatureName).toBe('ГОТОВОЕ ИМЯ');
  });

  it('keeps library intro text separate from the representative subscript', () => {
    const templateFields = resolveDemoAosrTemplateFields({
      draft: getSourceDraft(),
      objectDefaults: demoAosrWorkspace.objectDefaults,
      signatoryLibrary: demoAosrWorkspace.objectDefaults.representativeLibrary.map(
        getSignatoryLibraryItemFromRepresentative,
      ),
    });

    expect(templateFields.representatives[0]?.details).toBeUndefined();
  });

  it('keeps multiple members inside the representative group defined by objectTemplate', () => {
    const sourceRepresentatives = demoAosrWorkspace.objectDefaults.representativeLibrary;
    const firstRepresentative = sourceRepresentatives[0];
    const secondRepresentative = sourceRepresentatives[1];

    if (firstRepresentative === undefined || secondRepresentative === undefined) {
      throw new Error('Expected at least two demo representatives.');
    }

    const sourceGroup = demoAosrWorkspace.objectDefaults.objectTemplate.representativeGroups[0];

    if (sourceGroup === undefined) {
      throw new Error('Expected a source representative group.');
    }

    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      objectTemplate: {
        ...demoAosrWorkspace.objectDefaults.objectTemplate,
        representativeGroups: [
          {
            ...sourceGroup,
            members: [
              {
                id: 'member-first',
                signatoryId: firstRepresentative.id,
                subscriptMode: 'fromLibrary' as const,
              },
              {
                id: 'member-second',
                signatoryId: secondRepresentative.id,
                subscriptMode: 'fromLibrary' as const,
              },
            ],
          },
        ],
      },
    };
    const printState = buildDemoAosrPrintState({
      draft: getSourceDraft(),
      finalApplications: [],
      objectDefaults,
      selectedMaterials: [],
      selectedObjectDocuments: [],
      signatoryLibrary: sourceRepresentatives.map(getSignatoryLibraryItemFromRepresentative),
    });

    expect(printState.representatives.groups).toHaveLength(1);
    expect(printState.representatives.groups[0]?.title).toBe(firstRepresentative.roleLabel);
    expect(
      printState.representatives.groups[0]?.members.map(({ signatureName }) => signatureName),
    ).toEqual([firstRepresentative.fullName, secondRepresentative.fullName]);
  });

  it('does not merge different representative groups that have the same title', () => {
    const sourceGroups = demoAosrWorkspace.objectDefaults.objectTemplate.representativeGroups;
    const firstGroup = sourceGroups[0];
    const secondGroup = sourceGroups[1];

    if (firstGroup === undefined || secondGroup === undefined) {
      throw new Error('Expected at least two source representative groups.');
    }

    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      objectTemplate: {
        ...demoAosrWorkspace.objectDefaults.objectTemplate,
        representativeGroups: [firstGroup, { ...secondGroup, title: firstGroup.title }],
      },
    };
    const printState = buildDemoAosrPrintState({
      draft: getSourceDraft(),
      finalApplications: [],
      objectDefaults,
      selectedMaterials: [],
      selectedObjectDocuments: [],
      signatoryLibrary: demoAosrWorkspace.objectDefaults.representativeLibrary.map(
        getSignatoryLibraryItemFromRepresentative,
      ),
    });

    expect(printState.representatives.groups).toHaveLength(2);
    expect(printState.representatives.groups.map(({ title }) => title)).toEqual([
      firstGroup.title,
      firstGroup.title,
    ]);
  });

  it('uses counterparty fullText exactly once in linked printState', () => {
    const organization = {
      caption: 'Подстрочное пояснение',
      details: 'ОГРН 123; ИНН 456; адрес объекта.',
      id: 'global-organization-customer',
      organizationName: 'ООО "Точный текст"',
    };
    const libraryItem = getCounterpartyLibraryItemFromGlobalOrganization(organization);
    const printState = buildDemoAosrPrintState({
      counterpartyLibrary: [libraryItem],
      draft: getSourceDraft(),
      finalApplications: [],
      objectDefaults: demoAosrWorkspace.objectDefaults,
      selectedMaterials: [],
      selectedObjectDocuments: [],
    });

    expect(printState.counterparties[0]?.displayText).toBe(libraryItem.fullText);
    expect(printState.counterparties[0]?.displayText.match(/ООО "Точный текст"/gu)).toHaveLength(1);
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
    const objectDefaults = updateDemoObjectDefaultsField(
      updateDemoObjectDefaultsField(
        demoAosrWorkspace.objectDefaults,
        'defaultComplianceStatement',
        'Новый live-текст пункта 6.',
      ),
      'objectName',
      'Новый live-объект.',
    );

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults,
    });

    expect(templateFields.objectName).toBe('Новый live-объект.');
    expect(templateFields.complianceStatement).toBe('Новый live-текст пункта 6.');
  });

  it('does not reflect object template edits in manual acts', () => {
    const draft = getManualDraft();
    const objectDefaults = updateDemoObjectDefaultsField(
      updateDemoObjectDefaultsField(
        demoAosrWorkspace.objectDefaults,
        'defaultComplianceStatement',
        'Новый live-текст пункта 6.',
      ),
      'objectName',
      'Новый live-объект.',
    );

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
    const objectDefaults = updateDemoObjectDefaultsField(
      demoAosrWorkspace.objectDefaults,
      'objectName',
      'Актуальное имя из шаблона объекта.',
    );

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
      'workContractorName',
      'ООО "Индивидуальный исполнитель"',
    );

    expect(editedDraft.templateMode).toBe('linked');
    expect(editedDraft.manualTemplateSnapshot).toBeUndefined();
    expect(editedDraft.actNumber).toBe('ОВ-99');
    expect(editedDraft.workContractorName).toBe('ООО "Индивидуальный исполнитель"');
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
