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

    expect(screen.getByRole('navigation', { name: 'Разделы объекта' })).toBeTruthy();
    expect(screen.getByText(/Акты \/ АОСР/u)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Назад к объектам' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();

    await openDocumentPreview(user);
    expect(getDocumentPreview()).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('renders object workspace navigation with object status and quick metrics', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    expect(within(objectNavigation).getByRole('button', { name: 'Акты' })).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'АОСР' })).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть сертификаты объекта' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
    ).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Представители' })).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть реестр ИД' }),
    ).toBeTruthy();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть настройки объекта' }),
    ).toBeTruthy();

    expect(
      screen.getByRole('heading', {
        name: 'Реконструкция поликлиники, демонстрационный проект',
      }),
    ).toBeTruthy();
    expect(screen.getAllByText('В работе').length).toBeGreaterThan(0);

    const metrics = screen.getByLabelText('Показатели открытого объекта');
    expect(within(metrics).getByLabelText('АОСР: 2')).toBeTruthy();
    expect(within(metrics).getByLabelText('Сертификаты: 4')).toBeTruthy();
    expect(within(metrics).getByLabelText('Документы: 8')).toBeTruthy();
    expect(within(metrics).getByLabelText('Представители: 6')).toBeTruthy();
  });

  it('switches object workspace sections and renders the object documents page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть сертификаты объекта' }),
    );
    expect(screen.getByRole('heading', { name: 'Сертификаты объекта' })).toBeTruthy();
    expect(
      screen.getByText(
        'Сертификаты, паспорта качества, декларации и другие документы на материалы и оборудование объекта.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Материал / оборудование' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Документ' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Номер' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Кем выдан' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Используется в актах' })).toBeTruthy();
    expect(
      within(screen.getByRole('table')).getByText('Воздуховоды оцинкованные 0,7 мм'),
    ).toBeTruthy();
    expect(within(screen.getByRole('table')).getByText('Используется в 0 актах')).toBeTruthy();

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

    await user.click(within(objectNavigation).getByRole('button', { name: 'Открыть реестр ИД' }));
    expect(screen.getByRole('heading', { name: 'Реестр ИД' })).toBeTruthy();
    expect(screen.getByText('Автоматическая сборка строк из данных объекта')).toBeTruthy();
  });

  it('renders object certificate counts from the shared frontend mock data', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectCertificatesPage(user);

    const summary = screen.getByLabelText('Сводка сертификатов объекта');
    expect(within(summary).getByLabelText('Всего документов качества: 4')).toBeTruthy();
    expect(within(summary).getByLabelText('Сертификаты: 1')).toBeTruthy();
    expect(within(summary).getByLabelText('Паспорта: 2')).toBeTruthy();
    expect(within(summary).getByLabelText('Декларации: 1')).toBeTruthy();
  });

  it('filters object certificates by document category', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectCertificatesPage(user);

    const table = screen.getByRole('table');

    await user.click(screen.getByRole('button', { name: 'Декларации' }));
    expect(within(table).getByText('Теплоизоляционные маты ИЗ-50')).toBeTruthy();
    expect(within(table).queryByText('Воздуховоды оцинкованные 0,7 мм')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Паспорта' }));
    expect(within(table).getByText('Противопожарный состав для проходок')).toBeTruthy();
    expect(within(table).getByText('Крепежные элементы КМ-12')).toBeTruthy();
    expect(within(table).queryByText('Теплоизоляционные маты ИЗ-50')).toBeNull();
  });

  it('adds a mock object certificate and exposes it to AOSR material search', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectCertificatesPage(user);

    await user.type(
      screen.getByLabelText('Материал / оборудование'),
      'Клапан противопожарный КП-1',
    );
    await user.selectOptions(screen.getByLabelText('Тип документа'), 'Паспорт качества');
    await user.type(screen.getByLabelText('Номер документа'), 'ПК-КП-2026-01');
    await user.type(screen.getByLabelText('Кем выдан'), 'Заводская лаборатория контроля');
    await user.type(screen.getByLabelText('Дата'), '2026-06-07');
    await user.click(screen.getByRole('button', { name: 'Добавить сертификат / паспорт' }));

    const table = screen.getByRole('table');
    const certificateRow = within(table).getByText('Клапан противопожарный КП-1').closest('tr');

    if (certificateRow === null) {
      throw new Error('В тесте ожидается строка нового сертификата объекта.');
    }

    expect(within(certificateRow as HTMLElement).getByText('ПК-КП-2026-01')).toBeTruthy();
    expect(within(certificateRow as HTMLElement).getByText('Используется в 0 актах')).toBeTruthy();

    const summary = screen.getByLabelText('Сводка сертификатов объекта');
    expect(within(summary).getByLabelText('Всего документов качества: 5')).toBeTruthy();
    expect(within(summary).getByLabelText('Паспорта: 3')).toBeTruthy();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'АОСР' }));
    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));
    await user.type(screen.getByLabelText('Найти материал в библиотеке сертификатов'), 'клапан');

    const certificateLibrary = screen.getByRole('list', { name: 'Библиотека сертификатов' });
    expect(within(certificateLibrary).getByText('Клапан противопожарный КП-1')).toBeTruthy();
    expect(
      within(certificateLibrary).getByText('Паспорт качества N ПК-КП-2026-01 от 2026-06-07'),
    ).toBeTruthy();
  });

  it('keeps the dashboard to object certificates to AOSR flow working', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectCertificatesPage(user);

    expect(screen.getByRole('heading', { name: 'Сертификаты объекта' })).toBeTruthy();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'АОСР' }));
    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));
    await user.type(screen.getByLabelText('Найти материал в библиотеке сертификатов'), 'изоляц');

    const certificateLibrary = screen.getByRole('list', { name: 'Библиотека сертификатов' });
    const insulationRow = within(certificateLibrary)
      .getByText('Теплоизоляционные маты ИЗ-50')
      .closest('.library-row');

    if (insulationRow === null) {
      throw new Error('В тесте ожидается строка материала после перехода из сертификатов.');
    }

    await user.click(
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить материал' }),
    );
    await user.click(screen.getByRole('button', { name: 'Закрыть библиотеку' }));
    await openDocumentPreview(user);

    const previewText = getDocumentPreview().textContent;
    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
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

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'АОСР' }));
    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));
    await user.type(screen.getByLabelText('Найти документ объекта'), 'ВК-12');

    const documentLibrary = screen.getByRole('list', { name: 'Библиотека документов объекта' });
    expect(within(documentLibrary).getByText('Исполнительная схема ВК-12')).toBeTruthy();
    expect(within(documentLibrary).getByText('Исполнительная схема / ИС-ВК-12')).toBeTruthy();
  });

  it('returns from placeholder sections to AOSR inside acts', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

    await user.click(within(objectNavigation).getByRole('button', { name: 'Открыть реестр ИД' }));
    expect(screen.getByRole('heading', { name: 'Реестр ИД' })).toBeTruthy();

    await user.click(within(objectNavigation).getByRole('button', { name: 'АОСР' }));

    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
  });

  it('opens representatives from object workspace navigation using the existing page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'Представители' }));

    expect(screen.getByRole('heading', { name: 'Представители и организации' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Организации' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Представители' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Вернуться к АОСР' }));

    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
  });

  it('opens current object settings from object workspace navigation', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть настройки объекта' }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Настройки объекта' });
    expect(within(dialog).getByLabelText('Объект капитального строительства')).toBeTruthy();
    expect(
      within(dialog).getByRole('heading', { name: 'Нормативная и проектная база объекта' }),
    ).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть настройки' }));

    expect(screen.queryByRole('dialog', { name: 'Настройки объекта' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
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
    expect(screen.getByText('Сертификаты хранятся в библиотеке.')).toBeTruthy();
    expect(screen.getByText('Объект использует сертификаты из библиотеки.')).toBeTruthy();
    expect(screen.getByText('Акт выбирает материалы через поиск.')).toBeTruthy();
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
    expect(previewText).toContain('Паспорт изделия N ПИ-Н25-2026 от 03.06.2026');
  });

  it('returns from the certificate library page to objects', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openCertificateLibraryPage(user);

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('opens the real representatives and organizations mock management page', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    expect(screen.getByRole('heading', { name: 'Представители и организации' })).toBeTruthy();
    expect(
      screen.getByText(
        'Сначала сохраните организации и представителей, потом добавляйте их в объект и акты через поиск.',
      ),
    ).toBeTruthy();
    const workflow = screen.getByRole('list', { name: 'Порядок работы с подписантами' });
    expect(within(workflow).getByText('Добавьте организацию')).toBeTruthy();
    expect(within(workflow).getByText('Добавьте представителя')).toBeTruthy();
    expect(within(workflow).getByText('Откройте объект')).toBeTruthy();
    expect(within(workflow).getByText('Добавьте подписанта в акт')).toBeTruthy();
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
    await user.click(screen.getByRole('button', { name: 'Настройки объекта' }));
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
    await user.click(screen.getByRole('button', { name: 'Сохранить организацию в шапке' }));

    await user.click(screen.getByRole('button', { name: 'Закрыть настройки' }));
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
    await user.type(screen.getByLabelText('Роль / подпись'), 'Представитель монтажного участка');
    await user.type(screen.getByLabelText('Должность'), 'Инженер ПТО');
    await user.type(screen.getByLabelText('Организация представителя'), 'ООО "Новый участник"');
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

  it('shows a newly added representative in the act signatory search', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openRepresentativesManagementPage(user);

    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(screen.getByLabelText('ФИО представителя'), 'Яковлев Я.Я.');
    await user.type(screen.getByLabelText('Роль / подпись'), 'Представитель службы качества');
    await user.type(screen.getByLabelText('Должность'), 'Инженер службы качества');
    await user.type(screen.getByLabelText('Организация представителя'), 'ООО "Авторский контроль"');
    await user.type(screen.getByLabelText('Основание полномочий'), 'Приказ N Я-1 от 03.06.2026');
    await user.click(screen.getByRole('button', { name: 'Сохранить представителя' }));

    await user.click(screen.getByRole('button', { name: 'Вернуться к объектам' }));
    await user.click(getFirstOpenObjectButton());
    await user.type(screen.getByLabelText('Добавить подписанта из базы объекта'), 'яковлев');

    const signatoryPicker = screen.getByRole('list', {
      name: 'Представители объекта для текущего акта',
    });
    const representativeRow = within(signatoryPicker)
      .getByText('Яковлев Я.Я.')
      .closest('.library-row');

    if (representativeRow === null) {
      throw new Error('В тесте ожидается строка нового представителя.');
    }

    await user.click(
      within(representativeRow as HTMLElement).getByRole('button', {
        name: 'Добавить подписанта',
      }),
    );

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

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
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
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить материал' }),
    );
    await user.click(screen.getByRole('button', { name: 'Закрыть библиотеку' }));

    await user.type(screen.getByLabelText('Добавить подписанта из базы объекта'), 'заказчика');

    const objectPicker = screen.getByRole('list', {
      name: 'Представители объекта для текущего акта',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка представителя объекта.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить подписанта' }),
    );

    await openDocumentPreview(user);

    const preview = getDocumentPreview();
    const previewText = preview.textContent;

    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026');
    expect(
      screen.getByRole('checkbox', {
        name: /Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026/u,
      }),
    ).toBeTruthy();
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
  });
});

function getFirstOpenObjectButton(): HTMLElement {
  const [openButton] = screen.getAllByRole('button', { name: 'Открыть объект' });

  if (openButton === undefined) {
    throw new Error('На dashboard должна быть кнопка открытия объекта.');
  }

  return openButton;
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

async function openObjectCertificatesPage(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(getFirstOpenObjectButton());

  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', { name: 'Открыть сертификаты объекта' }),
  );
}

async function openObjectDocumentsPage(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(getFirstOpenObjectButton());

  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
  );
}

async function openDocumentPreview(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));
}

function getDocumentPreview(): HTMLElement {
  const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });

  return within(drawer).getByLabelText('Демо-предпросмотр печатной формы АОСР');
}
