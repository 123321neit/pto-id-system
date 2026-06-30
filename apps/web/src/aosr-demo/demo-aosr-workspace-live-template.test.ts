import { describe, expect, it } from 'vitest';

import {
  buildDemoAosrPrintState,
  defaultAosrRepresentativeSubscript,
  demoAosrWorkspace,
  getCounterpartyLibraryItemFromGlobalOrganization,
  getSignatoryLibraryItemFromRepresentative,
  resolveDemoAosrTemplateFields,
  returnDraftToLinkedTemplateMode,
  switchDraftToManualTemplateMode,
  updateDemoAosrDraftField,
  updateDemoObjectDefaultsField,
  updateHeaderOrganizationBlock,
  updateObjectRepresentative,
  updateObjectRepresentativeGroupTitle,
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

    expect(templateFields.representatives[0]?.details).toBe(defaultAosrRepresentativeSubscript);
    expect(templateFields.representatives[0]?.details).not.toBe(
      templateFields.representatives[0]?.introDisplayText,
    );
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
        updateDemoObjectDefaultsField(
          updateDemoObjectDefaultsField(
            updateDemoObjectDefaultsField(
              demoAosrWorkspace.objectDefaults,
              'defaultComplianceStatement',
              'Новый live-текст соответствия требованиям.',
            ),
            'defaultWorkContractorName',
            'ООО "Новый исполнитель"',
          ),
          'defaultAdditionalInfo',
          'Новые live-дополнительные сведения.',
        ),
        'defaultCopiesLine',
        '6',
      ),
      'objectName',
      'Новый live-объект.',
    );

    const templateFields = resolveDemoAosrTemplateFields({
      draft,
      objectDefaults,
    });

    expect(templateFields.objectName).toBe('Новый live-объект.');
    expect(templateFields.complianceStatement).toBe('Новый live-текст соответствия требованиям.');
    expect(templateFields.workContractorName).toBe('ООО "Новый исполнитель"');
    expect(templateFields.additionalInfo).toBe('Новые live-дополнительные сведения.');
    expect(templateFields.copiesLine).toBe('6');
  });

  it('uses the exact editable representative subscripts by default', () => {
    const templateFields = resolveDemoAosrTemplateFields({
      draft: getSourceDraft(),
      objectDefaults: demoAosrWorkspace.objectDefaults,
    });

    expect(templateFields.representativeGroups[0]?.members[0]?.subscript).toBe(
      defaultAosrRepresentativeSubscript,
    );
  });

  it('prints only the fragments that the DOCX template expects', () => {
    const objectDefaults = updateDemoObjectDefaultsField(
      demoAosrWorkspace.objectDefaults,
      'defaultCopiesLine',
      'в 5 экземплярах',
    );
    const draft = updateDemoAosrDraftField(
      updateDemoAosrDraftField(
        getSourceDraft(),
        'workDescription',
        'Монтаж скрытых участков воздуховодов.',
      ),
      'subsequentWorksPermitted',
      'Разрешается производство последующих работ по устройству теплоизоляции и облицовки.',
    );
    const printState = buildDemoAosrPrintState({
      draft,
      finalApplications: [
        {
          id: 'application-object-document-scheme-ov-04',
          source: 'Исполнительная схема / ИС-ОВ-04',
          title: 'Исполнительная схема скрытых участков вентиляции',
        },
      ],
      objectDefaults,
      selectedMaterials: [
        {
          certificateNumber: 'СТ-ОВ-2026-017',
          documentName: 'Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026',
          id: 'certificate-test',
          materialName: 'Воздуховоды оцинкованные 0,7 мм',
        },
      ],
      selectedObjectDocuments: [
        {
          documentDate: '2026-06-01',
          id: 'object-document-scheme-ov-04',
          reference: 'ИС-ОВ-04',
          title: 'Исполнительная схема скрытых участков вентиляции',
          type: 'Исполнительная схема',
        },
      ],
    });

    expect(printState.document.copiesLine).toBe('5');
    expect(printState.work.nextWorks).toBe('устройству теплоизоляции и облицовки');
    expect(printState.work.description).toBe(
      'Монтаж скрытых участков воздуховодов; оси 1-4 / А-В; отм. +3.200 - +3.850',
    );
    expect(printState.materials.items[0]?.displayText).toBe(
      'Воздуховоды оцинкованные 0,7 мм (Сертификат соответствия № СТ-ОВ-2026-017 от 12.05.2026)',
    );
    expect(printState.confirmationDocuments.items[0]?.displayText).toBe(
      'Исполнительная схема скрытых участков вентиляции ИС-ОВ-04',
    );
    expect(printState.applications.items[0]?.displayText).toBe(
      'Исполнительная схема скрытых участков вентиляции ИС-ОВ-04',
    );
  });

  it('updates object-level organization and representative values without mutating defaults', () => {
    const organizationDefaults = updateHeaderOrganizationBlock(
      demoAosrWorkspace.objectDefaults,
      'header-organization-customer',
      'caption',
      'Новый подстрочник организации',
    );
    const renamedGroupDefaults = updateObjectRepresentativeGroupTitle(
      organizationDefaults,
      'representative-group-contractor',
      'Новая роль представителя',
    );
    const representativeDefaults = updateObjectRepresentative(
      renamedGroupDefaults,
      'representative-group-contractor',
      'representative-member-contractor-001',
      'representative-contractor-001',
      'details',
      'Новый подстрочник представителя',
    );
    const templateFields = resolveDemoAosrTemplateFields({
      draft: getSourceDraft(),
      objectDefaults: representativeDefaults,
    });

    expect(templateFields.headerOrganizations[0]?.caption).toBe('Новый подстрочник организации');
    expect(templateFields.representativeGroups[0]?.title).toBe('Новая роль представителя');
    expect(templateFields.representativeGroups[0]?.members[0]?.subscript).toBe(
      'Новый подстрочник представителя',
    );
    expect(demoAosrWorkspace.objectDefaults.headerOrganizations[0]?.caption).not.toBe(
      'Новый подстрочник организации',
    );
  });

  it('does not reflect object template edits in manual acts', () => {
    const draft = getManualDraft();
    const objectDefaults = updateDemoObjectDefaultsField(
      updateDemoObjectDefaultsField(
        updateDemoObjectDefaultsField(
          updateDemoObjectDefaultsField(
            updateDemoObjectDefaultsField(
              demoAosrWorkspace.objectDefaults,
              'defaultComplianceStatement',
              'Новый live-текст соответствия требованиям.',
            ),
            'defaultWorkContractorName',
            'ООО "Новый исполнитель"',
          ),
          'defaultAdditionalInfo',
          'Новые live-дополнительные сведения.',
        ),
        'defaultCopiesLine',
        '6',
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
    expect(templateFields.workContractorName).toBe(
      demoAosrWorkspace.objectDefaults.defaultWorkContractorName,
    );
    expect(templateFields.additionalInfo).toBe(
      demoAosrWorkspace.objectDefaults.defaultAdditionalInfo,
    );
    expect(templateFields.copiesLine).toBe(demoAosrWorkspace.objectDefaults.defaultCopiesLine);
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
      'workDescription',
      'Индивидуальное описание скрытых работ.',
    );

    expect(editedDraft.templateMode).toBe('linked');
    expect(editedDraft.manualTemplateSnapshot).toBeUndefined();
    expect(editedDraft.actNumber).toBe('ОВ-99');
    expect(editedDraft.workDescription).toBe('Индивидуальное описание скрытых работ.');
  });

  it('snapshots repeated object template values only after an explicit manual action', () => {
    const manualDraft = switchDraftToManualTemplateMode({
      draft: getSourceDraft(),
      objectDefaults: demoAosrWorkspace.objectDefaults,
      signatoryLibrary: demoAosrWorkspace.objectDefaults.representativeLibrary.map(
        getSignatoryLibraryItemFromRepresentative,
      ),
    });

    expect(manualDraft.templateMode).toBe('manual');
    expect(manualDraft.manualTemplateSnapshot?.workTemplateDefaults.contractorName).toBe(
      demoAosrWorkspace.objectDefaults.defaultWorkContractorName,
    );
    expect(manualDraft.manualTemplateSnapshot?.documentTemplateDefaults.additionalInfo).toBe(
      demoAosrWorkspace.objectDefaults.defaultAdditionalInfo,
    );
    expect(manualDraft.manualTemplateSnapshot?.documentTemplateDefaults.copiesLine).toBe(
      demoAosrWorkspace.objectDefaults.defaultCopiesLine,
    );
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
