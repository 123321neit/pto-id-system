# PROJECT_MEMORY
# PTO ID SYSTEM
# EXECUTIVE DOCUMENTATION PLATFORM
# MASTER CONTEXT / SOURCE OF TRUTH
# VERSION: 2026-05-29-SHARING-ACCESS-MODEL-AMENDMENT
# STATUS: FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED
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
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED
```

Проект принял первый явно разрешённый infrastructure/bootstrap scaffold,
отдельный backend module architecture skeleton, первый маленький technical
frontend-backend status slice, database foundation technical slice и object
storage foundation technical slice. Это не feature coding и не production MVP
implementation. Главная цель текущего этапа — удерживать минимальную
инженерную основу репозитория без доменной реализации до отдельного
feature/database/API задания.

Canonical ADR baseline accepted. Authoritative ADR references:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

Future implementation must comply with these ADRs. They consolidate existing accepted decisions only and do not permit production feature coding.

MVP access amendment accepted:

```text
docs/19-sharing-and-access-model-v1.md supersedes docs/10-auth-workspace-rbac-model.md for MVP implementation scope
```

Future workspace/session/access tasks must use owner-based sharing, share codes and capability grants from `docs/19`, not the older role matrix.

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

### 5.8 Owner-based sharing over MVP RBAC

Для MVP сложный RBAC не используется. Access model первого scope описан в `docs/19-sharing-and-access-model-v1.md`:

- один `Global System Admin` для operational/admin path;
- regular users владеют своими workspaces/project data и certificate libraries;
- доступ другим пользователям выдаётся через share codes / invite codes;
- accepted code creates a persistent resource-scoped share grant;
- default access is view-only;
- owner selects explicit capabilities вместо ролей.

`docs/10-auth-workspace-rbac-model.md` сохраняется как historical/deferred RBAC reference, но его role matrix (`Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer`) superseded for MVP implementation scope.

---

## 6. Users, workspaces and sharing

`User` представляет физическое лицо, создающее аккаунт. В MVP обычный пользователь владеет своими workspaces/project data and certificate libraries. Access for other users is granted by owner-selected share grants, not by a complex role matrix.

После регистрации:

- автоматически создаётся owned/personal working context;
- регистрирующийся пользователь становится owner своих данных в этом context;
- личный workspace позволяет полноценно вести объекты, документы, evidence, реестры и комплекты без участия организации.

Пользователь может подключаться к чужим workspaces/project databases или certificate libraries через share codes / invite codes. Личные данные, чужие workspaces и shared libraries не смешиваются автоматически.

MVP access concepts:

- `Global System Admin` — ровно один operational/admin user, controlled by deployment/config, separate from business collaboration;
- `Regular User` — owns own workspaces/project data/libraries;
- `Share Grant` — capability-based access to a specific owner resource.

Default permission is view-only. Owner chooses explicit capabilities for each code. No `Foreman` role and no `Owner/Admin/PTO Engineer/Viewer` matrix are implemented in MVP.

---

## 7. Multi-tenancy and workspace isolation

Критически важное решение:

```text
isolated workspace/tenant architecture
```

`Workspace` является tenant boundary для business data and resource-scoped authorization. Для MVP важно не смешивать:

- owner workspace/project database;
- another user's connected workspace access through `WorkspaceShareGrant`;
- owner certificate library;
- another user's connected certificate library access through `CertificateLibraryShareGrant`.

Каждый workspace имеет логически изолированные данные.

Пользователь без ownership или accepted grant for this workspace не видит:

- объекты;
- документы;
- сертификаты;
- исполнительные схемы;
- компании;
- представителей;
- комплекты;
- шаблоны объекта.

Один пользователь может владеть своими данными и одновременно иметь accepted grants к чужим resources, но это не разрешает cross-workspace links, reuse или copy domain data без отдельной утверждённой политики.

Workspace/project database — collaboration tenant when shared by owner grant, а `CompanyProfile` / `ObjectCompanySnapshot` — реквизиты сторон в документации; одно не даёт автоматически прав на другое. Архитектура должна с самого начала учитывать workspace/tenant boundary во всех ключевых сущностях.

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
- auth, workspace, invitation, membership and RBAC draft baseline before Database Schema V1, now superseded for MVP by owner-based sharing/access.
- AI project ingestion and assistance draft baseline before Database Schema V1.
- owner-based sharing/access amendment for MVP in `docs/19-sharing-and-access-model-v1.md`.
- conceptual Database Schema V1, applying the required pre-schema baselines without choosing SQL, ORM, API or implementation stack.
- lifecycle, immutability, numbering, validation, registry override safety, package determinism and AI/OCR review follow-up produced by Schema V1 review in `docs/13-domain-lifecycle-immutability-validation-v1.md`.
- conceptual Backend/API Architecture V1 in `docs/14-backend-api-architecture-v1.md`, defining modular backend boundaries, commands/read models, consistency, concurrency, validation, async workflows and tenant-safe API policy without implementation choices.
- conceptual API Command/Read Model Contracts V1 in `docs/15-api-command-readmodel-contracts-v1.md`, defining envelope/result/error/async semantics, intent contracts, expected versions/idempotency, validation findings and UI read-model composition without transport or implementation choices.
- product MVP Scope and First Forms V1 in `docs/16-mvp-scope-and-first-forms-v1.md`, defining the first production-usable scope around AOSR, file-backed evidence, executive schemes, derived registry, package outputs, onboarding/contextual hints and AI-optional delivery without stack or implementation choices.
- practical Tech Stack and Implementation Strategy V1 in `docs/17-tech-stack-and-implementation-strategy-v1.md`, selecting a boring MVP-oriented direction: React/TypeScript/Vite frontend, NestJS modular monolith backend, PostgreSQL, Redis/BullMQ async jobs, domain-scoped file storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR.
- Initial Repository Bootstrap and Development Rules V1 in `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`, defining the final pre-scaffold gate, coding preconditions, first scaffold scope, CI/dev quality gates, infrastructure portability/no server lock-in, forbidden shortcuts, docs/16 precedence, ADR presence handling, Foreman restriction and architecture-violation criteria.
- canonical ADR baseline in `docs/adr/`, establishing authoritative references for structured source of truth, typed documents, file-backed evidence/derived artifacts, immutable revisions/package snapshots and modular monolith/bounded contexts.
- first technical frontend-backend status slice, proving that the React shell can
  call the NestJS technical `/health` endpoint through `VITE_API_BASE_URL` and
  consume the shared technical response type from `packages/shared-types`.
- database foundation technical slice with empty Prisma schema, Prisma
  generation wiring and infrastructure-only database health status.
- object storage foundation technical slice with infrastructure-only
  S3-compatible config health status and no uploads/file APIs.

Не завершено:

- feature/domain API/uploads/generation implementation; every such task still requires separate explicit authorization and ADR compliance check;
- точная первая AOSR template baseline/participant requirements and remaining invite, privacy/access, retention, AI-processing and audit requirements за пределами зафиксированных V1 policies;
- production physical database mapping, migrations and business file storage implementation;
- repositories;
- physical API transport mapping and implementation;
- package builder implementation internals;
- registry override persistence/read-model detail beyond its documented V1 safety surface;
- search system;
- frontend state architecture;
- OCR extraction schemas;
- template placeholder/binding model;
- deferred fine-grained RBAC/privacy/commercial lifecycle details;
- frontend component architecture.

---

## 39. Open questions

### Q1 — Aggregate design

Baseline определён в `docs/09-aggregate-boundaries-and-invariants.md` и по заданию владельца проекта применён в conceptual `docs/12-database-schema-v1.md`. Любое расширение этих границ или их изменение должно быть подтверждено до Backend/API Architecture.

Зафиксированы как самостоятельные owners:

- Object aggregate;
- FolderTree aggregate;
- Document aggregate;
- Certificate aggregate;
- ExecutiveScheme aggregate;
- Package bounded context;
- Template bounded context;
- Registry projection service.

Применённые Schema V1 boundary choices, которые могут быть пересмотрены только явным последующим решением:

- `FolderTree` является отдельным object-scoped aggregate root;
- содержательная работа первого scope хранится typed `Document` payload, без самостоятельного `WorkItem` root;
- `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`;
- reusable boundaries для representatives/materials требуют решения.

### Q2 — Conceptual schema and physical database mapping

Первая storage-neutral conceptual schema таблиц, relationships, constraints, indexing considerations и snapshots создана в `docs/12-database-schema-v1.md`.

Нужно спроектировать:

- production physical table/index/constraint mapping;
- typed structured payload persistence strategy;
- transactions and concurrency boundaries;
- soft delete;
- tenant isolation.

### Q3 — API command and read model contracts

Conceptual Backend/API Architecture V1 создана в `docs/14-backend-api-architecture-v1.md`. На её основе в `docs/15-api-command-readmodel-contracts-v1.md` создан conceptual contract layer: common command/result/error/async vocabulary, intent payload/result semantics, expected versions/idempotency, validation findings, authorization scope и screen-specific read models без route list, OpenAPI или implementation stack.

После review нужно спроектировать:

- concrete MVP typed forms/required fields and first validation gates that use these contracts;
- policy details for permissions, privacy, retention, warning acknowledgement and AI processing;
- physical API transport mapping and implementation only after accepted contracts and MVP form scope.

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

Async build, immutable released snapshots, dependency manifest and deterministic rebuild requirement документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`.

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

Draft baseline project ingestion, proposals, confirmation, traceability and isolation определён в `docs/11-ai-project-ingestion-and-assistance-model.md`, отражён conceptual table families в `docs/12-database-schema-v1.md` и дополнен обязательным proposal/review flow в `docs/13-domain-lifecycle-immutability-validation-v1.md`.

Нужно определить оставшиеся policy/implementation details:

- supported extraction scope для сертификатов, схем, актов и uploaded project documentation;
- provider, privacy/data-processing consent и доступ ролей;
- требуемую granular source citation и retention rejected/stale proposals;
- какие подтвержденные checks могут стать formal domain validation rules.

### Q8 — Registry override layer

Разрешенная V1 surface (`hidden`, `sort_order`, `note`, signer selection и package display config) и запрет замены source facts/скрытия domain errors документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`. Нужно спроектировать persistence/read model, конкретные registry scopes/exports и UI-команды изменения owning entities.

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
Review first technical frontend-backend status slice, then request a separate workspace/session isolation skeleton task
```

Technical status slice уже добавлен только для проверки связи
frontend/backend/shared/CI. Он не разрешает production feature coding, АОСР,
database/API/storage/generation implementation, OpenAPI, auth, uploads, queues,
AI/OCR или domain validation. Следующий implementation step должен быть отдельной
явной задачей и проверяться against `docs/PROJECT_MEMORY.md` and canonical ADR
0001-0005.

Pre-schema источники baseline:

```text
docs/09-aggregate-boundaries-and-invariants.md
docs/10-auth-workspace-rbac-model.md
docs/11-ai-project-ingestion-and-assistance-model.md
```

По прямому заданию владельца проекта их обязательные принципы применены в новом документе:

```text
docs/12-database-schema-v1.md
```

Database Schema V1 является conceptual/storage-neutral specification: она описывает table families, owners, relationships, constraints, indexing considerations, MVP/deferred scope и вопросы перед Backend/API, но не выбирает SQL, ORM, миграции или реализацию.

Review Schema V1 создал обязательный conceptual/storage-neutral follow-up:

```text
docs/13-domain-lifecycle-immutability-validation-v1.md
```

Он документирует V1 policies для lifecycle typed documents/evidence/packages/artifacts, editable-through-revision `final`, historical rebuild, structured numbering, validation gates, `RegistryOverride` safety, deterministic async packages, AI/OCR human review и границы `FolderTree`. Backend/API Architecture может начаться только после review и acceptance этого follow-up.

По заданию владельца проекта следующим conceptual этапом создан:

```text
docs/14-backend-api-architecture-v1.md
```

Он применяет зафиксированные policies через modular-monolith modules, explicit domain commands, UI-oriented read models, transaction/eventual boundaries, optimistic versioning, authoritative validation, package/artifact/AI async flows, tenant authorization and idempotency/error rules. Документ не является реализацией и не разрешает coding.

На его основе по прямому переходу владельца проекта создан contract-level документ:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

Он определяет common command envelope/results/errors/async operations, intent-level payload/result semantics, version/idempotency/invalidation behavior, validation finding contract, authorization scope и UI read-model fields. Документ не является OpenAPI/transport design и не разрешает coding.

На его основе по прямому переходу владельца проекта создан product/MVP-scope документ:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

Он фиксирует первую production-usable поставку: АОСР как mandatory first-class form, certificate library, executive schemes, derived registry, package builder, generated DOCX/PDF/registry/ZIP outputs, search/collaboration/onboarding MVP boundaries and explicit non-MVP exclusions. Документ подчеркивает, что MVP must be usable without AI/OCR, а AI/OCR остается optional/deferred and proposal-only.

После review рекомендуемый следующий документ:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

`docs/17-tech-stack-and-implementation-strategy-v1.md` фиксирует pragmatic MVP implementation direction:

- React + TypeScript + Vite frontend;
- React Hook Form, TanStack Query/Table and restrained UI primitives for large validation-heavy PTO forms;
- TypeScript on Node.js LTS with NestJS modular monolith backend;
- HTTP JSON command/query API without CRUD-first endpoints or OpenAPI-first design;
- PostgreSQL as relational database with controlled JSONB, explicit transactions and version-aware snapshots;
- Redis/BullMQ workers for package builds, DOCX/PDF/ZIP generation, future AI/OCR and indexing;
- domain-scoped local/S3-compatible storage for originals and generated artifacts;
- DOCX templates rendered from structured data, PDF conversion in workers and ZIP generation from immutable package manifests;
- PostgreSQL relational/full-text/trigram search first, semantic/vector search deferred;
- AI/OCR optional, async, provider-abstracted and proposal-only.

На его основе создан final pre-scaffold gate:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Он фиксирует enforceable first-bootstrap rules:

- first scaffold requires acceptance of docs/18 and a separate explicit first scaffold task;
- first scaffold is limited to tooling/app shells/shared config and MUST NOT include production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR or deployment infrastructure;
- infrastructure portability/no server lock-in is mandatory: provider is replaceable, config/env drives database/Redis/storage/public URLs/CORS/session/app URLs, provider SDKs stay inside infrastructure adapters, and generated artifact links resolve through storage/download service;
- docs/16 has implementation precedence over older docs/08 TestAct candidate wording;
- canonical ADR 0001-0005 physical files now exist in `docs/adr/` and are authoritative references for implementation compliance;
- Foreman active permissions are blocked without separate approval;
- exact first AOSR template participant requirements must not be hardcoded before template review;
- architecture violation criteria and stop/correct process are defined.

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
| `docs/09-aggregate-boundaries-and-invariants.md` | Boundary/invariants specification before database design | Фиксирует aggregate roots, ownership, invariants, revision/invalidation rules и baseline decisions, применённые в conceptual Schema V1. |
| `docs/10-auth-workspace-rbac-model.md` | Historical/deferred RBAC reference | Role/membership matrix superseded for MVP by `docs/19-sharing-and-access-model-v1.md`; tenant isolation, token safety, audit and revocation principles remain background when compatible. |
| `docs/11-ai-project-ingestion-and-assistance-model.md` | AI-assisted project source ingestion specification before database design | Фиксирует project source files, proposals, human confirmation, traceability, privacy/isolation/audit и связи с ИД, отражённые в Schema V1. |
| `docs/12-database-schema-v1.md` | Conceptual Database Schema V1 before Backend/API design | Применяет обязательные baseline-границы в storage-neutral table/relationship/constraint model, сохраняя открытыми physical mapping и domain/policy decisions. |
| `docs/13-domain-lifecycle-immutability-validation-v1.md` | Schema V1 lifecycle/immutability/validation follow-up before Backend/API design | Фиксирует storage-neutral lifecycle, historical rebuild, numbering, validation, override safety, package determinism, AI review flow и FolderTree boundary для review/acceptance. |
| `docs/14-backend-api-architecture-v1.md` | Conceptual Backend/API Architecture V1 before command/read-model contract design | Фиксирует modular-monolith modules, command/query boundary, UI read models, transactions/concurrency, validation, async outputs/AI and tenant-safe API principles без кода или technology selection. |
| `docs/15-api-command-readmodel-contracts-v1.md` | Conceptual API Command/Read Model Contracts V1 before MVP forms | Фиксирует command/result/error/async semantics, intent contracts, expected versions/idempotency, validation findings, screen reads and scope rules без OpenAPI, code или technology selection. |
| `docs/16-mvp-scope-and-first-forms-v1.md` | Product MVP Scope and First Forms V1 before technology selection | Фиксирует первую production-usable поставку вокруг АОСР, certificate library, executive schemes, registry, package outputs, onboarding hints and AI-optional delivery без code/scaffold/SQL/OpenAPI или выбора стека. |
| `docs/17-tech-stack-and-implementation-strategy-v1.md` | Tech Stack and Implementation Strategy V1 before repository bootstrap | Фиксирует pragmatic MVP stack and implementation direction: React/TypeScript/Vite, NestJS modular monolith, PostgreSQL, Redis/BullMQ, domain-scoped storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR; still no code/scaffold/migrations/OpenAPI. |
| `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` | Initial Repository Bootstrap and Development Rules V1 before first scaffold | Фиксирует final pre-scaffold gate: preconditions, invariants, first scaffold scope, infrastructure portability/no server lock-in, CI/dev gates, forbidden shortcuts, docs/16 precedence, ADR handling, Foreman restriction, AOSR template hardcode ban and architecture violation rules. |
| `docs/19-sharing-and-access-model-v1.md` | MVP sharing/access architecture amendment | Replaces complex RBAC with owner-based workspace/certificate-library sharing, opaque share codes and capability grants. |
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
| `Workspace` / `TenantContext` | Логическая граница данных и resource-scoped authorization SaaS | Owner workspaces/project databases изолируют domain data; accepted grants do not permit unrelated workspace access/reuse. |
| `User` | Аккаунт физического лица | В MVP user owns own data/libraries and can accept grants to specific resources; no global business role. |
| `Global System Admin` | Operational/admin user controlled by deployment/config | Exactly one expected initially; separate from owner/user sharing and not a business collaborator. |
| `OwnedWorkspace` | Полноценная рабочая область/project database пользователя | User owns objects, documents, evidence, registry/package outputs and share grants in this scope. |
| `WorkspaceShareCode` | Opaque code/link for connecting another authenticated user to an owned workspace | Capabilities are stored server-side; default view-only; code can expire, revoke and rotate. |
| `WorkspaceShareGrant` | Persistent capability-based access to one owner workspace | Created after code acceptance; can be revoked; cannot cross workspace boundaries. |
| `CertificateLibrary` | Owner's reusable quality evidence library | Separate from workspace sharing; file-backed certificate invariant remains. |
| `CertificateLibraryShareCode` | Opaque code/link for connecting another user to an owner's certificate library | Separate flow from workspace collaboration; default view/use posture. |
| `CertificateLibraryShareGrant` | Persistent capability-based access to one certificate library | Preserves source owner/provenance; does not grant workspace access. |
| `GrantCapability` | Explicit allowed action such as `view_documents` or `use_certificates_in_documents` | Replaces MVP roles; default deny when missing. |
| `GrantAuditEvent` | Access lifecycle and sensitive action audit event | Records code creation/acceptance/capability change/revocation and use of write capabilities. |
| `Membership` / `Role` | Deferred RBAC concepts | Previous `Owner/Admin/PTO Engineer/Foreman/Viewer` matrix in `docs/10` is not MVP implementation scope. |

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
- Conceptual `docs/12-database-schema-v1.md` применяет отдельный object-scoped `FolderTree`, document-owned work meaning без самостоятельного `WorkItem` root для V1 и object-owned `ProjectDrawingSet` как schema baseline.
- Conceptual Schema V1 применяет Workspace/Object-scoped project files, proposal-only AI/OCR, human confirmation, traceability and audit до влияния на structured targets.
- Production physical mapping, migrations, ORM, transactions and API ещё не утверждены.

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

Перед изменением архитектуры или реализацией агент обязан прочитать этот master context и canonical ADR baseline:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

При необходимости проверки происхождения решения агент обращается к `docs/CONVERSATION_QA_LOG.md`, ADR и sample analyses.

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
- нарушать canonical ADR baseline;
- заменять открытый архитектурный вопрос случайной технологической реализацией.

### 48.3 Decision-making behavior

- Если запрос касается source of truth, typed documents, registry projection, package snapshots, template versioning, locks/autosave, tenant isolation или privacy, агент должен проверить соответствие принятым решениям и при изменении принципа предложить ADR.
- Если пользовательская идея создаёт риск потери историчности, отсутствия подтверждающих файлов или невозможности пересобрать комплект, агент должен явно возразить и объяснить риск.
- Новые вопросы, на которые пользователь дал архитектурно значимый ответ, должны быть зафиксированы в `CONVERSATION_QA_LOG.md` и консолидированы здесь.
- На стадии реализации агент должен предпочитать domain-specific UI и contracts универсальным конструкторам.

---

## 49. Current Next Step

Созданы последовательные domain and pre-schema specifications:

```text
docs/06-data-model-v1.md
docs/07-aosr-domain-specification.md
docs/08-document-types-catalog.md
docs/09-aggregate-boundaries-and-invariants.md
docs/10-auth-workspace-rbac-model.md
docs/11-ai-project-ingestion-and-assistance-model.md
```

По прямому заданию владельца проекта создан conceptual schema document:

```text
docs/12-database-schema-v1.md
```

Database Schema V1:

- применяет `Workspace` tenant boundary, membership-based authorization и opaque stored invites;
- применяет отдельный `FolderTree`, document-owned work meaning без `WorkItem` root и object-owned `ProjectDrawingSet`;
- описывает logical table families для typed `Document`/`AOSR`, evidence, project sources/proposals, templates, registry, package, files, artifacts, snapshots and audit;
- сохраняет file-backed evidence, derived registry, immutable released/template/package history и assistant-only AI rules;
- определяет relationships, conceptual constraints, indexing considerations, MVP/deferred scope и вопросы перед Backend/API;
- не выбирает production database, SQL, ORM, migrations, API или application stack.

Review Schema V1 produced the required conceptual/storage-neutral follow-up:

```text
docs/13-domain-lifecycle-immutability-validation-v1.md
```

Он документирует V1 policy по lifecycle typed documents/evidence/packages/artifacts, editable-through-revision `final`, historical rebuild, structured numbering, validation levels/gates, `RegistryOverride` safety surface, deterministic async package manifests, AI/OCR review flow и границе `FolderTree`.

По прямому переходу владельца проекта к следующему этапу создан conceptual Backend/API document:

```text
docs/14-backend-api-architecture-v1.md
```

Backend/API Architecture V1:

- определяет modular monolith first и bounded application modules для реального PTO workflow;
- описывает explicit command families вместо CRUD-first API и screen-oriented read model families;
- закрепляет atomic revision/snapshot transitions, eventual projection/generation/search/AI flow, optimistic versioning and idempotency;
- применяет authoritative backend validation, immutable evidence/package references and workspace membership authorization;
- оставляет открытыми exact contracts, physical transport/persistence, storage/queue/renderer/AI choices and policy details.

По прямому переходу владельца проекта к следующему этапу создан conceptual contract document:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

API Command/Read Model Contracts V1:

- определяет common command envelope, command result, error and async-operation contracts;
- описывает payload/result semantics for typed document, folder/numbering, evidence, registry, package, artifact, AI/OCR and workspace/invite intents;
- фиксирует expected-version/idempotency, stale/invalidation, validation finding and authorization-scope rules;
- определяет screen-oriented read models without table dumps, routes or OpenAPI;
- оставляет открытыми first typed forms, fine-grained RBAC/privacy/retention/AI policy and physical implementation choices.

По прямому переходу владельца проекта к следующему этапу создан product/MVP-scope document:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

MVP Scope and First Forms V1:

- фиксирует АОСР как mandatory first-class typed form первой production delivery;
- оставляет `TestAct` и `TechnicalReadinessAct` limited/deferred без approved concrete form/payload/template/validation;
- включает certificate library and executive schemes as file-backed evidence, not standalone text in acts;
- ограничивает registry and package builder derived/snapshot workflows without ERP/ECM/platform expansion;
- фиксирует generated outputs MVP: AOSR DOCX/PDF, registry export and ZIP package;
- фиксирует UX/onboarding decision: first-run guidance, contextual hints/tooltips, empty states, validation explanation and "do not show again" behavior without cluttering experienced users;
- подчеркивает, что MVP must be usable without AI/OCR; AI/OCR remains optional/deferred and proposal-only.

По прямому переходу владельца проекта к следующему этапу создан practical implementation strategy document:

```text
docs/17-tech-stack-and-implementation-strategy-v1.md
```

Tech Stack and Implementation Strategy V1:

- выбирает boring MVP-oriented stack: React + TypeScript + Vite frontend and NestJS modular monolith backend on Node.js LTS;
- выбирает PostgreSQL as relational source-of-truth database, controlled JSONB usage, explicit transactions and version-aware snapshots;
- выбирает Redis/BullMQ direction for async package builds, DOCX/PDF/ZIP generation, future AI/OCR and indexing;
- выбирает domain-scoped file storage with local development adapter and S3-compatible production direction, forbidding generic drive abstraction;
- выбирает DOCX template rendering from structured data, backend PDF conversion and ZIP package generation from immutable manifests;
- выбирает PostgreSQL-first search and defers semantic/vector search;
- фиксирует AI/OCR as optional, async, provider-abstracted, proposal-only and never autonomous;
- определяет recommended first coding milestones but keeps coding blocked.

Tech Stack and Implementation Strategy V1 не разрешает production code, backend/frontend scaffold, source folders, package manifests, production SQL/migrations/ORM schema, OpenAPI, concrete routes, Docker/CI/deployment files или repository bootstrap. Actual coding/scaffold may begin only after acceptance of both `docs/17-tech-stack-and-implementation-strategy-v1.md` and `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

По прямому переходу владельца проекта к следующему этапу создан final pre-scaffold gate document:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Initial Repository Bootstrap and Development Rules V1:

- фиксирует preconditions before coding and first explicit scaffold task requirement;
- ограничивает first scaffold package/workspace setup, TS/lint/format/test tooling, React/Vite shell, NestJS shell, worker shell and placeholders;
- запрещает production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR and deployment infrastructure in first scaffold;
- фиксирует PostgreSQL + Prisma, NestJS, React + Vite + TS, Redis/BullMQ and S3-compatible storage abstraction as guarded implementation directions;
- фиксирует infrastructure portability/no server lock-in: deployment provider replaceable, server/provider-specific assumptions forbidden in domain/application code, environment/config drives database/Redis/object storage/public URLs/CORS/session/base URLs, generated artifact links resolved through storage/download service;
- фиксирует docs/16 precedence over older docs/08 TestAct candidate wording;
- requires canonical ADR 0001-0005 physical presence and implementation compliance;
- блокирует active Foreman permissions and complex RBAC for MVP; access follows `docs/19-sharing-and-access-model-v1.md`;
- запрещает hardcoding exact first AOSR participant requirements before template review;
- defines architecture violation and stop/correct process.

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
17. `Workspace` является tenant boundary; MVP access к чужим resources выдаётся только через resource-scoped share grants.
18. Complex RBAC, `Foreman` role и `Owner/Admin/PTO Engineer/Viewer` matrix не входят в MVP; capabilities replace roles for grants.
19. Project source files для AI-assisted ИД всегда scoped к `Workspace` и `Object`; upload не делает их единственным source of truth.
20. AI extraction и error detection создают только traceable/auditable proposals; пользователь подтверждает extracted data и proposed links.
21. `docs/12-database-schema-v1.md` является conceptual schema baseline; он не является production SQL, ORM/API contract или разрешением начать coding.
22. `docs/13-domain-lifecycle-immutability-validation-v1.md` документирует policy follow-up Schema V1, применяемый Backend/API Architecture V1.
23. `docs/14-backend-api-architecture-v1.md` является conceptual architecture input for command/read-model contracts, а не разрешением на code/SQL/scaffold.
24. `docs/15-api-command-readmodel-contracts-v1.md` является conceptual contract layer, не OpenAPI или implementation.
25. `docs/16-mvp-scope-and-first-forms-v1.md` фиксирует первый product/MVP scope before technology selection.
26. MVP должен быть usable without AI/OCR; AI/OCR не является prerequisite для первой delivery.
27. Onboarding/contextual hints, empty states, validation explanations and "do not show again" behavior входят в UX baseline MVP, но не должны мешать experienced users.
28. `docs/17-tech-stack-and-implementation-strategy-v1.md` фиксирует pragmatic stack and implementation direction but still does not permit code/scaffold/migrations/OpenAPI.
29. `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` фиксирует final pre-scaffold gate; first scaffold accepted, but feature coding remains blocked without separate explicit task.
30. `docs/16-mvp-scope-and-first-forms-v1.md` has implementation-scope precedence over older `docs/08-document-types-catalog.md` TestAct candidate wording.
31. Foreman active permissions must not be implemented without separate approval.
32. Exact first AOSR participant requirements must not be hardcoded before template review.
33. Infrastructure provider/server lock-in is forbidden: database, Redis, storage, public/download URLs, CORS, session secrets and app base URLs are config-driven; provider SDKs stay inside narrow infrastructure adapters.
34. Canonical ADR baseline 0001-0005 in `docs/adr/` is accepted and must be followed by all future implementation work.
35. `docs/19-sharing-and-access-model-v1.md` supersedes `docs/10-auth-workspace-rbac-model.md` for MVP implementation scope.

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
| Какая стадия проекта сейчас? | Infrastructure scaffold accepted; canonical ADR baseline accepted; backend module skeleton, technical status slice, database foundation technical slice and object storage foundation technical slice introduced; feature coding still blocked. | Следующий implementation step требует отдельного явного задания и проверки against project memory and ADR 0001-0005. |
| Кто является пользователем SaaS? | Физическое лицо с одним аккаунтом и owned working context. | Пользователь может работать сам и подключаться к чужим resources через share grants. |
| Где живут права доступа в MVP? | В resource-scoped `ShareGrant`, выданном owner через share code / invite code. | Capabilities replace roles; default access is view-only and default deny when capability missing. |
| Что случилось с RBAC role matrix? | Superseded for MVP by `docs/19-sharing-and-access-model-v1.md`. | `Foreman` и `Owner/Admin/PTO Engineer/Viewer` matrix deferred. |
| Какая схема данных является baseline перед Backend/API? | `docs/12-database-schema-v1.md` как storage-neutral conceptual schema. | Она применяет required aggregate/access/ingestion boundaries, но не выбирает SQL, ORM, API или implementation. |
| Какой follow-up Schema V1 требуется перед Backend/API? | `docs/13-domain-lifecycle-immutability-validation-v1.md` как lifecycle/immutability/validation V1 policy. | Фиксирует revisions, evidence lifecycles, numbering, validation, override safety, package determinism и AI review flow; требует review/acceptance. |
| Какой Backend/API shape следует применять до contracts? | `docs/14-backend-api-architecture-v1.md` как conceptual modular-monolith/application boundary. | Explicit domain commands, UI read models, authoritative validation, version/idempotency and async derived flows; никакого CRUD-first API или code permission. |
| Какой command/read-model contract применяется до MVP forms? | `docs/15-api-command-readmodel-contracts-v1.md` как conceptual contract layer. | Envelope/results/errors/async operations, intent semantics, validation findings and UI reads зафиксированы без routes/OpenAPI/code. |
| Какой first MVP scope принят к review? | `docs/16-mvp-scope-and-first-forms-v1.md`. | АОСР mandatory first-class form; certificate library, executive schemes, derived registry, package outputs and onboarding hints входят; `TestAct`/`TechnicalReadinessAct`, AI/OCR dependency and enterprise/platform features deferred. |
| Какой stack/implementation direction выбран для MVP? | `docs/17-tech-stack-and-implementation-strategy-v1.md`. | React/TypeScript/Vite frontend, NestJS modular monolith backend, PostgreSQL, Redis/BullMQ, domain-scoped storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR. Feature coding remains blocked without separate explicit task. |
| Какие правила первого scaffold действуют? | `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`. | First scaffold limited to tooling/app shells/placeholders. Database and object storage foundations now have separately authorized technical health boundaries only; no domain models, migrations, OpenAPI, real auth/uploads/file APIs/queue/generation, AI/OCR or deployment infra without separate approval. |
| Какие ADR являются canonical baseline? | `docs/adr/0001-structured-data-source-of-truth.md`, `docs/adr/0002-typed-document-domain-model.md`, `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`, `docs/adr/0004-immutable-revisions-and-package-snapshots.md`, `docs/adr/0005-modular-monolith-and-bounded-contexts.md`. | Future implementation must comply with these files; they consolidate existing decisions only and do not add feature/code permission. |

### 51.1 Accepted ADR register

| ADR | Решение | Статус |
| --- | --- | --- |
| ADR 0001 | `docs/adr/0001-structured-data-source-of-truth.md`: structured data являются source of truth; DOCX/PDF/registry/package/generated outputs are derived; no DOCX roundtrip import and no editable-source registry. | Принято; canonical. |
| ADR 0002 | `docs/adr/0002-typed-document-domain-model.md`: typed document domain model; AOSR first-class typed document; no generic low-code builder, generic document engine or generic CRUD domain. | Принято; canonical. |
| ADR 0003 | `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`: certificates and executive schemes are file-backed evidence; generated artifacts are derived; no evidence without physical file; storage/provider isolation required. | Принято; canonical. |
| ADR 0004 | `docs/adr/0004-immutable-revisions-and-package-snapshots.md`: final edits create new revisions; released revisions and package snapshots are immutable; no silent mutation/history rewrite. | Принято; canonical. |
| ADR 0005 | `docs/adr/0005-modular-monolith-and-bounded-contexts.md`: modular monolith first with bounded contexts; no premature microservices/event sourcing/CQRS split; infrastructure adapters isolated. | Принято; canonical. |

### 51.2 Boundary baseline applied in Conceptual Database Schema V1

| Вопрос границы | Draft baseline в `docs/09-aggregate-boundaries-and-invariants.md` | Причина |
| --- | --- | --- |
| Является ли `FolderTree` отдельным aggregate? | Да, object-scoped aggregate root. | Tree operations имеют собственные инварианты и не должны менять `Object` или document content. |
| Является ли `WorkItem` отдельным aggregate root для V1? | Нет; meaning работы, утверждаемой актом, принадлежит typed `Document` payload. | Shared work lifecycle ещё не подтверждён; released act должен быть автономно воспроизводим. |
| Где живёт `ProjectDrawingSet`? | Owned entity в `ObjectDocumentationContext`. | Это общий проектный basis объекта, не file-backed as-built evidence и пока не независимый lifecycle. |

Эти решения по заданию владельца проекта применены в `docs/12-database-schema-v1.md` как conceptual schema baseline. Их будущая замена или расширение требует явного решения; ADR 0001-0005 они не изменяют.

### 51.3 MVP sharing/access baseline superseding RBAC

| Access question | Baseline в `docs/19-sharing-and-access-model-v1.md` | Причина |
| --- | --- | --- |
| Нужен ли complex RBAC для MVP? | Нет; role matrix из `docs/10` superseded for MVP. | Simple UX and lower governance surface for first product scope. |
| Кто администрирует систему? | Exactly one `Global System Admin`, controlled by deployment/config, separate from business collaboration. | Support/admin path не должен становиться обычным workspace role. |
| Кто владеет данными? | Regular user owns own workspaces/project data and certificate libraries. | Ownership remains clear without organization governance. |
| Как выдать доступ к workspace/project database? | Owner creates opaque share code, selects capabilities, authenticated user accepts, persistent `WorkspaceShareGrant` is created. | Rights are explicit and resource-scoped. |
| Как выдать доступ к certificate library? | Separate certificate library share/connect flow creates `CertificateLibraryShareGrant`. | Library sharing is not workspace collaboration. |
| Какая default permission? | View-only for workspace; view/use-only for certificate library according to selected preset. | Least authority and safer sharing. |
| Что заменяет роли? | Explicit `GrantCapability` values such as `view_documents`, `edit_documents`, `build_packages`, `use_certificates_in_documents`. | Owner chooses actions directly; default deny when missing. |
| Что сохраняется из старой модели? | Tenant/workspace isolation, opaque token safety, auditability and revocation. | Security guardrails remain mandatory. |

Previous membership/RBAC governance is deferred. `docs/10-auth-workspace-rbac-model.md` remains historical/deferred context, but MVP access implementation must follow `docs/19-sharing-and-access-model-v1.md`.

### 51.4 AI project ingestion/assistance baseline applied in Conceptual Database Schema V1

| Ingestion question | Draft baseline в `docs/11-ai-project-ingestion-and-assistance-model.md` | Причина |
| --- | --- | --- |
| Где живут uploaded project files? | Каждый source file scoped to one `Workspace` and one `Object`. | Project content должен соблюдать tenant isolation и object context. |
| Становится ли загруженный проект source of truth? | Он является source material/provenance, но confirmed structured data and relations остаются source of truth. | Нельзя заменить domain model файлом или AI interpretation. |
| Что может сделать AI/OCR? | Создать extraction proposals и consistency findings with source citations. | AI помогает анализу, но не утверждает инженерный факт. |
| Как proposal влияет на ИД? | Только после user confirmation, permission checks, validation and audit appropriate to target owner. | Документы/evidence/released history должны оставаться контролируемыми. |
| Какие связи поддерживаются концептуально? | Project context может предлагать ссылки к `ProjectDrawingSet`, document-owned work, `AOSR`, `TestAct`, evidence expectations and scheme comparisons. | Project file не становится `Certificate` или `ExecutiveScheme` и не нарушает ownership boundaries. |

Этот baseline развивает принятые правила structured source of truth, AI assistant only и tenant isolation и отражён project-source/proposal/finding/citation table families Schema V1. Privacy/data-processing, source citation, access/audit and MVP material scope требуют review перед Backend/API Architecture; новый ADR не требуется.

### 51.5 Lifecycle/immutability/validation follow-up documented after Schema V1 review

| Review topic | V1 policy в `docs/13-domain-lifecycle-immutability-validation-v1.md` | Что не утверждается этим решением |
| --- | --- | --- |
| Document lifecycle and final editing | `final` is validated published revision; correction creates next revision, invalidates current package use and preserves immutable historical revision. | Concrete first act forms/required field sets. |
| Evidence and historical immutability | `Certificate`/`ExecutiveScheme` are file-backed; historical file references and released package snapshots cannot be silently overwritten. | Full retention/legal/privacy/access policy. |
| Numbering | Object/folder scope, structured prefix/sequence/suffix/rendered value, renumber, move choice and clone strategies are required. | API/transaction/collision implementation details. |
| Validation | `ERROR` blocks relevant final/build release, `WARNING` does not by baseline; certificate expiry is evaluated by document date; missing certificate file is `ERROR`. | Customer-specific readiness strengthening and exact typed-form rules. |
| Registry override | Presentation/configuration only; source fact changes and hiding domain errors are forbidden; `custom_display_title` is deferred. | Physical persistence/UI/export scope. |
| Package determinism | Async builds produce immutable dependency-manifest snapshots; changed dependencies require new build/snapshot. | Queue, renderer, storage and binary-reproducibility mechanism. |
| AI/OCR review | Proposals/findings retain citations, confidence, extractor/model/version and review state; explicit user acceptance is mandatory. | Provider, consent/privacy, supported processing scope and retention period. |
| FolderTree boundary | Business collection and cloning boundary only; it never owns document lifecycle or becomes a generic drive. | Broader UX details. |

Этот follow-up стал policy input для созданного по прямому переходу владельца проекта Backend/API Architecture V1. Он конкретизирует existing guardrails, не изменяя ADR 0001-0005 и не разрешая implementation.

### 51.6 Backend/API Architecture V1 documented for review

| Architecture topic | V1 direction в `docs/14-backend-api-architecture-v1.md` | What remains open |
| --- | --- | --- |
| Deployment/module shape | Modular monolith first with bounded modules for tenant, object, folders, typed documents, evidence, schemes, registry, package, templates, artifacts, sources, AI, validation, search and audit. | Framework/runtime/deployment and later split criteria. |
| Mutation API | Explicit PTO domain commands instead of CRUD/table endpoints or generic document/file APIs. | Exact command payload/result and transport route contracts. |
| Query API | UI-oriented read models for editor, pickers, registry, package, validation, artifacts, AI queue, activity and search. | Exact fields, pagination/filtering and frontend state. |
| Consistency/versioning | Atomic document release and successful snapshot creation; eventual derived generation/search/AI; optimistic versions, immutable references and stale markers. | Persistence/transaction/lock implementation and user conflict UX. |
| Validation and outputs | Server-authoritative gates, async package/artifact workflows, no mutation from outputs or AI. | Renderer/storage/queue/AI policy and first form readiness details. |
| Authorization | Every command/query scoped through workspace membership and object context where applicable. | Fine-grained RBAC, sensitive download/access and invite/governance detail. |

Документ подготовлен для review и не разрешает coding, backend scaffold, SQL/migrations/ORM, physical API implementation или technology/provider choices. После его принятия рекомендуемый следующий этап — `docs/15-api-command-readmodel-contracts-v1.md`.

### 51.7 API Command/Read Model Contracts V1 documented for review

| Contract topic | V1 direction в `docs/15-api-command-readmodel-contracts-v1.md` | What remains open |
| --- | --- | --- |
| Common command/outcome vocabulary | Commands are scoped by workspace/object/membership, versions and idempotency; results expose affected ids, findings, invalidations, async and audit references. | Transport/serialization/auth implementation and client UX details. |
| Errors and async work | Named error contract covers validation/conflict/access/idempotency/policy/file/override failures; package/artifact/AI/index operations never mutate sources. | Queue/runtime/provider/failure telemetry and privacy policy. |
| Domain command intents | Typed documents, folders/numbering, evidence/schemes, registry, packages, artifacts, AI/OCR and invites have payload/result semantics. | Concrete first typed forms, detailed permissions and retention/correction policy. |
| Read models and validation | Main PTO screens and `ValidationFinding` fields/gates/provenance are defined; registry/read outputs remain derived. | Frontend implementation, search/index policy and customer-specific acknowledgement/readiness rules. |
| Versioning/authorization | Working versus immutable references, idempotent dangerous commands, tenant/object scope and leakage protection are explicit. | Fine-grained RBAC, original-file access, cross-workspace export and physical enforcement. |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, SQL/migrations/ORM, OpenAPI, concrete routes или technology/provider choices. После его принятия рекомендуемый следующий этап — `docs/16-mvp-scope-and-first-forms-v1.md`.

### 51.8 MVP Scope and First Forms V1 documented for review

| MVP topic | V1 direction в `docs/16-mvp-scope-and-first-forms-v1.md` | What remains open |
| --- | --- | --- |
| First production scope | АОСР is mandatory first-class typed form; first workflow runs object -> AOSR -> evidence/schemes -> registry -> package output. | Review/acceptance of scope and exact first template baseline. |
| First evidence scope | Certificate library and ExecutiveScheme are file-backed MVP foundations; certificate numbers cannot be standalone truth. | Detailed retention/supersession/privacy and original-file access policy. |
| Deferred forms | `TestAct` family and `TechnicalReadinessAct` are not first generated/finalizable typed forms without separate concrete form ratification. | Which exact test act enters a later release. |
| Generated outputs | AOSR DOCX/PDF, registry export and ZIP package are MVP outputs; template marketplace and visual editor are excluded. | Rendering/storage/queue/template implementation in later tech strategy. |
| AI/OCR policy | MVP must work without AI/OCR; any AI/OCR remains optional/deferred, proposal-only and never autonomous. | Approved processing/provider/privacy policy before real file processing. |
| UX/onboarding | First-run guidance, contextual hints/tooltips, empty states, validation explanation and "do not show again" are MVP UX decisions. | Exact frontend state, lock/autosave UX and component implementation. |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, SQL/migrations/ORM, OpenAPI, concrete routes или database/provider/renderer/queue/AI choices. После его принятия рекомендуемый следующий этап — `docs/17-tech-stack-and-implementation-strategy-v1.md`.

### 51.9 Tech Stack and Implementation Strategy V1 documented for review

| Implementation topic | V1 direction в `docs/17-tech-stack-and-implementation-strategy-v1.md` | What remains open |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite; React Hook Form, TanStack Query/Table, restrained UI primitives and backend-authoritative validation UX. | Actual scaffold, exact component library styling, route structure and frontend implementation. |
| Backend | TypeScript on Node.js LTS with NestJS modular monolith and HTTP JSON command/query API. | Actual app scaffold, concrete controllers/routes, OpenAPI and module code. |
| Database | PostgreSQL, controlled JSONB, explicit transactions, optimistic versions and immutable snapshots; Prisma-style TypeScript persistence likely after bootstrap. | Physical ORM schema, migrations, indexes and production mapping. |
| Async/files/generation | Redis/BullMQ workers, domain-scoped storage, DOCX templates, backend PDF conversion and ZIP package snapshots. | Installed dependencies, converter packaging, storage provider config and generation code. |
| Search and AI | PostgreSQL relational/full-text/trigram search first; semantic/vector search deferred; AI/OCR optional proposal-only. | Provider/privacy policy, exact processing scope and future indexing architecture. |
| Coding gate | Recommended milestones are documented, but coding/scaffold remains blocked. | Review/acceptance of `docs/17` and creation/acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`. |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, source folders, package manifests, SQL/migrations/ORM, OpenAPI, Docker/CI/deployment files или repository bootstrap. После его принятия рекомендуемый следующий этап — `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

### 51.10 Initial Repository Bootstrap and Development Rules V1 documented for review

| Bootstrap topic | V1 direction в `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` | What remains open |
| --- | --- | --- |
| Coding preconditions | Docs/18 acceptance and a separate explicit first scaffold task are required. | Actual scaffold execution. |
| First scaffold scope | Only tooling, app shells, placeholders, local scripts and optional CI gates are allowed. | Feature implementation requires a separate explicit task and ADR compliance check. |
| Scope corruption controls | Docs/16 overrides older docs/08 TestAct candidate wording; Foreman active permissions blocked; AOSR participant requirements not hardcoded before template review. | Template review and later permission policy. |
| Architecture invariants | Structured data source of truth, typed AOSR first, registry derived, immutable snapshots/revisions, AI proposal-only, modular monolith and no cross-workspace leakage. | Concrete implementation details. |
| Infrastructure portability | Deployment provider is replaceable; server-specific assumptions, hardcoded hosts/paths and provider SDK leakage outside infrastructure adapters are forbidden. | Concrete deployment provider/config values. |
| ADR handling | Canonical ADR 0001-0005 physical files exist in `docs/adr/` and are authoritative implementation references. | Future implementation must comply; changing accepted principles requires explicit ADR review. |

Документ подготовлен для review и не разрешает production code/scaffold by itself. После его принятия следующий шаг — отдельное явно ограниченное first scaffold task; feature coding remains blocked until scaffold is accepted.

---

## 52. Open Questions Still Not Solved

Следующие вопросы не отменяют принятые выше принципы. Их нельзя решать случайным кодом: они требуют спецификации, пользовательского выбора и, где необходимо, ADR.

Lifecycle/immutability, structured numbering, validation baseline, package determinism и AI/OCR review boundary документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`. Backend module/consistency boundaries документированы в `docs/14-backend-api-architecture-v1.md`. Conceptual command/read-model/error/async/version/scope contracts документированы в `docs/15-api-command-readmodel-contracts-v1.md`. First product/MVP scope documented in `docs/16-mvp-scope-and-first-forms-v1.md` narrows the first delivery to AOSR, evidence, schemes, registry, package outputs and AI-optional UX. Practical implementation direction documented in `docs/17-tech-stack-and-implementation-strategy-v1.md` selects the boring stack and first milestone order. Initial bootstrap rules in `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` define the final pre-scaffold gate and still require a separate explicit scaffold task. Вопросы ниже сохраняют детализацию accepted first template, policy и physical implementation, которую эти conceptual/product/strategy/governance documents намеренно не утверждают.

### 52.1 Domain scope and typed schemas

- Какие конкретные формы АОСР и акты испытаний входят в первый MVP?
- Какова typed schema для `TECHNICAL_READINESS_ACT`, обнаруженного в реестре?
- Насколько структурировать описание работы, оси, этажи, отметки и нормативные ссылки в первой версии?
- Является ли `Material` обязательным каталогом MVP или достаточно `MaterialUsage` внутри typed documents со ссылками на сертификаты?
- Как учитывать оборудование отдельно от материалов?
- Какой набор участников и подписей обязателен для первых типов документов?

### 52.2 Aggregate and storage design

- Object/folder numbering scope, explicit move renumber choice, folder-clone strategies and conceptual command outcomes уже документированы в V1; открыта их future physical transaction/persistence/UI реализация.
- Требуется ли когда-либо пересмотреть применённый Schema V1 baseline отдельного object-scoped `FolderTree`?
- Нужен ли после baseline без самостоятельного `WorkItem` root shared work lifecycle и отдельный aggregate в следующем scope?
- Нужен ли `ProjectDrawingSet`, применённому как owned entity `ObjectDocumentationContext`, позднее отдельный lifecycle/versioning?
- Достаточна ли включённая в Schema V1 workspace-scoped representative library вместе с immutable output snapshots?
- Нужен ли reusable `Material`/equipment catalog или достаточно document-owned `MaterialUsage` в первом scope?
- Каковы production physical mapping, indexes, constraints, typed payload persistence strategy, tenant policies и soft-delete rules?
- Как хранить originals, generated artifacts, package snapshots и build logs в cloud-agnostic storage?
- Какие retention и hard-delete правила нужны для юридически/исторически значимых файлов?

### 52.3 Lifecycle, versioning and collaboration

- Baseline lifecycle для typed documents, evidence, packages и artifacts, включая editable `final` через новую revision и immutable historical output, документирован в `docs/13-domain-lifecycle-immutability-validation-v1.md`.
- Нужны ли дополнительные approval/signature/ЭЦП statuses сверх документированного V1 lifecycle в будущем?
- Каков UX хранения/отмены unpublished working revision и autosave recovery после исправления final?
- Каков UX и policy конфликтов locks: TTL, override permission, потеря соединения и восстановление drafts?
- Требуется ли multi-user beyond locks в будущем и будет ли он вообще допустим для MVP?
- Каковы полные retention/legal/privacy/access rules для superseded certificate/scheme/source originals, при том что historical package references уже запрещено перезаписывать?

### 52.4 Templates and generation

- Freeze template versions и dependency-manifest deterministic package rebuild документированы в V1; ниже остаются механизмы реализации.
- Какой template engine поддержит DOCX placeholders, повторяющиеся таблицы, preview compatibility и object-level variants?
- Как соотносятся data version, document revision, template version и generated artifact identity?
- Как генерируется PDF и как обеспечивается воспроизводимость старого вывода?
- Как устроены package async queue, rebuild dependency graph, PDF merge, retry/failure recovery и snapshot storage?

### 52.5 Registry, search and UX

- Разрешенная presentation-only surface `RegistryOverride`, запрет скрытия domain errors и conceptual command/read-model fields документированы в V1; какова их physical implementation и exact MVP export/UI scope?
- Какие реестры и экспортные формы входят в MVP?
- Разрешено ли inline editing через registry UI как команда изменения исходной сущности, и для каких полей?
- Как спроектировать global/object/folder search, filters и индексирование?
- Как UI показывает stale generated artifacts, warnings, incomplete packages и результат OCR confirmation?

### 52.6 Access, privacy and integrations

- Single-use или multi-use share codes входят в MVP, и какие default expiration нужны для workspace и certificate library codes?
- Можно ли owner менять capabilities существующего grant, или нужно revoke/reissue?
- Какие действия по write capabilities требуют дополнительного owner notification?
- Какой exact session/cache invalidation mechanism нужен для revocation?
- Какие privacy/access/audit requirements предъявляются к real certificate originals, schemes и personal representative data under share grants?
- Допустимы ли когда-либо controlled copy/transfer/export data между личным и organizational workspace или между организациями?
- Нужны ли ЭЦП/юридически значимое подписание, импорт legacy DOCX/PDF, BIM/CAD/ERP integrations, public API или offline mode, и только на каком последующем этапе?

### 52.7 AI project ingestion and assistance

- Mandatory proposal/review/accept-or-reject flow, provenance fields and no-auto-approval rule документированы в V1; ниже остаются supported scope и operating policy.
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
- physical API transport/serialization, repository implementation and frontend state mapping;
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
- Текущий статус после 2026-05-29: superseded for MVP implementation scope by `docs/19-sharing-and-access-model-v1.md`; role matrix deferred.

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

### 2026-05-27 — Database Schema V1 created

- Документ: `docs/12-database-schema-v1.md`
- Статус: `conceptual schema baseline for review before Backend/API Architecture`
- Описание: storage-neutral logical table, relationship, constraint, indexing and scope specification based on the required aggregate, access and project-ingestion baselines.

Зафиксированный прогресс:

- `Workspace`, `Membership` and stored opaque-token `Invite` представлены как tenant/access schema family без предоставления прав через `User` или URL;
- `Object`, отдельный `FolderTree`, object-owned `ProjectDrawingSet` и отсутствие самостоятельного `WorkItem` root применены как V1 boundary baseline;
- описаны typed `Document`/`AOSR` content, revisions, representative snapshots, validation and operational lock boundaries;
- представлены file-backed `Certificate` and `ExecutiveScheme`, storage-neutral `FileAsset`, immutable-used `TemplateVersion` and derived `GeneratedArtifact` provenance;
- представлены project source files, AI extraction/finding proposals, source citations and human confirmation boundary;
- `RegistryProjection` сохранён derived, `RegistryOverride` ограничен presentation/configuration, а `PackageBuild`/`PackageSnapshot` сохранены async/snapshot-based;
- собраны key relationships, constraints/invariants, indexing considerations, MVP/deferred scope and questions required before Backend/API Architecture.

Открыто перед Backend/API Architecture:

- concrete AOSR/TestAct typed validation and first MVP forms;
- evidence/project-source retention, supersession and sensitive-file access rules;
- invite/ownership/privacy/package readiness and AI processing policies;
- transaction/query/concurrency boundaries and any production physical mapping.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005 и фундаментальные source-of-truth/typed/registry/template/package/AI guardrails;
- production SQL, migrations, ORM, database vendor, API, backend/frontend, dependencies, Docker or CI.

### 2026-05-27 — Domain Lifecycle, Immutability and Validation V1 created after Schema V1 review

- Документ: `docs/13-domain-lifecycle-immutability-validation-v1.md`
- Статус: `conceptual/storage-neutral follow-up for review before Backend/API Architecture`
- Описание: policy layer closing lifecycle, historical immutability, numbering, validation, registry override safety, package determinism, AI/OCR review and FolderTree boundary gaps identified after Schema V1.

Зафиксированный прогресс:

- defined lifecycle transitions for typed documents, `Certificate`, `ExecutiveScheme`, `PackageBuild`/`PackageSnapshot` and generated artifacts;
- закреплено, что `final` документ исправляется новой revision, тогда как published revision и released package snapshot остаются immutable;
- описаны historical rebuild manifest requirements: frozen document revisions, evidence file references, scheme references, template versions, object/company snapshots, registry override version and package ordering;
- формализованы object/folder numbering, renumber, move decision and folder-clone numbering strategies;
- формализованы `ERROR`/`WARNING` validation gates, включая `ERROR` для certificate number without physical file и проверку expiry относительно даты документа;
- ограничен `RegistryOverride` presentation/configuration surface с запретом подмены source facts и скрытия domain errors;
- определены async package determinism и mandatory human-reviewed AI/OCR proposal flow;
- подтверждена граница `FolderTree` как business collection, не generic file manager.

Открыто перед Backend/API Architecture:

- acceptance/review настоящего follow-up документа;
- concrete first typed forms/required fields and customer-specific readiness policy;
- retention/privacy/access/RBAC/governance и AI-processing policy;
- template/rendering/storage/queue, API/transaction/read-model and physical database implementation choices.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005 и существующие structured-data/file-backed-evidence/derived-registry принципы;
- production SQL, migrations, ORM, API, backend/frontend, renderer, storage provider, queue, AI provider, dependencies, Docker or CI.

### 2026-05-27 — Backend/API Architecture V1 created

- Документ: `docs/14-backend-api-architecture-v1.md`
- Статус: `conceptual backend/API architecture for review before API Command/Read Model Contracts V1`
- Описание: application-level modular architecture applying Schema V1 and lifecycle policies without production code or technology selection.

Зафиксированный прогресс:

- определён modular monolith first с bounded modules для identity/workspace/object/folders, typed documents, evidence/schemes, registry/packages, templates/artifacts, project sources/AI review, validation, search and audit;
- mutations выражены explicit domain commands, а UI reads — отдельными read-model families для АОСР, certificate/scheme picker, registry preview, Package Builder, validation, AI review и activity/search;
- сформулированы atomic revision/snapshot transitions и eventual registry/generation/search/AI processing, optimistic concurrency, immutable references, stale markers and idempotency requirements;
- применены backend-authoritative validation rules, включая certificate-by-document-date, запрет `RegistryOverride` подавлять ошибки и human accept/reject для AI/OCR;
- закреплены tenant-safe command/query scope и отсутствие generic CRUD API, generic document builder или generic file drive.

Открыто перед следующим этапом:

- review и принятие `docs/14-backend-api-architecture-v1.md`;
- exact command/read-model contracts в рекомендуемом `docs/15-api-command-readmodel-contracts-v1.md`;
- concrete typed form scope, RBAC/privacy/retention/governance and AI processing policy;
- physical persistence/API transport, renderer/storage/queue/provider and frontend decisions.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1 and lifecycle/immutability principles;
- production code, backend/frontend scaffold, SQL, migrations, ORM, concrete routes/OpenAPI, database, renderer, storage provider, queue or AI provider.

### 2026-05-27 — API Command/Read Model Contracts V1 created

- Документ: `docs/15-api-command-readmodel-contracts-v1.md`
- Статус: `conceptual contract specification for review before MVP Scope and First Forms V1`
- Описание: application-level command, result, error, async-operation, validation and read-model contract vocabulary applying Backend/API Architecture V1 without transport or implementation decisions.

Зафиксированный прогресс:

- определены common command envelope and result semantics, including workspace/object membership scope, expected versions, idempotency, invalidations and audit references;
- описаны error contract and async operation contract for package build, artifact generation, AI/OCR/source processing and indexing without source mutation;
- детализированы intent-level commands для typed documents, numbering/folders, evidence/schemes, registry, packages, artifacts, AI/OCR proposals and membership/invites;
- зафиксированы screen-oriented read models для основного PTO workflow и explainable validation finding contract;
- сохранены immutable released revisions/snapshots/template/evidence references, presentation-only registry overrides, assistant-only AI and tenant leakage protection.

Открыто перед следующим этапом на момент создания документа:

- review и принятие `docs/15-api-command-readmodel-contracts-v1.md`;
- concrete MVP typed forms/required fields and exact first validation scope, subsequently addressed for review in `docs/16-mvp-scope-and-first-forms-v1.md`;
- retention/privacy/RBAC/governance/AI-processing policies and later physical implementation choices.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy and Backend/API module boundaries;
- production code, backend/frontend scaffold, SQL, migrations, ORM, OpenAPI, concrete routes, database, renderer, storage provider, queue or AI provider.

### 2026-05-28 — MVP Scope and First Forms V1 created

- Документ: `docs/16-mvp-scope-and-first-forms-v1.md`
- Статус: `product/MVP-scope specification for review before technology selection and implementation strategy`
- Описание: first production-usable MVP boundary focused on AOSR, file-backed evidence, executive schemes, registry, package outputs and simple UX without implementation choices.

Зафиксированный прогресс:

- определено, что `AOSR` является mandatory first-class typed form первой production delivery;
- `TestAct` family и `TechnicalReadinessAct` оставлены limited/deferred до отдельной ратификации concrete form, payload, template and validation;
- certificate library MVP and executive schemes MVP зафиксированы как file-backed evidence, required for AOSR/package correctness;
- folder/numbering, registry, package builder and generated output MVP rules narrowed to first usable workflow;
- AI/OCR explicitly not required for MVP; product must work fully with manual entry and confirmed structured data;
- onboarding/contextual hints, empty states, validation explanation UX and "do not show again" behavior added as MVP UX decisions;
- explicit large non-MVP list documented to prevent ERP/ECM/platform/generic-builder scope creep.

Открыто перед следующим этапом:

- review и принятие `docs/17-tech-stack-and-implementation-strategy-v1.md`;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details required before implementation;
- initial repository bootstrap and development rules in proposed `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy, Backend/API Architecture V1 and API Command/Read Model Contracts V1;
- production code, backend/frontend scaffold, SQL, migrations, ORM, OpenAPI, concrete routes, database, renderer, storage provider, queue, AI provider or dependency strategy.

### 2026-05-28 — Tech Stack and Implementation Strategy V1 created

- Документ: `docs/17-tech-stack-and-implementation-strategy-v1.md`
- Статус: `implementation-strategy specification for review before initial repository bootstrap and development rules`
- Описание: pragmatic MVP stack and implementation plan focused on forms, validation, DOCX/PDF generation, package builds, file-backed evidence and small-team maintainability.

Зафиксированный прогресс:

- выбран frontend direction: React + TypeScript + Vite, React Hook Form, TanStack Query/Table and restrained UI primitives for large validation-heavy PTO workflows;
- выбран backend direction: TypeScript on Node.js LTS, NestJS modular monolith and HTTP JSON command/query API without CRUD-first or OpenAPI-first implementation;
- выбран persistence direction: PostgreSQL, controlled JSONB, explicit transactions, optimistic versions and immutable snapshots, with Prisma-style TypeScript persistence likely during bootstrap;
- выбран async direction: Redis/BullMQ workers for package builds, generated artifacts, future AI/OCR and search indexing;
- выбран file/generation direction: domain-scoped local/S3-compatible storage, DOCX template rendering, backend PDF conversion and ZIP package generation from immutable manifests;
- выбран search/AI direction: PostgreSQL-first search, semantic/vector search deferred, AI/OCR optional provider-abstracted proposal-only;
- documented first coding milestones from bootstrap through AOSR DOCX/PDF prototype, registry and package builder.

Открыто перед следующим этапом:

- review и принятие `docs/17-tech-stack-and-implementation-strategy-v1.md`;
- creation/review/acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details;
- actual scaffold, dependencies, migrations, ORM schema, OpenAPI and production implementation only after docs/18 acceptance.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy, Backend/API Architecture V1, API Command/Read Model Contracts V1 and MVP scope;
- production code, backend/frontend scaffold, source folders, package manifests, SQL, migrations, ORM schema, OpenAPI, concrete routes, Docker/CI/deployment files or repository bootstrap.

### 2026-05-28 — Initial Repository Bootstrap and Development Rules V1 created

- Документ: `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
- Статус: `pre-scaffold governance specification`
- Описание: final implementation gate before the first scaffold, defining enforceable bootstrap/scaffold rules and architecture-violation criteria.

Зафиксированный прогресс:

- defined coding preconditions and requirement for a separate explicit first scaffold task;
- limited first scaffold to package/workspace setup, TypeScript/lint/format/test tooling, React/Vite shell, NestJS shell, worker shell, shared placeholders and optional CI checks;
- prohibited production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR and deployment infrastructure in first scaffold;
- fixed architecture invariants to preserve structured source of truth, typed AOSR first, derived registry, immutable revisions/snapshots, AI proposal-only, modular monolith and workspace isolation;
- added infrastructure portability/no server lock-in guardrails: replaceable deployment provider, config-driven database/Redis/storage/public URLs/CORS/session/app base URLs, S3-compatible storage adapter boundary, no hardcoded server paths/hosts and no provider SDK leakage outside adapters;
- fixed docs/16 precedence over older docs/08 TestAct candidate wording for implementation scope;
- required ADR 0001-0005 physical presence or documentation-only corrective restoration/replacement declaration before scaffold;
- superseded by the later canonical ADR baseline accepted in `docs/adr/`;
- blocked active Foreman permissions without separate approval;
- blocked hardcoding exact first AOSR participant requirements before template review;
- defined architecture violation examples and stop/correct process.

Открыто перед следующим этапом:

- docs/18 accepted and first infrastructure scaffold completed/accepted;
- separate explicit feature/database/API tasks after scaffold acceptance;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details;
- feature coding only after accepted scaffold and subsequent explicit feature tasks.

Что не было изменено или выбрано этим этапом:

- production code, backend/frontend scaffold, source folders, package manifests, dependencies, Prisma schema, SQL, migrations, OpenAPI, concrete routes, Docker/CI/deployment files or runtime configuration;
- first AOSR template requirements, active Foreman permission model, TestAct implementation, AI/OCR provider or deployment strategy.

### 2026-05-28 — First allowed infrastructure scaffold started

- Статус: `infrastructure/bootstrap scaffold`
- Описание: первый явно разрешённый scaffold после `docs/18`, ограниченный инженерной основой репозитория.

Созданная структура:

```text
apps/
  api/
  web/
packages/
  shared-config/
  shared-types/
```

Scaffold включает:

- `pnpm` workspace root;
- root scripts for `dev`, `build`, `lint`, `typecheck`, `test`, `format:check` and `ci:check`;
- strict TypeScript baseline with project references, workspace package imports and local path-alias foundations;
- ESLint/Prettier/Vitest setup;
- `.editorconfig`, `.gitignore`, env example files and Node version baseline;
- React + TypeScript + Vite shell in `apps/web`;
- NestJS shell in `apps/api`;
- technical `/health` endpoint only;
- shared technical placeholder types in `packages/shared-types`;
- typed env validation foundation in `packages/shared-config`;
- local CI-equivalent quality gate running format, lint, typecheck, test and build.

GitHub Actions workflow status:

```text
committed as scaffold CI
```

Workflow: `.github/workflows/ci.yml`.

It runs on `push` and `pull_request` with Node 22, Corepack, `pnpm install
--frozen-lockfile` and `corepack pnpm ci:check`. It does not require production
secrets, deploy, run AI/OCR or generate production artifacts.

Architecture guardrails added in tooling:

- strict TypeScript options;
- import boundary restrictions against app-internal cross-imports;
- blocked provider/database/queue SDK imports until a scoped infrastructure adapter task authorizes them;
- blocked hardcoded absolute server/workstation path literals in TypeScript/JavaScript source;
- env examples keep database, Redis, storage, CORS and public URL values configuration-driven.

What remains forbidden after this scaffold:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- Prisma schema;
- migrations;
- OpenAPI;
- real auth;
- uploads or storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- database models;
- domain/business validation or domain logic.

Что не было введено:

- no production domain modules;
- no database schema;
- no migrations;
- no OpenAPI;
- no storage adapter;
- no worker app or queue processor;
- no AOSR/certificate/package feature code;
- no AI/OCR integration;
- no deployment files, Docker or Kubernetes.

Current guardrail after scaffold and ADR baseline:

```text
Do not start feature/database/API/storage/generation work without a separate explicit task and ADR compliance check.
```

### 2026-05-28 — Canonical ADR baseline accepted

- Документы:
  - `docs/adr/0001-structured-data-source-of-truth.md`
  - `docs/adr/0002-typed-document-domain-model.md`
  - `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
  - `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
  - `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- Статус: `accepted canonical ADR baseline`
- Описание: documentation-only consolidation of accepted architecture decisions into the official ADR 0001-0005 set.

Зафиксированный прогресс:

- old non-canonical ADR files were replaced by the canonical file names above;
- ADR 0001 fixes structured data as source of truth and confirms generated DOCX/PDF/registry/package artifacts are derived;
- ADR 0002 fixes typed document domain model, AOSR as first-class typed document and rejects generic low-code/document/CRUD domain;
- ADR 0003 fixes certificate/executive-scheme file-backed evidence, derived artifacts and provider-isolated storage abstraction;
- ADR 0004 fixes immutable released revisions and immutable package snapshots, with final edits producing new revisions and no history rewrite;
- ADR 0005 fixes modular monolith first, bounded contexts and isolated infrastructure adapters;
- each ADR explicitly preserves no server lock-in, AI proposal-only, derived registry, async package build, workspace isolation, no cross-workspace leakage and no provider SDK leakage.

Что не было изменено или выбрано этим этапом:

- no architecture changes beyond consolidating already accepted decisions;
- no MVP scope change;
- no production code;
- no Prisma schema, SQL, migrations, ORM schema, OpenAPI, API routes, storage adapter, queue worker, generation pipeline or business/domain implementation.

### 2026-05-28 — Backend module architecture skeleton introduced

- Статус: `backend architecture skeleton only`
- Документы:
  - `apps/api/src/ARCHITECTURE.md`
  - module `README.md` files under `apps/api/src/{shared-kernel,infrastructure,workspace,documents,evidence,registry,packages,ai,health}/`
- Описание: canonical backend module boundaries for the NestJS modular monolith,
  introduced before feature implementation and without domain/business behavior.

Созданные backend boundaries:

- `workspace`: workspace boundary, membership vocabulary and isolation contracts;
- `documents`: typed documents, revisions and finalization lifecycle boundary;
- `evidence`: certificates, executive schemes and file-backed evidence boundary;
- `registry`: derived projection and presentation-only override boundary;
- `packages`: package builds, snapshots, generated artifacts and future async orchestration boundary;
- `ai`: proposal/finding-only boundary for future AI/OCR assistance;
- `shared-kernel`: shared primitives/interfaces only, without business aggregate leakage;
- `infrastructure`: provider adapter tokens/ports only, without provider leakage into domain modules;
- `health`: technical health endpoint only.

Architecture guardrails added:

- `apps/api/src/ARCHITECTURE.md` documents module purpose, ownership, forbidden couplings, dependency direction, source-of-truth rules, derived artifacts, revision/package invariants and infrastructure isolation;
- ESLint now blocks direct sibling-module internal imports for backend bounded contexts;
- ESLint blocks direct infrastructure access from bounded modules;
- ESLint keeps `shared-kernel` framework-free and keeps `infrastructure` from importing domain module internals.

What was not introduced:

- no AOSR implementation;
- no Prisma schema or migrations;
- no CRUD APIs, OpenAPI, auth, uploads/storage implementation, DB access, queue jobs, package generation or AI/OCR implementation;
- no controllers/services with domain behavior;
- no repositories, use cases, real entities, validation rules or business logic.

Recommended next step: request a separate, explicitly scoped backend
application skeleton task for workspace/session isolation foundations. Any
database/API/storage/queue/package/AOSR/AI work must remain blocked until its
own task is checked against `docs/PROJECT_MEMORY.md` and canonical ADR 0001-0005.

### 2026-05-28 — First technical frontend-backend status slice introduced

- Статус: `technical vertical slice only`
- Описание: минимальный end-to-end infrastructure check proving frontend ->
  backend communication, shared technical DTO usage and CI/build/test coverage
  without starting product/domain implementation.

Добавлено:

- `packages/shared-types/src/technical-health.ts` with technical
  `TechnicalHealthResponse`;
- strengthened backend `/health` test for the technical response shape and
  timestamp;
- `apps/web/src/technical-status/technical-health.ts` fetch utility using
  `VITE_API_BASE_URL`;
- frontend utility tests for URL construction, typed response parsing and
  fail-closed behavior when API base URL is missing;
- minimal placeholder `Backend status` panel showing loading, ok and error
  states;
- frontend workspace dependency on `@pto/shared-types`.

What was not introduced:

- no AOSR, certificates, executive schemes, registry or package builder;
- no auth, database, Prisma schema, migrations, uploads/storage, queues,
  AI/OCR, OpenAPI, CRUD APIs, real use cases or domain entities;
- no domain readiness semantics.

Recommended next step: review this technical slice, then request a separate,
explicitly scoped backend application skeleton task for workspace/session
isolation foundations before any product/domain work.

### 2026-05-28 — Database foundation technical slice introduced

- Статус: `database foundation technical slice only`
- Описание: минимальная database infrastructure foundation without domain
  schema, migrations, repositories, CRUD APIs or business behavior.

Добавлено:

- `apps/api/prisma/schema.prisma` with only Prisma `generator` and PostgreSQL
  `datasource`;
- Prisma Client dependency and `prisma:generate` wiring;
- optional `db:check` script for a technical connectivity check;
- `apps/api/src/infrastructure/database/` database health utility and
  Prisma-backed technical adapter;
- shared technical `/health` dependency status for database
  `configured/unconfigured/ok/error`;
- explicit non-global wiring: `HealthModule` imports `InfrastructureModule` for
  technical health composition only;
- frontend technical status parsing/display for the database dependency status;
- mocked unit tests for database health behavior, env fail-safe behavior and
  health response shape.

What was not introduced:

- no Prisma `model` blocks;
- no migrations folder;
- no domain tables or business database schema;
- no repositories, CRUD APIs, auth, uploads, business file storage, queues, AI/OCR or package
  implementation;
- no domain readiness semantics.

Current database guardrail:

```text
Prisma exists only as infrastructure foundation. Domain schema, migrations and
business tables require a separate explicit task. `InfrastructureModule` is not
global; domain bounded modules must not import it.
```

Recommended next step: review this database foundation, then request a separate,
explicitly scoped workspace/session isolation skeleton task before any domain
schema, migration, AOSR, uploads/file APIs, queue, package, OpenAPI or AI work.

### 2026-05-29 — Object storage foundation technical slice introduced

- Статус: `object storage foundation technical slice only`
- Описание: минимальная infrastructure-only object storage health foundation
  without uploads, downloads, evidence files, generated artifacts, file metadata,
  repositories, CRUD APIs or business behavior.

Добавлено:

- `apps/api/src/infrastructure/storage/` object storage health utility, port
  re-export and S3-compatible adapter skeleton;
- env-driven storage health configuration using `OBJECT_STORAGE_ENDPOINT`,
  `OBJECT_STORAGE_BUCKET` and `OBJECT_STORAGE_REGION`;
- config-only runtime health behavior where missing config is fail-safe
  `unconfigured` and complete config reports `configured`;
- optional mocked adapter path in tests for future lightweight connectivity
  behavior returning `ok` or `error`;
- technical `/health` response dependency status for storage:
  `configured`, `unconfigured`, `ok` or `error`;
- explicit non-global wiring: `HealthModule` imports `InfrastructureModule` for
  technical health composition only;
- frontend technical status parsing/display for the storage dependency status;
- mocked unit tests for storage config behavior, storage health behavior and
  health response shape.

Решение:

- object storage remains an infrastructure concern;
- no storage SDK dependency was added in this slice;
- the S3-compatible adapter skeleton performs a config-only check at runtime so
  CI does not depend on MinIO/S3 network availability;
- `/health` reports only `dependencies.storage.status` and does not expose
  endpoint, bucket, region, access keys, provider URLs, file paths, evidence
  state or artifact state;
- `InfrastructureModule` remains explicit and not global.

What was not introduced:

- no upload or download API;
- no certificate files, executive scheme files, document files, package
  artifacts or generated artifacts;
- no file metadata domain models;
- no file paths persisted;
- no Prisma models or migrations;
- no domain repositories, CRUD APIs, auth, package builder, registry,
  certificates or AI/OCR implementation;
- no business validation or domain readiness semantics.

Current object storage guardrail:

```text
Object storage exists only as an infrastructure health/config boundary. Uploads,
downloads, file metadata, evidence workflows, generated artifacts and domain
storage records require separate explicit tasks. Provider SDKs must stay inside
future infrastructure adapters and must not leak into domain/application modules.
```

Recommended next step: review this object storage foundation, then request a
separate, explicitly scoped workspace/session isolation skeleton task before any
domain schema, migration, AOSR, uploads, file APIs, queue, package, OpenAPI or
AI work.

### 2026-05-29 — Sharing and access model amendment created

- Документ: `docs/19-sharing-and-access-model-v1.md`
- Статус: `MVP architecture amendment`
- Описание: owner-based workspace and certificate-library sharing model replacing complex RBAC for MVP.

Зафиксированный прогресс:

- complex RBAC removed from MVP implementation scope;
- `docs/10-auth-workspace-rbac-model.md` superseded for MVP and retained as deferred/historical reference;
- no `Foreman` role and no `Owner/Admin/PTO Engineer/Viewer` matrix for MVP;
- one `Global System Admin` separated from business collaboration;
- regular users own own workspaces/project data and certificate libraries;
- workspace collaboration and certificate library sharing are separate flows;
- share codes / invite codes are opaque, non-guessable and safely stored;
- default permission is view-only;
- owner-selected capabilities replace roles;
- accepted code creates persistent resource-scoped share grant;
- owner revocation, code rotation, auditability and no cross-workspace leakage are mandatory.

Что требует ратификации перед implementation:

- code single-use/multi-use choice and default expirations;
- capability update versus revoke/reissue policy;
- exact privacy/download rules for originals and representative data;
- revocation/session invalidation mechanics;
- system admin support-access audit/retention policy.

Что не было изменено этим этапом:

- source-of-truth, typed documents, certificate evidence, registry projection, package snapshot and AI/OCR assistant-only decisions;
- physical database, Prisma schema, migrations, API routes, auth implementation, sharing implementation or business logic.
