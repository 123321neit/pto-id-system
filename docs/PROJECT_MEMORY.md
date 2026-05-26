# PROJECT_MEMORY
# PTO ID SYSTEM
# EXECUTIVE DOCUMENTATION PLATFORM
# MASTER CONTEXT / SOURCE OF TRUTH
# VERSION: 2026-05-26-SINGLE-SOURCE-OF-TRUTH
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

---

## 43. Repository Structure Policy

Этот раздел фиксирует назначение файлов репозитория и порядок разрешения противоречий. Он не отменяет исходные архитектурные документы: они сохраняются как детализация решений и история их формирования. При этом именно `docs/PROJECT_MEMORY.md` является самодостаточным master-файлом и первой точкой чтения для нового агента или разработчика.

### 43.1 Canonical knowledge structure

| Путь | Роль в проекте | Политика использования |
| --- | --- | --- |
| `README.md` | Входная страница репозитория | Кратко объясняет назначение проекта и ведёт к master context. Не является полным архитектурным описанием. |
| `docs/PROJECT_MEMORY.md` | Единый master context | Канонический источник продуктовых и архитектурных решений, терминов, текущего статуса и правил для агентов. |
| `docs/CONVERSATION_QA_LOG.md` | Журнал вопросов и решений | Хранит происхождение важных решений. Новые значимые ответы пользователя должны попадать сюда и затем отражаться в master context. |
| `docs/AGENTS.md` | Быстрые инструкции агентам | Краткая operational entry point. При расхождении с master context приоритет у `PROJECT_MEMORY.md`. |
| `docs/00-project-memory.md` | Ранняя фиксация принципов | Сохраняется как базовый архитектурный источник. Активные положения интегрированы в этот файл. |
| `docs/01-architecture-overview.md` | Архитектурный обзор слоёв | Детализирует domain/application/projection/generation/storage layers. |
| `docs/02-domain-model.md` | Исходное описание доменной модели | Используется при проектировании Data Model v1; положения включены в индексы ниже. |
| `docs/03-registry-model.md` | Исходное описание реестров | Подтверждает derived projection policy. |
| `docs/04-roadmap-and-open-questions.md` | Roadmap и ранние вопросы | Используется как источник незакрытых вопросов; актуальный консолидированный список приведён ниже. |
| `docs/05-codex-agent-instructions.md` | Ранние инструкции Codex | Не удаляется; актуальные обязательные правила собраны в master context и `docs/AGENTS.md`. |
| `docs/adr/*.md` | Принятые архитектурные решения | Нормативные решения по отдельным темам. Изменение принятого принципа требует нового ADR или явного пересмотра существующего. |
| `docs/samples/*.md` | Анализ реальных примеров | Reference sources для доменной модели и будущих шаблонов/парсеров; не generated output системы. |

### 43.2 Rules for repository changes

- На текущем этапе репозиторий является архитектурным репозиторием, а не кодовой базой продукта.
- Нельзя добавлять backend/frontend implementation, `package.json`, lock-файлы, Dockerfile, CI/CD, deployment configuration или зависимости без отдельного пользовательского запроса и предварительного архитектурного решения.
- Нельзя удалять исходные docs, ADR или sample analyses только потому, что информация вошла в master context: они нужны как доказательная база и история решений.
- При появлении нового доменного решения нужно обновить `docs/PROJECT_MEMORY.md`; если решение принято в диалоге, также обновить `docs/CONVERSATION_QA_LOG.md`; если оно изменяет долгосрочную архитектуру, создать ADR.
- `docs/PROJECT_MEMORY.md` должен быть достаточен для начала новой сессии без обязательного чтения остальных файлов. Остальные файлы нужны для проверки происхождения деталей и углубления.

---

## 44. Full Domain Model Index

Этот индекс консолидирует сущности, обнаруженные в проектной документации, анализе АОСР и анализе реестра. Это conceptual domain model, а не физическая схема БД.

### 44.1 Tenant and access context

| Сущность / концепт | Назначение | Ключевые правила |
| --- | --- | --- |
| `Tenant` | Логическая граница данных организации/пользователя SaaS | Все ключевые сущности должны учитывать `tenant_id`; данные tenants изолированы. |
| `User` | Пользователь системы | Детальная модель пользователей и RBAC ещё не спроектирована. |
| `Role` | `admin`, `PTO`, `foreman` и будущие права | Требует отдельного RBAC-дизайна; нельзя случайно реализовать до решения. |

### 44.2 Project and organization context

| Сущность / концепт | Назначение | Source of truth / связи |
| --- | --- | --- |
| `Object` / `Project` | Строительный объект, основной пользовательский контейнер | Владеет настройками и ссылками, но не должен содержать все документы как giant aggregate. |
| `EngineeringSystem` | Раздел или система: ОВиК, ВК, вентиляция, отопление, водоснабжение, канализация | Связан с объектом, работами, документами и схемами. |
| `Folder` | Business collection node внутри объекта | Организует документы; поддерживает tree, move, duplicate и soft delete; не владеет lifecycle документов. |
| `CompanyProfile` | Переиспользуемая карточка компании внутри tenant | Может меняться для будущих объектов; не должна ретроспективно менять исторические документы. |
| `ObjectCompanySnapshot` | Зафиксированные данные компании на объекте | Используется документами и реестром для исторически устойчивого рендера. |
| `Representative` | Представитель/подписант и его полномочия | Допускаются global, object и temporary representatives; важны порядок и overrides. |
| `RegistrySignerSnapshot` | Выбранный подписант конкретного реестра | Подписант реестра может отличаться от подписантов актов. |
| `ProjectDrawingSet` | Комплект рабочих чертежей, по которым выполняются работы | Не является исполнительной схемой; участвует в АОСР и блоке реестра. |

### 44.3 Work and documentation aggregates

| Сущность / концепт | Назначение | Ключевые правила |
| --- | --- | --- |
| `WorkItem` | Выполненная работа/участок/результат СМР | Может быть закрыт актами, связан с системой, местом, датами, материалами и схемами. |
| `Document` | Общая оболочка typed document | Содержит immutable `document_type`, status, number/date, typed payload, links, template version и revision. |
| `AOSR` | Акт освидетельствования скрытых работ | Typed document, связывает работу, представителей, проектную документацию, материалы, сертификаты, схемы и разрешение последующих работ. |
| `TestAct` | Акт испытаний | Typed document, фиксирует объект/методику/параметры/результаты испытаний и заключение. |
| `TechnicalReadinessAct` | Акт технической готовности | Обнаружен в реестре как требуемый тип; подробная schema ещё требует проработки. |
| `ExecutiveScheme` | Исполнительная схема | PDF/file + structured metadata; при замене создаётся новый файл/объект, а не правка чертежа системой. |
| `Certificate` | Сертификат, декларация, паспорт, письмо или иной документ качества | Library aggregate с физическим файлом и metadata; переиспользуется в нескольких документах/объектах. |
| `Material` | Материал или оборудование | Справочная/проектная сущность; обязательность каталога в MVP остаётся вопросом. |
| `MaterialUsage` | Факт применения материала в работе | Связывает конкретную работу, количество/партию/место применения и подтверждающие сертификаты. |

### 44.4 Output, rendering and lifecycle concepts

| Сущность / концепт | Назначение | Ключевые правила |
| --- | --- | --- |
| `RegistryProjection` | Вычисляемое представление состава документации | Никогда не source of truth; строится из domain data и override layer. |
| `RegistryOverride` | Управляемые печатные/порядковые изменения реестра | Позволяет порядок, скрытие, примечания и подписанта; не переписывает source fields. |
| `Package` / `PackageSnapshot` | Комплект ИД и зафиксированный результат сборки | Snapshot-based, asynchronous build, invalidation при изменении зависимостей. |
| `Template` / `TemplateVersion` | Правило визуального формирования документа | Version immutable after first use; новая форма означает новую версию. |
| `GeneratedArtifact` | DOCX, PDF, ZIP, export или package output | Производен от structured data, template version и snapshot context. |
| `DocumentLock` | Application-level lock редактирования | Отдельно от `Document`, содержит TTL/heartbeat и не меняет revision. |
| `ActivityHistory` | Audit/activity history | Должна фиксировать ключевые изменения, генерации, подтверждение OCR и invalidation snapshots. |
| `OCRExtractionProposal` | Предложенные AI/OCR metadata | Только assistant output; активными данные становятся после подтверждения пользователя. |

### 44.5 Aggregate boundary guardrails

- `Object` связывает данные объекта, но не поглощает documents, certificates, templates и packages в один giant aggregate.
- `Document`, `Certificate` и `ExecutiveScheme` должны иметь самостоятельный жизненный цикл.
- `RegistryProjection` является сервисом/проекцией, а не master aggregate.
- `Package Builder` должен рассматриваться как отдельный bounded context или application service с собственными snapshots/jobs.
- `DocumentLock` должен жить отдельно от document revision history.
- Физические границы aggregates, storage tables и API ещё не утверждены: это задача `Data Model v1 + Aggregate Boundaries`.

---

## 45. Full Document Types Index

### 45.1 Universal document contract

Каждый typed document должен иметь:

- идентификаторы tenant, object и folder;
- неизменяемый тип документа;
- status и revision;
- номер/правило нумерации и дату документа;
- structured payload соответствующего типа;
- связи с сертификатами, схемами, работами и представителями, если применимо;
- `template_version_id`;
- generated artifacts и признак необходимости регенерации;
- audit metadata и soft-delete metadata.

Документ не является произвольным JSON blob или редактируемым DOCX. Flexible fields допустимы только внутри определённого typed contract и не должны уничтожать доменную семантику.

### 45.2 AOSR / АОСР

Назначение: подтвердить освидетельствование скрытых работ перед последующими работами.

Обязательный смысл модели:

- объект, система и место выполнения;
- предъявленные скрытые работы;
- даты выполнения и дата акта;
- комплект рабочей/проектной документации и нормативные ссылки;
- применённые материалы/оборудование;
- ссылки на certificate library items;
- исполнительные схемы/приложения, когда требуются;
- участники освидетельствования, роли, полномочия и порядок;
- разрешение на последующие работы, замечания и дополнительные сведения;
- numbering, status, revision и template version.

Цветовая логика АОСР является зафиксированным input-to-domain mapping:

| Цвет в исходном обсуждении | Семантика | Правило хранения |
| --- | --- | --- |
| Жёлтый | Объектные данные и реквизиты объекта | Вводятся на уровне объекта и используются через object context/snapshot. |
| Зелёный | Представители и подписанты | Определяются на объекте, допускают document override; подстрочный текст editable; порядок обязателен. |
| Серый | Номер акта | Управляется numbering engine: prefix, sequence, suffix, rendered number. |
| Фиолетовый | Дата акта | Поле документа; default может быть текущей датой; допускается массовое изменение в папке. |
| Бирюзовый | Переменные данные конкретного акта | Работы, проектные ссылки, материалы, сертификаты, дальнейшие работы, приложения, примечания. |

Непреложное правило: certificate number в печатном АОСР является rendered value связи с `Certificate`; нельзя вводить его как ничем не подтверждённую строку.

### 45.3 Test Act / Акт испытаний

Назначение: зафиксировать испытание системы, участка, трубопровода или оборудования.

Модель должна поддерживать:

- вид испытания, например гидравлическое, пневматическое, промывка, опрессовка, герметичность или индивидуальные испытания оборудования;
- испытываемую систему/участок/оборудование;
- нормативное основание или методику;
- параметры и фактические результаты;
- дату/время и участников;
- измерительные средства, если применимо;
- заключение о соответствии;
- связанные схемы, материалы и другие акты.

Точный перечень форм и обязательных полей MVP ещё не утверждён.

### 45.4 Certificate / Документ качества

Сертификат участвует в комплекте и реестре как самостоятельный library item, а не как typed акт. В перечень поддерживаемых документов качества входят сертификаты соответствия, декларации, паспорта качества/технические паспорта, исходящие и отказные письма, информационные письма и иные подтверждающие документы.

Критические правила:

- у сертификата обязан быть физически сохранённый файл;
- акт и реестр ссылаются на `certificate_id`, а не держат ручную строку вместо сущности;
- один сертификат может переиспользоваться в нескольких актах и объектах внутри допустимой tenant-области;
- применимость/срок проверяется относительно даты документа, в котором сертификат используется;
- OCR извлекает metadata только как предложение для подтверждения.

### 45.5 ExecutiveScheme / Исполнительная схема

Исполнительная схема отражает фактически выполненные работы и отличается от `ProjectDrawingSet`, который описывает исходный комплект рабочих чертежей.

Минимальная модель:

- файл PDF/attachment;
- object и folder;
- title;
- registration number;
- date;
- sheet count;
- note;
- связи с WorkItem и актами.

На первом этапе metadata вводятся вручную. При изменении схемы создаётся новая сущность/новый файл; сложный versioning схем на старте не принят.

### 45.6 Documents recognized but requiring later schemas

- `TECHNICAL_READINESS_ACT`: присутствует в реальном примере реестра; модель требует отдельного уточнения.
- Другие акты испытаний и исполнительные документы: добавляются только как typed documents после согласования required fields и validation rules.

---

## 46. Full Registry Projection Rules

### 46.1 Canonical rule

```text
Registry = derived projection, never source of truth
```

Реестр удобен как рабочее представление инженера ПТО и как печатный артефакт, но он не заменяет доменные сущности. Любая строка должна быть объяснима через первичные данные объекта, snapshots, документов, сертификатов, схем или управляемого override.

### 46.2 Projection blocks and data ownership

| Блок реестра | Source data | Что нельзя делать |
| --- | --- | --- |
| Шапка объекта | `Object`, object settings | Не хранить единственную копию объекта в тексте реестра. |
| Подрядчик/исполнители | `ObjectCompanySnapshot`, contract/work settings | Не подтягивать будущие изменения `CompanyProfile` в исторический комплект. |
| Комплект рабочих чертежей | `ProjectDrawingSet` | Не смешивать с `ExecutiveScheme`. |
| Сертификаты/документы качества | `Certificate Library`, act refs, package scope | Не показывать номер без существующего файла library item. |
| Акты | Typed `Document` aggregates | Не редактировать date/number/status только в строке проекции. |
| Исполнительные схемы | `ExecutiveScheme` | Не подменять metadata свободным текстом в реестре. |
| Подписант | `RegistrySignerSnapshot` / selected representative | Не предполагать, что это всегда подписант акта. |

### 46.3 Color logic of the real registry example

Цветовая логика, объяснённая пользователем при разборе реестра вентиляции, является доменным ориентиром:

| Цвет | Блок | Вывод для модели |
| --- | --- | --- |
| Жёлтый | Объектные данные | Проецируются из object data, вводимых один раз на объект. |
| Красный | Сертификаты и документы качества | Проецируются из Certificate Library и document/package links. |
| Серый | Акты | Проецируются из typed `Document` aggregates. |
| Зелёный | Исполнительные чертежи/схемы | Проецируются из `ExecutiveScheme`. |
| Тёмно-красный | Лицо, подписывающее реестр | Проецируется из signer snapshot/selected representative. |

### 46.4 Editable surface and override layer

В интерфейсе реестра пользователь может:

- менять визуальный порядок строк, сертификатов, актов и схем;
- скрывать/возвращать строки в рамках конкретного выхода/комплекта;
- добавлять печатные примечания;
- выбирать подписанта реестра;
- менять ordering комплекта.

Эти операции должны сохраняться в `RegistryOverride` или package configuration. Они не дают права переписать primary fields сущностей.

Если пользователь хочет изменить дату акта, номер сертификата, название схемы или реквизиты компании, он должен изменить исходную сущность; после этого projection пересчитывается, а зависимые generated artifacts/snapshots могут инвалидироваться.

### 46.5 Registry output

DOCX/PDF/XLSX реестра — generated artifact. Он должен строиться заново из актуальной проекции, template version и overrides. Изменение экспортированного файла вне системы не меняет structured data без отдельного проектируемого процесса импорта.

---

## 47. Source Materials and Privacy Policy

### 47.1 Source materials used for the architecture

Архитектурные выводы в этом master context опираются на:

- исходные архитектурные документы `docs/00-project-memory.md` — `docs/05-codex-agent-instructions.md`;
- ADR 0001–0005;
- журнал решений `docs/CONVERSATION_QA_LOG.md`;
- инструкции агентов `docs/AGENTS.md`;
- анализ реального АОСР `docs/samples/aosr-example-analysis.md`, исходный пример обозначен как `Пример.docx`;
- анализ реестра вентиляции `docs/samples/registry-ventilation-example.md`, исходный пример обозначен как `Реестр вентиляция.doc`.

Sample analyses нужны как domain reference: они объясняют структуру документов, цветовую разметку и происхождение требований. Они не являются утверждёнными production templates, DB schemas или generated outputs будущей системы.

### 47.2 Privacy and source handling

В source examples могут находиться реальные или похожие на реальные персональные и организационные реквизиты: ФИО, компании, адреса, ИНН/КПП/ОГРН, договоры, регистрационные номера и сведения о сертификатах.

Правила обращения:

- использовать такие примеры для архитектурного анализа и разработки только в объёме, необходимом проекту;
- не интерпретировать пример как разрешение публиковать персональные или договорные сведения в демонстрационных данных;
- при создании публичных демо, тестовых fixtures, документации вне закрытого контекста или обучающих материалов обезличивать реквизиты;
- не отправлять содержимое source files внешним AI/OCR-сервисам без отдельного решения о privacy, согласии и модели обработки данных;
- оригинальные загруженные файлы будущей системы должны иметь tenant isolation, access control, audit trail и storage policy;
- OCR/AI result не считается подтверждённым фактом до проверки пользователем.

### 47.3 Historical evidence rule

Файлы сертификатов, исполнительных схем и выпущенных комплектов важны как подтверждающие материалы. Их нельзя без следа заменять или удалять после использования в документах/комплектах. Delete/version/retention policy должна сохранить воспроизводимость истории.

---

## 48. Agent Operating Rules

### 48.1 Mandatory reading and priority

Перед изменением архитектуры или реализацией агент обязан прочитать этот master context. При необходимости проверки происхождения решения агент обращается к `docs/CONVERSATION_QA_LOG.md`, ADR и sample analyses.

Если обнаружено противоречие:

1. не выбирать молча удобную трактовку;
2. выделить противоречие пользователю;
3. предложить корректировку master context и/или ADR;
4. до решения не внедрять необратимую реализацию.

### 48.2 Hard prohibitions

Агенту запрещено без явного нового решения:

- начинать кодинг на архитектурном этапе;
- делать DOCX, PDF, XLSX или выгруженный реестр source of truth;
- делать реестр самостоятельной редактируемой master table;
- моделировать документы как generic constructor или untyped JSON blob;
- хранить сертификат только текстовым номером без файла в библиотеке;
- считать `final` документ неизменяемым;
- менять использованную template version;
- делать Package Builder синхронной операцией пользовательского запроса;
- превращать `Object` в giant aggregate;
- разрешать OCR/AI автоматически утверждать критичные данные;
- ломать tenant isolation;
- заменять открытый архитектурный вопрос случайной технологической реализацией.

### 48.3 Decision-making behavior

- Если запрос касается source of truth, typed documents, registry projection, package snapshots, template versioning, locks/autosave, tenant isolation или privacy, агент должен проверить соответствие принятым решениям и при изменении принципа предложить ADR.
- Если пользовательская идея создаёт риск потери историчности, отсутствия подтверждающих файлов или невозможности пересобрать комплект, агент должен явно возразить и объяснить риск.
- Новые вопросы, на которые пользователь дал архитектурно значимый ответ, должны быть зафиксированы в `CONVERSATION_QA_LOG.md` и консолидированы здесь.
- На стадии реализации агент должен предпочитать domain-specific UI и contracts универсальным конструкторам.

---

## 49. Current Next Step

Текущий следующий архитектурный этап остаётся тем же:

```text
Data Model v1 + Aggregate Boundaries
```

Предлагаемый документ:

```text
docs/06-data-model-v1.md
```

Он должен определить:

- bounded contexts и aggregate roots;
- ownership и ссылки между `Object`, `Folder`, `Document`, `Certificate`, `ExecutiveScheme`, `Template`, `Package` и projections;
- typed payload v1 для АОСР и первых актов испытаний;
- snapshot boundaries для компаний, документов и комплектов;
- lifecycle, revision и invalidation events;
- MVP scope и deferred scope;
- список решений, которые ещё запрещают переход к физической БД/API.

До принятия Data Model v1 нельзя считать утверждёнными физическую БД, API, frontend state architecture, выбор backend/frontend стека или реализацию генератора.

---

## 50. What Must Not Be Forgotten

Этот список является коротким guardrail register, который должен проверяться при любом новом проектном решении:

1. `SOURCE OF TRUTH = STRUCTURED DATA`.
2. DOCX, PDF, ZIP, реестр и комплект — generated artifacts/projections, а не база данных.
3. Реестр — derived projection; source fields меняются в исходных сущностях.
4. АОСР, акты испытаний и другие документы — typed documents, не generic document constructor.
5. Цветовая логика АОСР: жёлтый — object, зелёный — representatives, серый — numbering, фиолетовый — date, бирюзовый — document-specific data.
6. Цветовая логика реестра: жёлтый — object, красный — certificates, серый — acts, зелёный — schemes, тёмно-красный — signer.
7. Номер сертификата нельзя просто вписать строкой: сначала должен существовать physical file + `Certificate` library entity.
8. Срок сертификата проверяется относительно даты документа, а не текущей даты; истечение может дать warning, а не автоматический запрет.
9. `final` документ можно исправлять; такое изменение повышает `revision` и инвалидирует зависимые package snapshots.
10. Template version после использования immutable; изменившаяся форма создаёт новую версию.
11. Package Builder является async и snapshot-based; rebuild вызывается изменением зависимостей.
12. `Object` не должен стать giant aggregate.
13. ObjectCompanySnapshot защищает исторические реквизиты объекта от будущих изменений карточки компании.
14. `ProjectDrawingSet` и `ExecutiveScheme` — разные понятия.
15. AI/OCR — assistant only; никакого auto-approve критичных metadata.
16. Исходные документы могут содержать чувствительные реквизиты; privacy и tenant isolation обязательны.

---

## 51. Decisions Already Made

Этот реестр включает решения из `CONVERSATION_QA_LOG.md`, ADR и source analyses, чтобы новый агент не возвращался к уже закрытым вопросам.

| Вопрос / тема | Принятое решение | Архитектурное следствие |
| --- | --- | --- |
| Нужен ли единый master context? | Да, `docs/PROJECT_MEMORY.md` является главным источником знаний. | Новые значимые решения консолидируются здесь. |
| Что является source of truth? | Structured data. | DOCX/PDF/registry/package — generated or derived outputs. |
| Должен ли реестр быть отдельным редактируемым документом? | Нет, registry is derived projection. | Разрешены overrides порядка/видимости/примечаний, но не ручная замена source fields. |
| Как трактовать цветовую разметку АОСР? | Жёлтый object, зелёный representatives, серый number, фиолетовый date, бирюзовый variable document data. | Разметка формирует boundaries данных документа и объекта. |
| Можно ли вписать certificate number без сертификата? | Нет. | Certificate Library item с физическим файлом обязателен до ссылки из акта/реестра. |
| На какую дату валидировать сертификат? | На дату документа, не на сегодняшнюю дату. | Исторически корректный документ сохраняет валидность; просрочка для нового документа даёт warning. |
| Можно ли править final document? | Да. | `final` — validated published revision, правка вызывает `revision++`, revalidation и invalidation package snapshots. |
| Можно ли изменить template version после использования? | Нет. | Used template version immutable; новая форма оформляется новой версией. |
| Как собирать комплект ИД? | Автоматически, snapshot-based, async background job. | Нужны dependency invalidation, progress/status, retry и cached snapshots. |
| Как хранить ExecutiveScheme? | File/PDF + structured metadata. | На старте metadata ручные; изменившаяся схема создаётся как новый файл/объект. |
| Что такое ProjectDrawingSet? | Отдельный concept для рабочих чертежей; не ExecutiveScheme. | Используется как источник блока реестра и ссылок АОСР. |
| Как должен ощущаться интерфейс? | Пользователь работает с комплектом ИД, а не с CRM-таблицей. | UX document-centric, complexity structured model скрывается. |
| Каково назначение OCR/AI? | Assistant only. | Извлечённые metadata активируются только после пользовательского подтверждения. |
| Где хранить данные компании на объекте? | Через `ObjectCompanySnapshot`. | Изменение профиля компании не переписывает исторические документы объекта. |
| Может ли Object владеть всем сразу? | Нет. | Требуются отдельные aggregates/contexts для documents, certificates, schemes, templates и packages. |
| Какая стадия проекта сейчас? | System Architecture Design, не coding. | Следующий шаг — Data Model v1 + Aggregate Boundaries, не scaffold приложения. |

### 51.1 Accepted ADR register

| ADR | Решение | Статус |
| --- | --- | --- |
| ADR 0001 | Structured data являются source of truth; файлы и реестры производны. | Принято. |
| ADR 0002 | Используются typed documents вместо generic documents. | Принято. |
| ADR 0003 | Реестр является derived projection. | Принято. |
| ADR 0004 | Требуются document locks и snapshot-oriented autosave; детали реализации впереди. | Принято как принцип, требует детализации. |
| ADR 0005 | Template versions версионируются и не изменяются после использования; детали template engine впереди. | Принято как принцип, требует детализации. |

---

## 52. Open Questions Still Not Solved

Следующие вопросы не отменяют принятые выше принципы. Их нельзя решать случайным кодом: они требуют спецификации, пользовательского выбора и, где необходимо, ADR.

### 52.1 Domain scope and typed schemas

- Какие конкретные формы АОСР и акты испытаний входят в первый MVP?
- Какова typed schema для `TECHNICAL_READINESS_ACT`, обнаруженного в реестре?
- Насколько структурировать описание работы, оси, этажи, отметки и нормативные ссылки в первой версии?
- Является ли `Material` обязательным каталогом MVP или достаточно `MaterialUsage` внутри typed documents со ссылками на сертификаты?
- Как учитывать оборудование отдельно от материалов?
- Какой набор участников и подписей обязателен для первых типов документов?

### 52.2 Aggregate and storage design

- Как точно проходят aggregate boundaries и транзакционные границы между Object, Folder, Document, Certificate, ExecutiveScheme, Template и Package?
- Где должен находиться `ProjectDrawingSet`: в Object settings или как отдельный aggregate?
- Каковы physical storage, tables, indexes, constraints, JSONB strategy, tenant policies и soft-delete rules?
- Как хранить originals, generated artifacts, package snapshots и build logs в cloud-agnostic storage?
- Какие retention и hard-delete правила нужны для юридически/исторически значимых файлов?

### 52.3 Lifecycle, versioning and collaboration

- Какой полный статусный lifecycle документов нужен кроме `draft`, `final`, `archived`, `deleted`?
- Какая именно операция создаёт новую revision для draft/final и для массового renumber?
- Каков UX и policy конфликтов locks: TTL, override permission, потеря соединения и восстановление drafts?
- Требуется ли multi-user beyond locks в будущем и будет ли он вообще допустим для MVP?
- Как версии/замены сертификатов и схем отражаются в уже сформированных historical packages?

### 52.4 Templates and generation

- Какой template engine поддержит DOCX placeholders, повторяющиеся таблицы, preview compatibility и object-level variants?
- Как соотносятся data version, document revision, template version и generated artifact identity?
- Как генерируется PDF и как обеспечивается воспроизводимость старого вывода?
- Как устроены package async queue, rebuild dependency graph, PDF merge, retry/failure recovery и snapshot storage?

### 52.5 Registry, search and UX

- Какова формальная schema `RegistryOverride` для порядка, скрытия, примечаний и signer selection?
- Какие реестры и экспортные формы входят в MVP?
- Разрешено ли inline editing через registry UI как команда изменения исходной сущности, и для каких полей?
- Как спроектировать global/object/folder search, filters и индексирование?
- Как UI показывает stale generated artifacts, warnings, incomplete packages и результат OCR confirmation?

### 52.6 Access, privacy and integrations

- Какова детальная модель RBAC и нужна ли авторизация в самом раннем MVP?
- Какие privacy/access/audit requirements предъявляются к реальным сертификатам, схемам и персональным данным представителей?
- Нужны ли ЭЦП/юридически значимое подписание, импорт legacy DOCX/PDF, BIM/CAD/ERP integrations, public API или offline mode, и только на каком последующем этапе?

### 52.7 Technology decisions explicitly deferred

До отдельных решений остаются невыбранными:

- backend/frontend stack;
- база данных и миграции;
- API и repository implementation;
- dependency/tooling strategy;
- Docker, deployment и CI/CD;
- OCR/AI provider and data-processing policy.

Пока эти вопросы открыты, агент не должен создавать реализационные файлы, выдавая выбор технологии за уже принятое решение.
