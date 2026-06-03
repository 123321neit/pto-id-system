// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from './App.js';

afterEach(() => {
  cleanup();
});

describe('App shell mock navigation', () => {
  it('renders mock object cards and quick access cards on the dashboard', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
    expect(screen.getByText('Жилой комплекс "Северный"')).toBeTruthy();
    expect(screen.getByText('Торговый центр "Горизонт"')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Открыть объект' })).toHaveLength(3);

    const quickAccess = screen.getByLabelText('Быстрые разделы');
    expect(within(quickAccess).getByText('Библиотека сертификатов')).toBeTruthy();
    expect(within(quickAccess).getByText('Представители и организации')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Недавние документы' })).toBeTruthy();
  });

  it('opens the AOSR workspace from an object card and returns to the dashboard', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    expect(screen.getByRole('button', { name: 'Назад к объектам' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('shows mock placeholder panels for quick access sections', async () => {
    const user = userEvent.setup();

    render(<App />);

    const quickAccess = screen.getByRole('region', { name: 'Быстрый доступ' });

    await user.click(within(quickAccess).getByRole('button', { name: /Библиотека сертификатов/u }));

    expect(screen.getByRole('heading', { name: 'Библиотека сертификатов' })).toBeTruthy();
    expect(screen.getByText('Раздел будет оформлен отдельным шагом.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));
    const updatedQuickAccess = screen.getByRole('region', { name: 'Быстрый доступ' });

    await user.click(
      within(updatedQuickAccess).getByRole('button', {
        name: /Представители и организации/u,
      }),
    );

    expect(screen.getByRole('heading', { name: 'Представители и организации' })).toBeTruthy();
    expect(screen.getByText('Раздел будет оформлен отдельным шагом.')).toBeTruthy();
  });

  it('keeps AOSR key flows available after opening an object from the shell', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

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

    await user.type(screen.getByLabelText('Добавить подписанта в акт'), 'заказчика');

    const objectPicker = screen.getByRole('list', {
      name: 'База представителей объекта для текущего акта',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка представителя объекта.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить в акт' }),
    );

    const preview = screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const previewText = preview.textContent;

    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026');
    expect(previewText.indexOf('Приложения:')).toBeLessThan(
      previewText.indexOf('Подписи представителей'),
    );
    expect(preview.querySelector('.act-page__sheet')).toBeTruthy();
    expect(preview.querySelector('.act-page__number-date-row')).toBeTruthy();
  });
});

function getFirstOpenObjectButton(): HTMLElement {
  const [openButton] = screen.getAllByRole('button', { name: 'Открыть объект' });

  if (openButton === undefined) {
    throw new Error('На dashboard должна быть кнопка открытия объекта.');
  }

  return openButton;
}
