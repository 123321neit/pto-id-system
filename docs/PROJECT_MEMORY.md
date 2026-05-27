# PROJECT_MEMORY
# PTO ID SYSTEM
# EXECUTIVE DOCUMENTATION PLATFORM
# MASTER CONTEXT / SOURCE OF TRUTH
# VERSION: 2026-05-27-AI-PROJECT-INGESTION-MODEL
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
- поддерживать загрузку project source materials по объекту и будущий AI-assisted анализ проекта для подготовки ИД и поиска несоответствий;
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

OCR/AI может предлагать значения, связи и findings, но не должен auto-approve критические данные или утверждать инженерный вывод. Пользователь подтверждает extracted data до изменения structured domain data.

Uploaded project documentation может быть source material и provenance для помощи с ИД, но не становится единственным source of truth. Project files должны принадлежать конкретным `Workspace` и `Object`; AI results должны быть traceable и auditable.

### 5.7 Simple UX over enterprise complexity

Система должна быть быстрой и понятной для ПТО, а не перегруженной корпоративной логикой.

---

## 6. Users, workspaces and roles

`User` представляет физическое лицо, создающее аккаунт. Права на business data принадлежат не `User` напрямую, а его активному `Membership` в конкретном workspace.

После регистрации:

- автоматически создаётся `Personal Workspace`;
- регистрирующийся пользователь получает в нём membership с ролью `Owner`;
- личный workspace позволяет полноценно вести объекты, документы, evidence, реестры и комплекты без участия организации.

Пользователь может одновременно состоять в нескольких `Organization Workspace`; вступление в них происходит через invitations. Личные и организационные данные не смешиваются автоматически.

Workspace membership roles baseline:

- `Owner` — accountable controller workspace;
- `Admin` — delegated workspace administrator;
- `PTO Engineer` — основной профессиональный пользователь документации;
- `Foreman` — ограниченный contributor;
- `Viewer` — read-only participant.

Точный permission baseline, invite rules и вопросы для ратификации определены в `docs/10-auth-workspace-rbac-model.md`. Workspace `Admin` не означает автоматически разрешённый platform-support access к данным других tenants.

---

## 7. Multi-tenancy and workspace isolation

Критически важное решение:

```text
isolated workspace/tenant architecture
```

`Workspace` является tenant boundary для business data и workspace-scoped authorization. Существуют:

- `Personal Workspace` — автоматически создаваемая полноценная рабочая область физического лица;
- `Organization Workspace` — совместная рабочая область, доступная через membership и invitations.

Каждый workspace имеет логически изолированные данные.

Пользователь без активного membership в данном workspace не видит:

- объекты;
- документы;
- сертификаты;
- исполнительные схемы;
- компании;
- представителей;
- комплекты;
- шаблоны объекта.

Один пользователь может работать в нескольких organization workspaces, но это не разрешает cross-workspace links, reuse или copy domain data без отдельной утверждённой политики.

Организационный workspace — collaboration tenant, а `CompanyProfile` / `ObjectCompanySnapshot` — реквизиты сторон в документации; одно не даёт автоматически прав на другое. Архитектура должна с самого начала учитывать workspace/tenant boundary во всех ключевых сущностях.

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

Project ingestion extension зафиксирован в `docs/11-ai-project-ingestion-and-assistance-model.md`:

- пользователь в будущем сможет загружать проектные PDF, drawings, specifications и другие source materials в context конкретных `Workspace` и `Object`;
- AI/OCR может предлагать project references, systems/zones/floors/axes, work statements, expected evidence и inconsistency findings;
- предложение обязано сохранять source citation/provenance настолько детально, насколько допускает формат;
- AI/OCR создаёт только proposals; принятие, исправление или отклонение выполняет authorized user;
- confirmed structured data и explicit relations остаются source of truth, а source file/OCR text/AI response не заменяют domain state;
- processing project originals требует утверждённых privacy, access, tenant isolation and audit rules.

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

Draft baseline из `docs/09-aggregate-boundaries-and-invariants.md`:

```text
ProjectDrawingSet = owned entity in ObjectDocumentationContext
```

Он не является самостоятельным aggregate root для первого scope. Если позднее появятся независимые approval/version/reuse workflows рабочих чертежей, boundary должна быть пересмотрена до реализации этих требований.

Project source files могут использоваться как provenance для данных и ссылок `ProjectDrawingSet`, но ни upload, ни AI extraction не изменяют эти confirmed fields автоматически. Связь и extracted values проходят user confirmation по модели `docs/11-ai-project-ingestion-and-assistance-model.md`.

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
- aggregate boundaries and invariants draft baseline before Database Schema V1.
- auth, workspace, invitation, membership and RBAC draft baseline before Database Schema V1.
- AI project ingestion and assistance draft baseline before Database Schema V1.

Не завершено:

- ратификация boundary baseline для `FolderTree`, `WorkItem` и `ProjectDrawingSet`;
- ратификация auth/workspace/RBAC baseline, invite policies и privacy/access requirements;
- ратификация AI project ingestion/assistance baseline, project-source privacy/processing and audit requirements;
- PostgreSQL physical design;
- repositories;
- API map;
- package builder internals;
- registry override structure;
- search system;
- frontend state architecture;
- OCR extraction schemas;
- template placeholder/binding model;
- fine-grained RBAC/privacy/commercial lifecycle details;
- frontend component architecture.

---

## 39. Open questions

### Q1 — Aggregate design

Draft baseline определён в `docs/09-aggregate-boundaries-and-invariants.md` и требует ратификации до Database Schema V1.

Зафиксированы как самостоятельные owners:

- Object aggregate;
- FolderTree aggregate;
- Document aggregate;
- Certificate aggregate;
- ExecutiveScheme aggregate;
- Package bounded context;
- Template bounded context;
- Registry projection service.

Boundary choices для подтверждения:

- `FolderTree` является отдельным object-scoped aggregate root;
- содержательная работа первого scope хранится typed `Document` payload, без самостоятельного `WorkItem` root;
- `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`;
- reusable boundaries для representatives/materials требуют решения.

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

### Q7 — OCR / AI project ingestion and extraction model

Draft baseline project ingestion, proposals, confirmation, traceability and isolation определён в `docs/11-ai-project-ingestion-and-assistance-model.md` и требует учёта до Database Schema V1.

Нужно определить обязательные поля/правила извлечения:

- из сертификатов;
- из схем;
- из актов.
- из uploaded project documentation, drawings и specifications;
- для source citations, proposal staleness, user confirmation и reviewable AI findings.

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
13. Не делать uploaded project documentation, OCR text или AI response единственным source of truth.
14. Любые AI extraction/error detection results сохранять как traceable proposals до user confirmation.
15. Всегда учитывать реальную практику ПТО: документы часто исправляют, номера пересчитывают, папки дублируют, сертификаты используют повторно, заказчики требуют разные формы.
16. Если есть сомнения — сначала задать вопрос пользователю и зафиксировать ответ в `docs/CONVERSATION_QA_LOG.md`.

---

## 41. Immediate next recommended step

Следующий правильный этап:

```text
Review and ratify Aggregate Boundaries/Invariants, Auth/Workspace/RBAC and AI Project Ingestion/Assistance before Database Schema V1
```

Не backend-код и не физическая схема хранения до ратификации.

Создан draft-документ:

```text
docs/09-aggregate-boundaries-and-invariants.md
```

В нём описаны owners, allowed/forbidden relationships, invariants, revision and invalidation rules, а также boundary choices, требующие подтверждения.

Созданы также pre-schema draft-документы:

```text
docs/10-auth-workspace-rbac-model.md
docs/11-ai-project-ingestion-and-assistance-model.md
```

Database Schema V1 после рассмотрения этих baseline decisions должен быть следующим отдельным документом:

```text
docs/12-database-schema-v1.md
```

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
| `docs/06-data-model-v1.md` | Первая формальная концептуальная модель данных | Фиксирует aggregate roots/boundaries, entities, ownership, snapshots, revisions и projections без выбора БД, API или стека. |
| `docs/07-aosr-domain-specification.md` | Первая спецификация typed document | Формализует АОСР: blocks, validation, snapshots, revisions, registry/package behavior и открытые domain questions без выбора реализации. |
| `docs/08-document-types-catalog.md` | Каталог document/evidence/output types | Классифицирует MVP baseline и candidate/deferred types, их source of truth, validation, registry/package and template behavior. |
| `docs/09-aggregate-boundaries-and-invariants.md` | Boundary/invariants specification before database design | Фиксирует aggregate roots, ownership, invariants, revision/invalidation rules и draft boundary decisions для ратификации перед Database Schema V1. |
| `docs/10-auth-workspace-rbac-model.md` | Access/tenant-boundary specification before database design | Фиксирует users, personal/organization workspaces, invitations, memberships, roles, permission baseline, isolation and SaaS readiness для ратификации перед Database Schema V1. |
| `docs/11-ai-project-ingestion-and-assistance-model.md` | AI-assisted project source ingestion specification before database design | Фиксирует project source files, proposals, human confirmation, traceability, privacy/isolation/audit и связи с ИД для учёта перед Database Schema V1. |
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

### 44.1 Workspace tenant and access context

| Сущность / концепт | Назначение | Ключевые правила |
| --- | --- | --- |
| `Workspace` / `TenantContext` | Логическая граница данных и workspace-scoped authorization SaaS | `Personal Workspace` и `Organization Workspace` изолируют domain data; cross-workspace access/reuse запрещены без отдельной политики. |
| `User` | Аккаунт физического лица | Не несёт глобальной business role; может иметь memberships в нескольких workspaces. |
| `Personal Workspace` | Полноценная личная рабочая область | Создаётся автоматически при регистрации; пользователь получает `Owner` membership. |
| `Organization Workspace` | Совместная рабочая область команды | Участники вступают через stored invites и memberships; creator становится `Owner`. |
| `Membership` | Связь пользователя с workspace и источник полномочий | Права принадлежат membership; role одного workspace не переносится в другой. |
| `Invite` | Контролируемое приглашение в organization workspace | URL не содержит прав; роль, срок, revocation, usage and email binding определяются сохранённым invite. |
| `Role` | `Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer` | Permission baseline описан в `docs/10-auth-workspace-rbac-model.md` и требует ратификации до физической схемы. |

### 44.2 Project and organization context

| Сущность / концепт | Назначение | Source of truth / связи |
| --- | --- | --- |
| `Object` / `Project` | Строительный объект, основной пользовательский контейнер | Владеет настройками и ссылками, но не должен содержать все документы как giant aggregate. |
| `EngineeringSystem` | Раздел или система: ОВиК, ВК, вентиляция, отопление, водоснабжение, канализация | Связан с объектом, работами, документами и схемами. |
| `FolderTree` / `Folder` | Самостоятельный object-scoped aggregate и его business collection nodes | Draft baseline `docs/09-aggregate-boundaries-and-invariants.md`: владеет hierarchy/placement, move, duplicate и soft delete; не владеет lifecycle документов. |
| `CompanyProfile` | Переиспользуемая карточка компании внутри tenant | Может меняться для будущих объектов; не должна ретроспективно менять исторические документы. |
| `ObjectCompanySnapshot` | Зафиксированные данные компании на объекте | Используется документами и реестром для исторически устойчивого рендера. |
| `Representative` | Представитель/подписант и его полномочия | Допускаются global, object и temporary representatives; важны порядок и overrides. |
| `RegistrySignerSnapshot` | Выбранный подписант конкретного реестра | Подписант реестра может отличаться от подписантов актов. |
| `ProjectDrawingSet` | Комплект рабочих чертежей, по которым выполняются работы | Draft baseline: owned entity в `ObjectDocumentationContext`; не является исполнительной схемой; участвует в АОСР и блоке реестра. |
| `ProjectSourceFile` | Загруженный project source material: PDF, drawing, specification или future supported source | Принадлежит конкретным `Workspace` и `Object`; служит provenance/reference context, но не становится единственным source of truth. |

### 44.3 Work and documentation aggregates

| Сущность / концепт | Назначение | Ключевые правила |
| --- | --- | --- |
| `WorkItem` / work statement | Выполненная работа/участок/результат СМР | Draft baseline: самостоятельный aggregate root для V1 не вводится; работа, утверждаемая актом, хранится в typed `Document` payload, а reusable WorkItem остаётся future candidate. |
| `Document` | Общая оболочка typed document | Содержит immutable `document_type`, status, number/date, typed payload, links, template version и revision. |
| `AOSR` | Акт освидетельствования скрытых работ | Typed document, связывает работу, представителей, проектную документацию, материалы, сертификаты, схемы и разрешение последующих работ. |
| `TestAct` | Акт испытаний | Typed document, фиксирует объект/методику/параметры/результаты испытаний и заключение. |
| `TechnicalReadinessAct` | Акт технической готовности | Обнаружен в sample-реестре; включение в MVP и подробная schema ещё требуют проработки. |
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
| `AIConsistencyFindingProposal` | Предложение о missing evidence, mismatch, incompleteness или иной inconsistency | Только reviewable finding с source citation; не является автоматически ошибкой или engineering approval. |

### 44.5 Aggregate boundary guardrails

- `Object` связывает данные объекта, но не поглощает documents, certificates, templates и packages в один giant aggregate.
- `Document`, `Certificate` и `ExecutiveScheme` должны иметь самостоятельный жизненный цикл.
- `RegistryProjection` является сервисом/проекцией, а не master aggregate.
- `Package Builder` должен рассматриваться как отдельный bounded context или application service с собственными snapshots/jobs.
- `DocumentLock` должен жить отдельно от document revision history.
- Draft baseline `docs/09-aggregate-boundaries-and-invariants.md` принимает отдельный object-scoped `FolderTree`, document-owned work meaning без самостоятельного `WorkItem` root для V1 и object-owned `ProjectDrawingSet`; эти choices требуют ратификации до Database Schema V1.
- Draft baseline `docs/11-ai-project-ingestion-and-assistance-model.md` требует Workspace/Object-scoped project files, proposal-only AI/OCR, human confirmation, traceability and audit до влияния на structured targets.
- Физическая модель хранения, storage tables и API ещё не утверждены.

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
- Классификация document/evidence/projection/package types и candidate test acts зафиксирована в `docs/08-document-types-catalog.md`; точный MVP type list всё ещё требует ратификации.

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
- project documentation, загружаемая для AI-assisted ИД, должна быть привязана к конкретным `Workspace` и `Object`, а originals/extracted content/proposals должны наследовать access restrictions source context;
- оригинальные загруженные файлы будущей системы должны иметь tenant isolation, access control, audit trail и storage policy;
- OCR/AI result не считается подтверждённым фактом до проверки пользователем; AI findings и подтверждения должны сохранять traceable source provenance и audit.

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
- считать uploaded project documentation, OCR text или AI response единственным source of truth либо применять AI proposal без user confirmation;
- ломать tenant isolation;
- заменять открытый архитектурный вопрос случайной технологической реализацией.

### 48.3 Decision-making behavior

- Если запрос касается source of truth, typed documents, registry projection, package snapshots, template versioning, locks/autosave, tenant isolation или privacy, агент должен проверить соответствие принятым решениям и при изменении принципа предложить ADR.
- Если пользовательская идея создаёт риск потери историчности, отсутствия подтверждающих файлов или невозможности пересобрать комплект, агент должен явно возразить и объяснить риск.
- Новые вопросы, на которые пользователь дал архитектурно значимый ответ, должны быть зафиксированы в `CONVERSATION_QA_LOG.md` и консолидированы здесь.
- На стадии реализации агент должен предпочитать domain-specific UI и contracts универсальным конструкторам.

---

## 49. Current Next Step

Текущий архитектурный этап выполнен в первой формальной редакции:

```text
Data Model v1 + Aggregate Boundaries
```

Создан документ:

```text
docs/06-data-model-v1.md
```

Документ определяет:

- bounded contexts и aggregate roots;
- ownership и ссылки между `Object`, `Folder`, `Document`, `Certificate`, `ExecutiveScheme`, `Template`, `Package` и projections;
- основу typed payload для АОСР и рамки первых актов испытаний;
- snapshot boundaries для компаний, документов и комплектов;
- lifecycle, revision и invalidation events;
- MVP scope и deferred scope;
- открытые решения, которые ещё запрещают переход к физической БД/API.

Текущий следующий шаг:

```text
Review and ratify aggregate boundaries/invariants, auth/workspace/RBAC and AI project ingestion/assistance before Database Schema V1
```

Создан draft-документ `docs/07-aosr-domain-specification.md`, который формализует АОСР как первый typed document: structure blocks, validation categories, snapshots, revisions, registry behavior, package interaction и audit requirements.

Создан draft-документ `docs/08-document-types-catalog.md`, который разделяет typed acts, evidence items, derived registry и package outputs, а для specialised test acts сохраняет candidate status до подтверждения первого MVP scope.

Создан draft-документ `docs/09-aggregate-boundaries-and-invariants.md`, который формально описывает owners, aggregate roots, invariants, revision/invalidation rules и три boundary baseline choices: отдельный object-scoped `FolderTree`, document-owned work meaning без самостоятельного `WorkItem` root на первом этапе и `ProjectDrawingSet` как owned entity object documentation context.

Создан draft-документ `docs/10-auth-workspace-rbac-model.md`, который конкретизирует tenant isolation через `Workspace`, разделяет `Personal Workspace` и `Organization Workspace`, определяет invitation/membership access model и permission baseline ролей `Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer`.

Создан draft-документ `docs/11-ai-project-ingestion-and-assistance-model.md`, который описывает загрузку project source materials по `Workspace`/`Object`, assistant-only extraction/error detection proposals, human confirmation, связи с ИД и требования traceability/privacy/audit.

Нужно ратифицировать boundary choices, auth/workspace/RBAC baseline, AI project ingestion/assistance baseline, точный набор MVP document types, открытые AOSR domain choices (обязательные participant roles, обязательность схем и документов качества для конкретных случаев, требуемую степень структуры work/location/project references и правила warning acceptance) и remaining policy choices по evidence/package/registry/privacy. До такого подтверждения нельзя считать утверждёнными физическую БД, API, frontend state architecture, выбор backend/frontend стека или реализацию генератора.

Планируемый документ Database Schema V1 после этих review gates:

```text
docs/12-database-schema-v1.md
```

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
17. `Workspace` является tenant boundary, а workspace-права принадлежат `Membership`, не глобальному `User`.
18. Каждый новый пользователь получает полноценный `Personal Workspace`; organization invitations не смешивают личные и командные данные.
19. Project source files для AI-assisted ИД всегда scoped к `Workspace` и `Object`; upload не делает их единственным source of truth.
20. AI extraction и error detection создают только traceable/auditable proposals; пользователь подтверждает extracted data и proposed links.

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
| Можно ли использовать загруженный проект для AI-assisted ИД и поиска ошибок? | Да, как Workspace/Object-scoped source material с proposals-only workflow. | Structured data остаются source of truth; extracted data/links/findings требуют user confirmation, traceability and audit. |
| Где хранить данные компании на объекте? | Через `ObjectCompanySnapshot`. | Изменение профиля компании не переписывает исторические документы объекта. |
| Может ли Object владеть всем сразу? | Нет. | Требуются отдельные aggregates/contexts для documents, certificates, schemes, templates и packages. |
| Какая стадия проекта сейчас? | System Architecture Design, не coding. | Следующий шаг — ратификация Aggregate Boundaries/Invariants, Auth/Workspace/RBAC и AI Project Ingestion/Assistance перед Database Schema V1, не scaffold приложения. |
| Кто является пользователем SaaS? | Физическое лицо с одним аккаунтом и автоматическим `Personal Workspace`. | Пользователь может работать сам и состоять в нескольких organization workspaces. |
| Где живут права доступа? | В `Membership` конкретного workspace, а не в `User` напрямую. | Один user может иметь разные роли в разных isolated tenants. |
| Как пользователь вступает в организацию? | Через stored `Invite`, acceptance которого создаёт membership. | Invite URL не содержит доверенных прав; role/expiry/revocation/usage определяются сохранённым invite. |

### 51.1 Accepted ADR register

| ADR | Решение | Статус |
| --- | --- | --- |
| ADR 0001 | Structured data являются source of truth; файлы и реестры производны. | Принято. |
| ADR 0002 | Используются typed documents вместо generic documents. | Принято. |
| ADR 0003 | Реестр является derived projection. | Принято. |
| ADR 0004 | Требуются document locks и snapshot-oriented autosave; детали реализации впереди. | Принято как принцип, требует детализации. |
| ADR 0005 | Template versions версионируются и не изменяются после использования; детали template engine впереди. | Принято как принцип, требует детализации. |

### 51.2 Draft boundary baseline requiring ratification

| Вопрос границы | Draft baseline в `docs/09-aggregate-boundaries-and-invariants.md` | Причина |
| --- | --- | --- |
| Является ли `FolderTree` отдельным aggregate? | Да, object-scoped aggregate root. | Tree operations имеют собственные инварианты и не должны менять `Object` или document content. |
| Является ли `WorkItem` отдельным aggregate root для V1? | Нет; meaning работы, утверждаемой актом, принадлежит typed `Document` payload. | Shared work lifecycle ещё не подтверждён; released act должен быть автономно воспроизводим. |
| Где живёт `ProjectDrawingSet`? | Owned entity в `ObjectDocumentationContext`. | Это общий проектный basis объекта, не file-backed as-built evidence и пока не независимый lifecycle. |

Эти решения конкретизируют существующие принципы и должны быть подтверждены до утверждения Database Schema V1; они не изменяют ADR 0001-0005.

### 51.3 Draft auth/workspace/RBAC baseline requiring ratification

| Access question | Draft baseline в `docs/10-auth-workspace-rbac-model.md` | Причина |
| --- | --- | --- |
| Как соотносятся tenant и workspace? | `Workspace` конкретизирует tenant boundary для domain data и workspace-scoped authorization. | Нужна единая изоляционная граница для personal и organization usage. |
| Как регистрируется пользователь? | Natural-person account автоматически получает полный `Personal Workspace` и `Owner` membership. | Независимый инженер ПТО должен полноценно работать без организации. |
| Как работает совместная организация? | `Organization Workspace` имеет memberships; user может состоять в нескольких таких workspaces. | Поддерживает SaaS для команд без смешивания tenant data. |
| Где находятся роли? | В `Membership`; роли baseline: `Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer`. | Глобальный user role создавал бы риск доступа между организациями. |
| Как выдаётся доступ? | Stored invite определяет target/role/conditions; URL несёт только opaque token/reference. | Права нельзя доверять параметрам ссылки. |

Auth/workspace baseline дополняет обязательную tenant isolation и требует ратификации permission details, invitation governance, ownership continuity, privacy/audit и commercial lifecycle до утверждения Database Schema V1. Новый ADR не требуется: фундаментальные принципы ADR 0001-0005 не меняются.

### 51.4 Draft AI project ingestion/assistance baseline requiring ratification

| Ingestion question | Draft baseline в `docs/11-ai-project-ingestion-and-assistance-model.md` | Причина |
| --- | --- | --- |
| Где живут uploaded project files? | Каждый source file scoped to one `Workspace` and one `Object`. | Project content должен соблюдать tenant isolation и object context. |
| Становится ли загруженный проект source of truth? | Он является source material/provenance, но confirmed structured data and relations остаются source of truth. | Нельзя заменить domain model файлом или AI interpretation. |
| Что может сделать AI/OCR? | Создать extraction proposals и consistency findings with source citations. | AI помогает анализу, но не утверждает инженерный факт. |
| Как proposal влияет на ИД? | Только после user confirmation, permission checks, validation and audit appropriate to target owner. | Документы/evidence/released history должны оставаться контролируемыми. |
| Какие связи поддерживаются концептуально? | Project context может предлагать ссылки к `ProjectDrawingSet`, document-owned work, `AOSR`, `TestAct`, evidence expectations and scheme comparisons. | Project file не становится `Certificate` или `ExecutiveScheme` и не нарушает ownership boundaries. |

Этот baseline развивает принятые правила structured source of truth, AI assistant only и tenant isolation. Он требует решения privacy/data-processing, source citation, access/audit and MVP material scope до утверждения Database Schema V1; новый ADR не требуется.

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

- Должен ли draft baseline отдельного object-scoped `FolderTree` быть ратифицирован для Database Schema V1?
- Подтверждается ли отсутствие самостоятельного `WorkItem` aggregate root на первом этапе, или уже в MVP нужен shared work lifecycle?
- Подтверждается ли `ProjectDrawingSet` как owned entity `ObjectDocumentationContext`, либо ему нужен отдельный lifecycle?
- Должен ли `RepresentativeProfile` стать отдельным library aggregate в первой схеме?
- Нужен ли reusable `Material`/equipment catalog или достаточно document-owned `MaterialUsage` в первом scope?
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

- Должен ли draft baseline `Workspace` as tenant boundary, automatic `Personal Workspace` и membership-owned roles быть ратифицирован для Database Schema V1?
- Разрешены ли multi-use organization invites в первом scope, каковы owner transfer/recovery rules и нужна ли fine-grained object assignment policy?
- Каковы точные права `Foreman` и `Viewer` на оригиналы evidence, outputs и lock override?
- Какие privacy/access/audit requirements предъявляются к реальным сертификатам, схемам и персональным данным представителей?
- Допустимы ли когда-либо controlled copy/transfer/export data между личным и organizational workspace или между организациями?
- Нужны ли ЭЦП/юридически значимое подписание, импорт legacy DOCX/PDF, BIM/CAD/ERP integrations, public API или offline mode, и только на каком последующем этапе?

### 52.7 AI project ingestion and assistance

- Какие PDF project materials и specifications входят в первый supported source scope, а какие форматы остаются deferred?
- Как пользователь управляет заменой/supersession project source files и staleness ранее созданных proposals?
- Какая granular source citation достаточна для extracted data и inconsistency findings?
- Какие роли вправе upload, process, review, confirm/dismiss и видеть sensitive project originals/extracted content?
- Какие AI-assisted checks после подтверждения являются hints/warnings, а какие могут стать formal domain validation rules?
- Какова approved privacy/data-processing policy до анализа реального проекта AI/OCR?

### 52.8 Technology decisions explicitly deferred

До отдельных решений остаются невыбранными:

- backend/frontend stack;
- база данных и миграции;
- API и repository implementation;
- dependency/tooling strategy;
- Docker, deployment и CI/CD;
- OCR/AI provider and data-processing policy.

Пока эти вопросы открыты, агент не должен создавать реализационные файлы, выдавая выбор технологии за уже принятое решение.

---

## 53. Architectural Progress Log

Policy:

- Каждый крупный архитектурный документ должен попадать в этот log.
- `PROJECT_MEMORY.md` всегда должен отражать актуальное состояние архитектуры.
- После нового архитектурного решения нужно обновлять:
  1. соответствующий документ;
  2. `PROJECT_MEMORY.md`;
  3. `CONVERSATION_QA_LOG.md`, если решение принято в обсуждении;
  4. ADR, если решение меняет архитектурный принцип.

### 2026-05-26 — docs/PROJECT_MEMORY.md

- Статус: `active`
- Описание: consolidated single source of truth for PTO ID System.

### 2026-05-26 — Data Model V1 specification created

- Документ: `docs/06-data-model-v1.md`
- Статус: `draft`
- Описание: formal domain model and aggregate design specification for PTO ID System.

Создана первая формальная спецификация модели данных:

```text
docs/06-data-model-v1.md
```

Зафиксированный прогресс:

- принятые архитектурные правила преобразованы в каталог aggregate roots, candidate boundaries, entities и value objects;
- формализованы ownership rules и lifecycle ownership без выбора физического хранения;
- описаны snapshot model и revision model, включая правило `final` document edit -> new revision и invalidation зависимых package snapshots;
- закреплены file ownership rules для сертификатов, исполнительных схем, шаблонов и generated artifacts;
- формализованы модели `Certificate`, `ExecutiveScheme`, `Package` и `RegistryProjection`;
- составлена relationships matrix;
- разделены MVP scope, deferred scope и вопросы, требующие подтверждения владельца проекта.

Что не было принято или реализовано этим этапом:

- физическая схема БД, SQL или ORM;
- backend/frontend stack;
- API;
- механизм хранения файлов;
- очередь package builds;
- template/OCR implementation;
- любой программный код продукта.

Текущий статус:

```text
Data Model V1 documented; open aggregate and MVP decisions require review before implementation design.
```

### 2026-05-26 — AOSR domain specification created

- Документ: `docs/07-aosr-domain-specification.md`
- Статус: `draft`
- Описание: first formal typed-document domain specification for AOSR, including blocks, validation, snapshots, revisions, registry projection and package interaction.

Зафиксированный прогресс:

- АОСР описан как `AOSRPayload` внутри aggregate root `Document`, а не как файл или generic form;
- формализованы header, work, participants, materials, certificate, executive scheme и attachments blocks;
- определены inherited validation invariants и draft baseline для `ERROR`, `WARNING` и `INFO`;
- описаны rendering, snapshot, revision, registry, package и audit rules;
- обязательности, не утверждённые ранее (например, точный состав подписантов и обязательность схемы для каждого случая), оставлены открытыми для ратификации.

Что не было изменено этим этапом:

- принятые архитектурные принципы ADR 0001-0005;
- база данных, API, frontend или технологический стек;
- правила, требующие отдельного решения владельца проекта по обязательной форме АОСР.

### 2026-05-26 — Document types catalog created

- Документ: `docs/08-document-types-catalog.md`
- Статус: `draft`
- Описание: catalog of typed acts, evidence items, registry projection and package outputs for MVP-oriented design and future extension.

Зафиксированный прогресс:

- перечислены обязательные для рассмотрения categories: AOSR, test acts, schemes, quality evidence, registry and package;
- специализированные акты испытаний (`HydraulicTestAct`, `PressureTestAct`, `FlushingAct`) обозначены как MVP candidates, а не молча утверждённый первый состав;
- `TechnicalReadinessAct` сохранён как deferred typed document candidate до определения schema;
- `Declaration` и `Passport` классифицированы как file-backed quality evidence kinds в текущей Certificate Library model;
- для каждого type описаны source of truth, базовые fields/links, validation, registry/package and template behavior, snapshots/revisions и open questions.

Что не было принято этим этапом:

- окончательный список typed documents первого MVP;
- новые фундаментальные архитектурные принципы или изменения ADR;
- технические решения по хранению, API, стеку или генерации.

### 2026-05-26 — Aggregate boundaries and invariants specification created

- Документ: `docs/09-aggregate-boundaries-and-invariants.md`
- Статус: `draft`
- Описание: formal ownership, aggregate root, invariant, revision and invalidation specification before Database Schema V1.

Зафиксированный прогресс:

- систематизированы aggregate roots, owned entities, value/snapshot/projection и operational boundaries;
- подробно закреплено, почему `Object` не поглощает independent document/evidence/template/package lifecycles;
- сформулированы allowed/forbidden operations, cross-aggregate reference rules, package and registry invalidation triggers;
- установлен draft baseline: `FolderTree` как отдельный object-scoped aggregate root;
- установлен draft baseline: work meaning первого scope принадлежит typed `Document`, а самостоятельный `WorkItem` root не вводится без подтверждённого shared workflow;
- установлен draft baseline: `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`, отличной от `ExecutiveScheme`;
- подтверждено, что `DocumentLock` является operational lease и не увеличивает document revision.

Что требует ратификации перед Database Schema V1:

- перечисленные boundary baseline choices;
- точный MVP document type/validation scope;
- границы reusable representatives/materials;
- evidence replacement/retention, registry override scope и package readiness rules.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005;
- физическая база данных, API, стек, миграции или implementation artifacts.

### 2026-05-26 — Auth, workspace and RBAC model created

- Документ: `docs/10-auth-workspace-rbac-model.md`
- Статус: `draft`
- Описание: formal access, tenant-boundary, invitation, membership and role specification before Database Schema V1.

Зафиксированный прогресс:

- `Workspace` формализован как tenant boundary для domain data и workspace-scoped authorization;
- определены `Personal Workspace` и `Organization Workspace`, включая автоматическое создание полноценного personal tenant при регистрации;
- права закреплены за `Membership`, а не за глобальным `User`;
- описаны invitation/join flow, включая правило, что invite URL не содержит доверенных прав;
- сформирован permission baseline ролей `Owner`, `Admin`, `PTO Engineer`, `Foreman` и `Viewer`;
- определены cross-workspace isolation, audit, security и SaaS commercial readiness guardrails.

Что требует ратификации перед Database Schema V1:

- workspace lifecycle/ownership continuity и organization creation governance;
- detailed permission scope, evidence/privacy/download and lock override rules;
- invite modes, expiration/revocation/email-verification and multi-use policy;
- cross-workspace copy/transfer/export and commercial entitlement boundaries;
- обязательный состав audit events и retention requirements.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005;
- физическая база данных, API, стек, миграции или implementation artifacts.

### 2026-05-27 — AI project ingestion and assistance model created

- Документ: `docs/11-ai-project-ingestion-and-assistance-model.md`
- Статус: `draft`
- Описание: architectural model for Workspace/Object-scoped project source uploads and assistant-only AI proposals for ID preparation and error checking before Database Schema V1.

Зафиксированный прогресс:

- project source files определены как object/workspace-scoped originals and provenance, но не как единственный source of truth;
- закреплено, что source of truth остаётся за confirmed structured data и explicit domain relations;
- описаны future source types, включая PDF, DWG/DXF future scope, DOCX/XLSX, scanned PDFs, specifications and drawings;
- определены extraction proposals, inconsistency findings, source citations, human confirmation and audit requirements;
- описаны связи source materials с `Object`, `ProjectDrawingSet`, document-owned work statement, `AOSR`, `TestAct`, `Certificate` и `ExecutiveScheme`;
- установлены privacy/security and tenant isolation guardrails для originals, extracted content and AI results;
- Database Schema V1 перенесён на планируемый путь `docs/12-database-schema-v1.md`, чтобы до него учесть ingestion baseline.

Что требует ратификации перед Database Schema V1:

- first supported project material scope, source-file lifecycle and citation granularity;
- permissions for upload/processing/review/confirmation and access to originals/extracted content;
- privacy/data-processing policy before any real AI/OCR processing;
- staleness, finding severity and audit/retention requirements.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005: AI по-прежнему только assistant, structured data остаются source of truth;
- AI/OCR provider, physical storage, база данных, API, SQL, стек, зависимости или implementation artifacts.
