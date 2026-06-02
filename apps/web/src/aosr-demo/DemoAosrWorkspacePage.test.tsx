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

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('renders configurable header organization blocks in preview order', () => {
    render(<DemoAosrWorkspacePage />);

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

  it('adds a header organization block and updates the preview', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Добавить организацию в шапке' }));
    await user.type(screen.getByLabelText('Название блока'), 'Генподрядчик');
    await user.type(screen.getByLabelText('Организация / наименование'), 'ООО "Демо-генподряд"');
    await user.type(
      screen.getByLabelText('Реквизиты / детали'),
      'ОГРН 1111111111111; ИНН 2222222222; адрес: г. Екатеринбург.',
    );
    await user.type(screen.getByLabelText('Подпись-подсказка'), 'Объектовый блок шапки');
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию в шапке' }));

    const previewText = getPreviewText();
    expect(previewText).toContain('Генподрядчик:');
    expect(previewText).toContain('ООО "Демо-генподряд"');
    expect(previewText.indexOf('Технический заказчик:')).toBeLessThan(
      previewText.indexOf('Генподрядчик:'),
    );
  });

  it('accepts representative role labels outside the example role set', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    await addManualRepresentative(user, {
      authorityBasis: 'Протокол допуска N Л-5',
      fullName: 'Лебедев Л.Л.',
      organization: 'Лаборатория контроля',
      position: 'Инженер лаборатории',
      roleLabel: 'Стройконтроль лаборатории',
    });

    const previewText = getPreviewText();
    expect(previewText).toContain('Стройконтроль лаборатории:');
    expect(previewText).toContain('Лебедев Л.Л.');
    expect(screen.queryByLabelText('Фиксированная роль представителя')).toBeNull();
  });

  it('adds a representative from the object library to the current act and preview', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    expect(getPreviewText()).not.toContain('Кузнецова А.А.');

    await user.click(screen.getByRole('button', { name: 'Добавить из базы подписантов объекта' }));
    const representativeLibrary = screen.getByRole('list', {
      name: 'База подписантов объекта для текущего акта',
    });
    const customerRow = within(representativeLibrary)
      .getByText('Кузнецова А.А.')
      .closest('.library-row');

    if (customerRow === null) {
      throw new Error('Expected representative library row.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить в акт' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Представитель заказчика:');
  });

  it('adds a manual temporary representative only to the current act when the checkbox is clear', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    await addManualRepresentative(user, {
      authorityBasis: 'Доверенность N Т-1',
      fullName: 'Сидоров С.С.',
      organization: 'ООО "Разовая проверка"',
      position: 'Инженер ПТО',
      roleLabel: 'Представитель разового осмотра',
    });

    expect(getPreviewText()).toContain('Сидоров С.С.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: 'Открыть базу' }));

    const objectLibrary = screen.getByRole('list', { name: 'База подписантов объекта' });
    expect(within(objectLibrary).queryByText('Сидоров С.С.')).toBeNull();
  });

  it('adds a manual representative to the object library and current act when selected', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

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
    await user.click(screen.getByRole('button', { name: 'Открыть базу' }));

    const objectLibrary = screen.getByRole('list', { name: 'База подписантов объекта' });
    expect(within(objectLibrary).getByText('Орлова О.О.')).toBeTruthy();
  });

  it('updates the document signatory order when a signatory is reordered', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    await user.click(screen.getByRole('button', { name: 'Переместить Петров П.П. вверх' }));

    const previewText = getPreviewText();
    expect(previewText.indexOf('Петров П.П.')).toBeLessThan(previewText.indexOf('Иванов И.И.'));
  });

  it('keeps materials selected from the certificate library without a free-text materials field', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    expect(screen.queryByLabelText('Материалы / сертификаты простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Приложения / исполнительные схемы простым текстом')).toBeNull();
    expect(
      screen.getByText('В реальной системе материал добавляется из библиотеки сертификатов'),
    ).toBeTruthy();

    expect(getPreviewText()).not.toContain('ДС-ИЗ-2026-04');

    await user.click(screen.getByRole('button', { name: 'Открыть сертификаты' }));
    const certificateLibrary = screen.getByRole('list', {
      name: 'Мок-библиотека сертификатов и материалов',
    });
    const insulationRow = within(certificateLibrary)
      .getByText('Теплоизоляционные маты ИЗ-50')
      .closest('.library-row');

    if (insulationRow === null) {
      throw new Error('Expected certificate library row.');
    }

    await user.click(
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
  });

  it('derives applications and renders them before final signature blocks', () => {
    render(<DemoAosrWorkspacePage />);

    const previewText = getPreviewText();

    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026');
    expect(previewText).toContain('Исполнительная схема скрытых участков вентиляции');
    expect(previewText.indexOf('Акт составлен в 4 экземплярах.')).toBeLessThan(
      previewText.indexOf('Приложения:'),
    );
    expect(previewText.indexOf('Приложения:')).toBeLessThan(
      previewText.indexOf('Подписи представителей'),
    );
  });

  it('follows the AOSR preview section order while using configurable arrays', () => {
    render(<DemoAosrWorkspacePage />);

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
      'Подписи представителей',
    ];

    for (let index = 0; index < orderedFragments.length - 1; index += 1) {
      const currentFragment = getRequiredElement(orderedFragments, index);
      const nextFragment = getRequiredElement(orderedFragments, index + 1);

      expect(previewText.indexOf(currentFragment)).toBeLessThan(previewText.indexOf(nextFragment));
    }
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
        name: 'Добавить этого представителя в базу подписантов объекта',
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
