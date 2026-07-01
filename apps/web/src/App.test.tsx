// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App.js';
import {
  buildSectionFinalPackageModel,
  buildFinalPackageReadiness,
  buildSectionIdPackageOverviewModel,
  buildIntermediateIdPackageModel,
} from './app-shell/object-final-package-model.js';
import { demoIdFolders } from './app-shell/object-id-folders.js';
import {
  buildDerivedRegistryRows,
  buildFinalRegistryModel,
  buildFolderRegistryModel,
} from './app-shell/object-registry-model.js';
import { demoAosrWorkspace, type DemoAosrDraft } from './aosr-demo/demo-aosr-workspace.js';
import { initialDemoCertificates, initialDemoObjectDocuments } from './demo-store/demo-store.js';

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe('App shell mock navigation', () => {
  it('renders mock object cards and quick access cards on the dashboard', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: 'ИДея — рабочее место ПТО для исполнительной документации',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
    expect(screen.getByText('Жилой комплекс "Северный"')).toBeTruthy();
    expect(screen.getByText('Торговый центр "Горизонт"')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Открыть объект' })).toHaveLength(4);

    const quickAccess = screen.getByLabelText('Быстрые разделы');
    expect(within(quickAccess).getByText('Библиотека сертификатов')).toBeTruthy();
    expect(within(quickAccess).getByText('Представители и организации')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Недавние документы' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Настройки скоро' })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('opens an object on the overview instead of the AOSR editor and returns to the dashboard', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    expect(screen.getByRole('navigation', { name: 'Разделы объекта' })).toBeTruthy();
    expect(screen.getAllByText('Обзор').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Назад к объектам' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Обзор объекта' })).toBeTruthy();
    expect(
      screen.getAllByText('Реконструкция поликлиники, демонстрационный проект').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('г. Екатеринбург, ул. Демонстрационная, 10').length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByRole('heading', { name: 'Документы папки' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));

    expect(
      screen.getByRole('heading', {
        name: 'ИДея — рабочее место ПТО для исполнительной документации',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('creates the first section, arbitrary folder and first document in an empty object', async () => {
    const user = userEvent.setup();

    render(<App />);

    const emptyObjectCard = screen
      .getByRole('heading', { name: 'Новый объект без папок ИД' })
      .closest('article');

    if (emptyObjectCard === null) {
      throw new Error('Карточка пустого демо-объекта не найдена.');
    }

    await user.click(within(emptyObjectCard).getByRole('button', { name: 'Открыть объект' }));

    expect(screen.getByRole('heading', { name: 'Создайте первый раздел ИД' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Объект → раздел → папка → акт' })).toBeTruthy();
    expect(screen.getByText('Выберите или создайте раздел ИД.')).toBeTruthy();
    expect(screen.getByText('Акты создаются только внутри выбранной папки.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Сентябрь 2026' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Октябрь 2026' })).toBeNull();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    expect(within(objectNavigation).getByText('Разделов пока нет')).toBeTruthy();
    expect(
      within(objectNavigation).queryByRole('button', { name: /Шаблонные значения раздела/u }),
    ).toBeNull();
    await user.click(within(objectNavigation).getByRole('button', { name: 'Разделы ИД' }));
    await user.click(screen.getByRole('button', { name: 'Создать раздел' }));
    expect(screen.getByRole('form', { name: 'Создать раздел ИД' })).toBeTruthy();

    const createSectionForm = screen.getByRole('form', { name: 'Создать раздел ИД' });
    const createSectionButton = within(createSectionForm).getByRole('button', {
      name: 'Создать раздел',
    });
    expect(createSectionButton.hasAttribute('disabled')).toBe(true);
    await user.type(within(createSectionForm).getByLabelText('Название раздела'), 'Вентиляция');
    expect(createSectionButton.hasAttribute('disabled')).toBe(false);
    await user.click(createSectionButton);

    expect(screen.getByRole('heading', { name: 'Вентиляция' })).toBeTruthy();

    const createFolderPanelButton = screen.getAllByRole('button', { name: 'Создать папку' })[0];

    if (createFolderPanelButton === undefined) {
      throw new Error('Кнопка создания папки не найдена.');
    }

    await user.click(createFolderPanelButton);

    const createFolderForm = screen.getByRole('form', { name: 'Создать папку ИД' });
    const createFolderButton = within(createFolderForm).getByRole('button', {
      name: 'Создать папку',
    });
    expect(createFolderButton.hasAttribute('disabled')).toBe(true);

    await user.type(
      within(createFolderForm).getByLabelText('Название папки'),
      'Монтаж вентиляции — этап 1',
    );
    expect(createFolderButton.hasAttribute('disabled')).toBe(false);
    await user.click(createFolderButton);

    expect(screen.getByRole('heading', { name: 'Монтаж вентиляции — этап 1' })).toBeTruthy();
    expect(screen.getByText('В этой папке пока нет актов')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Создать акт' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Создать акт' }));
    const createDocumentDialog = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(createDocumentDialog.textContent).toContain('Монтаж вентиляции — этап 1');
    expect(createDocumentDialog.textContent).toContain('1');
    expect(within(createDocumentDialog).queryByLabelText('Номер документа')).toBeNull();
    await user.click(within(createDocumentDialog).getByRole('button', { name: 'Создать акт' }));

    expect(screen.getByLabelText('Текущий акт: 1')).toBeTruthy();
    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть раздел Вентиляция' }),
    );
    const folderDirectory = screen
      .getAllByLabelText('Папки раздела')
      .find((element) => element.classList.contains('object-folder-directory'));

    if (folderDirectory === undefined) {
      throw new Error('Список папок раздела не найден.');
    }

    const createdFolder = within(folderDirectory).getByRole('button', {
      name: /Монтаж вентиляции — этап 1/u,
    });
    expect(createdFolder.textContent).toContain('1 акт');
  });

  it('creates an AOSR draft from a folder and updates derived object counts', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    expect(screen.queryByLabelText('Ключевые показатели объекта')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Вентиляция' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Последние документы' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Объект → раздел → папка → акт' })).toBeTruthy();
    expect(screen.queryByText('ОВ-1')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Создать акт' })).toBeNull();

    await openFolderByName(user, 'Сентябрь 2026');
    await user.click(getFirstCreateDocumentButton());

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(within(selector).getByText('АОСР — Акт освидетельствования скрытых работ')).toBeTruthy();
    expect(selector.textContent).toContain('Сентябрь 2026');
    expect(selector.textContent).not.toContain('ОВ-3');
    expect(selector.textContent).not.toContain('Выбран');
    expect(within(selector).queryByLabelText('Номер документа')).toBeNull();
    expect(within(selector).getByRole('radio', { checked: true })).toBeTruthy();
    expect(within(selector).getByText('Акт испытаний')).toBeTruthy();
    expect(within(selector).getByText('Исполнительная схема')).toBeTruthy();

    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));

    expect(screen.getByLabelText('Текущий акт: ОВ-3')).toBeTruthy();
    const documentNumberInput = screen.getByLabelText<HTMLInputElement>('Номер акта');
    await user.clear(documentNumberInput);
    await user.type(documentNumberInput, '12-3-ОВ');
    expect(screen.getByLabelText('Текущий акт: 12-3-ОВ')).toBeTruthy();
    expect(screen.getByText('Ручная нумерация')).toBeTruthy();
    expect(
      screen.getByText(/Автоматическая нумерация больше не будет управлять номером/u),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Редактировать только для этого акта' }),
    ).toBeTruthy();

    await openDocumentPreview(user);
    expect(getDocumentPreview()).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Редактировать только для этого акта' }),
    ).toBeNull();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'Обзор объекта' }));

    expect(screen.queryByLabelText('Ключевые показатели объекта')).toBeNull();
    expect(screen.queryByText('12-3-ОВ')).toBeNull();

    await user.click(
      within(objectNavigation).getByRole('button', {
        name: 'Итоговая ИД по разделу Вентиляция',
      }),
    );

    expect(screen.getAllByText('12-3-ОВ').length).toBeGreaterThan(0);
    const finalSummary = screen.getByLabelText('Сводка итогового комплекта ИД');
    expect(within(finalSummary).getByLabelText('Документы из папок: 3')).toBeTruthy();
    expect(within(finalSummary).getByLabelText('Всего позиций: 10')).toBeTruthy();
  });

  it('creates an AOSR draft with an empty manual number without blocking the editor', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());
    await openFolderByName(user, 'Сентябрь 2026');
    await user.click(getFirstCreateDocumentButton());

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(within(selector).queryByLabelText('Номер документа')).toBeNull();
    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));

    expect(screen.getByLabelText('Текущий акт: ОВ-3')).toBeTruthy();

    const documentNumberInput = screen.getByLabelText<HTMLInputElement>('Номер акта');
    expect(documentNumberInput.value).toBe('ОВ-3');
    await user.clear(documentNumberInput);
    expect(documentNumberInput.value).toBe('');

    expect(screen.getByLabelText('Текущий акт: Без номера')).toBeTruthy();
    expect(screen.getByText('Ручная нумерация')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр' })).toBeTruthy();
  });

  it('renders object workspace navigation with one clear overview path', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    expect(within(objectNavigation).getByText('Работа')).toBeTruthy();
    expect(within(objectNavigation).getByText('Объект')).toBeTruthy();
    expect(within(objectNavigation).getByText('Сервис')).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Обзор объекта' })).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Разделы ИД' })).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть раздел Вентиляция' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть раздел Отопление' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', {
        name: 'Шаблонные значения раздела Вентиляция',
      }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть папку Сентябрь 2026' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть папку Октябрь 2026' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', {
        name: 'Итоговая ИД по разделу Вентиляция',
      }),
    ).toBeTruthy();
    expect(within(objectNavigation).queryByRole('button', { name: /ОВ-1/u })).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: /ОВ-2/u })).toBeNull();
    expect(
      within(objectNavigation).queryByRole('button', { name: /сертификаты объекта/iu }),
    ).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: 'Сертификаты' })).toBeNull();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
    ).toBeTruthy();
    expect(within(objectNavigation).queryByRole('button', { name: 'Представители' })).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: 'Акты' })).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: 'АОСР' })).toBeNull();
    expect(
      within(objectNavigation).queryByRole('button', { name: 'Открыть реестр ИД' }),
    ).toBeNull();

    expect(
      screen.getByRole('heading', {
        name: 'Реконструкция поликлиники, демонстрационный проект',
      }),
    ).toBeTruthy();
    expect(screen.queryByText('Активен')).toBeNull();

    expect(screen.queryByLabelText('Показатели открытого объекта')).toBeNull();

    expect(screen.queryByLabelText('Метаданные объекта')).toBeNull();

    expect(screen.queryByLabelText('Ключевые показатели объекта')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Периоды работ' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Периодическая ИД и итоговая ИД' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Вентиляция' })).toBeTruthy();
    expect(
      screen.getByText(/Итоговая ИД по разделу собирается именно из папок выбранного раздела/u),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Открыть раздел' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Перейти к разделам ИД' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Создать папку' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Создать акт' })).toBeNull();
    expect(document.querySelectorAll('.object-overview .action-button--primary')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Перейти к разделам ИД' }));

    expect(
      screen.getByRole('heading', { name: 'Разделы исполнительной документации' }),
    ).toBeTruthy();
    expect(screen.queryByRole('form', { name: 'Создать раздел ИД' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /Открыть раздел/u }).length).toBeGreaterThan(0);
    expect(screen.getByText('2 папки · 2 акта')).toBeTruthy();

    await user.click(
      within(screen.getByLabelText('Все разделы ИД')).getByRole('button', {
        name: 'Открыть раздел Вентиляция',
      }),
    );
    expect(screen.getByRole('heading', { name: 'Вентиляция' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Создать папку' }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /Итоговая ИД по разделу/u }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /Шаблонные значения раздела/u }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Создать акт' })).toBeNull();
  });

  it('switches object workspace sections and renders the object documents page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
    );
    expect(screen.getByRole('heading', { name: 'Документы объекта' })).toBeTruthy();
    expect(
      screen.getByText(
        'Исполнительные схемы, исполнительные чертежи, протоколы, журналы и другие документы объекта.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Наименование' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Тип документа' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Номер' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Дата' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Используется в актах' })).toBeTruthy();
    expect(
      within(screen.getByRole('table')).getByText(
        'Исполнительная схема скрытых участков вентиляции',
      ),
    ).toBeTruthy();
    expect(screen.getAllByText('Используется в 1 актах').length).toBeGreaterThan(0);

    await openFolderByName(user, 'Сентябрь 2026');
    expect(screen.getByRole('heading', { name: 'Сентябрь 2026' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Акты в папке' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /ОВ-1/u })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Реестр папки «Сентябрь 2026»' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Промежуточная ИД по папке' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Открыть промежуточную ИД по папке' })).toBeTruthy();

    await user.click(
      within(objectNavigation).getByRole('button', {
        name: 'Итоговая ИД по разделу Вентиляция',
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Итоговая ИД по разделу: Вентиляция' }),
    ).toBeTruthy();
  });

  it('opens a folder as a working folder with documents and intermediate ID action', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openFolderByName(user, 'Октябрь 2026');

    expect(screen.getByRole('heading', { name: 'Октябрь 2026' })).toBeTruthy();
    expect(screen.getAllByText('ОВ-2').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: 'Реестр папки «Октябрь 2026»' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Промежуточная ИД по папке' })).toBeTruthy();
    expect(
      screen.getByText('Реестр и печатный состав открываются в промежуточной ИД этой папки.'),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /ОВ-2/u }));

    expect(screen.getByRole('heading', { name: 'Акты в папке «Октябрь 2026»' })).toBeTruthy();
    expect(screen.getByLabelText('Текущий акт: ОВ-2')).toBeTruthy();
  });

  it('opens a frontend-only intermediate ID page derived from the selected folder', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openFolderByName(user, 'Октябрь 2026');
    await user.click(screen.getByRole('button', { name: 'Открыть промежуточную ИД по папке' }));

    const intermediatePackagePage = screen.getByRole('region', {
      name: 'Промежуточная ИД по папке «Октябрь 2026»',
    });

    expect(
      within(intermediatePackagePage).getByRole('heading', {
        name: 'Промежуточная ИД по папке «Октябрь 2026»',
      }),
    ).toBeTruthy();
    expect(
      within(intermediatePackagePage).getByText('Документы, сертификаты и файлы выбранной папки.'),
    ).toBeTruthy();
    const summary = within(intermediatePackagePage).getByLabelText(
      'Сводка промежуточной ИД по папке',
    );
    expect(within(summary).getByLabelText('Документы папки: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Сертификаты без дублей: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Документы / чертежи без дублей: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Всего позиций: 4')).toBeTruthy();

    expect(
      within(intermediatePackagePage).getByRole('heading', { name: 'Реестр папки' }),
    ).toBeTruthy();
    const intermediateRegistry = within(getSectionByHeading('Реестр папки'));
    expect(
      intermediateRegistry.getByText(
        'Построен из текущих документов папки. Реестр не сохраняется, не блокируется и не закрывает папку.',
      ),
    ).toBeTruthy();
    expect(intermediateRegistry.getByRole('columnheader', { name: '№' })).toBeTruthy();
    expect(intermediateRegistry.getAllByText('АОСР').length).toBeGreaterThan(0);
    expect(
      intermediateRegistry.getAllByText('Акт освидетельствования скрытых работ').length,
    ).toBeGreaterThan(0);
    expect(intermediateRegistry.getByText('ОВ-2')).toBeTruthy();
    expect(intermediateRegistry.getByText('Октябрь 2026')).toBeTruthy();
    expect(intermediateRegistry.queryByText('ОВ-1')).toBeNull();
    expect(
      within(intermediatePackagePage).getByRole('heading', { name: 'Документы папки' }),
    ).toBeTruthy();
    expect(within(intermediatePackagePage).getAllByText('ОВ-2').length).toBeGreaterThan(0);
    expect(
      within(intermediatePackagePage).getByText('Комплект печатается из текущего состава папки.'),
    ).toBeTruthy();
    const printButton = within(intermediatePackagePage).getByRole('button', {
      name: 'Печать промежуточной ИД по папке',
    });
    expect((printButton as HTMLButtonElement).disabled).toBe(false);
    await user.click(printButton);
    expect(
      within(intermediatePackagePage).getByText(
        'Промежуточная ИД по папке пока доступна как экран состава. Генерация файла появится после UX-baseline.',
      ),
    ).toBeTruthy();
  });

  it('creates an AOSR draft inside the selected folder and shows it in that folder tree', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openFolderByName(user, 'Октябрь 2026');

    expect(screen.getByRole('button', { name: 'Создать акт' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Создать акт' }));

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(selector.textContent).toContain('Октябрь 2026');
    expect(selector.textContent).not.toContain('ОВ-3');
    expect(within(selector).queryByLabelText('Номер документа')).toBeNull();

    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));

    expect(screen.getByLabelText('Текущий акт: ОВ-3')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-3' })).toBeTruthy();

    await openFolderByName(user, 'Октябрь 2026');
    await user.click(screen.getByRole('button', { name: 'Создать акт' }));
    const nextSelector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(nextSelector.textContent).not.toContain('ОВ-4');
    await user.click(within(nextSelector).getByRole('button', { name: 'Отмена' }));

    const updatedOctoberActs = within(getSectionByHeading('Акты в папке'));
    expect(updatedOctoberActs.getByText('ОВ-3')).toBeTruthy();
    expect(
      updatedOctoberActs.getAllByText('АОСР — Акт освидетельствования скрытых работ').length,
    ).toBeGreaterThan(1);

    await user.click(screen.getByRole('button', { name: /ОВ-3/u }));

    expect(screen.getByLabelText('Текущий акт: ОВ-3')).toBeTruthy();
    expect(screen.getAllByText('Октябрь 2026').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('ОВ-3')).toBeTruthy();
    expect(screen.getByRole('button', { name: /ОВ-3/u })).toBeTruthy();

    await openFolderByName(user, 'Октябрь 2026');
    expect(screen.getByRole('button', { name: /ОВ-2/u })).toBeTruthy();
    expect(screen.getByRole('button', { name: /ОВ-3/u })).toBeTruthy();

    await openFolderByName(user, 'Сентябрь 2026');
    expect(screen.getByRole('button', { name: /ОВ-1/u })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /ОВ-3/u })).toBeNull();
  });

  it('uses current section template parameters for linked AOSR drafts', async () => {
    const user = userEvent.setup();
    const nextObjectName = 'Новый объект для будущих АОСР.';
    const nextProjectDocumentation = 'Новая проектная документация для будущих АОСР.';
    const nextComplianceText = 'Новый текст соответствия требованиям для будущих АОСР.';

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openObjectSettingsFromWorkspace(user);

    const dialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    await user.clear(within(dialog).getByLabelText('Объект капитального строительства'));
    await user.type(
      within(dialog).getByLabelText('Объект капитального строительства'),
      nextObjectName,
    );
    await user.click(within(dialog).getByRole('button', { name: /Организации/u }));
    await user.click(within(dialog).getByRole('button', { name: 'Переместить Подрядчик вверх' }));
    await user.click(within(dialog).getByRole('button', { name: /Данные и тексты/u }));
    await user.clear(within(dialog).getByLabelText('Проектная документация шаблона'));
    await user.type(
      within(dialog).getByLabelText('Проектная документация шаблона'),
      nextProjectDocumentation,
    );
    await user.clear(within(dialog).getByLabelText('Текст соответствия работ требованиям'));
    await user.type(
      within(dialog).getByLabelText('Текст соответствия работ требованиям'),
      nextComplianceText,
    );
    await user.click(within(dialog).getByRole('button', { name: 'Вернуться к разделу' }));
    await openSeptemberAosrDocument(user);

    expect(
      getTextAreaValue(screen.getByLabelText('Объект капитального строительства в документе')),
    ).toBe(nextObjectName);
    expect(getTextAreaValue(screen.getByLabelText('Проектная документация в документе'))).toBe(
      nextProjectDocumentation,
    );
    expect(getTextAreaValue(screen.getByLabelText('Текст соответствия работ требованиям'))).toBe(
      nextComplianceText,
    );
    const oldOrganizationOrderText = screen.getByRole('list', {
      name: 'Порядок организаций в акте',
    }).textContent;
    expect(oldOrganizationOrderText.indexOf('Подрядчик')).toBeLessThan(
      oldOrganizationOrderText.indexOf('Заказчик'),
    );

    await openFolderByName(user, 'Октябрь 2026');
    await user.click(screen.getByRole('button', { name: 'Создать акт' }));

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));
    await user.click(screen.getByRole('button', { name: /ОВ-3/u }));

    expect(
      getTextAreaValue(screen.getByLabelText('Объект капитального строительства в документе')),
    ).toBe(nextObjectName);
    expect(getTextAreaValue(screen.getByLabelText('Проектная документация в документе'))).toBe(
      nextProjectDocumentation,
    );
    expect(getTextAreaValue(screen.getByLabelText('Текст соответствия работ требованиям'))).toBe(
      nextComplianceText,
    );
    const newOrganizationOrderText = screen.getByRole('list', {
      name: 'Порядок организаций в акте',
    }).textContent;
    expect(newOrganizationOrderText.indexOf('Подрядчик')).toBeLessThan(
      newOrganizationOrderText.indexOf('Заказчик'),
    );
    expect(screen.getAllByText('Данные из раздела').length).toBeGreaterThan(0);
  });

  it('opens the final ID package page with derived summary counts and grouped composition', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    const finalPackagePage = screen.getByRole('region', {
      name: 'Итоговая ИД по разделу: Вентиляция',
    });

    expect(
      within(finalPackagePage).getByRole('heading', {
        name: 'Итоговая ИД по разделу: Вентиляция',
      }),
    ).toBeTruthy();

    const septemberPackage = within(finalPackagePage).getByLabelText('Состав пакета Сентябрь 2026');
    expect(within(septemberPackage).getByLabelText('Документы: 1')).toBeTruthy();
    expect(within(septemberPackage).getByLabelText('Использовано сертификатов: 2')).toBeTruthy();
    expect(within(septemberPackage).getByLabelText('Документы объекта: 2')).toBeTruthy();

    const octoberPackage = within(finalPackagePage).getByLabelText('Состав пакета Октябрь 2026');
    expect(within(octoberPackage).getByLabelText('Документы: 1')).toBeTruthy();
    expect(within(octoberPackage).getByLabelText('Использовано сертификатов: 1')).toBeTruthy();
    expect(within(octoberPackage).getByLabelText('Документы объекта: 1')).toBeTruthy();

    const summary = within(finalPackagePage).getByLabelText('Сводка итогового комплекта ИД');
    expect(within(summary).getByLabelText('Документы из папок: 2')).toBeTruthy();
    expect(within(summary).getByLabelText('Сертификаты без дублей: 3')).toBeTruthy();
    expect(within(summary).getByLabelText('Документы / чертежи без дублей: 3')).toBeTruthy();
    expect(within(summary).getByLabelText('Всего позиций: 9')).toBeTruthy();

    expect(
      within(finalPackagePage).getByRole('heading', {
        name: 'Финальный реестр итоговой ИД раздела',
      }),
    ).toBeTruthy();
    const finalRegistry = within(getSectionByHeading('Финальный реестр итоговой ИД раздела'));
    expect(
      finalRegistry.getByText(
        'Построен из документов всех папок выбранного раздела. Финальный реестр не сохраняется как сущность, не блокируется и не архивируется.',
      ),
    ).toBeTruthy();
    expect(finalRegistry.getByText('ОВ-1')).toBeTruthy();
    expect(finalRegistry.getByText('ОВ-2')).toBeTruthy();
    expect(finalRegistry.getByText('Сентябрь 2026')).toBeTruthy();
    expect(finalRegistry.getByText('Октябрь 2026')).toBeTruthy();
    expect(finalRegistry.getAllByText('АОСР').length).toBeGreaterThan(1);
    expect(
      finalRegistry.getAllByText('Акт освидетельствования скрытых работ').length,
    ).toBeGreaterThan(1);
    expect(
      finalRegistry.getByText(
        'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой.',
      ),
    ).toBeTruthy();
    expect(
      finalRegistry.getByText(
        'Установка гильз трубопроводов перед заделкой отверстий в перекрытии.',
      ),
    ).toBeTruthy();
    expect(
      within(finalPackagePage).getByRole('heading', { name: 'Документы из папок' }),
    ).toBeTruthy();
    expect(within(finalPackagePage).getByRole('heading', { name: 'Сертификаты' })).toBeTruthy();
    expect(
      within(finalPackagePage).getByRole('heading', { name: 'Документы объекта' }),
    ).toBeTruthy();
    expect(within(finalPackagePage).getAllByText('ОВ-1').length).toBeGreaterThan(0);
    expect(within(finalPackagePage).getByText('СТ-ОВ-2026-017')).toBeTruthy();
    expect(within(finalPackagePage).getByText('ИС-ОВ-04')).toBeTruthy();
  });

  it('builds the frontend-only intermediate and final ID package overview model', () => {
    const packageOverview = buildSectionIdPackageOverviewModel(
      demoAosrWorkspace.drafts,
      initialDemoObjectDocuments,
      initialDemoCertificates,
    );

    expect(packageOverview.intermediatePackages).toHaveLength(2);
    expect(packageOverview.intermediatePackages[0]?.type).toBe('intermediate');
    expect(packageOverview.intermediatePackages[0]?.folderName).toBe('Сентябрь 2026');
    expect(packageOverview.intermediatePackages[0]?.title).toBe(
      'Промежуточная ИД по папке «Сентябрь 2026»',
    );
    expect(packageOverview.intermediatePackages[0]?.summary).toEqual({
      acts: 1,
      objectDocuments: 2,
      usedCertificates: 2,
    });
    expect(packageOverview.intermediatePackages[1]?.folderName).toBe('Октябрь 2026');
    expect(packageOverview.intermediatePackages[1]?.summary).toEqual({
      acts: 1,
      objectDocuments: 1,
      usedCertificates: 1,
    });
    expect(packageOverview.finalPackage).toMatchObject({
      title: 'Итоговая ИД по разделу',
      type: 'final',
    });
    expect(packageOverview.finalPackage.summary).toEqual({
      acts: 2,
      objectDocuments: 3,
      usedCertificates: 3,
    });

    const octoberFolder = demoIdFolders[1];

    if (octoberFolder === undefined) {
      throw new Error('Для демо нужна октябрьская папка ИД.');
    }

    const intermediatePackage = buildIntermediateIdPackageModel(
      octoberFolder,
      demoAosrWorkspace.drafts,
      initialDemoObjectDocuments,
      initialDemoCertificates,
    );

    expect(intermediatePackage.summary).toEqual({
      acts: 1,
      certificates: 1,
      objectDocuments: 1,
      total: 4,
    });
    expect(intermediatePackage.groups.find((group) => group.id === 'registry')?.title).toBe(
      'Реестр папки',
    );
    expect(
      intermediatePackage.groups.find((group) => group.id === 'registry')?.registry?.rows,
    ).toEqual([
      expect.objectContaining({
        documentNumber: 'ОВ-2',
        documentTypeCode: 'АОСР',
        documentTypeTitle: 'Акт освидетельствования скрытых работ',
        folderName: 'Октябрь 2026',
        rowNumber: 1,
        workDescription: 'Установка гильз трубопроводов перед заделкой отверстий в перекрытии.',
      }),
    ]);
    expect(intermediatePackage.groups.find((group) => group.id === 'acts')?.items).toEqual([
      expect.objectContaining({
        number: 'ОВ-2',
      }),
    ]);

    const octoberRegistry = buildFolderRegistryModel(octoberFolder, demoAosrWorkspace.drafts);
    expect(octoberRegistry.rows).toEqual([
      expect.objectContaining({
        documentNumber: 'ОВ-2',
        documentTypeCode: 'АОСР',
        documentTypeTitle: 'Акт освидетельствования скрытых работ',
        folderName: 'Октябрь 2026',
      }),
    ]);

    const finalRegistry = buildFinalRegistryModel(demoAosrWorkspace.drafts, demoIdFolders);
    expect(finalRegistry.rows.map((row) => row.documentNumber)).toEqual(['ОВ-1', 'ОВ-2']);
    expect(finalRegistry.rows.map((row) => row.folderName)).toEqual([
      'Сентябрь 2026',
      'Октябрь 2026',
    ]);

    expect(
      buildDerivedRegistryRows([
        {
          actTypeId: 'aosr',
          documentDate: '2026-11-01',
          documentNumber: 'ОВ-meta',
          id: 'metadata-driven-row',
          folderName: 'Ноябрь 2026',
          workDescription: 'Проверка строки через метаданные типа документа',
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        documentNumber: 'ОВ-meta',
        documentTypeCode: 'АОСР',
        documentTypeTitle: 'Акт освидетельствования скрытых работ',
        folderName: 'Ноябрь 2026',
      }),
    ]);
  });

  it('does not repeat duplicate certificates or object documents in the final package model', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (sourceDraft === undefined) {
      throw new Error('Для демо нужен исходный АОСР.');
    }

    const duplicateDrafts: readonly DemoAosrDraft[] = [
      {
        ...sourceDraft,
        id: 'final-package-dedupe-source',
        materialCertificateIds: ['certificate-ducts-001', 'certificate-fasteners-001'],
        objectDocumentIds: ['object-document-scheme-ov-04'],
      },
      {
        ...sourceDraft,
        actNumber: 'ОВ-duplicate',
        id: 'final-package-dedupe-repeat',
        materialCertificateIds: ['certificate-ducts-001'],
        objectDocumentIds: ['object-document-scheme-ov-04'],
      },
    ];
    const foldersWithDuplicateDrafts = demoIdFolders.map((folder) =>
      folder.id === sourceDraft.folderId
        ? { ...folder, draftIds: duplicateDrafts.map((draft) => draft.id) }
        : folder,
    );

    const finalPackage = buildSectionFinalPackageModel(
      duplicateDrafts,
      initialDemoObjectDocuments,
      initialDemoCertificates,
      foldersWithDuplicateDrafts,
    );
    const certificates = finalPackage.groups.find((group) => group.id === 'certificates')?.items;
    const objectDocuments = finalPackage.groups.find(
      (group) => group.id === 'object-documents',
    )?.items;

    expect(finalPackage.summary.acts).toBe(2);
    expect(finalPackage.summary.certificates).toBe(2);
    expect(finalPackage.summary.objectDocuments).toBe(1);
    expect(finalPackage.summary.total).toBe(6);
    expect(
      certificates?.filter((item) => item.id === 'final-certificate-global-certificate-ducts-001'),
    ).toHaveLength(1);
    expect(
      objectDocuments?.filter(
        (item) => item.id === 'final-object-document-object-document-scheme-ov-04',
      ),
    ).toHaveLength(1);
  });

  it('derives final package readiness warnings from missing demo composition', () => {
    const readiness = buildFinalPackageReadiness({
      acts: 0,
      certificates: 0,
      objectDocuments: 0,
    });

    expect(readiness.status).toBe('needs-attention');
    expect(readiness.statusLabel).toBe('Пустые поля останутся пустыми');
    expect(readiness.issues).toEqual([
      'Нет документов папки',
      'Нет сертификатов',
      'Нет документов объекта',
    ]);
  });

  it('shows a mock message for the final ID package download action in demo mode', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    const finalPackagePage = screen.getByRole('region', {
      name: 'Итоговая ИД по разделу: Вентиляция',
    });
    const downloadButton = within(finalPackagePage).getByRole('button', {
      name: 'Скачать итоговую ИД по разделу',
    });
    expect((downloadButton as HTMLButtonElement).disabled).toBe(false);
    await user.click(downloadButton);
    expect(
      within(finalPackagePage).getByText(
        'Генерация DOCX/PDF будет подключена позже. Сейчас показан состав итоговой ИД по разделу.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Документы папок выбранного раздела собираются без дублирования сертификатов и файлов.',
      ),
    ).toBeTruthy();
  });

  it('navigates from the final ID package page back to AOSR', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    await openSeptemberAosrDocument(user);

    expect(screen.getByRole('heading', { name: 'Акты в папке «Сентябрь 2026»' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр' })).toBeTruthy();
  });

  it('renders object document counts from the frontend mock data', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectDocumentsPage(user);

    const summary = screen.getByLabelText('Сводка документов объекта');
    expect(within(summary).getByLabelText('Всего документов: 8')).toBeTruthy();
    expect(within(summary).getByLabelText('Схемы: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Чертежи: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Протоколы: 1')).toBeTruthy();
  });

  it('filters object documents by mock document category', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectDocumentsPage(user);

    const table = screen.getByRole('table');

    await user.click(screen.getByRole('button', { name: 'Протоколы' }));
    expect(within(table).getByText('Протокол проверки герметичности воздуховодов')).toBeTruthy();
    expect(
      within(table).queryByText('Исполнительная схема скрытых участков вентиляции'),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Журналы' }));
    expect(within(table).getByText('Запись журнала входного контроля материалов')).toBeTruthy();
    expect(within(table).queryByText('Протокол проверки герметичности воздуховодов')).toBeNull();
  });

  it('adds a mock object document in memory on the object documents page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectDocumentsPage(user);

    await user.type(screen.getByLabelText('Наименование'), 'Протокол аэродинамических испытаний');
    await user.selectOptions(screen.getByLabelText('Тип'), 'Протокол');
    await user.type(screen.getByLabelText('Номер'), 'ПР-АИ-2026-09');
    await user.type(screen.getByLabelText('Дата'), '2026-06-05');
    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));

    const table = screen.getByRole('table');
    const documentRow = within(table)
      .getByText('Протокол аэродинамических испытаний')
      .closest('tr');

    if (documentRow === null) {
      throw new Error('В тесте ожидается строка нового документа объекта.');
    }

    expect(within(documentRow as HTMLElement).getByText('ПР-АИ-2026-09')).toBeTruthy();
    expect(within(documentRow as HTMLElement).getByText('Используется в 0 актах')).toBeTruthy();

    const summary = screen.getByLabelText('Сводка документов объекта');
    expect(within(summary).getByLabelText('Всего документов: 9')).toBeTruthy();
    expect(within(summary).getByLabelText('Протоколы: 2')).toBeTruthy();
  });

  it('shows newly added object documents in the AOSR point 4 drawer', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectDocumentsPage(user);

    await user.type(screen.getByLabelText('Наименование'), 'Исполнительная схема ВК-12');
    await user.selectOptions(screen.getByLabelText('Тип'), 'Исполнительная схема');
    await user.type(screen.getByLabelText('Номер'), 'ИС-ВК-12');
    await user.type(screen.getByLabelText('Дата'), '2026-06-06');
    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));

    await openSeptemberAosrDocument(user);
    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));
    await user.type(screen.getByLabelText('Найти документ объекта'), 'ВК-12');

    const documentLibrary = screen.getByRole('list', { name: 'Библиотека документов объекта' });
    expect(within(documentLibrary).getByText('Исполнительная схема ВК-12')).toBeTruthy();
    expect(within(documentLibrary).getByText('Исполнительная схема / ИС-ВК-12')).toBeTruthy();
  });

  it('navigates from a folder placeholder back into its AOSR document', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openFolderByName(user, 'Сентябрь 2026');
    expect(screen.queryByRole('heading', { name: 'Реестр папки «Сентябрь 2026»' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Промежуточная ИД по папке' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /ОВ-1/u }));

    expect(screen.getByRole('heading', { name: 'Акты в папке «Сентябрь 2026»' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр' })).toBeTruthy();
  });

  it('deletes an AOSR draft from the selected object folder after confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openSeptemberAosrDocument(user);

    const actions = screen.getByRole('region', { name: 'Действия с актом' });

    await user.click(within(actions).getByRole('button', { name: 'Удалить акт' }));

    expect(confirmSpy).toHaveBeenCalledWith('Удалить акт ОВ-1? Акт будет удалён из текущей папки.');
    expect(screen.getByRole('heading', { name: 'Сентябрь 2026' })).toBeTruthy();
    expect(screen.getByText('В этой папке пока нет актов')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /ОВ-1/u })).toBeNull();
  });

  it('deletes an AOSR draft directly from the folder act list after confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openFolderByName(user, 'Сентябрь 2026');

    const folderDocuments = within(getSectionByHeading('Акты в папке'));
    const deleteButton = folderDocuments.getByRole('button', { name: 'Удалить акт' });

    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('Удалить акт ОВ-1? Акт будет удалён из текущей папки.');
    expect(screen.getByRole('button', { name: /ОВ-1/u })).toBeTruthy();

    await user.click(deleteButton);

    expect(screen.getByText('В этой папке пока нет актов')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /ОВ-1/u })).toBeNull();
  });

  it('reorders folder acts by drag and recalculates automatic section numbering', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openFolderByName(user, 'Сентябрь 2026');

    await user.click(screen.getByRole('button', { name: 'Создать акт' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Создание акта' })).getByRole('button', {
        name: 'Создать акт',
      }),
    );
    await user.clear(screen.getByLabelText('Дата акта'));
    await user.type(screen.getByLabelText('Дата акта'), '2026-09-05');
    await openFolderByName(user, 'Сентябрь 2026');

    let folderActs = screen.getByRole('list', { name: 'Акты в папке Сентябрь 2026' });
    let rows = within(folderActs).getAllByRole('listitem');

    expect(rows[0]?.textContent).toContain('ОВ-1');
    expect(rows[0]?.textContent).toContain('04.09.2026');
    expect(rows[1]?.textContent).toContain('ОВ-3');
    expect(rows[1]?.textContent).toContain('05.09.2026');

    const dataTransfer = createDragDataTransfer();
    const draggedRow = getRequiredListItem(rows, 1);
    const targetRow = getRequiredListItem(rows, 0);

    fireEvent.dragStart(draggedRow, { dataTransfer });
    fireEvent.drop(targetRow, { dataTransfer });

    folderActs = screen.getByRole('list', { name: 'Акты в папке Сентябрь 2026' });
    rows = within(folderActs).getAllByRole('listitem');

    expect(rows[0]?.textContent).toContain('ОВ-1');
    expect(rows[0]?.textContent).toContain('05.09.2026');
    expect(rows[1]?.textContent).toContain('ОВ-2');
    expect(rows[1]?.textContent).toContain('04.09.2026');

    const reverseDataTransfer = createDragDataTransfer();
    const reverseDraggedRow = getRequiredListItem(rows, 0);
    const reverseTargetRow = getRequiredListItem(rows, 1);
    const reverseDraggedId = reverseDraggedRow.dataset['folderDraftId'];
    const reverseTargetId = reverseTargetRow.dataset['folderDraftId'];

    if (reverseDraggedId === undefined || reverseTargetId === undefined) {
      throw new Error('В строках актов ожидались data-folder-draft-id.');
    }

    fireEvent.dragStart(reverseDraggedRow, { dataTransfer: reverseDataTransfer });
    expect(reverseDraggedId).not.toBe(reverseTargetId);
    expect(reverseDataTransfer.getData('text/plain')).toBe(reverseDraggedId);
    fireEvent.dragOver(reverseTargetRow, { clientY: 999, dataTransfer: reverseDataTransfer });
    fireEvent.drop(reverseTargetRow, { dataTransfer: reverseDataTransfer });

    folderActs = screen.getByRole('list', { name: 'Акты в папке Сентябрь 2026' });
    rows = within(folderActs).getAllByRole('listitem');

    expect(rows[0]?.textContent).toContain('ОВ-1');
    expect(rows[0]?.textContent).toContain('04.09.2026');
    expect(rows[1]?.textContent).toContain('ОВ-2');
    expect(rows[1]?.textContent).toContain('05.09.2026');

    await openFolderByName(user, 'Октябрь 2026');
    expect(screen.getByRole('button', { name: /ОВ-3/u })).toBeTruthy();
  });

  it('keeps representatives in the global library instead of duplicating them in object navigation', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    expect(within(objectNavigation).queryByRole('button', { name: 'Представители' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));
    await openRepresentativesManagementPage(user);

    expect(screen.getByRole('heading', { name: 'Представители и организации' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Организации' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Представители' })).toBeTruthy();
  });

  it('opens current section template settings from object workspace navigation', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openObjectSettingsFromWorkspace(user);

    const dialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    expect(
      within(dialog).getByRole('navigation', { name: 'Разделы шаблонных значений раздела' }),
    ).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Данные и тексты/u })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Организации/u })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Представители/u })).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: /Тексты акта/u })).toBeNull();
    expect(within(dialog).getByLabelText('Объект капитального строительства')).toBeTruthy();
    expect(
      within(dialog).getByRole('heading', { name: '7. Соответствие работ требованиям' }),
    ).toBeTruthy();
    expect(
      within(dialog).getByRole('heading', { name: 'Копирование шаблонных значений' }),
    ).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Скопировать' })).toBeTruthy();
    expect(
      within(dialog).getByText(
        'Буфер пуст. Скопируйте значения в одном разделе, затем вставьте в другом.',
      ),
    ).toBeTruthy();
    expect(
      within(dialog).getByText('Скопируйте значения здесь, вставьте в другом разделе.'),
    ).toBeTruthy();
    expect(within(dialog).getByText('Что копируется и что не копируется')).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Вставить' })).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: 'Скопировать из выбранного раздела' }),
    ).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: 'Скопировать в выбранный раздел' }),
    ).toBeNull();
    expect(within(dialog).queryByLabelText('Раздел-источник')).toBeNull();
    expect(within(dialog).queryByLabelText('Раздел-получатель')).toBeNull();

    await user.click(within(dialog).getByRole('button', { name: 'Вернуться к разделу' }));

    expect(screen.queryByRole('region', { name: /Шаблонные значения раздела/u })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Вентиляция' })).toBeTruthy();
  });

  it('copies section template settings to another section without copying its prefix', async () => {
    const user = userEvent.setup();
    const copiedComplianceText = 'Скопированный текст соответствия только для проверки разделов.';

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openObjectSettingsFromWorkspace(user);

    const ventilationDialog = screen.getByRole('region', {
      name: /Шаблонные значения раздела/u,
    });
    const ventilationPrefix =
      within(ventilationDialog).getByLabelText<HTMLInputElement>('Префикс номера');
    const ventilationCompliance = within(ventilationDialog).getByLabelText<HTMLTextAreaElement>(
      'Текст соответствия работ требованиям',
    );

    expect(ventilationPrefix.value).toBe('ОВ-');
    await user.clear(ventilationPrefix);
    await user.type(ventilationPrefix, 'VENT-');
    await user.clear(ventilationCompliance);
    await user.type(ventilationCompliance, copiedComplianceText);
    await user.click(within(ventilationDialog).getByRole('button', { name: 'Скопировать' }));

    expect(ventilationDialog.textContent).toContain('Шаблонные значения скопированы.');
    expect(ventilationDialog.textContent).toContain(
      'В буфере значения этого же раздела. Вставка сюда недоступна.',
    );
    const pasteIntoSourceButton = within(ventilationDialog).getByRole('button', {
      name: 'Вставить',
    });
    expect((pasteIntoSourceButton as HTMLButtonElement).disabled).toBe(true);
    await user.click(
      within(ventilationDialog).getByRole('button', { name: 'Вернуться к разделу' }),
    );

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'Разделы ИД' }));
    await user.click(
      within(screen.getByLabelText('Все разделы ИД')).getByRole('button', {
        name: 'Открыть раздел Отопление',
      }),
    );
    await openObjectSettingsFromWorkspace(user, 'Отопление');

    const heatingDialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    expect(heatingDialog.textContent).toContain(
      'В буфере: «Вентиляция» · объект «Реконструкция поликлиники, демонстрационный проект»',
    );
    expect(heatingDialog.textContent).toContain(
      'При вставке в раздел «Отопление» объекта «Реконструкция поликлиники, демонстрационный проект» префикс текущего раздела сохранится.',
    );
    const heatingCompliance = within(heatingDialog).getByLabelText<HTMLTextAreaElement>(
      'Текст соответствия работ требованиям',
    );
    const originalHeatingComplianceText = heatingCompliance.value;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(within(heatingDialog).getByRole('button', { name: 'Вставить' }));
    expect(confirmSpy).toHaveBeenCalledWith(
      'Вставить шаблонные значения из раздела «Вентиляция» объекта «Реконструкция поликлиники, демонстрационный проект»?\n' +
        'Будут заменены шаблонные значения текущего раздела.\n' +
        'Папки, акты, выпущенные комплекты и файлы не изменятся.\n' +
        'Префикс текущего раздела сохранится.\n' +
        'Продолжить?',
    );
    expect(heatingCompliance.value).toBe(originalHeatingComplianceText);

    confirmSpy.mockReturnValue(true);
    await user.click(within(heatingDialog).getByRole('button', { name: 'Вставить' }));
    expect(heatingDialog.textContent).toContain(
      'Шаблонные значения вставлены. Префикс текущего раздела сохранён.',
    );
    expect(within(heatingDialog).getByLabelText<HTMLInputElement>('Префикс номера').value).toBe(
      'ОТ-',
    );
    expect(
      within(heatingDialog).getByLabelText<HTMLTextAreaElement>(
        'Текст соответствия работ требованиям',
      ).value,
    ).toBe(copiedComplianceText);
  });

  it('keeps copied section template values available after switching to another object', async () => {
    const user = userEvent.setup();
    const copiedProjectDocumentation = 'Проектная документация из буфера другого объекта.';

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openObjectSettingsFromWorkspace(user);

    const sourceDialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    const sourceProjectDocumentation = within(sourceDialog).getByLabelText<HTMLTextAreaElement>(
      'Проектная документация шаблона',
    );
    await user.clear(sourceProjectDocumentation);
    await user.type(sourceProjectDocumentation, copiedProjectDocumentation);
    await user.click(within(sourceDialog).getByRole('button', { name: 'Скопировать' }));
    expect(sourceDialog.textContent).toContain('Шаблонные значения скопированы.');
    await user.clear(sourceProjectDocumentation);
    await user.type(sourceProjectDocumentation, 'Изменено уже после копирования.');

    await user.click(within(sourceDialog).getByRole('button', { name: 'Вернуться к разделу' }));
    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));

    await user.click(
      within(getObjectCardByTitle('Жилой комплекс "Северный"')).getByRole('button', {
        name: 'Открыть объект',
      }),
    );
    await openObjectSettingsFromWorkspace(user);

    const targetDialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    expect(targetDialog.textContent).toContain(
      'В буфере: «Вентиляция» · объект «Реконструкция поликлиники, демонстрационный проект»',
    );
    const pasteButton = within(targetDialog).getByRole('button', { name: 'Вставить' });
    expect((pasteButton as HTMLButtonElement).disabled).toBe(false);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(pasteButton);

    expect(targetDialog.textContent).toContain(
      'Шаблонные значения вставлены. Префикс текущего раздела сохранён.',
    );
    expect(
      within(targetDialog).getByLabelText<HTMLTextAreaElement>('Проектная документация шаблона')
        .value,
    ).toBe(copiedProjectDocumentation);
    expect(within(targetDialog).getByLabelText<HTMLInputElement>('Префикс номера').value).toBe(
      'ОВ-',
    );
  });

  it('uses the section template numbering rule for new acts', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    await openObjectSettingsFromWorkspace(user);

    const dialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    const automaticMode = within(dialog).getByLabelText<HTMLInputElement>(/Автоматическая/u);
    const manualMode = within(dialog).getByLabelText<HTMLInputElement>(/Ручная/u);
    const globalScope = within(dialog).getByLabelText<HTMLInputElement>(/Сквозная по разделу/u);
    const folderScope = within(dialog).getByLabelText<HTMLInputElement>(/Отдельно в каждой папке/u);
    const prefix = within(dialog).getByLabelText<HTMLInputElement>('Префикс номера');
    const firstNumber = within(dialog).getByLabelText<HTMLInputElement>(/Первый номер/u);
    const suffix = within(dialog).getByLabelText<HTMLInputElement>('Суффикс номера');

    expect(automaticMode.checked).toBe(true);
    expect(manualMode.checked).toBe(false);
    expect(globalScope.checked).toBe(true);
    expect(folderScope.checked).toBe(false);
    await user.click(folderScope);
    await user.clear(prefix);
    await user.type(prefix, 'АОСР/');
    await user.clear(firstNumber);
    await user.type(firstNumber, '100');
    await user.type(suffix, '/2026');

    expect(dialog.textContent).toContain('Пример первого номера: АОСР/100/2026');
    await user.click(within(dialog).getByRole('button', { name: 'Вернуться к разделу' }));

    await openFolderByName(user, 'Октябрь 2026');
    await user.click(screen.getByRole('button', { name: 'Создать акт' }));

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(selector.textContent).not.toContain('АОСР/2/2026');
    expect(within(selector).queryByLabelText('Номер документа')).toBeNull();
    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));
    expect(screen.getByRole('button', { name: /АОСР\/100\/2026/u })).toBeTruthy();
  });

  it('creates new acts without a number when section numbering is manual', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openObjectSettingsFromWorkspace(user);

    const dialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    await user.click(within(dialog).getByLabelText<HTMLInputElement>(/Ручная/u));
    expect(dialog.textContent).toContain(
      'Новые акты будут создаваться без номера. Номер можно ввести в редакторе акта.',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Вернуться к разделу' }));

    await openFolderByName(user, 'Сентябрь 2026');
    await user.click(getFirstCreateDocumentButton());

    const selector = screen.getByRole('dialog', { name: 'Создание акта' });
    expect(within(selector).queryByLabelText('Номер документа')).toBeNull();
    await user.click(within(selector).getByRole('button', { name: 'Создать акт' }));

    expect(screen.getByLabelText('Текущий акт: Без номера')).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Номер акта').value).toBe('');
    expect(
      screen.getByText(
        'Используются общие данные раздела: объект, участники, проектная документация',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Редактировать только для этого акта' }),
    ).toBeTruthy();
  });

  it('renumbers all section acts with the automatic section numbering rule', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openObjectSettingsFromWorkspace(user);

    const dialog = screen.getByRole('region', { name: /Шаблонные значения раздела/u });
    await user.clear(within(dialog).getByLabelText<HTMLInputElement>('Префикс номера'));
    await user.type(within(dialog).getByLabelText<HTMLInputElement>('Префикс номера'), 'AUTO-');
    await user.clear(within(dialog).getByLabelText<HTMLInputElement>(/Первый номер/u));
    await user.type(within(dialog).getByLabelText<HTMLInputElement>(/Первый номер/u), '100');

    const renumberButton = within(dialog).getByRole('button', {
      name: 'Пронумеровать все акты раздела',
    });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(renumberButton);
    expect(confirmSpy).toHaveBeenCalledWith(
      'Задать автоматическую нумерацию для всех актов раздела?\n' +
        'Будут изменены номера актов выбранного раздела: 2 акта.\n' +
        'Шаблонные значения акта и ручной/связанный режим шаблона не изменятся.\n' +
        'Продолжить?',
    );
    expect(
      screen.queryByText('Автоматическая нумерация применена ко всем актам раздела.'),
    ).toBeNull();

    confirmSpy.mockReturnValue(true);
    await user.click(renumberButton);
    expect(
      screen.getByText('Автоматическая нумерация применена ко всем актам раздела.'),
    ).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Вернуться к разделу' }));

    await openFolderByName(user, 'Сентябрь 2026');
    expect(screen.getByRole('button', { name: /AUTO-100/u })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /AUTO-100/u }));
    expect(
      screen.getByText(
        'Используются общие данные раздела: объект, участники, проектная документация',
      ),
    ).toBeTruthy();

    await openFolderByName(user, 'Октябрь 2026');
    expect(screen.getByRole('button', { name: /AUTO-101/u })).toBeTruthy();
  });

  it('does not show forbidden status or object-template wording in the object workflow', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    expectNoForbiddenObjectWorkspaceText();

    await openObjectSettingsFromWorkspace(user);
    expect(screen.getByRole('region', { name: /Шаблонные значения раздела/u })).toBeTruthy();
    expectNoForbiddenObjectWorkspaceText();

    await openSeptemberAosrDocument(user);
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();
    expectNoForbiddenObjectWorkspaceText();

    await openDocumentPreview(user);
    expect(screen.getByRole('region', { name: 'Предпросмотр акта' })).toBeTruthy();
    expectNoForbiddenObjectWorkspaceText();
  });

  it('opens the certificate library page from quick access with onboarding visible', async () => {
    const user = userEvent.setup();

    render(<App />);

    const quickAccess = screen.getByRole('region', { name: 'Быстрый доступ' });

    await user.click(within(quickAccess).getByRole('button', { name: /Библиотека сертификатов/u }));

    expect(screen.getByRole('heading', { name: 'Библиотека сертификатов' })).toBeTruthy();
    expect(
      screen.getByText(
        'Сначала сохраните сертификаты и материалы. Потом добавляйте их в акты через поиск материалов.',
      ),
    ).toBeTruthy();

    const workflow = screen.getByRole('list', { name: 'Порядок работы с сертификатами' });
    expect(within(workflow).getByText('Добавьте сертификат')).toBeTruthy();
    expect(within(workflow).getByText('Откройте акт')).toBeTruthy();
    expect(within(workflow).getByText('Найдите материал')).toBeTruthy();
    expect(within(workflow).getByText('Сертификат появится в приложениях')).toBeTruthy();
    expect(screen.queryByText('Раздел будет оформлен отдельным шагом.')).toBeNull();
  });

  it('renders the certificate list and future workflow guidance', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    const certificateList = screen.getByRole('list', { name: 'Список сертификатов' });
    expect(within(certificateList).getByText('Воздуховоды оцинкованные 0,7 мм')).toBeTruthy();
    expect(within(certificateList).getByText(/СТ-ОВ-2026-017/u)).toBeTruthy();
    expect(within(certificateList).getByText('ООО "ВентПрофиль"')).toBeTruthy();
    expect(within(certificateList).getByText('Противопожарный состав для проходок')).toBeTruthy();

    expect(screen.getByRole('region', { name: 'Как это будет работать' })).toBeTruthy();
    expect(screen.getByText('Сертификаты хранятся в глобальной библиотеке.')).toBeTruthy();
    expect(screen.getByText('Объект не хранит отдельную библиотеку сертификатов.')).toBeTruthy();
    expect(screen.getByText('Акт выбирает материалы и сертификаты через поиск.')).toBeTruthy();
    expect(screen.getByText('Инженер включает приложения чекбоксами.')).toBeTruthy();
    expect(
      screen.getByText(
        /Библиотека сертификатов и поиск материалов в АОСР используют один frontend mock-store/u,
      ),
    ).toBeTruthy();
  });

  it('searches certificates by material, number, type, manufacturer and issuer', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    const certificateList = screen.getByRole('list', { name: 'Список сертификатов' });

    await user.type(screen.getByLabelText('Поиск по библиотеке сертификатов'), 'тепломат');
    expect(within(certificateList).getByText('Теплоизоляционные маты ИЗ-50')).toBeTruthy();
    expect(within(certificateList).queryByText('Воздуховоды оцинкованные 0,7 мм')).toBeNull();

    await user.clear(screen.getByLabelText('Поиск по библиотеке сертификатов'));
    await user.type(screen.getByLabelText('Поиск по библиотеке сертификатов'), 'ПП-ОГН');
    expect(within(certificateList).getByText('Противопожарный состав для проходок')).toBeTruthy();

    await user.clear(screen.getByLabelText('Поиск по библиотеке сертификатов'));
    await user.type(screen.getByLabelText('Поиск по библиотеке сертификатов'), 'паспорт качества');
    expect(within(certificateList).getByText('Крепежные элементы КМ-12')).toBeTruthy();

    await user.clear(screen.getByLabelText('Поиск по библиотеке сертификатов'));
    await user.type(screen.getByLabelText('Поиск по библиотеке сертификатов'), 'эксперт');
    expect(within(certificateList).getByText('Воздуховоды оцинкованные 0,7 мм')).toBeTruthy();
  });

  it('filters certificates by status', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    const certificateList = screen.getByRole('list', { name: 'Список сертификатов' });

    await user.selectOptions(screen.getByLabelText('Фильтр по статусу сертификата'), 'Истекает');

    expect(within(certificateList).getByText('Противопожарный состав для проходок')).toBeTruthy();
    expect(within(certificateList).getByText('Истекает')).toBeTruthy();
    expect(within(certificateList).queryByText('Воздуховоды оцинкованные 0,7 мм')).toBeNull();
  });

  it('adds a mock certificate in memory on the certificate library page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить сертификат' }));
    await user.type(screen.getByLabelText('Материал'), 'Насос циркуляционный N-25');
    await user.type(screen.getByLabelText('Тип документа'), 'Паспорт изделия');
    await user.type(screen.getByLabelText('Номер'), 'ПИ-Н25-2026');
    await user.type(screen.getByLabelText('Дата выдачи'), '03.06.2026');
    await user.type(screen.getByLabelText('Действует до'), '03.06.2029');
    await user.type(screen.getByLabelText('Производитель'), 'ООО "НасосТех"');
    await user.type(screen.getByLabelText('Орган сертификации'), 'Отдел качества производителя');
    await user.selectOptions(
      screen.getByLabelText('Статус нового сертификата'),
      'Требует проверки',
    );

    expect(screen.getByText('Загрузка PDF и сканов будет реализована позже.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Сохранить сертификат' }));

    const certificateList = screen.getByRole('list', { name: 'Список сертификатов' });
    expect(within(certificateList).getByText('Насос циркуляционный N-25')).toBeTruthy();
    expect(within(certificateList).getByText('Паспорт изделия / ПИ-Н25-2026')).toBeTruthy();
    expect(within(certificateList).getByText('ООО "НасосТех"')).toBeTruthy();
  });

  it('shows a newly added certificate in the AOSR material search without reload', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить сертификат' }));
    await user.type(screen.getByLabelText('Материал'), 'Насос циркуляционный N-25');
    await user.type(screen.getByLabelText('Тип документа'), 'Паспорт изделия');
    await user.type(screen.getByLabelText('Номер'), 'ПИ-Н25-2026');
    await user.type(screen.getByLabelText('Дата выдачи'), '03.06.2026');
    await user.type(screen.getByLabelText('Действует до'), '03.06.2029');
    await user.type(screen.getByLabelText('Производитель'), 'ООО "НасосТех"');
    await user.type(screen.getByLabelText('Орган сертификации'), 'Отдел качества производителя');
    await user.click(screen.getByRole('button', { name: 'Сохранить сертификат' }));

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));
    await user.click(getFirstOpenObjectButton());
    await openSeptemberAosrDocument(user);
    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));
    await user.type(screen.getByLabelText('Найти материал в библиотеке сертификатов'), 'насос');

    const certificateLibrary = screen.getByRole('list', { name: 'Библиотека сертификатов' });
    const pumpRow = within(certificateLibrary)
      .getByText('Насос циркуляционный N-25')
      .closest('.library-row');

    if (pumpRow === null) {
      throw new Error('В тесте ожидается строка нового сертификата.');
    }

    await user.click(
      within(pumpRow as HTMLElement).getByRole('button', { name: 'Добавить материал' }),
    );

    await user.click(screen.getByRole('button', { name: 'Закрыть библиотеку' }));
    await openDocumentPreview(user);

    const previewText = getDocumentPreview().textContent;
    expect(previewText).toContain('Насос циркуляционный N-25');
    expect(previewText).toContain('ПИ-Н25-2026');
    expect(previewText).toContain('Паспорт изделия № ПИ-Н25-2026 от 03.06.2026');
  });

  it('returns from the certificate library page to objects', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));

    expect(
      screen.getByRole('heading', {
        name: 'ИДея — рабочее место ПТО для исполнительной документации',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('opens the real representatives and organizations mock management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    expect(screen.getByRole('heading', { name: 'Представители и организации' })).toBeTruthy();
    expect(
      screen.getByText(
        'Глобальные библиотеки организаций и представителей. Из поиска создавайте или выбирайте карточку, затем назначайте ее объекту и акту.',
      ),
    ).toBeTruthy();
    const workflow = screen.getByRole('list', { name: 'Порядок работы с подписантами' });
    expect(within(workflow).getByText('Добавьте организацию')).toBeTruthy();
    expect(within(workflow).getByText('Добавьте представителя')).toBeTruthy();
    expect(within(workflow).getByText('Назначьте на объект')).toBeTruthy();
    expect(within(workflow).getByText('Выберите в акт')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Организации' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Представители' })).toBeTruthy();
    expect(screen.getByText('Организации в объекте')).toBeTruthy();
    expect(screen.getByText('Представители в объекте')).toBeTruthy();
    expect(screen.queryByText('Раздел будет оформлен отдельным шагом.')).toBeNull();
  });

  it('filters organizations in the management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    const organizationLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека организаций',
    });

    expect(within(organizationLibrary).getByText('ГАУЗ СО "Демо-заказчик"')).toBeTruthy();

    await user.type(screen.getByLabelText('Фильтр организаций'), 'генподряд');

    expect(within(organizationLibrary).getByText('ООО "Демо-генподряд"')).toBeTruthy();
    expect(within(organizationLibrary).queryByText('ГАУЗ СО "Демо-заказчик"')).toBeNull();
  });

  it('filters representatives in the management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    const representativeLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });

    expect(within(representativeLibrary).getByText('Иванов И.И.')).toBeTruthy();

    await user.type(screen.getByLabelText('Фильтр представителей'), 'лаборатория');

    expect(within(representativeLibrary).getByText('Лебедев Л.Л.')).toBeTruthy();
    expect(within(representativeLibrary).queryByText('Иванов И.И.')).toBeNull();
  });

  it('adds a mock organization in memory on the management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить организацию' }));
    await user.type(screen.getByLabelText('Название организации'), 'ООО "Новый участник"');
    await user.type(
      screen.getByLabelText('ИНН / ОГРН / реквизиты'),
      'ИНН 6611000000; ОГРН 1266600000001.',
    );
    await user.type(
      screen.getByLabelText('Где используется'),
      'Будет выбран как участник объекта для демонстрационного акта.',
    );
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию' }));

    const organizationLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека организаций',
    });
    expect(within(organizationLibrary).getByText('ООО "Новый участник"')).toBeTruthy();
    expect(
      within(organizationLibrary).getByText('ИНН 6611000000; ОГРН 1266600000001.'),
    ).toBeTruthy();
  });

  it('allows saving an empty global organization mock card', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить организацию' }));
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию' }));

    expect(screen.queryByLabelText('Название организации')).toBeNull();
  });

  it('shows a newly added organization in the object organization picker', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить организацию' }));
    await user.type(screen.getByLabelText('Название организации'), 'ООО "Авторский контроль"');
    await user.type(
      screen.getByLabelText('ИНН / ОГРН / реквизиты'),
      'ИНН 6600000002; ОГРН 1266600000002.',
    );
    await user.type(
      screen.getByLabelText('Где используется'),
      'Будет выбран как объектовая организация в демо.',
    );
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию' }));

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));
    await user.click(getFirstOpenObjectButton());
    await openObjectSettingsFromWorkspace(user);
    await user.click(screen.getByRole('button', { name: /Организации/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить блок шапки' }));
    await user.type(
      screen.getByLabelText('Найти организацию в глобальной библиотеке'),
      'авторский контроль',
    );

    const organizationPicker = screen.getByRole('list', {
      name: 'Глобальная библиотека организаций',
    });
    const organizationRow = within(organizationPicker)
      .getByText('ООО "Авторский контроль"')
      .closest('.library-row');

    if (organizationRow === null) {
      throw new Error('В тесте ожидается строка новой организации.');
    }

    await user.click(
      within(organizationRow as HTMLElement).getByRole('button', { name: 'Выбрать' }),
    );
    await user.type(screen.getByLabelText('Название блока'), 'Авторский контроль');
    await user.click(screen.getByRole('button', { name: 'Добавить организацию в шаблон' }));

    await user.click(screen.getByRole('button', { name: 'Вернуться к разделу' }));
    await openSeptemberAosrDocument(user);
    await openDocumentPreview(user);

    const previewText = getDocumentPreview().textContent;
    expect(previewText).toContain('Авторский контроль:');
    expect(previewText).toContain('ООО "Авторский контроль"');
    expect(previewText).toContain('ИНН 6600000002; ОГРН 1266600000002.');
  });

  it('adds a mock representative in memory on the management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(screen.getByLabelText('ФИО представителя'), 'Орлова О.О.');
    await user.type(
      screen.getByLabelText('Базовая роль / подпись'),
      'Представитель монтажного участка',
    );
    await user.type(screen.getByLabelText('Базовая должность'), 'Инженер ПТО');
    await user.type(screen.getByLabelText('Базовая организация'), 'ООО "Новый участник"');
    await user.type(screen.getByLabelText('Основание полномочий'), 'Приказ N О-7 от 03.06.2026');
    await user.type(screen.getByLabelText('НРС / детали'), 'НРС С-66-000111');
    await user.click(screen.getByRole('button', { name: 'Сохранить представителя' }));

    const representativeLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });
    expect(within(representativeLibrary).getByText('Орлова О.О.')).toBeTruthy();
    expect(
      within(representativeLibrary).getByText('Представитель монтажного участка / Инженер ПТО'),
    ).toBeTruthy();
    expect(within(representativeLibrary).getByText('НРС С-66-000111')).toBeTruthy();
  });

  it('allows saving an empty global representative mock card', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.click(screen.getByRole('button', { name: 'Сохранить представителя' }));

    expect(screen.queryByLabelText('ФИО представителя')).toBeNull();
  });

  it('shows a newly added representative in the act signatory search', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(screen.getByLabelText('ФИО представителя'), 'Яковлев Я.Я.');
    await user.type(
      screen.getByLabelText('Базовая роль / подпись'),
      'Представитель службы качества',
    );
    await user.type(screen.getByLabelText('Базовая должность'), 'Инженер службы качества');
    await user.type(screen.getByLabelText('Базовая организация'), 'ООО "Авторский контроль"');
    await user.type(screen.getByLabelText('Основание полномочий'), 'Приказ N Я-1 от 03.06.2026');
    await user.click(screen.getByRole('button', { name: 'Сохранить представителя' }));

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));
    await user.click(getFirstOpenObjectButton());
    await openSeptemberAosrDocument(user);
    await openObjectSettingsFromWorkspace(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(
      screen.getByLabelText('Найти представителя в глобальной библиотеке'),
      'яковлев',
    );

    const signatoryPicker = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });
    const representativeRow = within(signatoryPicker)
      .getByText('Яковлев Я.Я.')
      .closest('.library-row');

    if (representativeRow === null) {
      throw new Error('В тесте ожидается строка нового представителя.');
    }

    await user.click(
      within(representativeRow as HTMLElement).getByRole('button', {
        name: 'Выбрать',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Добавить представителя в шаблон' }));
    await user.click(screen.getByRole('button', { name: 'Вернуться к разделу' }));

    await openSeptemberAosrDocument(user);
    await openDocumentPreview(user);

    const previewText = getDocumentPreview().textContent;
    expect(previewText).toContain('Яковлев Я.Я.');
    expect(previewText).toContain('Представитель службы качества:');
  });

  it('returns from the representatives management page to objects', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));

    expect(
      screen.getByRole('heading', {
        name: 'ИДея — рабочее место ПТО для исполнительной документации',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('keeps AOSR key flows available after opening an object from the shell', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());
    await openSeptemberAosrDocument(user);

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
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить материал' }),
    );
    await user.click(screen.getByRole('button', { name: 'Закрыть библиотеку' }));

    await openObjectSettingsFromWorkspace(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(
      screen.getByLabelText('Найти представителя в глобальной библиотеке'),
      'заказчика',
    );

    const objectPicker = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка представителя объекта.');
    }

    await user.click(within(customerRow as HTMLElement).getByRole('button', { name: 'Выбрать' }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя в шаблон' }));
    await user.click(screen.getByRole('button', { name: 'Вернуться к разделу' }));

    await openSeptemberAosrDocument(user);
    await openDocumentPreview(user);

    const preview = getDocumentPreview();
    const previewText = preview.textContent;

    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Декларация о соответствии № ДС-ИЗ-2026-04 от 20.05.2026');
    expect(preview.querySelector('.act-page__sheet')).toBeTruthy();
    expect(preview.querySelector('.act-page__number-date-row')).toBeTruthy();

    const applications = preview.querySelector('.act-page__applications');
    const signatures = preview.querySelector('.act-page__signature-section');

    if (applications === null || signatures === null) {
      throw new Error('В preview ожидаются приложения и блок подписей.');
    }

    expect(
      Boolean(applications.compareDocumentPosition(signatures) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Редактирование' }));
    expect(
      screen.getByRole('checkbox', {
        name: /Декларация о соответствии № ДС-ИЗ-2026-04 от 20.05.2026/u,
      }),
    ).toBeTruthy();
  });
});

function getFirstOpenObjectButton(): HTMLElement {
  const [openButton] = screen.getAllByRole('button', { name: 'Открыть объект' });

  if (openButton === undefined) {
    throw new Error('На dashboard должна быть кнопка открытия объекта.');
  }

  return openButton;
}

function getObjectCardByTitle(title: string): HTMLElement {
  const objectCard = screen.getByRole('heading', { name: title }).closest('article');

  if (objectCard === null) {
    throw new Error(`Карточка объекта "${title}" не найдена.`);
  }

  return objectCard;
}

function getFirstCreateDocumentButton(): HTMLElement {
  const [createButton] = screen.getAllByRole('button', { name: 'Создать акт' });

  if (createButton === undefined) {
    throw new Error('В папке должна быть кнопка создания акта.');
  }

  return createButton;
}

async function openFolderByName(
  user: ReturnType<typeof userEvent.setup>,
  folderName: string,
): Promise<void> {
  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', { name: `Открыть папку ${folderName}` }),
  );
  await screen.findByRole('heading', { name: folderName });
}

function getSectionByHeading(name: string): HTMLElement {
  const section = screen.getByRole('heading', { name }).closest('section');

  if (section === null) {
    throw new Error(`Для заголовка "${name}" должна существовать секция.`);
  }

  return section;
}

function getTextAreaValue(element: HTMLElement): string {
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('В тесте ожидалось текстовое поле.');
  }

  return element.value;
}

function createDragDataTransfer(): DataTransfer {
  const data = new Map<string, string>();

  return {
    dropEffect: 'move',
    effectAllowed: 'move',
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
    clearData: vi.fn(),
    getData: vi.fn((format: string) => data.get(format) ?? ''),
    setData: vi.fn((format: string, value: string) => {
      data.set(format, value);
    }),
    setDragImage: vi.fn(),
  };
}

function getRequiredListItem(items: readonly HTMLElement[], index: number): HTMLElement {
  const item = items[index];

  if (item === undefined) {
    throw new Error(`В списке актов ожидалась строка с индексом ${String(index)}.`);
  }

  return item;
}

function expectNoForbiddenObjectWorkspaceText(): void {
  const pageText = document.body.textContent;
  const forbiddenTexts = [
    'Активен',
    'Черновик',
    'Готовность',
    'Поля заполнены',
    'Настройки объекта',
    'Шаблон объекта',
  ];

  for (const forbiddenText of forbiddenTexts) {
    expect(pageText).not.toContain(forbiddenText);
  }
}

async function openRepresentativesManagementPage(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  const navigation = screen.getByRole('navigation', { name: 'Основная навигация' });

  await user.click(
    within(navigation).getByRole('button', { name: /Представители и организации/u }),
  );
}

async function openCertificateLibraryPage(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const navigation = screen.getByRole('navigation', { name: 'Основная навигация' });

  await user.click(within(navigation).getByRole('button', { name: /Библиотека сертификатов/u }));
}

async function openObjectDocumentsPage(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(getFirstOpenObjectButton());

  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
  );
}

async function openSeptemberAosrDocument(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await openFolderByName(user, 'Сентябрь 2026');
  await user.click(screen.getByRole('button', { name: /ОВ-1/u }));
}

async function openObjectSettingsFromWorkspace(
  user: ReturnType<typeof userEvent.setup>,
  sectionName = 'Вентиляция',
): Promise<void> {
  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', {
      name: `Шаблонные значения раздела ${sectionName}`,
    }),
  );
}

async function openObjectFinalPackagePage(
  user: ReturnType<typeof userEvent.setup>,
  sectionName = 'Вентиляция',
): Promise<void> {
  await user.click(getFirstOpenObjectButton());

  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', {
      name: `Итоговая ИД по разделу ${sectionName}`,
    }),
  );
}

async function openDocumentPreview(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Предпросмотр' }));
}

function getDocumentPreview(): HTMLElement {
  return screen.getByLabelText('Демо-предпросмотр печатной формы АОСР');
}
