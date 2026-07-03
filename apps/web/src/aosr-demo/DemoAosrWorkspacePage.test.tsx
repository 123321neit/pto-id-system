// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  addHeaderOrganizationBlock,
  addMaterialCertificateToDraft,
  addObjectDocumentToDraft,
  createEmptyDemoAosrDraft,
  demoAosrWorkspace,
  getDraftComplianceStatement,
  getDraftMaterialCertificates,
  getDraftObjectDocuments,
  isDraftComplianceFromObjectDefault,
  isDraftHeaderOrganizationsFromObjectDefault,
  isDraftObjectNameFromObjectDefault,
  isDraftProjectDocumentationFromObjectDefault,
  moveHeaderOrganizationInDraft,
  moveHeaderOrganizationBlock,
  resetDraftComplianceToObjectDefault,
  resetDraftHeaderOrganizationsToObjectDefault,
  resetDraftObjectNameToObjectDefault,
  resetDraftProjectDocumentationToObjectDefault,
  type DemoAosrDraft,
  updateDemoAosrDraftField,
  updateDraftComplianceStatement,
} from './demo-aosr-workspace.js';
import { DemoStoreProvider } from '../demo-store/DemoStoreProvider.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanup();
});

describe('DemoAosrWorkspacePage', () => {
  it('shows object-level and act-level areas as separate scopes', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('region', { name: 'Редактор документа' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Шаблонные значения' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Шаблонные значения' })).toBeNull();
    expect(screen.queryByLabelText('Название проекта / объекта')).toBeNull();
  });

  it('keeps the act editor focused on document metadata instead of repeated counters', () => {
    renderDemoWorkspace();

    const metadata = screen.getByLabelText('Метаданные документа');

    expect(within(metadata).getByText('Акт')).toBeTruthy();
    expect(within(metadata).getByText('ОВ-1')).toBeTruthy();
    expect(screen.queryByLabelText('Сводка текущего акта')).toBeNull();
    expect(screen.queryByText('Статус')).toBeNull();
    expect(screen.queryByText('Черновик')).toBeNull();
    expect(screen.queryByText('На проверку')).toBeNull();
    expect(screen.queryByText('Готов')).toBeNull();
    expect(screen.queryByText('Выпущен')).toBeNull();
  });

  it('renders signatory cards as a compact readable hierarchy', () => {
    renderDemoWorkspace();

    const signatoryList = screen.getByRole('list', { name: 'Порядок подписантов' });
    const cards = within(signatoryList).getAllByRole('listitem');
    const firstCard = cards[0];
    const secondCard = cards[1];

    if (firstCard === undefined || secondCard === undefined) {
      throw new Error('Expected at least two signatory cards.');
    }

    const firstCardTitle = firstCard.querySelector('.signatory-order-item__title');

    expect(firstCardTitle?.textContent).toBe('Представитель подрядчика — Иванов И.И.');
    expect(
      within(firstCard).getByText('— Иванов И.И.').classList.contains('signatory-order-item__name'),
    ).toBe(true);
    expect(
      within(firstCard)
        .getByText('Производитель работ, ООО "ПТО Монтаж"')
        .classList.contains('signatory-order-item__subtitle'),
    ).toBe(true);
    expect(
      within(firstCard)
        .getByText('Приказ № 12-П от 10.05.2026')
        .classList.contains('signatory-order-item__details'),
    ).toBe(true);
    expect(
      within(secondCard)
        .getByText('Договор строительного контроля № СК-7, НРС С-66-212868')
        .classList.contains('signatory-order-item__details'),
    ).toBe(true);
  });

  it('keeps readiness hints out of the document workspace', () => {
    renderDemoWorkspace();

    expect(screen.queryByRole('region', { name: 'Подсказки по акту' })).toBeNull();
    expect(screen.queryByText('🟢 Поля заполнены')).toBeNull();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
  });

  it('keeps preview available when document sections are empty', async () => {
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
    await switchCurrentActToManualTemplate(user);
    await user.click(screen.getByRole('button', { name: 'Убрать Иванов И.И. из акта' }));
    await user.click(screen.getByRole('button', { name: 'Убрать Петров П.П. из акта' }));
    await user.click(screen.getByRole('button', { name: 'Убрать Смирнова С.С. из акта' }));
    await user.clear(screen.getByLabelText('Текст соответствия работ требованиям'));

    expect(screen.queryByRole('region', { name: 'Подсказки по акту' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
  });

  it('shows document context in the header without object-wide counters', () => {
    renderDemoWorkspace();

    expect(screen.getByLabelText('Текущий акт: ОВ-1')).toBeTruthy();
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
    expect(screen.getByRole('heading', { name: 'Акты в папке «Рабочая папка»' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Редактор документа' })).toBeTruthy();
  });

  it('shows the AOSR DOCX download action and reports generation errors', async () => {
    const user = userEvent.setup();
    const generationError = new Error('DOCX template error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(generationError));
    renderDemoWorkspace();

    expect(screen.queryByRole('region', { name: 'Действия с актом' })).toBeNull();

    const actions = screen.getByRole('region', { name: 'Действия редактора' });
    const downloadButton = within(actions).getByRole('button', { name: 'Скачать DOCX' });

    expect(downloadButton).toBeTruthy();

    await user.click(downloadButton);

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe(
      'Не удалось сформировать DOCX. Проверьте шаблон акта и данные документа.',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith('AOSR DOCX generation failed', generationError);
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();
  });

  it('deletes the selected act only after user confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    renderDemoWorkspace();

    const actions = screen.getByRole('region', { name: 'Действия редактора' });
    const deleteButton = within(actions).getByRole('button', { name: 'Удалить акт' });

    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('Удалить акт ОВ-1? Акт будет удалён из текущей папки.');
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeTruthy();

    await user.click(deleteButton);

    expect(screen.queryByRole('heading', { name: 'Редактирование акта ОВ-1' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Редактирование акта ОВ-2' })).toBeTruthy();
    expect(screen.queryByLabelText('Текущий акт: ОВ-1')).toBeNull();
    expect(screen.getByLabelText('Текущий акт: ОВ-2')).toBeTruthy();
  });

  it('opens and closes the document preview drawer with existing preview content', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));

    const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });
    const preview = within(drawer).getByLabelText('Тестовый HTML fallback АОСР');
    const drawerContext = within(drawer).getByLabelText('Контекст предпросмотра документа');

    expect(drawerContext.textContent).toContain('Акт ОВ-1');
    expect(drawerContext.textContent).toContain('АОСР 1');
    expect(drawerContext.textContent).toContain('«04» сентября 2026 г.');
    expect(drawerContext.textContent).toContain('4 приложений');
    expect(within(preview).getByText('Страница 1')).toBeTruthy();
    expect(within(preview).queryByText('Страница 2')).toBeNull();
    expect(within(drawer).getByText('1 страница')).toBeTruthy();
    expect(within(drawer).queryByText('2 страницы')).toBeNull();
    expect(preview.textContent).toContain('ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ');
    expect(preview.querySelectorAll('.act-page__page-frame')).toHaveLength(1);
    expect(preview.querySelectorAll('.act-page__sheet')).toHaveLength(1);

    await user.click(
      within(drawer).getByRole('button', { name: 'Закрыть предпросмотр документа' }),
    );

    expect(screen.queryByRole('dialog', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Редактор документа' })).toBeTruthy();
  });

  it('uses only the DOCX preview host in normal user preview mode', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ previewModeForTests: 'auto' });

    await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));

    const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });

    expect(within(drawer).getByLabelText('Предпросмотр DOCX-шаблона АОСР')).toBeTruthy();
    expect(within(drawer).queryByLabelText('Тестовый HTML fallback АОСР')).toBeNull();
    expect(drawer.querySelector('.act-page')).toBeNull();
    expect(drawer.querySelector('.act-page__signature-line-row')).toBeNull();
    expect(drawer.textContent).not.toContain('5.Даты:');
  });

  it('keeps default parameters and libraries compact until opened', () => {
    renderDemoWorkspace();

    expect(screen.getByRole('button', { name: 'Шаблонные значения' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Шаблонные значения' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Представители для актов' })).toBeNull();
    expect(screen.queryByLabelText('Найти организацию в глобальной библиотеке')).toBeNull();
    expect(screen.queryByLabelText('Найти материал в библиотеке сертификатов')).toBeNull();
    expect(
      screen.getByText(
        'Выберите материал из библиотеки, чтобы сертификат попал в акт и приложения.',
      ),
    ).toBeTruthy();
  });

  it('updates linked object name after changing object template parameters', async () => {
    const user = userEvent.setup();
    const updatedDefaultObjectName = 'Новый демо-объект АОСР';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(screen.queryByLabelText('Объект капитального строительства')).toBeNull();
    expect(
      getTextAreaValue(screen.getByLabelText('Объект капитального строительства в документе')),
    ).toBe(demoAosrWorkspace.objectDefaults.objectName);

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });
    const objectNameField = within(dialog).getByLabelText('Объект капитального строительства');

    await user.clear(objectNameField);
    await user.type(objectNameField, updatedDefaultObjectName);

    expect(
      getTextAreaValue(screen.getByLabelText('Объект капитального строительства в документе')),
    ).toBe(updatedDefaultObjectName);
    expect(getPreviewText()).toContain(updatedDefaultObjectName);

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }));

    expect(screen.queryByRole('dialog', { name: 'Шаблонные значения' })).toBeNull();
  });

  it('shows object-level compliance defaults in a dedicated section', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });

    expect(
      within(dialog).getByRole('heading', {
        name: '7. Соответствие работ требованиям',
      }),
    ).toBeTruthy();
    expect(
      getTextAreaValue(within(dialog).getByLabelText('Текст соответствия работ требованиям')),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('updates linked project documentation after changing object template parameters', async () => {
    const user = userEvent.setup();
    const updatedDefaultProjectDocumentation =
      'Новая проектная документация по умолчанию для следующих актов.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const projectDocumentationField = screen.getByLabelText('Проектная документация в документе');
    expect(getTextAreaValue(projectDocumentationField)).toBe(
      demoAosrWorkspace.objectDefaults.defaultProjectDocumentation,
    );
    expect(getPreviewText()).toContain(
      demoAosrWorkspace.objectDefaults.defaultProjectDocumentation,
    );

    await openObjectSettings(user);
    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });
    const defaultProjectDocumentationField = within(dialog).getByLabelText(
      'Проектная документация шаблона',
    );
    await user.clear(defaultProjectDocumentationField);
    await user.type(defaultProjectDocumentationField, updatedDefaultProjectDocumentation);

    expect(getTextAreaValue(screen.getByLabelText('Проектная документация в документе'))).toBe(
      updatedDefaultProjectDocumentation,
    );
    expect(getPreviewText()).toContain(updatedDefaultProjectDocumentation);

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }));
  });

  it('stores repeated contractor, additional information and copy count in the section template', async () => {
    const user = userEvent.setup();
    const contractorName = 'ООО "Исполнитель из шаблона"';
    const additionalInfo = 'Печатные сведения из шаблонных значений.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });
    const contractorField = within(dialog).getByLabelText('Лицо, выполнившее работы');
    const copiesField = within(dialog).getByLabelText('Количество экземпляров');

    await user.clear(contractorField);
    await user.type(contractorField, contractorName);
    await user.clear(copiesField);
    await user.type(copiesField, '8');
    const additionalInfoField = within(dialog).getByLabelText('Печатный текст для актов объекта');
    await user.clear(additionalInfoField);
    await user.type(additionalInfoField, additionalInfo);

    expect(getPreviewText()).toContain(contractorName);
    expect(getPreviewText()).toContain(additionalInfo);
    expect(getPreviewText()).toContain('8 экземплярах');

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }));

    expect(screen.getAllByText(contractorName).length).toBeGreaterThan(0);
    expect(screen.getByText('Экземпляров: 8')).toBeTruthy();
  });

  it('uses linked object template compliance text in the act and preview', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const complianceSection = getSectionByHeading('7. Соответствие работ требованиям');

    expect(within(complianceSection).queryByText('По шаблону объекта')).toBeNull();
    expect(screen.getAllByText('Данные из раздела').length).toBeGreaterThan(0);
    expect(
      getTextAreaValue(
        within(complianceSection).getByLabelText('Текст соответствия работ требованиям'),
      ),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('keeps object template data collapsed in a linked act until the user opens it', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();

    const templateSections = [
      '2. Объект и участники',
      '3. Представители / подписанты',
      'Подписанты текущего акта',
      'Лицо, выполнившее работы',
      '6. Документы-основания',
      '7. Соответствие работ требованиям',
      '9. Дополнительные сведения / экземпляры / подписи',
    ];

    for (const sectionName of templateSections) {
      const details = getTemplateSection(sectionName);

      expect(details.open).toBe(false);
    }

    const contractorSection = getTemplateSection('Лицо, выполнившее работы');
    await user.click(within(contractorSection).getByText('Лицо, выполнившее работы'));

    expect(contractorSection.open).toBe(true);
    expect(getInputValue(within(contractorSection).getByLabelText('Печатное наименование'))).toBe(
      demoAosrWorkspace.objectDefaults.defaultWorkContractorName,
    );
    expect(within(contractorSection).queryByRole('button')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Редактировать только для этого акта' }),
    ).toBeTruthy();
  });

  it('allows editing document compliance text and uses it in preview', async () => {
    const user = userEvent.setup();
    const documentText = 'В документе: работы выполнены по уточнённому листу РД-ОВ-14 и ТУ-ОВ-5.';

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

    const complianceField = screen.getByLabelText('Текст соответствия работ требованиям');
    expect(getTextAreaValue(complianceField)).toBe(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );

    await user.clear(complianceField);
    await user.type(complianceField, documentText);

    expect(screen.getByText('Отличается от общих данных раздела')).toBeTruthy();
    expect(getPreviewText()).toContain(documentText);
    expect(getPreviewText()).not.toContain(
      demoAosrWorkspace.objectDefaults.defaultComplianceStatement,
    );
  });

  it('reverts document compliance text back to default parameters', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

    await user.clear(screen.getByLabelText('Текст соответствия работ требованиям'));
    await user.type(
      screen.getByLabelText('Текст соответствия работ требованиям'),
      'Индивидуальное исключение для проверки возврата.',
    );

    expect(getPreviewText()).toContain('Индивидуальное исключение для проверки возврата.');

    await user.click(screen.getByRole('button', { name: 'Вернуть связь с данными раздела' }));

    expect(screen.getAllByText('Данные из раздела').length).toBeGreaterThan(0);
    expect(getPreviewText()).toContain(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
    expect(getPreviewText()).not.toContain('Индивидуальное исключение для проверки возврата.');
  });

  it('keeps object compliance defaults unchanged after editing document text', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await switchCurrentActToManualTemplate(user);

    await user.clear(screen.getByLabelText('Текст соответствия работ требованиям'));
    await user.type(
      screen.getByLabelText('Текст соответствия работ требованиям'),
      'Только этот акт использует отдельную нормативную ссылку.',
    );

    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });
    expect(
      getTextAreaValue(within(dialog).getByLabelText('Текст соответствия работ требованиям')),
    ).toBe(demoAosrWorkspace.objectDefaults.defaultComplianceStatement);
  });

  it('keeps object settings understandable without a separate helper paragraph', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });

    expect(within(dialog).getByRole('button', { name: /Данные и тексты/u })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Организации/u })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: /Представители/u })).toBeTruthy();
    expect(
      within(dialog).queryByText(/Связанные документы используют эти данные напрямую/u),
    ).toBeNull();
  });

  it('keeps the noisy section template summary out of the settings page', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);

    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });

    expect(within(dialog).queryByRole('region', { name: 'Сводка шаблонных значений' })).toBeNull();
    expect(within(dialog).queryByText('Как применяются значения')).toBeNull();

    await user.click(within(dialog).getByRole('button', { name: /Организации/u }));
    expect(
      within(dialog).getByText(/Выберите организацию из глобальной библиотеки или создайте новую/u),
    ).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Добавить блок шапки' }));
    expect(within(dialog).getByText('Глобальная библиотека → назначение в шаблоне')).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: /Представители/u }));
    expect(within(dialog).getByText(/Группы определяют роли и порядок подписей/u)).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Добавить представителя' }));
    expect(
      within(dialog).getByText('Библиотека представителей → назначение на объект'),
    ).toBeTruthy();
  });

  it('keeps linked act signatories read-only without repeated helper text', () => {
    renderDemoWorkspace();

    expect(screen.queryByLabelText('Добавить назначение представителя в акт')).toBeNull();
    expect(screen.queryByText('Состав подписантов берётся из шаблона объекта.')).toBeNull();
    expect(screen.getAllByText('Данные из раздела').length).toBeGreaterThan(0);
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
      .getByRole('heading', { name: '5. Материалы и сертификаты' })
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
    expect(screen.getByRole('heading', { name: '5. Материалы и сертификаты' })).toBeTruthy();
  });

  it('renders act editor sections in the intended AOSR order', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Редактирование акта ОВ-1' }).textContent;
    const orderedFragments = [
      '1. Номер и дата',
      'Номер акта',
      'Дата акта',
      'Форма акта',
      'АОСР 1',
      '2. Объект и участники',
      'Объект капитального строительства',
      '3. Представители / подписанты',
      'Подписанты текущего акта',
      'Лицо, выполнившее работы',
      '4. Выполненные работы',
      'Описание скрытых работ',
      'Например: монтаж воздуховодов из оцинкованной стали в осях 1-4/Б-Г с отм. 0,000 до отм. +3,950.',
      'Начало работ',
      'Окончание работ',
      '5. Материалы и сертификаты',
      '6. Документы-основания',
      'Исполнительные схемы / документы объекта',
      '7. Соответствие работ требованиям',
      '8. Последующие работы',
      'Дополнительные сведения',
      '10. Приложения',
    ];

    for (let index = 0; index < orderedFragments.length - 1; index += 1) {
      const currentFragment = getRequiredElement(orderedFragments, index);
      const nextFragment = getRequiredElement(orderedFragments, index + 1);

      expect(editorText.indexOf(currentFragment)).toBeLessThan(editorText.indexOf(nextFragment));
    }
  });

  it('keeps axes and elevations inside the work description field in the editor UI', () => {
    renderDemoWorkspace();

    const editor = screen.getByRole('region', { name: 'Редактирование акта ОВ-1' });

    expect(within(editor).getByLabelText('Описание скрытых работ')).toBeTruthy();
    expect(
      within(editor).getByText(
        'Например: монтаж воздуховодов из оцинкованной стали в осях 1-4/Б-Г с отм. 0,000 до отм. +3,950.',
      ),
    ).toBeTruthy();
    expect(within(editor).queryByLabelText('Оси')).toBeNull();
    expect(within(editor).queryByLabelText('Отметки')).toBeNull();
  });

  it('renders organization order before signatories and the numbered act body', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Редактирование акта ОВ-1' }).textContent;

    expect(editorText.indexOf('3. Представители / подписанты')).toBeLessThan(
      editorText.indexOf('Подписанты текущего акта'),
    );
    expect(editorText.indexOf('Подписанты текущего акта')).toBeLessThan(
      editorText.indexOf('4. Выполненные работы'),
    );
    expect(screen.getByRole('list', { name: 'Порядок организаций в акте' })).toBeTruthy();
  });

  it('changes organization display order from the editor and updates preview order', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

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

  it('keeps manual organization order detached and restores live template order', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

    const organizationOrder = screen.getByRole('list', { name: 'Порядок организаций в акте' });
    const getOrganizationOrderText = (): string => organizationOrder.textContent;

    expect(getOrganizationOrderText().indexOf('Заказчик')).toBeLessThan(
      getOrganizationOrderText().indexOf('Подрядчик'),
    );

    await openObjectSettings(user);
    const dialog = screen.getByRole('dialog', { name: 'Шаблонные значения' });
    await user.click(within(dialog).getByRole('button', { name: /Организации/u }));
    await user.click(within(dialog).getByRole('button', { name: 'Переместить Подрядчик вверх' }));

    expect(getOrganizationOrderText().indexOf('Заказчик')).toBeLessThan(
      getOrganizationOrderText().indexOf('Подрядчик'),
    );
    expect(getPreviewText().indexOf('Заказчик:')).toBeLessThan(
      getPreviewText().indexOf('Подрядчик:'),
    );
    expect(screen.getAllByText('Ручная версия').length).toBeGreaterThan(0);

    await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }));

    await user.click(screen.getByRole('button', { name: 'Вернуть связь с данными раздела' }));

    expect(getOrganizationOrderText().indexOf('Подрядчик')).toBeLessThan(
      getOrganizationOrderText().indexOf('Заказчик'),
    );
    expect(getPreviewText().indexOf('Подрядчик:')).toBeLessThan(
      getPreviewText().indexOf('Заказчик:'),
    );
  });

  it('edits organization and signatory snapshot fields only in manual mode', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    expect(screen.queryByText('Изменить организацию')).toBeNull();
    expect(screen.queryByText('Изменить подписанта')).toBeNull();

    await switchCurrentActToManualTemplate(user);

    const organizationEditor = screen.getAllByText('Изменить организацию')[0];
    const signatoryEditor = screen.getAllByText('Изменить подписанта')[0];

    if (organizationEditor === undefined || signatoryEditor === undefined) {
      throw new Error('Expected manual snapshot editors.');
    }

    await user.click(organizationEditor);
    const organizationField = screen.getByLabelText('Организация блока Заказчик');
    await user.clear(organizationField);
    await user.type(organizationField, 'ООО "Ручной заказчик"');

    await user.click(signatoryEditor);
    const signatoryField = screen.getByLabelText('ФИО подписанта Иванов И.И.');
    await user.clear(signatoryField);
    await user.type(signatoryField, 'Ручной Р.Р.');

    const introDisplayTextField = screen.getByLabelText(
      'Верхняя печатная строка подписанта Ручной Р.Р.',
    );
    await user.clear(introDisplayTextField);
    await user.type(introDisplayTextField, 'РУЧНАЯ ПЕЧАТНАЯ СТРОКА ПРЕДСТАВИТЕЛЯ');

    expect(getPreviewText()).toContain('ООО "Ручной заказчик"');
    expect(getPreviewText()).toContain('РУЧНАЯ ПЕЧАТНАЯ СТРОКА ПРЕДСТАВИТЕЛЯ');
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

    expect(
      screen.getByRole('heading', { name: 'Исполнительные схемы / документы объекта' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Добавить документ' })).toBeTruthy();

    const pointFourList = screen.getByRole('list', {
      name: 'Документы-основания текущего акта',
    });
    expect(
      within(pointFourList).getByText('Исполнительная схема скрытых участков вентиляции'),
    ).toBeTruthy();
  });

  it('keeps applications in a separate section after additional info while signatories stay near top', () => {
    renderDemoWorkspace();

    const editorText = screen.getByRole('region', { name: 'Редактирование акта ОВ-1' }).textContent;

    expect(editorText.indexOf('Подписанты текущего акта')).toBeLessThan(
      editorText.indexOf('4. Выполненные работы'),
    );
    expect(editorText.indexOf('Дополнительные сведения')).toBeLessThan(
      editorText.indexOf('10. Приложения'),
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
      name: 'Документы-основания текущего акта',
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
    await user.click(screen.getByRole('button', { name: /Организации/u }));
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
    await user.click(screen.getByRole('button', { name: 'Добавить организацию в шаблон' }));

    expect(getPreviewText()).toContain('Генподрядчик:');
    expect(getPreviewText()).toContain('ООО "Демо-генподряд"');

    await user.click(screen.getByRole('button', { name: 'Закрыть' }));

    const previewText = getPreviewText();
    expect(previewText).toContain('Генподрядчик:');
    expect(previewText).toContain('ООО "Демо-генподряд"');
    expect(previewText).toContain('620075, г. Екатеринбург, ул. Генподрядная, 8');
    expect(previewText).not.toContain('объектовый договор № ГП-1');
  });

  it('creates a global organization before linking a new object-template counterparty', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Организации/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить блок шапки' }));
    await user.type(screen.getByLabelText('Название блока'), 'Проектировщик');
    await user.type(
      screen.getByLabelText('Организация / объектовый текст'),
      'ООО "Новая библиотечная организация"',
    );
    await user.type(
      screen.getByLabelText('Реквизиты / детали для этого объекта'),
      'ОГРН 777; ИНН 888.',
    );
    await user.click(screen.getByRole('button', { name: 'Добавить организацию в шаблон' }));

    expect(getPreviewText()).toContain('ООО "Новая библиотечная организация" ОГРН 777; ИНН 888.');

    await user.click(screen.getByRole('button', { name: 'Добавить блок шапки' }));
    await user.type(
      screen.getByLabelText('Найти организацию в глобальной библиотеке'),
      'Новая библиотечная',
    );

    expect(
      within(screen.getByRole('list', { name: 'Глобальная библиотека организаций' })).getByText(
        'ООО "Новая библиотечная организация"',
      ),
    ).toBeTruthy();
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
    await user.click(screen.getByRole('button', { name: 'Добавить представителя в шаблон' }));

    const objectLibrary = screen.getByRole('list', { name: 'Назначения представителей объекта' });
    expect(within(objectLibrary).getByText('Николаев Н.Н.')).toBeTruthy();
  });

  it('creates a global signatory before linking a new object-template member', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(screen.getByLabelText('Роль на этом объекте'), 'Лабораторный контроль');
    await user.type(screen.getByLabelText('ФИО представителя'), 'Тестов Т.Т.');
    await user.type(screen.getByLabelText('Должность на этом объекте'), 'Инженер лаборатории');
    await user.type(screen.getByLabelText('Организация на этом объекте'), 'ООО "ЛабТест"');
    await user.type(screen.getByLabelText('Основание полномочий для объекта'), 'Приказ N 5');
    await user.click(screen.getByRole('button', { name: 'Добавить представителя в шаблон' }));

    expect(
      within(screen.getByRole('list', { name: 'Назначения представителей объекта' })).getByText(
        'Тестов Т.Т.',
      ),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(screen.getByLabelText('Найти представителя в глобальной библиотеке'), 'Тестов');

    expect(
      within(screen.getByRole('list', { name: 'Глобальная библиотека представителей' })).getByText(
        'Тестов Т.Т.',
      ),
    ).toBeTruthy();
  });

  it('updates linked act when a representative assignment is added to the section template', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    expect(getPreviewText()).not.toContain('Кузнецова А.А.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя' }));
    await user.type(
      screen.getByLabelText('Найти представителя в глобальной библиотеке'),
      'заказчика',
    );

    const globalLibrary = screen.getByRole('list', {
      name: 'Глобальная библиотека представителей',
    });
    const customerRow = within(globalLibrary).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка глобального представителя.');
    }

    await user.click(within(customerRow as HTMLElement).getByRole('button', { name: 'Выбрать' }));
    await user.click(screen.getByRole('button', { name: 'Добавить представителя в шаблон' }));

    const previewText = getPreviewText();
    expect(previewText).toContain('Кузнецова А.А.');
    expect(previewText).toContain('Представитель заказчика:');
  });

  it('creates a manual representative only in the current act snapshot', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

    await addRepresentativeAssignmentFromAct(user, {
      authorityBasis: 'Доверенность № Т-1',
      fullName: 'Сидоров С.С.',
      organization: 'ООО "Разовая проверка"',
      position: 'Инженер ПТО',
      roleLabel: 'Представитель разового осмотра',
    });

    expect(getPreviewText()).toContain('Сидоров С.С.');

    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));

    const objectLibrary = screen.getByRole('list', { name: 'Назначения представителей объекта' });
    expect(within(objectLibrary).queryByText('Сидоров С.С.')).toBeNull();
  });

  it('shows object template representatives as groups with members', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));

    const contractorGroup = screen.getByRole('list', {
      name: 'Участники группы Представитель подрядчика',
    });

    expect(within(contractorGroup).getByText('Иванов И.И.')).toBeTruthy();
    expect(within(contractorGroup).getByText('Производитель работ, ООО "ПТО Монтаж"')).toBeTruthy();
  });

  it('edits an existing organization block and its subscript in the linked act', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Организации/u }));

    const organizationCard = within(screen.getByRole('list', { name: 'Организации в шапке акта' }))
      .getByText('Заказчик')
      .closest('.compact-card-list__item');

    if (organizationCard === null) {
      throw new Error('Expected the customer organization card.');
    }

    await user.click(
      within(organizationCard as HTMLElement).getByRole('button', { name: 'Редактировать' }),
    );
    const organizationName = within(organizationCard as HTMLElement).getByLabelText('Организация');
    const organizationDetails = within(organizationCard as HTMLElement).getByLabelText(
      'Реквизиты организации',
    );
    const organizationSubscript = within(organizationCard as HTMLElement).getByLabelText(
      'Подстрочный текст',
    );

    await user.clear(organizationName);
    await user.type(organizationName, 'ООО "Новый заказчик"');
    await user.clear(organizationDetails);
    await user.type(organizationDetails, 'ОГРН 123; ИНН 456.');
    await user.clear(organizationSubscript);
    await user.type(organizationSubscript, 'Изменяемая подпись организации');

    expect(getPreviewText()).toContain('ООО "Новый заказчик" ОГРН 123; ИНН 456.');
    expect(getPreviewText()).toContain('(Изменяемая подпись организации)');
  });

  it('edits a representative group, member values and subscript in the linked act', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await openObjectSettings(user);
    await user.click(screen.getByRole('button', { name: /Представители/u }));

    const group = within(screen.getByRole('list', { name: 'Назначения представителей объекта' }))
      .getByText('Представитель подрядчика')
      .closest('.representative-template-group');

    if (group === null) {
      throw new Error('Expected the contractor representative group.');
    }

    await user.click(within(group as HTMLElement).getByRole('button', { name: 'Редактировать' }));
    const groupTitle = within(group as HTMLElement).getByLabelText('Название группы / роль');
    const fullName = within(group as HTMLElement).getByLabelText('ФИО');
    const subscript = within(group as HTMLElement).getByLabelText('Подстрочный текст');

    await user.clear(groupTitle);
    await user.type(groupTitle, 'Представитель монтажной организации');
    await user.clear(fullName);
    await user.type(fullName, 'Сидоров С.С.');
    await user.clear(subscript);
    await user.type(subscript, 'Изменяемая подпись представителя');

    expect(getPreviewText()).toContain('Представитель монтажной организации:');
    expect(getPreviewText()).toContain('Сидоров С.С.');
    expect(getPreviewText()).toContain('(Изменяемая подпись представителя)');
  });

  it('describes manual representative creation as a local act snapshot edit', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace();
    await switchCurrentActToManualTemplate(user);

    await user.click(screen.getByRole('button', { name: 'Создать представителя и назначение' }));

    expect(screen.queryByRole('button', { name: 'Добавить подписанта в акт' })).toBeNull();
    expect(
      screen.queryByRole('checkbox', {
        name: 'Также оставить назначение в параметрах по умолчанию',
      }),
    ).toBeNull();
    expect(screen.queryByLabelText('ФИО для снимка акта')).toBeNull();
    expect(screen.getByLabelText('ФИО представителя')).toBeTruthy();
    expect(screen.getByLabelText('Группа / роль в ручной версии')).toBeTruthy();
    expect(screen.getAllByText(/Эти значения меняются только в этом акте/u).length).toBeGreaterThan(
      0,
    );
  });

  it('updates the document signatory order in the preview', async () => {
    const user = userEvent.setup();

    renderDemoWorkspace({ initialDocumentPreviewOpen: true });
    await switchCurrentActToManualTemplate(user);

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
    expect(previewText).toContain('Декларация о соответствии № ДС-ИЗ-2026-04 от 20.05.2026');
    expect(
      screen.getByRole('checkbox', {
        name: /Декларация о соответствии № ДС-ИЗ-2026-04 от 20.05.2026/u,
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
      name: 'Документы-основания текущего акта',
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
    expect(screen.getByRole('heading', { name: '10. Приложения' })).toBeTruthy();
    expect(screen.queryByText('Итоговые приложения в акте')).toBeNull();
  });

  it('renders checked applications before final signature blocks', () => {
    renderDemoWorkspace({ initialDocumentPreviewOpen: true });

    const previewText = getPreviewText();

    expect(previewText).toContain('Приложения:');
    expect(previewText).toContain('Сертификат соответствия № СТ-ОВ-2026-017 от 12.05.2026');
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
      '4.Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',
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
      '1.К освидетельствованию предъявлены следующие работы:',
      '2.Работы выполнены по проектной документации:',
      '3.При выполнении работ применены:',
      '4.Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним требованиям:',
      '5.Даты:',
      '6.Работы выполнены в соответствии с:',
      '7.Разрешается производство последующих работ по:',
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
    expect(preview.querySelector('.act-page__signature-line-row')).toBeTruthy();
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
      'Монтаж скрытых участков воздуховодов до закрытия теплоизоляцией и облицовкой в осях 1-4 / А-В с отм. +3.200 - +3.850.',
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
    const editedObjectNameDraft = updateDemoAosrDraftField(
      sourceDraft,
      'objectName',
      'Объект только для unit-теста.',
    );
    const revertedObjectNameDraft = resetDraftObjectNameToObjectDefault(
      editedObjectNameDraft,
      demoAosrWorkspace.objectDefaults,
    );
    const editedProjectDocumentationDraft = updateDemoAosrDraftField(
      sourceDraft,
      'projectDocumentation',
      'Проектная документация только для unit-теста.',
    );
    const revertedProjectDocumentationDraft = resetDraftProjectDocumentationToObjectDefault(
      editedProjectDocumentationDraft,
      demoAosrWorkspace.objectDefaults,
    );
    const editedHeaderOrganizationsDraft = moveHeaderOrganizationInDraft(
      sourceDraft,
      'header-organization-contractor',
      'up',
    );
    const revertedHeaderOrganizationsDraft = resetDraftHeaderOrganizationsToObjectDefault(
      editedHeaderOrganizationsDraft,
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
    expect(isDraftObjectNameFromObjectDefault(sourceDraft, demoAosrWorkspace.objectDefaults)).toBe(
      true,
    );
    expect(editedObjectNameDraft.objectName).toBe('Объект только для unit-теста.');
    expect(
      isDraftObjectNameFromObjectDefault(editedObjectNameDraft, demoAosrWorkspace.objectDefaults),
    ).toBe(false);
    expect(revertedObjectNameDraft.objectName).toBe(demoAosrWorkspace.objectDefaults.objectName);
    expect(
      isDraftProjectDocumentationFromObjectDefault(sourceDraft, demoAosrWorkspace.objectDefaults),
    ).toBe(true);
    expect(editedProjectDocumentationDraft.projectDocumentation).toBe(
      'Проектная документация только для unit-теста.',
    );
    expect(
      isDraftProjectDocumentationFromObjectDefault(
        editedProjectDocumentationDraft,
        demoAosrWorkspace.objectDefaults,
      ),
    ).toBe(false);
    expect(revertedProjectDocumentationDraft.projectDocumentation).toBe(
      demoAosrWorkspace.objectDefaults.defaultProjectDocumentation,
    );
    expect(
      isDraftHeaderOrganizationsFromObjectDefault(sourceDraft, demoAosrWorkspace.objectDefaults),
    ).toBe(true);
    expect(editedHeaderOrganizationsDraft.headerOrganizations[0]?.label).toBe('Подрядчик');
    expect(
      isDraftHeaderOrganizationsFromObjectDefault(
        editedHeaderOrganizationsDraft,
        demoAosrWorkspace.objectDefaults,
      ),
    ).toBe(false);
    expect(revertedHeaderOrganizationsDraft.headerOrganizations[0]?.label).toBe('Заказчик');
    expect(demoAosrWorkspace.objectDefaults.defaultComplianceStatement).toContain('ГОСТ');
    expect(demoAosrWorkspace.objectDefaults.defaultComplianceStatement).toContain('ТУ');
  });

  it('adds material certificate selections without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[1];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть второй черновик.');
    }

    const editedDraft = addMaterialCertificateToDraft(sourceDraft, {
      certificateNumber: 'ДС-ИЗ-2026-04',
      documentName: 'Декларация о соответствии № ДС-ИЗ-2026-04 от 20.05.2026',
      id: 'certificate-insulation-001',
      materialName: 'Теплоизоляционные маты ИЗ-50',
    });

    expect(editedDraft.materialCertificateIds).toContain('certificate-insulation-001');
    expect(editedDraft.materialCertificateSnapshots).toContainEqual(
      expect.objectContaining({
        id: 'certificate-insulation-001',
        materialName: 'Теплоизоляционные маты ИЗ-50',
      }),
    );
    expect(sourceDraft.materialCertificateIds).not.toContain('certificate-insulation-001');
    expect(sourceDraft.materialCertificateSnapshots).not.toContainEqual(
      expect.objectContaining({ id: 'certificate-insulation-001' }),
    );
    expect(editedDraft).not.toBe(sourceDraft);
  });

  it('adds object document selections without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[1];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть второй черновик.');
    }

    const editedDraft = addObjectDocumentToDraft(sourceDraft, {
      documentDate: '2026-06-01',
      id: 'object-document-drawing-node-02',
      reference: 'ИЧ-ОВ-02',
      title: 'Исполнительный чертеж. Узел прохода воздуховодов через перекрытие',
      type: 'Исполнительный чертеж',
    });

    expect(editedDraft.objectDocumentIds).toContain('object-document-drawing-node-02');
    expect(editedDraft.objectDocumentSnapshots).toContainEqual(
      expect.objectContaining({
        id: 'object-document-drawing-node-02',
        reference: 'ИЧ-ОВ-02',
      }),
    );
    expect(sourceDraft.objectDocumentIds).not.toContain('object-document-drawing-node-02');
    expect(sourceDraft.objectDocumentSnapshots).not.toContainEqual(
      expect.objectContaining({ id: 'object-document-drawing-node-02' }),
    );
    expect(editedDraft).not.toBe(sourceDraft);
  });

  it('uses snapshots per selected material and document while falling back for legacy ids', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('В демо-рабочей области должен быть первый черновик.');
    }

    const legacyAwareDraft: DemoAosrDraft = {
      ...sourceDraft,
      materialCertificateIds: ['certificate-legacy-001', 'certificate-current-001'],
      materialCertificateSnapshots: [
        {
          certificateNumber: 'СТ-ТЕКУЩИЙ-1',
          documentName: 'Snapshot certificate document',
          id: 'certificate-current-001',
          materialName: 'Snapshot material',
        },
      ],
      objectDocumentIds: ['object-document-legacy-001', 'object-document-current-001'],
      objectDocumentSnapshots: [
        {
          documentDate: '2026-06-16',
          id: 'object-document-current-001',
          reference: 'SNAP-1',
          title: 'Snapshot object document',
          type: 'Другое',
        },
      ],
    };

    expect(
      getDraftMaterialCertificates(legacyAwareDraft, [
        {
          certificateNumber: 'СТ-СТАРЫЙ-1',
          documentName: 'Legacy fallback certificate document',
          id: 'certificate-legacy-001',
          materialName: 'Legacy fallback material',
        },
      ]).map(({ materialName }) => materialName),
    ).toEqual(['Legacy fallback material', 'Snapshot material']);
    expect(
      getDraftObjectDocuments(legacyAwareDraft, [
        {
          documentDate: '2026-06-15',
          id: 'object-document-legacy-001',
          reference: 'LEG-1',
          title: 'Legacy fallback object document',
          type: 'Другое',
        },
      ]).map(({ title }) => title),
    ).toEqual(['Legacy fallback object document', 'Snapshot object document']);
  });

  it('adds configurable header blocks without mutating section templates', () => {
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

  it('moves header organization blocks without mutating section templates', () => {
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
      defaultComplianceStatement: 'Новый текст соответствия по умолчанию.',
      defaultProjectDocumentation: 'Новая проектная документация по умолчанию.',
      headerOrganizations: [
        ...demoAosrWorkspace.objectDefaults.headerOrganizations.slice(1),
        getRequiredElement(demoAosrWorkspace.objectDefaults.headerOrganizations, 0),
      ],
      objectName: 'Новый объект по умолчанию.',
    };
    const draft = createEmptyDemoAosrDraft({
      actNumber: 'ОВ-defaults',
      id: 'aosr-draft-default-copy-test',
      objectDefaults,
    });

    expect(draft.complianceStatement).toBe(objectDefaults.defaultComplianceStatement);
    expect(draft.projectDocumentation).toBe(objectDefaults.defaultProjectDocumentation);
    expect(draft.objectName).toBe(objectDefaults.objectName);
    expect(draft.headerOrganizations.map(({ id }) => id)).toEqual(
      objectDefaults.headerOrganizations.map(({ id }) => id),
    );
    expect(draft.headerOrganizations).not.toBe(objectDefaults.headerOrganizations);
    expect(draft.formVariantTitle).toBe('АОСР 1');
    expect(draft.formVariantPrintTitle).toBe('ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ');
    expect(draft.actNumber).toBe('ОВ-defaults');
  });
});

interface RenderDemoWorkspaceOptions {
  readonly initialDocumentPreviewOpen?: boolean;
  readonly previewModeForTests?: 'auto' | 'html-fallback-for-tests-only';
}

function renderDemoWorkspace({
  initialDocumentPreviewOpen = false,
  previewModeForTests = 'html-fallback-for-tests-only',
}: RenderDemoWorkspaceOptions = {}): void {
  render(
    <DemoStoreProvider>
      <DemoAosrWorkspacePage
        initialDocumentPreviewOpen={initialDocumentPreviewOpen}
        previewModeForTests={previewModeForTests}
      />
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
  const openButton = screen.queryByRole('button', { name: 'Шаблонные значения' });

  if (openButton !== null) {
    await user.click(openButton);
  }
}

async function switchCurrentActToManualTemplate(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

  await user.click(screen.getByRole('button', { name: 'Редактировать только для этого акта' }));

  expect(confirmSpy).toHaveBeenCalledWith(
    'Этот акт станет ручной версией. Шаблонные значения больше не будут обновлять этот акт. Изменения будут действовать только здесь.',
  );
}

async function addRepresentativeAssignmentFromAct(
  user: ReturnType<typeof userEvent.setup>,
  representative: RepresentativeAssignmentInput,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Создать представителя и назначение' }));
  await user.type(screen.getByLabelText('Группа / роль в ручной версии'), representative.roleLabel);
  await user.type(screen.getByLabelText('ФИО представителя'), representative.fullName);
  await user.type(screen.getByLabelText('Должность в ручной версии'), representative.position);
  await user.type(
    screen.getByLabelText('Организация в ручной версии'),
    representative.organization,
  );
  await user.type(
    screen.getByLabelText('Основание полномочий в ручной версии'),
    representative.authorityBasis,
  );

  await user.click(screen.getByRole('button', { name: 'Создать и добавить в акт' }));
}

function getPreviewText(): string {
  return getDocumentPreview().textContent;
}

function getDocumentPreview(): HTMLElement {
  const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });

  return within(drawer).getByLabelText('Тестовый HTML fallback АОСР');
}

function getTextAreaValue(element: HTMLElement): string {
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error('В тесте ожидалось текстовое поле.');
  }

  return element.value;
}

function getSectionByHeading(heading: string): HTMLElement {
  const headingElement = screen.queryByRole('heading', { name: heading });
  const section =
    headingElement?.closest('.form-section') ?? screen.getByRole('region', { name: heading });

  return section as HTMLElement;
}

function getTemplateSection(name: string): HTMLDetailsElement {
  const section = screen.getByRole('region', { name });
  const details = section.querySelector('details');

  if (!(details instanceof HTMLDetailsElement)) {
    throw new Error(`В тесте ожидается сворачиваемая секция "${name}".`);
  }

  return details;
}

function getInputValue(element: HTMLElement): string {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('В тесте ожидалось однострочное поле.');
  }

  return element.value;
}

function getRequiredElement<TElement>(elements: readonly TElement[], index: number): TElement {
  const element = elements[index];

  if (element === undefined) {
    throw new Error(`Expected element at index ${String(index)}.`);
  }

  return element;
}
