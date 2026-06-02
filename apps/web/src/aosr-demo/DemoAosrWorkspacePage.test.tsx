// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import { demoAosrWorkspace, updateDemoAosrDraftField } from './demo-aosr-workspace.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('renders a compact document tree, act-form flow and A4-like mock document', () => {
    render(<DemoAosrWorkspacePage />);

    expect(
      screen.getAllByText('ДЕМО / демонстрационные данные / не для работы в продуктиве'),
    ).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Порядок актов АОСР' })).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        name: 'Поля акта в порядке печатной формы',
      }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Шапка акта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Объект / проект' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Комиссия / подписанты' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Предъявленные скрытые работы' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Приложения' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Период выполнения работ' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Решение комиссии' })).toBeTruthy();

    const actOrder = screen.getByRole('list', { name: 'Порядок актов АОСР' });
    expect(within(actOrder).getAllByRole('button')).toHaveLength(2);

    const form = screen.getByRole('region', {
      name: 'Поля акта в порядке печатной формы',
    });
    const formText = form.textContent;
    expect(formText.indexOf('Комиссия / подписанты')).toBeLessThan(
      formText.indexOf('Предъявленные скрытые работы'),
    );
    expect(formText.indexOf('Приложения')).toBeLessThan(
      formText.indexOf('Период выполнения работ'),
    );

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    expect(
      within(preview).getByRole('heading', {
        name: 'Акт освидетельствования скрытых работ',
      }),
    ).toBeTruthy();
    expect(
      within(preview).getByRole('heading', {
        name: '9. Подписи представителей',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Позже здесь будет реальный PDF/печатная форма акта')).toBeTruthy();
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

  it('updates the document signatory order when a signatory is moved', async () => {
    const user = userEvent.setup();

    render(<DemoAosrWorkspacePage />);

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');

    await user.click(screen.getByRole('button', { name: 'Опустить Иванов И.И.' }));

    const previewText = preview.textContent;
    expect(previewText.indexOf('Петров П.П.')).toBeLessThan(previewText.indexOf('Иванов И.И.'));
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
});

function getRequiredElement<TElement>(elements: readonly TElement[], index: number): TElement {
  const element = elements[index];

  if (element === undefined) {
    throw new Error(`Expected element at index ${String(index)}.`);
  }

  return element;
}
