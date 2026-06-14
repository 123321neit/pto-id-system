// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from './App.js';
import {
  buildFinalPackageModel,
  buildFinalPackageReadiness,
  buildIdPackageOverviewModel,
} from './app-shell/object-final-package-model.js';
import { demoAosrWorkspace, type DemoAosrDraft } from './aosr-demo/demo-aosr-workspace.js';
import { initialDemoCertificates, initialDemoObjectDocuments } from './demo-store/demo-store.js';

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
    expect(screen.queryByRole('heading', { name: 'Документы периода' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Предпросмотр документа' })).toBeNull();
    expect(screen.queryByLabelText('Демо-предпросмотр печатной формы АОСР')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Назад к объектам' }));

    expect(screen.getByRole('heading', { name: 'Мои объекты' })).toBeTruthy();
    expect(screen.getByText('Реконструкция поликлиники, демонстрационный проект')).toBeTruthy();
  });

  it('creates an AOSR draft from overview and updates derived object counts', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    const overviewMetrics = screen.getByLabelText('Ключевые показатели объекта');
    expect(within(overviewMetrics).getByLabelText('Документы в периодах: 2')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Использовано сертификатов: 3')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Документы объекта: 8')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Представители: 6')).toBeTruthy();

    expect(screen.getByRole('heading', { name: 'Периоды работ' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Документы в периодах' })).toBeTruthy();
    expect(screen.getByText('ОВ-1')).toBeTruthy();

    await user.click(getFirstCreateDocumentButton());

    let selector = screen.getByRole('dialog', { name: 'Создать документ' });
    expect(within(selector).getByText('АОСР — Акт освидетельствования скрытых работ')).toBeTruthy();
    expect(selector.textContent).toContain('Сентябрь 2026');
    expect(selector.textContent).toContain('Предлагаемый номер: ОВ-3');
    let documentNumberInput = within(selector).getByLabelText<HTMLInputElement>('Номер документа');
    expect(documentNumberInput.value).toBe('ОВ-3');
    expect(selector.textContent).toContain(
      'Автонумерация работает как подсказка: номер можно изменить вручную перед созданием.',
    );
    expect(within(selector).getByText('ОВ-{n}')).toBeTruthy();
    expect(within(selector).getByText('12-{n}-ОВ')).toBeTruthy();
    expect(within(selector).getByText('АОСР/{YYYY}/{n}')).toBeTruthy();
    expect(within(selector).getByText(/нумерацию по объекту или заново в периоде/u)).toBeTruthy();
    expect(within(selector).getByText('Акт испытаний')).toBeTruthy();
    expect(within(selector).getAllByRole('button', { name: 'Скоро' })).toHaveLength(2);

    await user.clear(documentNumberInput);
    await user.type(documentNumberInput, 'ОВ-черновик');
    expect(documentNumberInput.value).toBe('ОВ-черновик');
    await user.click(within(selector).getByRole('button', { name: 'Закрыть' }));

    await user.click(getFirstCreateDocumentButton());
    selector = screen.getByRole('dialog', { name: 'Создать документ' });
    documentNumberInput = within(selector).getByLabelText<HTMLInputElement>('Номер документа');
    expect(documentNumberInput.value).toBe('ОВ-3');

    await user.clear(documentNumberInput);
    await user.type(documentNumberInput, '12-3-ОВ');

    await user.click(within(selector).getByRole('button', { name: 'Создать документ' }));

    expect(screen.getAllByText(/Периоды \/ АОСР/u).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByLabelText('Текущий документ: 12-3-ОВ')).toBeTruthy();
    expect(screen.getByDisplayValue('12-3-ОВ')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();

    await openDocumentPreview(user);
    expect(getDocumentPreview()).toBeTruthy();

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

    await user.click(within(objectNavigation).getByRole('button', { name: 'Обзор' }));

    const updatedOverviewMetrics = screen.getByLabelText('Ключевые показатели объекта');
    expect(within(updatedOverviewMetrics).getByLabelText('Документы в периодах: 3')).toBeTruthy();
    expect(screen.getByText('12-3-ОВ')).toBeTruthy();

    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть итоговый комплект ИД' }),
    );

    const finalSummary = screen.getByLabelText('Сводка итогового комплекта ИД');
    expect(within(finalSummary).getByLabelText('Документы из периодов: 3')).toBeTruthy();
    expect(within(finalSummary).getByLabelText('Всего позиций: 10')).toBeTruthy();
  });

  it('creates an AOSR draft with an empty manual number without blocking the editor', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());
    await user.click(getFirstCreateDocumentButton());

    const selector = screen.getByRole('dialog', { name: 'Создать документ' });
    const documentNumberInput =
      within(selector).getByLabelText<HTMLInputElement>('Номер документа');
    expect(documentNumberInput.value).toBe('ОВ-3');

    await user.clear(documentNumberInput);
    expect(documentNumberInput.value).toBe('');
    await user.click(within(selector).getByRole('button', { name: 'Создать документ' }));

    expect(screen.getAllByText(/Периоды \/ АОСР/u).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Номер акта').value).toBe('');
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
  });

  it('renders object workspace navigation and keeps object-wide metrics on the overview', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    expect(within(objectNavigation).getByRole('button', { name: 'Обзор' })).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Периоды' })).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Сентябрь 2026' })).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Октябрь 2026' })).toBeTruthy();
    expect(
      within(objectNavigation).queryByRole('button', { name: /сертификаты объекта/iu }),
    ).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: 'Сертификаты' })).toBeNull();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть документы объекта' }),
    ).toBeTruthy();
    expect(within(objectNavigation).getByRole('button', { name: 'Представители' })).toBeTruthy();
    expect(within(objectNavigation).queryByRole('button', { name: 'Акты' })).toBeNull();
    expect(within(objectNavigation).queryByRole('button', { name: 'АОСР' })).toBeNull();
    expect(
      within(objectNavigation).queryByRole('button', { name: 'Открыть реестр ИД' }),
    ).toBeNull();
    expect(
      within(objectNavigation).getByRole('button', { name: 'Открыть итоговый комплект ИД' }),
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

    expect(screen.queryByLabelText('Показатели открытого объекта')).toBeNull();

    const objectMetadata = screen.getByLabelText('Метаданные объекта');
    expect(within(objectMetadata).getByText('Открыт раздел')).toBeTruthy();
    expect(within(objectMetadata).getByText('Обзор')).toBeTruthy();
    expect(within(objectMetadata).getByText('Последнее изменение')).toBeTruthy();
    expect(within(objectMetadata).getByText('сегодня')).toBeTruthy();
    expect(within(objectMetadata).queryByText('Документов в объекте')).toBeNull();

    const overviewMetrics = screen.getByLabelText('Ключевые показатели объекта');
    expect(within(overviewMetrics).getByLabelText('Документы в периодах: 2')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Использовано сертификатов: 3')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Документы объекта: 8')).toBeTruthy();
    expect(within(overviewMetrics).getByLabelText('Представители: 6')).toBeTruthy();
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

    await user.click(within(objectNavigation).getByRole('button', { name: 'Сентябрь 2026' }));
    expect(screen.getByRole('heading', { name: 'Сентябрь 2026' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Реестр периода за Сентябрь 2026' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Комплект периода за Сентябрь 2026' })).toBeTruthy();

    await user.click(
      within(objectNavigation).getByRole('button', { name: 'Открыть итоговый комплект ИД' }),
    );
    expect(screen.getByRole('heading', { name: 'Итоговая ИД по объекту' })).toBeTruthy();
    expect(
      screen.getByText(
        'Итоговая ИД собирается из всех периодов, документов объекта и сертификатов, использованных в документах, без дублей.',
      ),
    ).toBeTruthy();
  });

  it('opens a period with documents and registry/package placeholders', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'Октябрь 2026' }));

    expect(screen.getByRole('heading', { name: 'Октябрь 2026' })).toBeTruthy();
    expect(screen.getByText('ОВ-2')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Реестр периода за Октябрь 2026' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Комплект периода за Октябрь 2026' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /ОВ-2/u }));

    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByLabelText('Текущий документ: ОВ-2')).toBeTruthy();
  });

  it('creates an AOSR draft inside the selected period and shows it in that period tree', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });
    await user.click(within(objectNavigation).getByRole('button', { name: 'Октябрь 2026' }));

    await user.click(screen.getByRole('button', { name: 'Создать документ' }));

    const selector = screen.getByRole('dialog', { name: 'Создать документ' });
    expect(selector.textContent).toContain('Октябрь 2026');
    expect(selector.textContent).toContain('Предлагаемый номер: ОВ-3');
    expect(within(selector).getByLabelText<HTMLInputElement>('Номер документа').value).toBe('ОВ-3');

    await user.click(within(selector).getByRole('button', { name: 'Создать документ' }));

    expect(screen.getByLabelText('Текущий документ: ОВ-3')).toBeTruthy();
    expect(screen.getAllByText('Октябрь 2026').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('ОВ-3')).toBeTruthy();
    expect(screen.getByRole('button', { name: /ОВ-3/u })).toBeTruthy();

    await user.click(within(objectNavigation).getByRole('button', { name: 'Октябрь 2026' }));
    expect(screen.getByRole('button', { name: /ОВ-2/u })).toBeTruthy();
    expect(screen.getByRole('button', { name: /ОВ-3/u })).toBeTruthy();

    await user.click(within(objectNavigation).getByRole('button', { name: 'Сентябрь 2026' }));
    expect(screen.getByRole('button', { name: /ОВ-1/u })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /ОВ-3/u })).toBeNull();
  });

  it('opens the final ID package page with derived summary counts and grouped composition', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    const finalPackagePage = screen.getByRole('region', { name: 'Итоговая ИД по объекту' });

    expect(
      within(finalPackagePage).getByRole('heading', { name: 'Итоговая ИД по объекту' }),
    ).toBeTruthy();
    expect(
      within(finalPackagePage).getByText(
        'Итоговая ИД собирается из всех периодов, документов объекта и сертификатов, использованных в документах, без дублей.',
      ),
    ).toBeTruthy();
    expect(
      within(finalPackagePage).getByRole('heading', {
        name: 'Периодическая ИД → Итоговая ИД',
      }),
    ).toBeTruthy();
    expect(within(finalPackagePage).getByText('все документы из периодов;')).toBeTruthy();
    expect(
      within(finalPackagePage).getByText('все использованные сертификаты без дублей;'),
    ).toBeTruthy();
    expect(
      within(finalPackagePage).getByText(
        'все использованные чертежи и документы объекта без дублей;',
      ),
    ).toBeTruthy();
    expect(within(finalPackagePage).getByText('итоговый реестр.')).toBeTruthy();

    const septemberPackage = within(finalPackagePage).getByLabelText('Состав пакета Сентябрь 2026');
    expect(within(septemberPackage).getByLabelText('Документы: 1')).toBeTruthy();
    expect(within(septemberPackage).getByLabelText('Использовано сертификатов: 2')).toBeTruthy();
    expect(within(septemberPackage).getByLabelText('Документы объекта: 2')).toBeTruthy();

    const octoberPackage = within(finalPackagePage).getByLabelText('Состав пакета Октябрь 2026');
    expect(within(octoberPackage).getByLabelText('Документы: 1')).toBeTruthy();
    expect(within(octoberPackage).getByLabelText('Использовано сертификатов: 1')).toBeTruthy();
    expect(within(octoberPackage).getByLabelText('Документы объекта: 1')).toBeTruthy();

    const summary = within(finalPackagePage).getByLabelText('Сводка итогового комплекта ИД');
    expect(within(summary).getByLabelText('Документы из периодов: 2')).toBeTruthy();
    expect(within(summary).getByLabelText('Сертификаты без дублей: 3')).toBeTruthy();
    expect(within(summary).getByLabelText('Документы / чертежи без дублей: 3')).toBeTruthy();
    expect(within(summary).getByLabelText('Всего позиций: 9')).toBeTruthy();

    const readinessCard = within(finalPackagePage).getByRole('region', {
      name: 'Проверка комплекта',
    });
    expect(within(readinessCard).getByText('🟢 Поля заполнены')).toBeTruthy();
    expect(
      within(readinessCard).getByText(
        'Пустые поля не блокируют печать: в печатной форме будут оставлены строки для заполнения от руки.',
      ),
    ).toBeTruthy();
    expect(within(readinessCard).getByText('Пробелов по демо-проверкам нет.')).toBeTruthy();

    expect(within(finalPackagePage).getByRole('heading', { name: 'Реестр ИД' })).toBeTruthy();
    expect(
      within(finalPackagePage).getByRole('heading', { name: 'Документы из периодов' }),
    ).toBeTruthy();
    expect(within(finalPackagePage).getByRole('heading', { name: 'Сертификаты' })).toBeTruthy();
    expect(
      within(finalPackagePage).getByRole('heading', { name: 'Документы объекта' }),
    ).toBeTruthy();
    expect(
      within(finalPackagePage).getByText('Итоговый реестр исполнительной документации'),
    ).toBeTruthy();
    expect(within(finalPackagePage).getByText('ОВ-1')).toBeTruthy();
    expect(within(finalPackagePage).getByText('СТ-ОВ-2026-017')).toBeTruthy();
    expect(within(finalPackagePage).getByText('ИС-ОВ-04')).toBeTruthy();
  });

  it('builds the frontend-only periodic and final ID package overview model', () => {
    const packageOverview = buildIdPackageOverviewModel(
      demoAosrWorkspace.drafts,
      initialDemoObjectDocuments,
      initialDemoCertificates,
    );

    expect(packageOverview.periodicPackages).toHaveLength(2);
    expect(packageOverview.periodicPackages[0]?.type).toBe('periodic');
    expect(packageOverview.periodicPackages[0]?.periodName).toBe('Сентябрь 2026');
    expect(packageOverview.periodicPackages[0]?.summary).toEqual({
      acts: 1,
      objectDocuments: 2,
      usedCertificates: 2,
    });
    expect(packageOverview.periodicPackages[1]?.periodName).toBe('Октябрь 2026');
    expect(packageOverview.periodicPackages[1]?.summary).toEqual({
      acts: 1,
      objectDocuments: 1,
      usedCertificates: 1,
    });
    expect(packageOverview.finalPackage).toMatchObject({
      title: 'Итоговая ИД по объекту',
      type: 'final',
    });
    expect(packageOverview.finalPackage.summary).toEqual({
      acts: 2,
      objectDocuments: 3,
      usedCertificates: 3,
    });
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

    const finalPackage = buildFinalPackageModel(
      duplicateDrafts,
      initialDemoObjectDocuments,
      initialDemoCertificates,
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
    expect(readiness.statusLabel).toBe('🟡 Есть пустые разделы');
    expect(readiness.issues).toEqual([
      'Нет документов периода',
      'Нет сертификатов',
      'Нет документов объекта',
    ]);
  });

  it('keeps the final ID package download action disabled in demo mode', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    const downloadButton = screen.getByRole('button', { name: 'Скачать итоговую ИД' });
    expect((downloadButton as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText(
        'В демо режиме скачивание не выполняется. Позже здесь будет сборка PDF/DOCX/ZIP комплекта.',
      ),
    ).toBeTruthy();
  });

  it('navigates from the final ID package page back to AOSR', async () => {
    const user = userEvent.setup();

    render(<App />);
    await openObjectFinalPackagePage(user);

    await openSeptemberAosrDocument(user);

    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Рабочая область акта' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Предпросмотр документа' })).toBeTruthy();
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

  it('navigates from a period placeholder back into its AOSR document', async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getFirstOpenObjectButton());

    const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

    await user.click(within(objectNavigation).getByRole('button', { name: 'Сентябрь 2026' }));
    expect(screen.getByRole('heading', { name: 'Реестр периода за Сентябрь 2026' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Комплект периода за Сентябрь 2026' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /ОВ-1/u }));

    expect(screen.getByRole('heading', { name: 'Документы периода' })).toBeTruthy();
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

    await user.click(screen.getByRole('button', { name: 'Вернуться к обзору' }));

    expect(screen.getByRole('heading', { name: 'Обзор объекта' })).toBeTruthy();
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
    await user.click(screen.getByRole('button', { name: 'Открыть настройки объекта' }));
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
    await user.type(screen.getByLabelText('Добавить назначение представителя в акт'), 'яковлев');

    const signatoryPicker = screen.getByRole('list', {
      name: 'Назначения представителей для текущего акта',
    });
    const representativeRow = within(signatoryPicker)
      .getByText('Яковлев Я.Я.')
      .closest('.library-row');

    if (representativeRow === null) {
      throw new Error('В тесте ожидается строка нового представителя.');
    }

    await user.click(
      within(representativeRow as HTMLElement).getByRole('button', {
        name: 'Добавить назначение',
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

    await user.type(screen.getByLabelText('Добавить назначение представителя в акт'), 'заказчика');

    const objectPicker = screen.getByRole('list', {
      name: 'Назначения представителей для текущего акта',
    });
    const customerRow = within(objectPicker).getByText('Кузнецова А.А.').closest('.library-row');

    if (customerRow === null) {
      throw new Error('В тесте ожидается строка представителя объекта.');
    }

    await user.click(
      within(customerRow as HTMLElement).getByRole('button', { name: 'Добавить назначение' }),
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

function getFirstCreateDocumentButton(): HTMLElement {
  const [createButton] = screen.getAllByRole('button', { name: 'Создать документ' });

  if (createButton === undefined) {
    throw new Error('На обзоре объекта должна быть кнопка создания документа.');
  }

  return createButton;
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
  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(within(objectNavigation).getByRole('button', { name: 'Сентябрь 2026' }));
  await user.click(screen.getByRole('button', { name: /ОВ-1/u }));
}

async function openObjectFinalPackagePage(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(getFirstOpenObjectButton());

  const objectNavigation = screen.getByRole('navigation', { name: 'Разделы объекта' });

  await user.click(
    within(objectNavigation).getByRole('button', { name: 'Открыть итоговый комплект ИД' }),
  );
}

async function openDocumentPreview(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Предпросмотр документа' }));
}

function getDocumentPreview(): HTMLElement {
  const drawer = screen.getByRole('dialog', { name: 'Предпросмотр документа' });

  return within(drawer).getByLabelText('Демо-предпросмотр печатной формы АОСР');
}
