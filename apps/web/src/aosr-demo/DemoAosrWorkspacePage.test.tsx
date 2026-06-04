// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
} from './demo-aosr-workspace.js';
import { DemoStoreProvider } from '../demo-store/DemoStoreProvider.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('shows object-level and act-level areas as separate scopes', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Настройки объекта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Открыть объектовые настройки' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Текущий акт' })).toBeTruthy();
    expect(screen.queryByText('Настройки объекта по кнопке')).toBeNull();
    expect(
      within(screen.getByLabelText('Разделение уровней данных')).getByText('Настройки объекта'),
    ).toBeTruthy();
  });

  it('keeps object settings and libraries compact until opened', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Открыть объектовые настройки' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Представители объекта' })).toBeNull();
    expect(screen.queryByLabelText('Найти организацию в глобальной библиотеке')).toBeNull();
    expect(screen.queryByLabelText('Найти материал в библиотеке сертификатов')).toBeNull();
    expect(
      screen.getByText(
        'Выберите материал из библиотеки, чтобы сертификат попал в акт и приложения.',
      ),
    ).toBeTruthy();
  });

  it('shows the demo shortcut note for prefilled object representatives', () => {
    renderDemoWorkspace();

    expect(
      screen.getByText(
        'Демо-база представителей уже заполнена; на реальном объекте пользователь выбирает их сам.',
      ),
    ).toBeTruthy();
  });

  it('explains the act signatory search source and fallback', () => {
    renderDemoWorkspace();

    expect(screen.getByLabelText('Добавить подписанта из базы объекта')).toBeTruthy();
    expect(
      screen.getByText('Если нужного человека нет, добавьте временного подписанта.'),
    ).toBeTruthy();
  });

  it('explains that act materials must be selected from the certificate library', () => {
    renderDemoWorkspace();

    expect(
      screen.getByText(
        'Выберите материал из библиотеки, чтобы сертификат попал в акт и приложения.',
      ),
    ).toBeTruthy();
  });

  it('renders configurable object-level header organization blocks in preview order', () => {
    renderDemoWorkspace();

    const previewText = getPreviewText();

    expect(previewText).toContain('Объект капитального строительства:');
    expect(previewText.indexOf('Заказчик:')).toBeLessThan(previewText.indexOf('Подрядчик:'));
    expect(previewText.indexOf('Подрядчик:')).toBeLessThan(
      previewText.indexOf('Технический заказчик:'),
    );
    expect(previewText.indexOf('Технический заказчик:')).toBeLessThan(
      previewText.indexOf('ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ'),
    );
  });

  it('adds a header organization from the mock global organization library search', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Добавить блок шапки' }));
    await user.type(
      screen.getByLabelText('Найти организацию в глобальной библиотеке'),
      'генподряд',
    );

    const globalLibrary = screen.getByRole('list', { name: 'Глобальная библиотека организаций' });
    const organizationRow = within(globalLibrary)
      .getByText('ООО "Демо-генподряд"')
      .closest('.library-row');

    if (organizationRow === null) {
      throw new Error('В тесте ожидается строка глобальной организации.');
    }

    await user.click(
      within(organizationRow as HTMLElement).getByRole('button', { name: 'Выбрать' }),
    );
    await user.type(screen.getByLabelText('Название блока'), 'Генподрядчик');
    await user.clear(screen.getByLabelText('Реквизиты / детали для этого объекта'));
    await user.type(
      screen.getByLabelText('Реквизиты / детали для этого объекта'),
      'ОГРН 1096600000001; ИНН 6671000001; объектовый договор N ГП-1.',
    );
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию в шапке' }));

    const previewText = getPreviewText();
    expect(previewText).toContain('Генподрядчик:');
    expect(previewText).toContain('ООО "Демо-генподряд"');
    expect(previewText).toContain('объектовый договор N ГП-1');
  });

  it('adds a representative to the object base from the mock global representative library search', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(
      screen.getByLabelText('Найти представителя в глобальной библиотеке'),
      'генподряд',
    );

    const globalLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });
    const representativeRow = within(globalLibrary)
      .getByText('Николаев Н.Н.')
      .closest('.library-row');

    if (representativeRow === null) {
      throw new Error('В тесте ожидается строка глобального представителя.');
    }

    await user.click(
      within(representativeRow as HTMLElement).getByRole('button', { name: 'Выбрать' }),
    );
    await user.clear(screen.getByLabelText('Роль на этом объекте'));
    await user.type(screen.getByLabelText('Роль на этом объекте'), 'Представитель генподрядчика');
    await user.click(
      screen.getByRole('button', { name: 'Сохранить представителя в базу объекта' }),
    );

    const objectLibrary = screen.getByRole('list', { name: 'Представители объекта' });
    expect(within(objectLibrary).getByText('Николаев Н.Н.')).toBeTruthy();
  });

  it('searches object-level representatives and adds one to the current act', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    expect(getPreviewText()).not.toContain('Кузнецова А.А.');

    await user.type(screen.getByLabelText('Добавить подписанта из базы объекта'), 'заказчика');

    const objectPicker = screen.getByRole('list', {
      name: 'Представители объекта для текущего акта',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка представителя объекта.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить в акт' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Представитель заказчика:');
  });

  it('adds a temporary representative only to the current act when the checkbox is clear', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await addManualRepresentative(user, {
      authorityBasis: 'Доверенность N Т-1',
      fullName: 'Сидоров С.С.',
      organization: 'ООО "Разовая проверка"',
      position: 'Инженер ПТО',
      roleLabel: 'Представитель разового осмотра',
    });

    expect(getPreviewText()).toContain('Сидоров С.С.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Представители объекта' }));

    const objectLibrary = screen.getByRole('list', { name: 'Представители объекта' });
    expect(within(objectLibrary).queryByText('Сидоров С.С.')).toBeNull();
  });

  it('adds a temporary representative to the object base too when selected', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await addManualRepresentative(
      user,
      {
        authorityBasis: 'Приказ N Б-77',
        fullName: 'Орлова О.О.',
        organization: 'ООО "Новый участник"',
        position: 'Руководитель проекта',
        roleLabel: 'Представитель нового участника',
      },
      true,
    );

    expect(getPreviewText()).toContain('Орлова О.О.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Представители объекта' }));

    const objectLibrary = screen.getByRole('list', { name: 'Представители объекта' });
    expect(within(objectLibrary).getByText('Орлова О.О.')).toBeTruthy();
  });

  it('updates the document signatory order in the preview', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Переместить Петров П.П. вверх' }));

    const previewText = getPreviewText();
    expect(previewText.indexOf('Петров П.П.')).toBeLessThan(previewText.indexOf('Иванов И.И.'));
  });

  it('adds a material through certificate library search and derives applications', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    expect(getPreviewText()).not.toContain('ДС-ИЗ-2026-04');

    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));
    await user.type(screen.getByLabelText('Найти материал в библиотеке сертификатов'), 'изоляц');

    const certificateLibrary = screen.getByRole('list', { name: 'Библиотека сертификатов' });
    const insulationRow = within(certificateLibrary)
      .getByText('Теплоизоляционные маты ИЗ-50')
      .closest('.library-row');

    if (insulationRow === null) {
      throw new Error('В тесте ожидается строка материала.');
    }

    await user.click(
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
    expect(previewText).toContain('Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026');
  });

  it('does not expose free-text material, certificate or final applications fields', () => {
    renderDemoWorkspace();

    expect(screen.queryByLabelText('Материалы / сертификаты простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Приложения / исполнительные схемы простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Итоговые приложения простым текстом')).toBeNull();
    expect(screen.getByText(/Свободного поля “приложения” в демо нет/u)).toBeTruthy();
  });

  it('renders derived applications before final signature blocks', () => {
    renderDemoWorkspace();

    const previewText = getPreviewText();

    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026');
    expect(previewText).toContain('Исполнительная схема скрытых участков вентиляции');
    expect(previewText.indexOf('Акт составлен в 4 экземплярах.')).toBeLessThan(
      previewText.indexOf('Приложения:'),
    );

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const applications = preview.querySelector('.act-page__applications');
    const signatures = preview.querySelector('.act-page__signature-section');

    if (applications === null || signatures === null) {
      throw new Error('В preview ожидаются приложения и блок подписей.');
    }

    expect(
      Boolean(applications.compareDocumentPosition(signatures) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
  });

  it('keeps the AOSR preview section order close to the Word form', () => {
    renderDemoWorkspace();

    const previewText = getPreviewText();
    const orderedFragments = [
      'Объект капитального строительства:',
      'Заказчик:',
      'ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ',
      'Представитель подрядчика:',
      'произвели осмотр работ',
      'и составили настоящий акт о нижеследующем:',
      '1. К освидетельствованию предъявлены следующие работы:',
      '2. Работы выполнены по проектной документации:',
      '3. При выполнении работ применены:',
      '4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',
      '5. Даты:',
      '6. Работы выполнены в соответствии с:',
      '7. Разрешается производство последующих работ по:',
      'Дополнительные сведения:',
      'Акт составлен в 4 экземплярах.',
      'Приложения:',
    ];

    for (let index = 0; index < orderedFragments.length - 1; index += 1) {
      const currentFragment = getRequiredElement(orderedFragments, index);
      const nextFragment = getRequiredElement(orderedFragments, index + 1);

      expect(previewText.indexOf(currentFragment)).toBeLessThan(previewText.indexOf(nextFragment));
    }
  });

  it('renders key Word-like preview structure classes', () => {
    renderDemoWorkspace();

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    expect(preview.querySelector('.act-page__sheet')).toBeTruthy();
    expect(preview.querySelector('.act-page__top-blocks')).toBeTruthy();
    expect(preview.querySelector('.act-page__field-line')).toBeTruthy();
    expect(preview.querySelector('.act-page__caption')).toBeTruthy();
    expect(preview.querySelector('.act-page__number-date-row')).toBeTruthy();
    expect(preview.querySelector('.act-page__signature-person-row')).toBeTruthy();
  });

  it('keeps current editing behavior after the component split', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.clear(screen.getByDisplayValue('АОСР-001'));
    await user.type(screen.getByLabelText('Номер акта'), 'АОСР-010');

    expect(getPreviewText()).toContain('№ АОСР-010');
    expect(screen.getByText('АОСР-002')).toBeTruthy();
  });

  it('updates editable act data without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть черновик.');
    }

    const editedDraft = updateDemoAosrDraftField(
      sourceDraft,
      'workDescription',
      'Проверены скрытые крепления воздуховодов.',
    );

    expect(editedDraft.workDescription).toBe('Проверены скрытые крепления воздуховодов.');
    expect(sourceDraft.workDescription).toBe(
      'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
    );
    expect(editedDraft).not.toBe(sourceDraft);
  });

  it('adds material certificate selections without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[1];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть второй черновик.');
    }

    const editedDraft = addMaterialCertificateToDraft(sourceDraft, 'certificate-insulation-001');

    expect(editedDraft.materialCertificateIds).toContain('certificate-insulation-001');
    expect(sourceDraft.materialCertificateIds).not.toContain('certificate-insulation-001');
    expect(editedDraft).not.toBe(sourceDraft);
  });

  it('adds configurable header blocks without mutating object defaults', () => {
    const editedDefaults = addHeaderOrganizationBlock(demoAosrWorkspace.objectDefaults, {
      details: 'ОГРН 3333333333333; ИНН 4444444444.',
      id: 'header-organization-test',
      label: 'Инвестор',
      organizationName: 'ООО "Демо-инвестор"',
    });

    expect(editedDefaults.headerOrganizations).toHaveLength(
      demoAosrWorkspace.objectDefaults.headerOrganizations.length + 1,
    );
    expect(demoAosrWorkspace.objectDefaults.headerOrganizations).not.toContainEqual(
      expect.objectContaining({ label: 'Инвестор' }),
    );
  });
});

function renderDemoWorkspace(): void {
  render(
    <DemoStoreProvider>
      <DemoAosrWorkspacePage />
    </DemoStoreProvider>,
  );
}

interface ManualRepresentativeInput {
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

async function openObjectSettings(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const openButton = screen.queryByRole('button', { name: 'Открыть объектовые настройки' });

  if (openButton !== null) {
    await user.click(openButton);
  }
}

async function addManualRepresentative(
  user: ReturnType<typeof userEvent.setup>,
  representative: ManualRepresentativeInput,
  shouldAddToObjectLibrary = false,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Добавить вручную для этого акта' }));
  await user.type(screen.getByLabelText('Роль для акта'), representative.roleLabel);
  await user.type(screen.getByLabelText('ФИО для акта'), representative.fullName);
  await user.type(screen.getByLabelText('Должность для акта'), representative.position);
  await user.type(screen.getByLabelText('Организация для акта'), representative.organization);
  await user.type(
    screen.getByLabelText('Основание полномочий для акта'),
    representative.authorityBasis,
  );

  if (shouldAddToObjectLibrary) {
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Добавить этого представителя в базу представителей объекта',
      }),
    );
  }

  await user.click(screen.getByRole('button', { name: 'Добавить подписанта в акт' }));
}

function getPreviewText(): string {
  return screen.getByLabelText('Демо-предпросмотр печатной формы АОСР').textContent;
}

function getRequiredElement<TElement>(elements: readonly TElement[], index: number): TElement {
  const element = elements[index];

  if (element === undefined) {
    throw new Error(`Expected element at index ${String(index)}.`);
  }

  return element;
}
