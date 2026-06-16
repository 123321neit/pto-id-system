// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  addObjectDocumentToDraft,
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  getDraftComplianceStatement,
  isDraftComplianceFromObjectDefault,
  isDraftUnderTitleFromObjectDefault,
  moveHeaderOrganizationBlock,
  resetDraftComplianceToObjectDefault,
  resetDraftUnderTitleToObjectDefault,
  updateDemoAosrDraftField,
  updateDraftComplianceStatement,
} from './demo-aosr-workspace.js';
import { DemoStoreProvider } from '../demo-store/DemoStoreProvider.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('shows object-level and act-level areas as separate scopes', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Параметры по умолчанию' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Текущий акт' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Параметры по умолчанию' })).toBeNull();
    expect(screen.queryByLabelText('Название проекта / объекта')).toBeNull();
  });

  it('keeps the act editor focused on document metadata instead of repeated counters', () => {
    renderDemoWorkspace();

    const metadata = screen.getByLabelText('Метаданные текущего акта');

    expect(within(metadata).getByText('Документ')).toBeTruthy();
    expect(within(metadata).getByText('ОВ-1')).toBeTruthy();
    expect(screen.queryByLabelText('Сводка текущего акта')).toBeNull();
    expect(screen.queryByText('Статус')).toBeNull();
    expect(screen.queryByText('Черновик')).toBeNull();
    expect(screen.queryByText('На проверку')).toBeNull();
    expect(screen.queryByText('Готов')).toBeNull();
    expect(screen.queryByText('Выпущен')).toBeNull();
  });

  it('renders a compact readiness panel with a ready act state', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    const readinessPanel = screen.getByRole('region', { name: 'Подсказки по акту' });

    expect((readinessPanel as HTMLDetailsElement).open).toBe(false);
    expect(within(readinessPanel).getByRole('heading', { name: 'Подсказки по акту' })).toBeTruthy();
    expect(within(readinessPanel).getByText('🟢 Поля заполнены')).toBeTruthy();

    await user.click(within(readinessPanel).getByRole('heading', { name: 'Подсказки по акту' }));

    expect((readinessPanel as HTMLDetailsElement).open).toBe(true);
    expect(
      within(readinessPanel).getByText(
        'Это не блокировка: пустые поля останутся строками в печатной форме и их можно будет заполнить от руки.',
      ),
    ).toBeTruthy();
    expect(within(readinessPanel).getByText('Пробелов по демо-проверкам нет.')).toBeTruthy();
    expect(within(readinessPanel).queryByText('Пустые разделы:')).toBeNull();
  });

  it('shows readiness warnings when required demo data is missing', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(
      screen.getByRole('button', {
        name: 'Убрать материал Воздуховоды оцинкованные 0,7 мм',
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Убрать материал Крепежные элементы КМ-12',
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Убрать документ Исполнительная схема скрытых участков вентиляции',
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Убрать документ Запись журнала входного контроля материалов',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Убрать Иванов И.И. из акта' }));
    await user.click(screen.getByRole('button', { name: 'Убрать Петров П.П. из акта' }));
    await user.click(screen.getByRole('button', { name: 'Убрать Смирнова С.С. из акта' }));
    await user.clear(screen.getByLabelText('Текст пункта 6 в документе'));

    const readinessPanel = screen.getByRole('region', { name: 'Подсказки по акту' });

    expect(within(readinessPanel).getByText('🟡 Есть пустые разделы')).toBeTruthy();

    await user.click(within(readinessPanel).getByRole('heading', { name: 'Подсказки по акту' }));

    expect(within(readinessPanel).getByText('Пустые разделы:')).toBeTruthy();
    expect(within(readinessPanel).getByText('Нет подписантов')).toBeTruthy();
    expect(within(readinessPanel).getByText('Не выбраны материалы')).toBeTruthy();
    expect(within(readinessPanel).getByText('Не выбраны документы объекта')).toBeTruthy();
    expect(within(readinessPanel).getByText('Не заполнена нормативная база')).toBeTruthy();
  });

  it('shows document context in the header without object-wide counters', () => {
    renderDemoWorkspace();

    expect(screen.getByLabelText('Текущий документ: ОВ-1')).toBeTruthy();
    expect(screen.queryByLabelText('Сводка рабочей области')).toBeNull();
    expect(screen.queryByLabelText('Акты: 2')).toBeNull();
    expect(screen.queryByLabelText('Организации объекта: 3')).toBeNull();
    expect(screen.queryByLabelText('Подписанты: 3')).toBeNull();
  });

  it('keeps the workspace usable without the document preview drawer open', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
  });

  it('opens and closes the document preview drawer with existing preview content', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));

    const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });
    const preview = within(drawer).getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const drawerContext = within(drawer).getByLabelText('Контекст предпросмотра документа');

    expect(drawerContext.textContent).toContain('Акт ОВ-1');
    expect(drawerContext.textContent).toContain('АОСР 1');
    expect(drawerContext.textContent).toContain('"04" сентября 2026 г.');
    expect(drawerContext.textContent).toContain('4 приложений');
    expect(within(preview).getByText('Страница 1')).toBeTruthy();
    expect(within(preview).getByText('Страница 2')).toBeTruthy();
    expect(preview.textContent).toContain('ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ');
    expect(preview.querySelectorAll('.act-page__page-frame')).toHaveLength(2);
    expect(preview.querySelectorAll('.act-page__sheet')).toHaveLength(2);

    await user.click(
      within(drawer).getByRole('button', { name: 'Закрыть предпросмотр документа' }),
    );

    expect(screen.queryByRole('dialog', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
  });

  it('keeps default parameters and libraries compact until opened', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Параметры по умолчанию' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Параметры по умолчанию' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Представители для актов' })).toBeNull();
    expect(screen.queryByLabelText('Найти организацию в глобальной библиотеке')).toBeNull();
    expect(screen.queryByLabelText('Найти материал в библиотеке сертификатов')).toBeNull();
    expect(
      screen.getByText(
        'Выберите материал из библиотеки, чтобы сертификат попал в акт и приложения.',
      ),
    ).toBeTruthy();
  });

  it('opens default parameters from the button and keeps existing defaults functional', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(screen.queryByLabelText('Объект капитального строительства')).toBeNull();

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Параметры по умолчанию' });
    const objectNameField = within(dialog).getByLabelText('Объект капитального строительства');

    await user.clear(objectNameField);
    await user.type(objectNameField, 'Новый демо-объект АОСР');

    expect(getPreviewText()).toContain('Новый демо-объект АОСР');

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }));

    expect(screen.queryByRole('dialog', { name: 'Параметры по умолчанию' })).toBeNull();
  });

  it('shows object-level compliance defaults in a dedicated section', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Параметры по умолчанию' });

    await user.click(within(dialog).getByRole('button', { name: /Тексты акта/u }));

    expect(
      within(dialog).getByRole('heading', {
        name: 'Пункт 6. Соответствие требованиям',
      }),
    ).toBeTruthy();
    expect(
      getTextAreaValue(
        within(dialog).getByLabelText(
          'Текст для пункта 6. Соответствие работ предъявляемым требованиям',
        ),
      ),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('uses copied compliance text by default in the act and preview', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const complianceSection = getSectionByHeading('6. Соответствие работ');

    expect(within(complianceSection).getByText('По параметрам по умолчанию')).toBeTruthy();
    expect(
      getTextAreaValue(within(complianceSection).getByLabelText('Текст пункта 6 в документе')),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('allows editing document compliance text and uses it in preview', async () => {
    const user = userEvent.setup();
    const documentText = 'В документе: работы выполнены по уточнённому листу РД-ОВ-14 и ТУ-ОВ-5.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const complianceField = screen.getByLabelText('Текст пункта 6 в документе');
    expect(getTextAreaValue(complianceField)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );

    await user.clear(complianceField);
    await user.type(complianceField, documentText);

    expect(screen.getByText('Изменено в документе')).toBeTruthy();
    expect(getPreviewText()).toContain(documentText);
    expect(getPreviewText()).not.toContain(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
  });

  it('reverts document compliance text back to default parameters', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.clear(screen.getByLabelText('Текст пункта 6 в документе'));
    await user.type(
      screen.getByLabelText('Текст пункта 6 в документе'),
      'Индивидуальное исключение для проверки возврата.',
    );

    expect(getPreviewText()).toContain('Индивидуальное исключение для проверки возврата.');

    await user.click(screen.getByRole('button', { name: 'Вернуть из параметров по умолчанию' }));

    expect(screen.getAllByText('По параметрам по умолчанию').length).toBeGreaterThan(1);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(getPreviewText()).not.toContain('Индивидуальное исключение для проверки возврата.');
  });

  it('keeps object compliance defaults unchanged after editing document text', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.clear(screen.getByLabelText('Текст пункта 6 в документе'));
    await user.type(
      screen.getByLabelText('Текст пункта 6 в документе'),
      'Только этот акт использует отдельную нормативную ссылку.',
    );

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Параметры по умолчанию' });
    await user.click(within(dialog).getByRole('button', { name: /Тексты акта/u }));

    expect(
      getTextAreaValue(
        within(dialog).getByLabelText(
          'Текст для пункта 6. Соответствие работ предъявляемым требованиям',
        ),
      ),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('shows a calm explanation for object-level default parameters', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    expect(
      screen.getByText(/Эти значения подставляются в новые документы как предложение/u),
    ).toBeTruthy();
  });

  it('explains the act signatory search source and fallback', () => {
    renderDemoWorkspace();

    expect(screen.getByLabelText('Добавить назначение представителя в акт')).toBeTruthy();
    expect(
      screen.getByText('Акт выбирает назначение объекта и сохраняет печатный снимок подписанта.'),
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

  it('opens the certificate library as a visible drawer instead of an inline list', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    const materialsSection = screen
      .getByRole('heading', { name: '3. Материалы' })
      .closest('.form-section');

    if (materialsSection === null) {
      throw new Error('В тесте ожидается секция материалов.');
    }

    expect(
      screen.queryByRole('dialog', { name: 'Выбор материалов из библиотеки сертификатов' }),
    ).toBeNull();
    expect(materialsSection.querySelector('.library-panel')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));

    const drawer = screen.getByRole('dialog', {
      name: 'Выбор материалов из библиотеки сертификатов',
    });

    expect(drawer).toBeTruthy();
    expect(within(drawer).getByLabelText('Найти материал в библиотеке сертификатов')).toBeTruthy();
    expect(within(drawer).getByRole('list', { name: 'Библиотека сертификатов' })).toBeTruthy();
    expect(materialsSection.querySelector('.library-panel')).toBeNull();
  });

  it('closes the certificate drawer and returns to the act editor', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Библиотека сертификатов' }));
    expect(
      screen.getByRole('dialog', { name: 'Выбор материалов из библиотеки сертификатов' }),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Закрыть библиотеку' }));

    expect(
      screen.queryByRole('dialog', { name: 'Выбор материалов из библиотеки сертификатов' }),
    ).toBeNull();
    expect(screen.getByRole('heading', { name: '3. Материалы' })).toBeTruthy();
  });

  it('renders act editor sections in the intended AOSR order', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Текущий акт' }).textContent;
    const orderedFragments = [
      'Шапка печатного документа',
      'Номер акта',
      'Дата акта',
      'Объект капитального строительства',
      'Форма акта',
      'АОСР 1',
      'Текст под заголовком акта',
      'Организации, участвующие в акте',
      'Подписанты текущего акта',
      '1. Скрытые работы',
      'Описание скрытых работ',
      'Оси',
      'Отметки',
      '2. Проектная документация',
      '3. Материалы',
      '4. Документы объекта',
      '5. Даты выполнения работ',
      '6. Соответствие работ',
      '7. Последующие работы',
      'Дополнительные сведения',
      'Приложения к акту',
    ];

    for (let index = 0; index < orderedFragments.length - 1; index += 1) {
      const currentFragment = getRequiredElement(orderedFragments, index);
      const nextFragment = getRequiredElement(orderedFragments, index + 1);

      expect(editorText.indexOf(currentFragment)).toBeLessThan(editorText.indexOf(nextFragment));
    }
  });

  it('renders organization order before signatories and the numbered act body', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Текущий акт' }).textContent;

    expect(editorText.indexOf('Организации, участвующие в акте')).toBeLessThan(
      editorText.indexOf('Подписанты текущего акта'),
    );
    expect(editorText.indexOf('Подписанты текущего акта')).toBeLessThan(
      editorText.indexOf('1. Скрытые работы'),
    );
    expect(screen.getByRole('list', { name: 'Порядок организаций в акте' })).toBeTruthy();
  });

  it('changes organization display order from the editor and updates preview order', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.click(
      screen.getByRole('button', { name: 'Переместить организацию Подрядчик вверх' }),
    );

    const organizationOrder = screen.getByRole('list', { name: 'Порядок организаций в акте' });
    const organizationOrderText = organizationOrder.textContent;
    const previewText = getPreviewText();

    expect(organizationOrderText.indexOf('Подрядчик')).toBeLessThan(
      organizationOrderText.indexOf('Заказчик'),
    );
    expect(previewText.indexOf('Подрядчик:')).toBeLessThan(previewText.indexOf('Заказчик:'));
  });

  it('keeps under-title text document-owned after changing default parameters', async () => {
    const user = userEvent.setup();
    const updatedDefaultUnderTitleText = 'Новый текст по умолчанию для следующих документов.';
    const documentUnderTitleText = 'Индивидуальный текст под заголовком этого акта.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const underTitleField = screen.getByLabelText('Текст под заголовком акта в документе');
    expect(getTextAreaValue(underTitleField)).toBe(
      demoAosrWorkspace.objectDefaults.defaultUnderTitleText,
    );
    expect(screen.getAllByText('По параметрам по умолчанию').length).toBeGreaterThan(1);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultUnderTitleText);

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Шапка акта/u }));

    const defaultUnderTitleField = screen.getByLabelText('Текст под заголовком акта по умолчанию');
    await user.clear(defaultUnderTitleField);
    await user.type(defaultUnderTitleField, updatedDefaultUnderTitleText);

    expect(getTextAreaValue(screen.getByLabelText('Текст под заголовком акта в документе'))).toBe(
      demoAosrWorkspace.objectDefaults.defaultUnderTitleText,
    );
    expect(screen.getAllByText('Изменено в документе').length).toBeGreaterThan(0);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultUnderTitleText);
    expect(getPreviewText()).not.toContain(updatedDefaultUnderTitleText);

    const documentUnderTitleField = screen.getByLabelText('Текст под заголовком акта в документе');
    await user.clear(documentUnderTitleField);
    await user.type(documentUnderTitleField, documentUnderTitleText);

    expect(getPreviewText()).toContain(documentUnderTitleText);

    await user.click(screen.getByRole('button', { name: 'Вернуть из параметров по умолчанию' }));

    expect(getTextAreaValue(screen.getByLabelText('Текст под заголовком акта в документе'))).toBe(
      updatedDefaultUnderTitleText,
    );
    expect(getPreviewText()).toContain(updatedDefaultUnderTitleText);
  });

  it('does not show a separate AOSR place or location field', () => {
    renderDemoWorkspace();

    expect(screen.queryByLabelText('Место')).toBeNull();
    expect(screen.queryByLabelText('Место выполнения работ')).toBeNull();
    expect(screen.queryByLabelText('Участок / место работ')).toBeNull();
    expect(screen.queryByLabelText('Объект / участок')).toBeNull();
  });

  it('shows selected object documents as a clear point 4 section', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('heading', { name: '4. Документы объекта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Добавить документ' })).toBeTruthy();

    const pointFourList = screen.getByRole('list', {
      name: 'Документы пункта 4 текущего акта',
    });
    expect(
      within(pointFourList).getByText('Исполнительная схема скрытых участков вентиляции'),
    ).toBeTruthy();
  });

  it('keeps applications in a separate section after additional info while signatories stay near top', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Текущий акт' }).textContent;

    expect(editorText.indexOf('Подписанты текущего акта')).toBeLessThan(
      editorText.indexOf('1. Скрытые работы'),
    );
    expect(editorText.indexOf('Дополнительные сведения')).toBeLessThan(
      editorText.indexOf('Приложения к акту'),
    );
    expect(screen.queryByText('Итоговые приложения в акте')).toBeNull();
    expect(screen.queryByRole('list', { name: 'Итоговые приложения текущего акта' })).toBeNull();
  });

  it('opens the object document drawer and searches object documents', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    expect(screen.queryByRole('dialog', { name: 'Документы объекта' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));

    const drawer = screen.getByRole('dialog', { name: 'Документы объекта' });
    expect(within(drawer).getByLabelText('Найти документ объекта')).toBeTruthy();
    expect(within(drawer).getByLabelText('Фильтр по типу документа объекта')).toBeTruthy();

    await user.type(within(drawer).getByLabelText('Найти документ объекта'), 'чертеж');

    const documentLibrary = within(drawer).getByRole('list', {
      name: 'Библиотека документов объекта',
    });
    expect(
      within(documentLibrary).getByText(
        'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
      ),
    ).toBeTruthy();
    expect(
      within(documentLibrary).queryByText('ППР на монтаж систем вентиляции и кондиционирования'),
    ).toBeNull();
  });

  it('adds an object document to the current act, point 4 and applications', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(getPreviewText()).not.toContain(
      'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
    );

    await user.click(screen.getByRole('button', { name: 'Добавить документ' }));
    await user.type(screen.getByLabelText('Найти документ объекта'), 'чертеж');

    const documentLibrary = screen.getByRole('list', { name: 'Библиотека документов объекта' });
    const drawingRow = within(documentLibrary)
      .getByText('Исполнительный чертеж. Узел прохода воздуховодов через перекрытие')
      .closest('.library-row');

    if (drawingRow === null) {
      throw new Error('В тесте ожидается строка документа объекта.');
    }

    await user.click(
      within(drawingRow as HTMLElement).getByRole('button', { name: 'Добавить документ' }),
    );

    const pointFourList = screen.getByRole('list', {
      name: 'Документы пункта 4 текущего акта',
    });
    expect(
      within(pointFourList).getByText(
        'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
      ),
    ).toBeTruthy();

    const applications = screen.getByRole('group', { name: 'Приложения текущего акта' });
    expect(
      within(applications).getByText(
        'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
      ),
    ).toBeTruthy();
    expect(getPreviewText()).toContain(
      'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
    );
  });

  it('renders configurable object-level header organization blocks in preview order', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

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

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Шапка акта/u }));
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

  it('adds a representative assignment from the mock global representative library search', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
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
    await user.click(screen.getByRole('button', { name: 'Сохранить назначение представителя' }));

    const objectLibrary = screen.getByRole('list', { name: 'Назначения представителей объекта' });
    expect(within(objectLibrary).getByText('Николаев Н.Н.')).toBeTruthy();
  });

  it('searches object-level representatives and adds one to the current act', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(getPreviewText()).not.toContain('Кузнецова А.А.');

    await user.type(screen.getByLabelText('Добавить назначение представителя в акт'), 'заказчика');

    const objectPicker = screen.getByRole('list', {
      name: 'Назначения представителей для текущего акта',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка назначения представителя.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить назначение' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Представитель заказчика:');
  });

  it('creates a representative assignment from the act form and adds its snapshot to the act', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await addRepresentativeAssignmentFromAct(user, {
      authorityBasis: 'Доверенность N Т-1',
      fullName: 'Сидоров С.С.',
      organization: 'ООО "Разовая проверка"',
      position: 'Инженер ПТО',
      roleLabel: 'Представитель разового осмотра',
    });

    expect(getPreviewText()).toContain('Сидоров С.С.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
    await user.click(screen.getByRole('button', { name: 'Показать назначения' }));

    const objectLibrary = screen.getByRole('list', { name: 'Назначения представителей объекта' });
    expect(within(objectLibrary).getByText('Сидоров С.С.')).toBeTruthy();
  });

  it('does not expose the old act-only representative creation model', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Создать представителя и назначение' }));

    expect(screen.queryByRole('button', { name: 'Добавить подписанта в акт' })).toBeNull();
    expect(
      screen.queryByRole('checkbox', {
        name: 'Также оставить назначение в параметрах по умолчанию',
      }),
    ).toBeNull();
    expect(screen.queryByLabelText('ФИО для снимка акта')).toBeNull();
    expect(screen.getByLabelText('ФИО глобального представителя')).toBeTruthy();
    expect(screen.getByLabelText('Роль назначения на объекте')).toBeTruthy();
    expect(
      screen.getByText(
        'В production это создаст глобального представителя, назначение на объект и снимок для акта.',
      ),
    ).toBeTruthy();
  });

  it('updates the document signatory order in the preview', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.click(screen.getByRole('button', { name: 'Переместить Петров П.П. вверх' }));

    const previewText = getPreviewText();
    expect(previewText.indexOf('Петров П.П.')).toBeLessThan(previewText.indexOf('Иванов И.И.'));
  });

  it('adds a material through certificate library search and derives applications', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

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
      within(insulationRow as HTMLElement).getByRole('button', { name: 'Добавить материал' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Теплоизоляционные маты ИЗ-50');
    expect(previewText).toContain('ДС-ИЗ-2026-04');
    expect(previewText).toContain('Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026');
    expect(
      screen.getByRole('checkbox', {
        name: /Декларация о соответствии N ДС-ИЗ-2026-04 от 20.05.2026/u,
      }),
    ).toBeTruthy();
  });

  it('unchecking an application removes it from final applications and preview only', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const applicationCheckbox = screen.getByRole('checkbox', {
      name: /Запись журнала входного контроля материалов/u,
    });

    expect((applicationCheckbox as HTMLInputElement).checked).toBe(true);
    expect(getPreviewText()).toContain('Запись журнала входного контроля материалов');

    await user.click(applicationCheckbox);

    expect((applicationCheckbox as HTMLInputElement).checked).toBe(false);

    const pointFourList = screen.getByRole('list', {
      name: 'Документы пункта 4 текущего акта',
    });
    expect(
      within(pointFourList).getByText('Запись журнала входного контроля материалов'),
    ).toBeTruthy();

    const applications = screen.getByRole('group', { name: 'Приложения текущего акта' });
    expect(
      within(applications).getByText('Запись журнала входного контроля материалов'),
    ).toBeTruthy();

    const preview = getDocumentPreview();
    const pointFourPreview = within(preview).getByLabelText('Документы соответствия');
    const previewApplications = preview.querySelector('.act-page__applications');

    if (previewApplications === null) {
      throw new Error('В preview ожидается блок приложений.');
    }

    expect(pointFourPreview.textContent).toContain('Запись журнала входного контроля материалов');
    expect(previewApplications.textContent).not.toContain(
      'Запись журнала входного контроля материалов',
    );
  });

  it('does not expose free-text material, certificate or final applications fields', () => {
    renderDemoWorkspace();

    expect(screen.queryByLabelText('Материалы / сертификаты простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Приложения / исполнительные схемы простым текстом')).toBeNull();
    expect(screen.queryByLabelText('Итоговые приложения простым текстом')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Приложения к акту' })).toBeTruthy();
    expect(screen.queryByText('Итоговые приложения в акте')).toBeNull();
  });

  it('renders checked applications before final signature blocks', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const previewText = getPreviewText();

    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Сертификат соответствия N СТ-ОВ-2026-017 от 12.05.2026');
    expect(previewText).toContain('Исполнительная схема скрытых участков вентиляции');
    expect(previewText.indexOf('Акт составлен в 4 экземплярах.')).toBeLessThan(
      previewText.indexOf('Приложения:'),
    );

    const preview = getDocumentPreview();
    const applications = preview.querySelector('.act-page__applications');
    const signatures = preview.querySelector('.act-page__signature-section');

    if (applications === null || signatures === null) {
      throw new Error('В preview ожидаются приложения и блок подписей.');
    }

    expect(
      Boolean(applications.compareDocumentPosition(signatures) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
  });

  it('uses real AOSR wording for point 4 in the preview', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(getPreviewText()).toContain(
      '4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',
    );
  });

  it('keeps the AOSR preview section order close to the Word form', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const previewText = getPreviewText();
    const orderedFragments = [
      'Объект капитального строительства:',
      'Заказчик:',
      'ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ',
      demoAosrWorkspace.objectDefaults.defaultUnderTitleText,
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
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const preview = getDocumentPreview();
    expect(preview.querySelector('.act-page__sheet')).toBeTruthy();
    expect(preview.querySelector('.act-page__top-blocks')).toBeTruthy();
    expect(preview.querySelector('.act-page__field-line')).toBeTruthy();
    expect(preview.querySelector('.act-page__caption')).toBeTruthy();
    expect(preview.querySelector('.act-page__number-date-row')).toBeTruthy();
    expect(preview.querySelector('.act-page__signature-person-row')).toBeTruthy();
  });

  it('keeps current editing behavior after the component split', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.clear(screen.getByDisplayValue('ОВ-1'));
    await user.type(screen.getByLabelText('Номер акта'), 'ОВ-10');

    expect(getPreviewText()).toContain('№ ОВ-10');
    expect(screen.getByText('ОВ-2')).toBeTruthy();
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

  it('keeps document default text helpers immutable', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть черновик.');
    }

    const editedComplianceDraft = updateDraftComplianceStatement(
      sourceDraft,
      'Отдельное значение только для unit-теста.',
    );
    const revertedComplianceDraft = resetDraftComplianceToObjectDefault(
      editedComplianceDraft,
      demoAosrWorkspace.objectDefaults,
    );
    const editedUnderTitleDraft = updateDemoAosrDraftField(
      sourceDraft,
      'underTitleText',
      'Отдельный подзаголовок только для unit-теста.',
    );
    const revertedUnderTitleDraft = resetDraftUnderTitleToObjectDefault(
      editedUnderTitleDraft,
      demoAosrWorkspace.objectDefaults,
    );

    expect(getDraftComplianceStatement(sourceDraft)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
    expect(isDraftComplianceFromObjectDefault(sourceDraft, demoAosrWorkspace.objectDefaults)).toBe(
      true,
    );
    expect(getDraftComplianceStatement(editedComplianceDraft)).toBe(
      'Отдельное значение только для unit-теста.',
    );
    expect(
      isDraftComplianceFromObjectDefault(editedComplianceDraft, demoAosrWorkspace.objectDefaults),
    ).toBe(false);
    expect(getDraftComplianceStatement(revertedComplianceDraft)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
    expect(isDraftUnderTitleFromObjectDefault(sourceDraft, demoAosrWorkspace.objectDefaults)).toBe(
      true,
    );
    expect(editedUnderTitleDraft.underTitleText).toBe(
      'Отдельный подзаголовок только для unit-теста.',
    );
    expect(
      isDraftUnderTitleFromObjectDefault(editedUnderTitleDraft, demoAosrWorkspace.objectDefaults),
    ).toBe(false);
    expect(revertedUnderTitleDraft.underTitleText).toBe(
      demoAosrWorkspace.objectDefaults.defaultUnderTitleText,
    );
    expect(demoAosrWorkspace.objectDefaults.defaultComplianceStatement).toContain('ГОСТ');
    expect(demoAosrWorkspace.objectDefaults.defaultComplianceStatement).toContain('ТУ');
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

  it('adds object document selections without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[1];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть второй черновик.');
    }

    const editedDraft = addObjectDocumentToDraft(sourceDraft, 'object-document-drawing-node-02');

    expect(editedDraft.objectDocumentIds).toContain('object-document-drawing-node-02');
    expect(sourceDraft.objectDocumentIds).not.toContain('object-document-drawing-node-02');
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

  it('moves header organization blocks without mutating object defaults', () => {
    const editedDefaults = moveHeaderOrganizationBlock(
      demoAosrWorkspace.objectDefaults,
      'header-organization-contractor',
      'up',
    );

    expect(editedDefaults.headerOrganizations[0]?.label).toBe('Подрядчик');
    expect(demoAosrWorkspace.objectDefaults.headerOrganizations[0]?.label).toBe('Заказчик');
    expect(editedDefaults).not.toBe(demoAosrWorkspace.objectDefaults);
  });

  it('creates new blank AOSR drafts with the default AOSR 1 form variant', () => {
    const draft = createEmptyDemoAosrDraft({
      actNumber: '',
      id: 'aosr-draft-form-variant-test',
      objectDefaults: demoAosrWorkspace.objectDefaults,
    });

    expect(draft.formVariantId).toBe('aosr-1');
  });

  it('copies current default parameters into new blank AOSR drafts', () => {
    const objectDefaults = {
      ...demoAosrWorkspace.objectDefaults,
      defaultComplianceStatement: 'Новый пункт 6 по умолчанию.',
      defaultUnderTitleText: 'Новый текст под заголовком по умолчанию.',
    };
    const draft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-defaults',
      id: 'aosr-draft-default-copy-test',
      objectDefaults,
    });

    expect(draft.underTitleText).toBe(objectDefaults.defaultUnderTitleText);
    expect(draft.complianceStatement).toBe(objectDefaults.defaultComplianceStatement);
    expect(draft.actNumber).toBe('ОВ-defaults');
  });
});

interface RenderDemoWorkspaceOptions {
  readonly initialDocumentPreviewOpen?: boolean;
}

function renderDemoWorkspace({
  initialDocumentPreviewOpen = false,
}: RenderDemoWorkspaceOptions = {}): void {
  render(
    <DemoStoreProvider>
      <DemoAosrWorkspacePage initialDocumentPreviewOpen={initialDocumentPreviewOpen} />
    </DemoStoreProvider>,
  );
}

interface RepresentativeAssignmentInput {
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

async function openObjectSettings(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const openButton = screen.queryByRole('button', { name: 'Параметры по умолчанию' });

  if (openButton !== null) {
    await user.click(openButton);
  }
}

async function addRepresentativeAssignmentFromAct(
  user: ReturnType<typeof userEvent.setup>,
  representative: RepresentativeAssignmentInput,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Создать представителя и назначение' }));
  await user.type(screen.getByLabelText('Роль назначения на объекте'), representative.roleLabel);
  await user.type(screen.getByLabelText('ФИО глобального представителя'), representative.fullName);
  await user.type(screen.getByLabelText('Должность в назначении объекта'), representative.position);
  await user.type(
    screen.getByLabelText('Организация в назначении объекта'),
    representative.organization,
  );
  await user.type(
    screen.getByLabelText('Основание полномочий в назначении объекта'),
    representative.authorityBasis,
  );

  await user.click(screen.getByRole('button', { name: 'Создать и добавить в акт' }));
}

function getPreviewText(): string {
  return getDocumentPreview().textContent;
}

function getDocumentPreview(): HTMLElement {
  const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });

  return within(drawer).getByLabelText('Демо-предпросмотр печатной формы АОСР');
}

function getTextAreaValue(element: HTMLElement): string {
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('В тесте ожидалось текстовое поле.');
  }

  return element.value;
}

function getSectionByHeading(heading: string): HTMLElement {
  const section = screen.getByRole('heading', { name: heading }).closest('.form-section');

  if (section === null) {
    throw new Error(`В тесте ожидается секция "${heading}".`);
  }

  return section as HTMLElement;
}

function getRequiredElement<TElement>(elements: readonly TElement[], index: number): TElement {
  const element = elements[index];

  if (element === undefined) {
    throw new Error(`Expected element at index ${String(index)}.`);
  }

  return element;
}
