# PROJECT_MEMORY
# PTO ID SYSTEM
# EXECUTIVE DOCUMENTATION PLATFORM
# MASTER CONTEXT / SOURCE OF TRUTH
# VERSION: 2026-05-23-CONSOLIDATED
# STATUS: ACTIVE SYSTEM ARCHITECTURE DESIGN PHASE
# LANGUAGE: RU

---

## 0. IMPORTANT — HOW TO USE THIS FILE

Этот файл — главный источник контекста проекта **PTO ID System**.

Любой новый чат, Codex, AI-агент, разработчик или подрядчик обязан:

1. Полностью прочитать этот файл перед работой.
2. Считать его главным source of truth по продуктовой и архитектурной логике.
3. Не начинать кодинг, если задача затрагивает нерешённые архитектурные вопросы.
4. Не ломать принятые решения без отдельного ADR.
5. Не подменять систему файловым менеджером, CRM, ERP, BIM или generic document constructor.
6. Задавать вопросы пользователю, если решение влияет на доменную модель исполнительной документации.
7. Спорить с пользователем, если запрос создаёт архитектурный риск.

Текущая стадия проекта:

```text
SYSTEM ARCHITECTURE DESIGN
```

Проект **не находится на стадии быстрого кодинга MVP**. Главная цель текущего этапа — спроектировать production-ready архитектуру SaaS-системы исполнительной документации для инженеров ПТО.

---

## 1. Product idea

**PTO ID System** — web-система автоматизации исполнительной документации для инженеров ПТО.

Основной фокус MVP:

- ОВиК;
- ВК;
- российская исполнительная документация;
- АОСР;
- акты испытаний;
- сертификаты;
- исполнительные схемы;
- реестры;
- комплекты исполнительной документации.

Система создаётся как коммерческий SaaS-продукт.

Главная бизнес-цель:

```text
максимально сократить ручную работу инженера ПТО
```

Продукт должен не просто хранить файлы, а понимать доменную структуру исполнительной документации: объекты, папки, акты, сертификаты, схемы, реестры, комплекты, подписантов, шаблоны, версии, нумерацию и зависимости между документами.

---

## 2. Core product philosophy

Главный принцип системы:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

Source of truth — это НЕ:

- DOCX;
- PDF;
- файлы;
- Word-шаблоны;
- распечатанные комплекты;
- ручной Excel/Word-реестр.

Source of truth — это:

- структурированные сущности;
- связи между сущностями;
- нормализованные данные;
- версии документов;
- версии шаблонов;
- snapshots;
- domain rules;
- audit/activity history;
- validated metadata.

DOCX, PDF, ZIP, печатные формы и итоговые комплекты являются **generated artifacts**.

Они должны:

- генерироваться из structured data;
- пересобираться при изменении данных;
- не становиться главным источником данных;
- не быть единственным местом хранения смысла документа.

Это фундаментальное архитектурное решение. Его нельзя ломать.

---

## 3. What the system does

Система должна:

- создавать объекты строительства;
- хранить бизнес-папочную структуру объекта;
- создавать и редактировать АОСР;
- создавать и редактировать акты испытаний;
- хранить сертификаты, декларации, паспорта, письма и другие документы качества;
- хранить исполнительные схемы как PDF/файлы + structured metadata;
- автоматически вести реестры;
- автоматически собирать комплекты ИД;
- автоматически нумеровать документы;
- поддерживать перенос и дублирование документов/папок;
- генерировать DOCX/PDF;
- поддерживать шаблоны документов;
- поддерживать immutable versioning шаблонов;
- поддерживать live preview документов;
- поддерживать autosave;
- поддерживать document locks;
- поддерживать warnings/errors validation;
- поддерживать библиотеку компаний;
- поддерживать object-level company snapshots;
- поддерживать библиотеку представителей;
- поддерживать OCR/AI-анализ сертификатов в будущем;
- поддерживать OCR/AI-анализ исполнительных схем в будущем;
- помогать искать сертификаты и документы;
- предупреждать о просроченных сертификатах;
- давать быстрый document-centric UX.

---

## 4. What the system is not

Система НЕ является:

- ERP;
- BIM;
- CAD;
- полноценным корпоративным документооборотом;
- enterprise monster software;
- универсальным конструктором любых документов;
- Google Docs;
- collaborative editor;
- CRM;
- файловым менеджером;
- простым облачным хранилищем;
- системой, где пользователь вручную ведёт Word/Excel как главный источник истины.

Главный приоритет:

```text
простота + скорость + document-centric UX + автоматизация рутины ПТО
```

---

## 5. Product principles

### 5.1 Structured data first

Каждый документ должен иметь понятную structured модель. Даже если физически часть payload хранится в JSONB, это не должен быть бесконтрольный JSON blob.

### 5.2 Typed documents, not generic documents

Документ имеет immutable type: AOSR, TEST_ACT, TECHNICAL_READYNESS_ACT и т.п. Документ нельзя превратить из одного типа в другой.

Причина: тип документа определяет schema, validation, preview, DOCX generation, registry projection, package builder и search contracts.

### 5.3 Registry is derived projection

Реестр не является самостоятельным editable Word-документом. Реестр — производная проекция из данных объекта, компании, сертификатов, актов, схем и override layer.

### 5.4 DOCX/PDF are generated artifacts

DOCX/PDF генерируются из данных. Редактирование generated DOCX вручную не должно становиться основным workflow.

### 5.5 Object/company snapshot

Изменение карточки компании не должно менять старые объекты. При создании объекта данные компании копируются в ObjectCompanySnapshot.

### 5.6 AI is assistant only

OCR/AI может предлагать значения, но не должен auto-approve критические данные. Пользователь подтверждает извлечённые данные.

### 5.7 Simple UX over enterprise complexity

Система должна быть быстрой и понятной для ПТО, а не перегруженной корпоративной логикой.

---

## 6. Users and roles

### 6.1 admin

Полный доступ.

Видит:

- пользователей;
- tenants;
- объекты;
- системные настройки;
- глобальные шаблоны;
- системные справочники.

### 6.2 PTO

Основной пользователь.

Может:

- создавать объекты;
- создавать папки;
- создавать документы;
- редактировать документы;
- загружать сертификаты;
- загружать исполнительные схемы;
- вести библиотеку компаний;
- вести библиотеку представителей;
- собирать комплекты ИД;
- управлять шаблонами объекта, если разрешено.

### 6.3 foreman

Упрощённая роль.

Может:

- создавать документы;
- редактировать ограниченный набор данных;
- загружать файлы;
- просматривать документацию.

Точные права требуют отдельного RBAC-дизайна.

---

## 7. Multi-tenancy

Критически важное решение:

```text
isolated tenant architecture
```

Каждый пользователь/tenant имеет логически изолированные данные.

Другие пользователи не видят:

- объекты;
- документы;
- сертификаты;
- исполнительные схемы;
- компании;
- представителей;
- комплекты;
- шаблоны объекта.

Исключение: admin.

Это не collaborative workspace между компаниями. Архитектура должна с самого начала учитывать `tenant_id` во всех ключевых сущностях.

---

## 8. Core hierarchy

Пользовательская структура:

```text
Object
  → Folder Tree
      → Documents
      → Executive Schemes
      → Packages / Registry projections
```

Архитектурно важно:

- Object не должен становиться giant aggregate;
- Folder не должен владеть жизненным циклом документа;
- Documents — отдельные aggregate roots;
- Certificates — отдельные library aggregates;
- Registry — derived projection;
- Package Builder — отдельный bounded context/aggregate;
- Templates — отдельный контекст.

---

## 9. Object

Object — главный контейнер строительного проекта.

Содержит/связывает:

- настройки объекта;
- папочную структуру;
- numbering settings;
- representatives bindings;
- template bindings;
- ObjectCompanySnapshot;
- документы;
- исполнительные схемы;
- package settings;
- registry settings;
- project drawing sets.

Object имеет собственную изоляцию данных внутри tenant.

Object не должен хранить все документы внутри себя как вложенный giant aggregate.

---

## 10. Folder tree

Folder — это не файловая папка, а business collection node.

Поддерживается:

- nested tree;
- drag & drop;
- move;
- duplicate;
- copy;
- soft delete;
- folder-level grouping;
- потенциально folder-level numbering scope.

Пример:

```text
ОВ
 └── 2025
      ├── Октябрь
      └── Ноябрь
```

Folder rules:

- folder принадлежит одному object;
- может иметь parent;
- может иметь children;
- может содержать documents через `folder_id`;
- parent folder не может быть из другого object;
- cycles запрещены;
- folder move не должен ломать object isolation.

Удаление folder: soft delete only. Удаление папки логически удаляет children/documents, но через trash/soft delete.

---

## 11. Folder duplication

Критически важная business feature.

Пользователь хочет дублировать месяцы/периоды:

```text
Октябрь → Ноябрь
```

При duplicate можно:

- копировать структуру;
- копировать документы;
- копировать связи;
- копировать numbering;
- копировать даты;
- сбрасывать даты;
- продолжать numbering;
- начинать numbering заново;
- копировать linked certificate refs;
- копировать placeholders;
- сбрасывать статусы.

Нужны clone strategies:

- `copy_documents`;
- `copy_dates`;
- `copy_numbering`;
- `copy_links`;
- `copy_certificate_refs`;
- `reset_statuses`;
- `reset_dates`;
- `renumber`.

Это не файловая логика. Это business cloning logic.

---

## 12. Document model

Принято решение:

```text
Document = typed domain model + structured payload + rendering contract
```

Документ имеет immutable type.

Примеры типов:

- `AOSR` — акт освидетельствования скрытых работ;
- `TEST_ACT` — акт испытаний;
- `TECHNICAL_READINESS_ACT` — акт технической готовности;
- `INSPECTION_ACT`;
- другие типы исполнительной документации.

Документ нельзя превратить в другой тип. Если нужен другой документ — создаётся новый.

Причина: иначе ломаются schema, templates, validation, registry generation, package builder, search и future AI extraction contracts.

Документ должен иметь:

- `document_id`;
- `tenant_id`;
- `object_id`;
- `folder_id`;
- `document_type`;
- `status`;
- `numbering`;
- `date`;
- `payload` typed schema;
- `linked_certificate_ids`;
- `linked_scheme_ids`;
- `representative snapshots/refs`;
- `template_version_id`;
- `revision`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

---

## 13. Document statuses

Статусы:

- `draft`;
- `final`;
- `archived`;
- `deleted`.

`draft` может быть невалидным.

`final` означает validated published revision.

Важно:

```text
final != immutable
```

Пользователь может редактировать final document.

При изменении final document:

- `revision++`;
- validation пересчитывается;
- affected package snapshots invalidated;
- package regeneration required.

Причина: в реальной ПТО-практике акты после “готовности” часто исправляются.

---

## 14. Draft and autosave

Документы редко создаются за один раз.

Нужен draft mode:

- пользователь начал документ;
- отвлёкся;
- закрыл браузер;
- вернулся позже;
- продолжил заполнение.

Autosave model:

```text
snapshot-based autosave
```

Autosave сохраняет полное состояние draft/document payload.

Patch-based editing, operational editing и CRDT не используются на старте.

Причины:

- нет collaborative editing;
- один активный редактор;
- snapshot проще и надёжнее;
- ПТО не должны терять документы.

Manual save также нужен.

---

## 15. Document locks

Система не является multi-user collaborative editor.

Можно:

- открыть документ;
- просматривать;
- скачивать;
- смотреть preview;
- смотреть комплекты.

Нельзя:

- одновременно редактировать один и тот же документ.

При нажатии “Редактировать” создаётся application-level document lock.

Lock содержит:

- `document_id`;
- `user_id`;
- `session_id`;
- `locked_at`;
- `expires_at`;
- `heartbeat_at`.

Lock имеет TTL, heartbeat и automatic expiration.

Рекомендованный inactivity timeout: 15 минут.

Не использовать database locks типа `SELECT FOR UPDATE` для пользовательского редактирования.

DocumentLock не должен быть частью Document Aggregate, потому что heartbeat не должен увеличивать revision документа.

---

## 16. Live preview

Live preview — критически важная UX feature.

Пользователь должен видеть документ в реальном времени. При изменении поля акт визуально обновляется.

Но preview не должен генерироваться через DOCX.

Правильная архитектура:

```text
Structured Data
  → HTML Preview Renderer
  → DOCX Generator
  → PDF Export / Package Build
```

Preview renderer и DOCX generator — разные слои.

DOCX/PDF генерируются только:

- при export;
- при package build;
- при finalization, если это нужно;
- при snapshot generation.

---

## 17. UX philosophy

Инженер ПТО думает не таблицами.

Он думает:

- объектами;
- папками;
- актами;
- сертификатами;
- схемами;
- комплектами;
- реестрами.

UI должен быть:

- визуальным;
- быстрым;
- document-centric;
- понятным;
- без enterprise перегруза;
- без CRM-style логики.

Пользователь должен ощущать:

```text
я работаю с комплектом исполнительной документации
```

а не:

```text
я заполняю CRM-таблицу
```

---

## 18. High-level user workflow

### 18.1 Dashboard

Пользователь видит список объектов:

- ЖК Северный;
- ТЦ Грин Парк;
- Школа №12;
- и т.д.

Карточка объекта показывает:

- название;
- статус;
- количество документов;
- warnings;
- последние изменения;
- package status.

### 18.2 Object workspace

Пользователь открывает объект и видит:

- left folder tree;
- central folder content;
- top actions;
- search;
- package builder;
- certificate library access;
- scheme upload;
- object settings.

### 18.3 Folder view

В выбранной папке:

- акты;
- исполнительные схемы;
- packages;
- реестр как projection;
- status indicators.

### 18.4 Document editor

Document editor:

- left/control panel: fields;
- right: live preview;
- autosave state;
- validation warnings;
- linked certificates;
- representatives;
- numbering;
- final/draft status.

---

## 19. AOSR model

АОСР — акт освидетельствования скрытых работ.

Пример был загружен как `Пример.docx`.

Из примера и обсуждения выделена цветовая логика:

### Yellow / object data

Название объекта и другие объектные данные. Вводятся один раз на объект.

### Green / representatives

Подписанты и представители. Вводятся один раз на объект, но могут быть переопределены в документе.

Особенности:

- подстрочный текст должен быть дефолтным, но редактируемым;
- в одном блоке может быть несколько фамилий;
- порядок представителей критически важен;
- возможны global representatives, object representatives и temporary representatives.

### Gray / document number

Номер акта. Автоматическая нумерация.

Поддерживаются:

- prefix;
- sequence;
- suffix;
- rendered_number.

Примеры:

- `ОВ-1`;
- `ОВ-2`;
- `1/12-1`;
- `ПД-1`.

### Purple / document date

Дата акта. По умолчанию текущая дата. Можно массово менять внутри папки.

### Cyan / per-document variable data

Переменные данные, заполняемые в каждом акте отдельно:

- предъявленные работы;
- проектная документация;
- применённые материалы;
- сертификаты;
- разрешение на дальнейшие работы;
- дополнительные сведения;
- приложения.

Для АОСР важно, что сертификаты должны быть ссылками на Certificate Library, а не просто вручную напечатанными номерами.

---

## 20. Numbering engine

Нумерация — одна из центральных частей системы.

Поддерживаются:

- object-scope numbering;
- folder-scope numbering.

Пример:

```text
Октябрь:
ОВ-1
ОВ-2

Ноябрь:
может продолжать numbering
или начинать заново
```

Номер состоит из:

- prefix;
- sequence;
- suffix;
- rendered_number.

Нужен renumber engine.

Документы можно перемещать между папками.

При move система показывает modal:

- сохранить numbering;
- пересчитать numbering.

При пересчёте:

- номер может измениться;
- revision может увеличиться;
- package snapshots invalidated.

---

## 21. Representatives

Поддерживаются:

- global representatives;
- object representatives;
- temporary representatives.

Representative fields:

- organization;
- role;
- subtitle;
- sort_order;
- authority basis;
- contact info, если нужно;
- registry/doc block mapping.

Порядок критически важен.

В одном блоке может быть несколько фамилий.

Temporary representatives создаются только внутри конкретного документа и не обязательно попадают в глобальную библиотеку.

---

## 22. Company Profile Library

Пользователь может работать/подрабатывать на разные компании.

Нужна библиотека компаний пользователя.

CompanyProfile содержит:

- `company_id`;
- `tenant_id`;
- `legal_name`;
- `short_name`;
- `INN`;
- `KPP`;
- `OGRN`;
- `legal_address`;
- `actual_address`;
- `director_full_name`;
- `director_position`;
- `authority_basis`;
- SRO information;
- contacts;
- possibly bank details later;
- timestamps;
- soft delete fields.

Примеры:

- ООО «Десятый трест»;
- ИП;
- другая подрядная компания.

---

## 23. ObjectCompanySnapshot

Критически важное решение.

При создании объекта пользователь выбирает компанию из Company Profile Library.

Данные компании копируются в ObjectCompanySnapshot:

```text
CompanyProfile → ObjectCompanySnapshot → Registry / Documents
```

Изменение карточки компании не должно менять старые объекты.

Причина: историческая неизменность исполнительной документации.

Если через год у компании поменялся директор, старые реестры не должны пересобраться с новым директором.

ObjectCompanySnapshot может включать:

- название организации;
- ИНН;
- КПП;
- ОГРН;
- юридический адрес;
- фактический адрес;
- директор;
- должность;
- основание полномочий;
- СРО;
- contact info;
- work contract data;
- project section data.

---

## 24. Certificate Library

Certificate — shared entity.

Один сертификат может использоваться в нескольких объектах и документах.

Сертификат/документ качества может быть:

- сертификат соответствия;
- декларация о соответствии;
- исходящее письмо;
- отказное письмо;
- паспорт качества;
- технический паспорт;
- информационное письмо;
- другое.

Certificate fields:

- `certificate_id`;
- `tenant_id`;
- `file_id`;
- `document_type`;
- `coverage/material/equipment name`;
- `manufacturer`;
- `issuer`;
- `issue_date`;
- `valid_until`;
- `registration_number`;
- `page_count`;
- `status`;
- `ocr_status`;
- `confirmed_by_user`;
- timestamps;
- soft delete.

Критическое business rule:

```text
Нельзя просто вбить номер сертификата вручную, если сертификата нет в библиотеке.
```

Причина: иначе при package build нечего будет прикладывать.

Сначала сертификат должен существовать физически.

---

## 25. Certificate validation

Сертификат проверяется по дате документа, а не по текущей дате.

Пример:

```text
Если документ создан в 2023,
а сертификат истёк в 2025,
документ остаётся валидным.
```

При создании нового документа:

- если сертификат просрочен на дату документа, система показывает warning;
- warning не блокирует;
- иногда пользователь сознательно использует старые документы.

Validation levels:

- `WARNING` — разрешает продолжить;
- `ERROR` — блокирует.

---

## 26. OCR / AI philosophy

AI = assistant only.

OCR не auto-approve.

Flow:

1. Пользователь загружает сертификат.
2. Сертификат попадает в библиотеку.
3. OCR асинхронно пытается извлечь:
   - номер;
   - дату;
   - срок действия;
   - производителя;
   - материал;
   - issuer;
   - page count.
4. Пользователь подтверждает значения.
5. Только после подтверждения значения становятся active metadata.

---

## 27. ExecutiveScheme

ExecutiveScheme — это:

```text
PDF file + structured metadata
```

На первом этапе metadata вводятся вручную.

Поля:

- `scheme_id`;
- `tenant_id`;
- `object_id`;
- `folder_id`;
- `file_id`;
- `title`;
- `registration_number`;
- `date`;
- `sheet_count`;
- `note`;
- timestamps;
- soft delete.

Позже AI будет извлекать эти данные из схемы.

Исполнительная схема не редактируется как чертёж.

Если схема изменилась, создаётся новая сущность/новый файл.

На старте — не versioning.

---

## 28. ProjectDrawingSet

По анализу реестра нужен отдельный concept:

```text
ProjectDrawingSet
```

Это комплект рабочей документации, а не исполнительная схема.

Пример из реестра:

```text
Наименование: Вентиляция
Шифр: 369-2025-02-ОВ
Количество листов: 13
```

ProjectDrawingSet используется в блоке реестра “Комплект рабочих чертежей”.

Поля:

- object_id;
- company snapshot reference;
- drawing_name;
- drawing_code;
- sheet_count;
- section;
- note.

Нужно решить позже: является ли ProjectDrawingSet отдельным aggregate или частью Object settings.

Предварительно: часть Object/ObjectDocumentationSettings, если использование простое.

---

## 29. Registry model

Реестр был проанализирован на примере `Реестр вентиляция.doc`.

Ключевая структура реестра:

1. Шапка объекта.
2. Перечень исполнителей / подрядных организаций.
3. Комплект рабочих чертежей.
4. Сертификаты, паспорта, декларации, письма и другие документы качества.
5. Акты исполнительной документации.
6. Исполнительные схемы и съёмки.
7. Подписант реестра.

Принято решение:

```text
Registry is NOT an editable standalone document
Registry = derived projection
```

Источники данных:

- Object;
- Object settings;
- ObjectCompanySnapshot;
- Certificate Library;
- Act Documents;
- Executive Schemes;
- ProjectDrawingSet;
- RegistrySignerSnapshot;
- Registry override layer.

Реестр всегда может быть пересобран.

Реестр не является source of truth.

---

## 30. Registry data sources

### 30.1 Object block

Источник:

- Object;
- Object settings;
- object-level fields.

Поля:

- object name;
- object address;
- work name;
- section;
- project code;
- customer/developer data later.

### 30.2 Contractor/company block

Источник:

- ObjectCompanySnapshot.

Поля:

- contractor legal name;
- construction basis document / contract;
- performed work types;
- project section / drawing set;
- license/SRO;
- INN;
- KPP;
- OGRN;
- legal address;
- actual address;
- director;
- authority basis;
- construction control representative, if needed.

### 30.3 Working drawing set block

Источник:

- ProjectDrawingSet.

Поля:

- company name;
- drawing/project name;
- drawing code;
- sheet count.

### 30.4 Certificate block

Источник:

- Certificate Library;
- act certificate refs;
- package scope.

Поля:

- document type;
- coverage/material/equipment name;
- manufacturer;
- issuer;
- issue date;
- valid until;
- registration number;
- page count;
- file.

### 30.5 Acts block

Источник:

- Document Aggregate.

Поля:

- document type;
- work description;
- number;
- date;
- note;
- folder;
- status;
- revision.

### 30.6 Executive schemes block

Источник:

- ExecutiveScheme.

Поля:

- scheme title;
- registration number;
- date;
- sheet count;
- file;
- note.

### 30.7 Registry signer block

Источник:

- RegistrySignerSnapshot;
- ObjectCompanySnapshot;
- selected representative.

Поля:

- full name;
- position;
- organization;
- authority basis;
- signature caption;
- stamp marker.

---

## 31. Registry editing policy

По умолчанию реестр — derived projection.

Пользователь может:

- менять порядок строк;
- менять порядок сертификатов;
- менять порядок актов;
- менять порядок схем;
- скрывать строки;
- включать строки обратно;
- добавлять примечания;
- выбирать подписанта;
- менять package ordering.

Пользователь не должен напрямую редактировать source fields реестра, если эти fields приходят из Object/Company/Document/Certificate/Scheme.

Для ручных отклонений нужен RegistryOverride layer.

---

## 32. Package Builder

Комплект ИД собирается автоматически.

Default order:

1. Реестр;
2. Сертификаты;
3. Акты;
4. Исполнительные схемы.

Пользователь может менять порядок вручную.

Drag & drop order обязателен.

Package Builder должен:

- собрать registry projection;
- собрать unique certificates;
- сгенерировать DOCX/PDF актов;
- включить оригинальные certificate PDFs;
- включить executive scheme PDFs;
- merge PDFs;
- сформировать snapshot;
- сохранить snapshot;
- отдавать cached snapshot, если ничего не изменилось.

Package generation:

```text
snapshot-based
```

Если ничего не изменилось — отдавать старый snapshot.

Если изменился:

- документ;
- сертификат;
- схема;
- ordering;
- registry override;
- template version;
- company snapshot;

package должен быть invalidated and rebuilt.

Package build не synchronous. Должен быть background async job.

Причины:

- PDF merge;
- DOCX generation;
- conversion;
- large certificate files;
- executive scheme PDFs;
- package snapshots.

Нужны:

- async queue;
- job status;
- progress;
- failure handling;
- retry;
- stored build logs;
- user-friendly UX.

---

## 33. Storage philosophy

Система должна быть cloud agnostic.

Нельзя жёстко привязываться к одному хостингу.

Поддерживаются:

- local;
- MinIO;
- S3;
- Yandex Object Storage.

Оригинальные файлы обязательно хранятся физически:

- certificate PDFs;
- executive scheme PDFs;
- uploaded originals.

Generated files могут пересобираться:

- DOCX;
- PDF;
- package PDF;
- ZIP.

---

## 34. Template system

Поддерживаются:

- global templates;
- object templates.

Причина: разные заказчики используют разные формы.

Template system должен поддерживать:

- placeholders;
- binding;
- rendering;
- DOCX generation;
- preview renderer compatibility;
- template versioning.

Template versioning — критическое business rule.

Если через 5 лет форма изменилась, пользователь должен скачать старый акт в старой форме.

Поэтому:

```text
Template versions are immutable after use
```

После использования template version нельзя менять. Только новая версия.

---

## 35. Delete strategy

Soft delete only.

Удалённые сущности попадают в Trash.

Hard delete — только после retention period, предварительно 30 дней.

---

## 36. Activity history

Нужна история действий.

UI не должен быть перегружен, но система должна понимать:

- кто создал документ;
- кто изменил документ;
- кто пересобрал комплект;
- кто загрузил сертификат;
- кто подтвердил OCR;
- кто изменил шаблон;
- какие snapshots были invalidated.

---

## 37. Search system — open design area

Нужно спроектировать поиск.

Возможные scopes:

- global search;
- object search;
- folder search.

Примеры запросов:

- все акты с воздуховодами;
- все сертификаты Nevatom;
- все документы с просроченными сертификатами;
- все схемы по ОВ;
- все акты за месяц.

Нужно решить:

- indexing strategy;
- full-text search;
- filters;
- permissions;
- UX.

---

## 38. Current project status

Завершено на архитектурном уровне:

- product philosophy;
- source of truth decision;
- domain understanding;
- AOSR analysis;
- registry analysis;
- numbering philosophy;
- folder tree philosophy;
- storage philosophy;
- template philosophy;
- package philosophy;
- OCR philosophy;
- locking philosophy;
- live preview philosophy;
- company snapshot concept;
- registry projection concept;
- Package Builder high-level model.

Не завершено:

- aggregate boundaries;
- PostgreSQL physical design;
- repositories;
- API map;
- package builder internals;
- registry override structure;
- search system;
- frontend state architecture;
- OCR extraction schemas;
- template placeholder/binding model;
- RBAC details;
- frontend component architecture.

---

## 39. Open questions

### Q1 — Aggregate design

Нужно определить DDD aggregate boundaries.

Предварительно:

- Document aggregate;
- Certificate aggregate;
- ExecutiveScheme aggregate;
- Package bounded context;
- Template bounded context;
- Object aggregate;
- Folder aggregate/entity;
- Registry projection service.

### Q2 — PostgreSQL physical design

Нужно спроектировать:

- tables;
- indexes;
- constraints;
- JSONB strategy;
- transactions;
- soft delete;
- tenant isolation.

### Q3 — API map

После БД:

- modules;
- services;
- repositories;
- REST endpoints;
- validation boundaries;
- async job API.

### Q4 — Template engine

Нужно спроектировать:

- placeholders;
- binding;
- rendering;
- DOCX generation;
- preview compatibility;
- template versioning;
- object template override.

### Q5 — Package Builder internals

Нужно спроектировать:

- async queue;
- generation pipeline;
- PDF merge;
- snapshot storage;
- rebuild triggers;
- dependency graph;
- error handling.

### Q6 — Frontend state

Нужно спроектировать:

- autosave;
- live preview;
- optimistic UI;
- draft sync;
- locking UX;
- conflict handling;
- validation UI.

### Q7 — OCR extraction schema

Нужно определить обязательные поля извлечения:

- из сертификатов;
- из схем;
- из актов.

### Q8 — Registry override layer

Нужно спроектировать, как пользовательские правки порядка/видимости/примечаний живут поверх derived projection.

---

## 40. Rules for future AI agents

1. Не начинать кодинг без явного задания.
2. Если пользователь просит “сделать MVP”, сначала проверить, не нарушает ли это архитектурные решения.
3. Любое изменение source of truth, registry philosophy, typed document model, template versioning или package snapshot strategy требует ADR.
4. Не предлагать Google Docs-like collaborative editing.
5. Не делать registry standalone editable Word/Excel.
6. Не хранить сертификаты только как текстовые номера.
7. Не делать DOCX/PDF source of truth.
8. Не делать generic JSON documents без typed schema.
9. Не делать Object giant aggregate.
10. Не делать Package Builder synchronous.
11. Не делать OCR auto-approve.
12. Не ломать tenant isolation.
13. Всегда учитывать реальную практику ПТО: документы часто исправляют, номера пересчитывают, папки дублируют, сертификаты используют повторно, заказчики требуют разные формы.
14. Если есть сомнения — сначала задать вопрос пользователю и зафиксировать ответ в `docs/CONVERSATION_QA_LOG.md`.

---

## 41. Immediate next recommended step

Следующий правильный этап:

```text
Data Model v1 + Aggregate Boundaries
```

Не backend-код.

Нужно создать документ:

```text
docs/06-data-model-v1.md
```

В нём описать сущности, связи, ownership, source of truth, derived projections и MVP/deferred scope.

---

## 42. Final note

Проект должен развиваться маленькими системными шагами.

Не цель — “быстро написать MVP”.

Цель — построить архитектуру, которая выдержит реальные сценарии ПТО:

- много объектов;
- разные компании;
- разные заказчики;
- разные формы;
- разные сертификаты;
- пересборка комплектов;
- исправления документов;
- историческая неизменность старых данных;
- быстрый UX;
- минимум ручной рутины.
