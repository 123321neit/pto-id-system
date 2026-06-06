// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  addObjectDocumentToDraft,
  demoAosrWorkspace,
  getDraftComplianceStatement,
  resetDraftComplianceToObjectDefault,
  startDraftComplianceOverride,
  updateDemoAosrDraftField,
  updateDraftComplianceOverride,
} from './demo-aosr-workspace.js';
import { DemoStoreProvider } from '../demo-store/DemoStoreProvider.js';

afterEach(() => {
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('shows object-level and act-level areas as separate scopes', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Настройки объекта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Текущий акт' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Настройки объекта' })).toBeNull();
    expect(screen.queryByLabelText('Название проекта / объекта')).toBeNull();
  });

  it('shows a compact summary strip with current act counts and status', () => {
    renderDemoWorkspace();

    const summary = screen.getByLabelText('Сводка текущего акта');

    expect(within(summary).getByLabelText('Материалы: 2')).toBeTruthy();
    expect(within(summary).getByLabelText('Документы: 2')).toBeTruthy();
    expect(within(summary).getByLabelText('Приложения: 4')).toBeTruthy();
    expect(within(summary).getByLabelText('Подписанты: 3')).toBeTruthy();
    expect(within(summary).getByLabelText('Статус: Черновик')).toBeTruthy();
  });

  it('shows polished object workspace status cards in the header', () => {
    renderDemoWorkspace();

    const workspaceSummary = screen.getByLabelText('Сводка рабочей области');

    expect(screen.getByLabelText('Выбранный акт в шапке: АОСР-001')).toBeTruthy();
    expect(within(workspaceSummary).getByLabelText('Черновики: 2')).toBeTruthy();
    expect(within(workspaceSummary).getByLabelText('Текущий акт: АОСР-001')).toBeTruthy();
    expect(within(workspaceSummary).getByLabelText('Организации объекта: 3')).toBeTruthy();
    expect(within(workspaceSummary).getByLabelText('Подписанты: 3')).toBeTruthy();
  });

  it('keeps the workspace usable without the document preview drawer open', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Дерево проекта' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
  });

  it('opens and closes the document preview drawer with existing preview content', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));

    const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });
    const preview = within(drawer).getByLabelText('Демо-предпросмотр печатной формы АОСР');
    const drawerContext = within(drawer).getByLabelText('Контекст предпросмотра документа');

    expect(drawerContext.textContent).toContain('Акт АОСР-001');
    expect(drawerContext.textContent).toContain('"01" июня 2026 г.');
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

  it('keeps object settings and libraries compact until opened', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Настройки объекта' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Настройки объекта' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Представители объекта' })).toBeNull();
    expect(screen.queryByLabelText('Найти организацию в глобальной библиотеке')).toBeNull();
    expect(screen.queryByLabelText('Найти материал в библиотеке сертификатов')).toBeNull();
    expect(
      screen.getByText(
        'Выберите материал из библиотеки, чтобы сертификат попал в акт и приложения.',
      ),
    ).toBeTruthy();
  });

  it('opens object settings from the button and keeps existing settings functional', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(screen.queryByLabelText('Объект капитального строительства')).toBeNull();

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Настройки объекта' });
    const objectNameField = within(dialog).getByLabelText('Объект капитального строительства');

    await user.clear(objectNameField);
    await user.type(objectNameField, 'Новый демо-объект АОСР');

    expect(getPreviewText()).toContain('Новый демо-объект АОСР');

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть настройки' }));

    expect(screen.queryByRole('dialog', { name: 'Настройки объекта' })).toBeNull();
  });

  it('shows object-level compliance settings in a dedicated section', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Настройки объекта' });

    expect(
      within(dialog).getByRole('heading', {
        name: 'Нормативная и проектная база объекта',
      }),
    ).toBeTruthy();
    expect(
      getTextAreaValue(
        within(dialog).getByLabelText(
          'Текст для пункта 6. Соответствие работ предъявляемым требованиям',
        ),
      ),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(within(dialog).getByText(/пункте 6 текущего акта/u)).toBeTruthy();
  });

  it('uses object compliance value by default in the act and preview', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const complianceSection = getSectionByHeading('6. Соответствие работ');

    expect(within(complianceSection).getByText('Используется значение объекта')).toBeTruthy();
    expect(
      within(complianceSection).getByLabelText('Соответствие работ из настроек объекта')
        .textContent,
    ).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(screen.queryByLabelText('Значение только для этого акта')).toBeNull();
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('allows a per-act compliance override and uses it in preview', async () => {
    const user = userEvent.setup();
    const overrideText =
      'Индивидуально для акта: работы выполнены по уточнённому листу РД-ОВ-14 и ТУ-ОВ-5.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.click(screen.getByRole('button', { name: 'Изменить только для этого акта' }));

    expect(screen.getByText('Изменено только для этого акта')).toBeTruthy();

    const overrideField = screen.getByLabelText('Значение только для этого акта');
    expect(getTextAreaValue(overrideField)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );

    await user.clear(overrideField);
    await user.type(overrideField, overrideText);

    expect(getPreviewText()).toContain(overrideText);
    expect(getPreviewText()).not.toContain(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
  });

  it('reverts a compliance override back to the object value', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    await user.click(screen.getByRole('button', { name: 'Изменить только для этого акта' }));
    await user.clear(screen.getByLabelText('Значение только для этого акта'));
    await user.type(
      screen.getByLabelText('Значение только для этого акта'),
      'Индивидуальное исключение для проверки возврата.',
    );

    expect(getPreviewText()).toContain('Индивидуальное исключение для проверки возврата.');

    await user.click(screen.getByRole('button', { name: 'Вернуться к значению объекта' }));

    expect(screen.getByText('Используется значение объекта')).toBeTruthy();
    expect(screen.queryByLabelText('Значение только для этого акта')).toBeNull();
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(getPreviewText()).not.toContain('Индивидуальное исключение для проверки возврата.');
  });

  it('keeps object compliance settings unchanged after an act override', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Изменить только для этого акта' }));
    await user.clear(screen.getByLabelText('Значение только для этого акта'));
    await user.type(
      screen.getByLabelText('Значение только для этого акта'),
      'Только этот акт использует отдельную нормативную ссылку.',
    );

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Настройки объекта' });
    expect(
      getTextAreaValue(
        within(dialog).getByLabelText(
          'Текст для пункта 6. Соответствие работ предъявляемым требованиям',
        ),
      ),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('shows the demo shortcut note for prefilled object representatives inside settings', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

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
      'Общие данные',
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
      'Подписанты текущего акта',
    ];

    for (let index = 0; index < orderedFragments.length - 1; index += 1) {
      const currentFragment = getRequiredElement(orderedFragments, index);
      const nextFragment = getRequiredElement(orderedFragments, index + 1);

      expect(editorText.indexOf(currentFragment)).toBeLessThan(editorText.indexOf(nextFragment));
    }
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

  it('keeps applications in a separate section after additional info and before signatories', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Текущий акт' }).textContent;

    expect(editorText.indexOf('Дополнительные сведения')).toBeLessThan(
      editorText.indexOf('Приложения к акту'),
    );
    expect(editorText.indexOf('Приложения к акту')).toBeLessThan(
      editorText.indexOf('Подписанты текущего акта'),
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

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

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
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить подписанта' }),
    );

    const previewText = getPreviewText();
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Представитель заказчика:');
  });

  it('adds a temporary representative only to the current act when the checkbox is clear', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

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

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

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

    expect(screen.getByLabelText('Приложения: 3')).toBeTruthy();

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

  it('keeps object compliance defaults unchanged in pure act override helpers', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть черновик.');
    }

    const draftWithStartedOverride = startDraftComplianceOverride(
      sourceDraft,
      demoAosrWorkspace.objectDefaults,
    );
    const editedDraft = updateDraftComplianceOverride(
      draftWithStartedOverride,
      'Отдельное значение только для unit-теста.',
    );
    const revertedDraft = resetDraftComplianceToObjectDefault(editedDraft);

    expect(getDraftComplianceStatement(sourceDraft, demoAosrWorkspace.objectDefaults)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
    expect(getDraftComplianceStatement(editedDraft, demoAosrWorkspace.objectDefaults)).toBe(
      'Отдельное значение только для unit-теста.',
    );
    expect(getDraftComplianceStatement(revertedDraft, demoAosrWorkspace.objectDefaults)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
    expect(sourceDraft.complianceStatementOverride).toBeUndefined();
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

interface ManualRepresentativeInput {
  readonly authorityBasis: string;
  readonly fullName: string;
  readonly organization: string;
  readonly position: string;
  readonly roleLabel: string;
}

async function openObjectSettings(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const openButton = screen.queryByRole('button', { name: 'Настройки объекта' });

  if (openButton !== null) {
    await user.click(openButton);
  }
}

async function addManualRepresentative(
  user: ReturnType<typeof userEvent.setup>,
  representative: ManualRepresentativeInput,
  shouldAddToObjectLibrary = false,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Добавить подписанта' }));
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
