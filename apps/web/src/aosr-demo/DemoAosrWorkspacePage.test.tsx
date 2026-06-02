// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  addMaterialCertificateToDraft,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
} from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('renders object-level data, act-level data and an A4-like mock document', () => {
    render(<DemoAosrWorkspacePage />);

    expect(
      screen.getAllByText('ДЕМО / демонстрационные данные / не для работы в продуктиве'),
    ).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Порядок актов АОСР' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Данные объекта и текущего акта' })).toBeTruthy();
    const scopeSwitchText = screen.getByLabelText('Разделение уровней данных').textContent;
    expect(scopeSwitchText).toContain('Данные объекта');
    expect(scopeSwitchText).toContain('Текущий акт');

    const objectArea = screen.getByRole('region', {
      name: 'Объектовые значения по умолчанию',
    });
    expect(within(objectArea).getByLabelText('Название проекта / объекта')).toBeTruthy();
    expect(within(objectArea).getByLabelText('Проектная документация по умолчанию')).toBeTruthy();
    expect(
      within(objectArea).getByRole('list', {
        name: 'Библиотека представителей объекта',
      }),
    ).toBeTruthy();

    const actArea = screen.getByRole('region', { name: 'Поля АОСР' });
    expect(within(actArea).getByRole('heading', { name: 'Шапка акта' })).toBeTruthy();
    expect(within(actArea).getByRole('heading', { name: 'Место и границы работ' })).toBeTruthy();
    expect(
      within(actArea).getByRole('heading', {
        name: 'Комиссия / подписанты текущего акта',
      }),
    ).toBeTruthy();
    expect(
      within(actArea).getByRole('heading', { name: 'Материалы из библиотеки сертификатов' }),
    ).toBeTruthy();
    expect(within(actArea).getByRole('heading', { name: 'Производные приложения' })).toBeTruthy();

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    expect(
      within(preview).getByRole('heading', {
        name: 'Акт освидетельствования скрытых работ',
      }),
    ).toBeTruthy();
    expect(
      within(preview).getByRole('heading', {
        name: '8. Подписи представителей',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Позже здесь будет реальный PDF/печатная форма акта')).toBeTruthy();
    expect(preview.textContent).not.toContain('Унифицированная демонстрационная HTML-форма');
  });

  it('adds a representative from the object library to the current act and preview', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');

    expect(preview.textContent).not.toContain('Кузнецова А.А.');

    const representativeLibrary = screen.getByRole('list', {
      name: 'Библиотека представителей объекта',
    });
    const customerRow = within(representativeLibrary)
      .getByText('Кузнецова А.А.')
      .closest('.library-row');

    if (customerRow === null) {
      throw new Error('Expected representative library row.');
    }

    await user.click(within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить' }));

    expect(preview.textContent).toContain('Кузнецова А.А.');
    expect(preview.textContent).toContain('Представитель заказчика');
  });

  it('updates the document signatory order when a signatory is dragged', () => {
    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const signatoryOrder = screen.getByRole('list', { name: 'Порядок подписантов' });
    const signatoryItems = within(signatoryOrder).getAllByRole('listitem');
    const firstSignatory = getRequiredElement(signatoryItems, 0);
    const secondSignatory = getRequiredElement(signatoryItems, 1);

    fireEvent.dragStart(secondSignatory);
    fireEvent.dragOver(firstSignatory);
    fireEvent.drop(firstSignatory);

    const previewText = preview.textContent;
    expect(previewText.indexOf('Петров П.П.')).toBeLessThan(previewText.indexOf('Иванов И.И.'));
  });

  it('adds a material from the mock certificate library to the act and preview', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');

    expect(preview.textContent).not.toContain('ДС-ИЗ-2026-04');

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

    expect(preview.textContent).toContain('Теплоизоляционные маты ИЗ-50');
    expect(preview.textContent).toContain('ДС-ИЗ-2026-04');
    expect(preview.textContent).toContain(
      'Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026',
    );
  });

  it('does not expose materials or applications as plain free-text fields', () => {
    render(<DemoAosrWorkspacePage />);

    expect(screen.queryByLabelText('Материалы / сертификаты простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Приложения / исполнительные схемы простым текстом')).toBeNull();
    expect(
      screen.getByText('В реальной системе материал добавляется из библиотеки сертификатов'),
    ).toBeTruthy();
  });

  it('renders applications as the final document section after signatures', () => {
    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const previewText = preview.textContent;

    expect(previewText).toContain('8. Подписи представителей');
    expect(previewText).toContain('9. Приложения к акту');
    expect(previewText.indexOf('8. Подписи представителей')).toBeLessThan(
      previewText.indexOf('9. Приложения к акту'),
    );
    expect(previewText.trim().endsWith('ЖВК-2026-05')).toBe(true);
  });

  it('updates the A4-like document when a user edits a large field', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const workDescriptionInput = screen.getByRole('textbox', {
      name: 'Описание скрытых работ',
    });

    await user.clear(workDescriptionInput);
    await user.type(
      workDescriptionInput,
      'Предъявлены скрытые сварные соединения воздуховодов до закрытия огнезащитной обшивкой.',
    );

    expect(preview.textContent).toContain(
      'Предъявлены скрытые сварные соединения воздуховодов до закрытия огнезащитной обшивкой.',
    );
  });

  it('updates act order in the compact tree through mock drag and drop', () => {
    render(<DemoAosrWorkspacePage />);

    const actOrder = screen.getByRole('list', { name: 'Порядок актов АОСР' });
    const actButtons = within(actOrder).getAllByRole('button');
    const firstActButton = getRequiredElement(actButtons, 0);
    const secondActButton = getRequiredElement(actButtons, 1);

    fireEvent.dragStart(secondActButton);
    fireEvent.dragOver(firstActButton);
    fireEvent.drop(firstActButton);

    const reorderedButtons = within(actOrder).getAllByRole('button');
    expect(getRequiredElement(reorderedButtons, 0).textContent).toContain('АОСР-002');
    expect(getRequiredElement(reorderedButtons, 1).textContent).toContain('АОСР-001');
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
});

function getRequiredElement<TElement>(elements: readonly TElement[], index: number): TElement {
  const element = elements[index];

  if (element === undefined) {
    throw new Error(`Expected element at index ${String(index)}.`);
  }

  return element;
}
