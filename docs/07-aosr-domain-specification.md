# 07. AOSR Domain Specification

# PTO ID System

# Акт освидетельствования скрытых работ как первый формализованный typed document

Статус: draft domain specification for review.

Дата фиксации: 2026-05-26.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, ADR 0001-0007, `docs/samples/aosr-example-analysis.md`, `docs/samples/registry-ventilation-example.md`.

Уточнение 2026-06-22:

```text
ADR 0007 имеет приоритет для active working acts.
```

Рабочий АОСР бывает либо `linked`, либо `manual`. `linked` разрешает
template-owned данные через текущий `ObjectTemplate` и глобальные библиотеки;
`manual` хранит один полный `manualTemplateSnapshot`. Participant/company
snapshots, описанные ниже без отдельного qualifier, относятся к manual state
или к released `DocumentRevisionSnapshot`, а не к обязательной копии в каждом
активном акте.

---

## 1. Purpose

Этот документ формализует `AOSR` - акт освидетельствования скрытых работ - как первый полностью описанный тип документа PTO ID System. Он является эталоном того, как остальные typed documents должны определять business meaning, ownership, structured blocks, validation, rendering, snapshots, revisions, registry projection и package participation.

Спецификация описывает предметную модель и правила документа. Она не определяет:

- программный код;
- физическую схему хранения, SQL или ORM;
- API или transport contracts;
- frontend-компоненты;
- стек, зависимости, deployment или инфраструктуру;
- конкретную технологию генерации файла.

### 1.1 Normative guardrails

Для АОСР обязательны уже принятые правила проекта:

1. `SOURCE OF TRUTH = STRUCTURED DATA`.
2. `AOSR` является typed payload внутри aggregate root `Document`, а не DOCX/PDF и не generic form.
3. Реестр является derived projection и не владеет данными акта.
4. Ссылка на документ качества допустима только через `Certificate` с физическим evidence file.
5. Срок сертификата проверяется относительно даты АОСР, а не текущего дня.
6. `final` АОСР может быть исправлен только через следующую revision.
7. Использованная `TemplateVersion` неизменяема.
8. Package Builder является asynchronous и snapshot-based.
9. `Object` предоставляет контекст, но не поглощает lifecycle АОСР как часть giant aggregate.
10. OCR/AI может предлагать metadata, но не утверждает их автоматически.
11. Active working AOSR follows ADR 0007: template data is either fully
    `linked` through `ObjectTemplate` and global libraries or fully `manual`
    through one complete snapshot; partial template-field overrides are
    forbidden.

### 1.2 Status of detail in this document

Документ различает:

- **inherited rule** - правило уже принято master context или ADR и применяется к АОСР без нового архитектурного решения;
- **AOSR draft baseline** - детальная предметная спецификация для проверки владельцем проекта перед реализацией;
- **open question** - решение намеренно не принято.

---

## 2. Business Meaning

### 2.1 What AOSR confirms

АОСР подтверждает, что определённые работы, результат которых после последующих операций будет скрыт или недоступен для обычного контроля, были предъявлены к освидетельствованию до закрытия последующими работами.

В доменной модели акт фиксирует связанный набор фактов:

- на каком объекте и в какой инженерной системе выполнены работы;
- какие скрытые работы предъявлены;
- где и в какой период они выполнены;
- по какой рабочей/проектной документации и нормативным ссылкам они выполнялись;
- какие материалы или оборудование использованы;
- какими документами качества подтверждаются применённые материалы/оборудование;
- какие представители участвовали и на каком основании;
- какие приложения подтверждают результат;
- разрешены ли последующие работы либо зафиксированы замечания.

### 2.2 Legal and evidentiary meaning

В рамках продукта АОСР рассматривается как документальное доказательство освидетельствования скрытых работ и часть комплекта исполнительной документации. Система должна обеспечить воспроизводимость того состояния данных, документов качества, подписантов, формы и приложений, на основании которого акт был выпущен.

Эта спецификация описывает доменное содержание и историческую воспроизводимость документа; она не заменяет юридическую экспертизу обязательной формы, нормативных требований или порядка подписания для конкретного объекта/заказчика.

### 2.3 Role in executive documentation

АОСР:

- является самостоятельным typed document в составе документации объекта;
- появляется в `RegistryProjection` как акт исполнительной документации;
- может связывать применённые материалы с `Certificate`;
- может ссылаться на `ExecutiveScheme` и иные attachments;
- входит в `Package` через конкретную revision и generated artifact;
- является первым шаблоном правил для будущих типов актов, но не превращает их в вариации generic document.

---

## 3. Lifecycle

### 3.1 Status model

| Status | Business meaning | Allowed behavior | Output/package behavior |
| --- | --- | --- | --- |
| `draft` | Рабочий черновик АОСР | Заполнение, исправление, autosave, связывание evidence, validation findings | Не является утверждённым опубликованным актом; включение в официальный package не является baseline. |
| `final` | Провалидированная опубликованная revision АОСР | Просмотр, rendering, включение в package; содержательная правка создаёт новую revision | Может давать generated artifact и входить в package snapshot. |
| `archived` | Акт выведен из активной работы, но сохраняется исторически | Чтение и использование для истории согласно будущей policy; изменение требует явной операции | Ранее созданные snapshots сохраняют ссылку на revision. |
| `deleted` | Soft-deleted / trash состояние | Скрыт из обычной активной работы; восстановление и retention policy уточняются | Нельзя бесследно разрушить historical package/reference. |

### 3.2 Transition baseline

| From | To | Condition or effect |
| --- | --- | --- |
| New | `draft` | Создан typed document с `document_type = AOSR` в context одного объекта. |
| `draft` | `final` | Пройдены blocking validation errors; фиксируется resolved revision snapshot, включая participant output и selected template version. |
| `final` | `final` new revision | Любая содержательная правка выпуска оформляется следующей revision с повторной validation. |
| `draft` / `final` | `archived` | Пользователь намеренно выводит акт из активного состава; детали разрешений остаются open. |
| Active / archived | `deleted` | Только soft delete; historical links/snapshots нельзя уничтожить молча. |

### 3.3 Not yet accepted lifecycle states

Статусы `in_review`, `approved`, `issued`, `superseded` и `needs_regeneration` встречаются как возможные расширения, но не вводятся этой спецификацией. Необходимо отдельно решить, являются ли они статусами `Document` или projection/package readiness states.

---

## 4. Document Ownership

### 4.1 Aggregate owner

`AOSR` не является отдельным aggregate root. Он является typed payload документа:

```text
Document(document_type = AOSR) owns AOSRPayload
```

`Document` владеет:

- типом документа, который после создания неизменяем;
- номером и датой акта;
- статусом и revision;
- structured AOSR payload;
- validation findings соответствующей revision;
- ссылками на связанные evidence entities;
- linked/manual template mode for working state and resolved participant output
  snapshots for each published revision;
- binding к `TemplateVersion`;
- provenance generated artifacts.

### 4.2 Owned data, referenced data and snapshots

| Data group | Ownership class | Owner / source of truth | AOSR usage |
| --- | --- | --- | --- |
| Номер, дата, статус, revision | Owned by document | `Document` | Header and rendering inputs. |
| Описание освидетельствуемой работы и решение о последующих работах | Owned typed payload | `AOSRPayload` | Содержательная часть акта. |
| Размещение документа | Reference/placement | `Folder` context referenced by `Document` | Навигация; папка не владеет актом. |
| Объект и инженерная система | Reference with required output values | `Object` / `EngineeringSystem`; exact rendered values freeze on release | Контекст акта и печатная шапка. |
| Данные организаций на объекте | Live template assignment or frozen snapshot | Global organization library through `ObjectTemplate`; full manual/released snapshot where applicable | Linked acts receive current corrected values; historical output remains stable. |
| Рабочая документация | Reference plus rendered values | `ProjectDrawingSet` / typed project references | Основание выполнения работ. |
| Представители | Live template assignment or frozen snapshot | Global representative library through `ObjectTemplate`; full manual/released snapshot where applicable | No partial overrides; resolved participants freeze for release. |
| Материалы/оборудование | Typed usage data and optional references | `MaterialUsage`; `Material` catalog status remains open | Состав применённых позиций. |
| Сертификаты | Reference to evidence aggregate | `Certificate` | Номер и metadata отображаются через evidence-backed link. |
| Исполнительные схемы | Reference to evidence aggregate | `ExecutiveScheme` | Отображение/приложение, если предусмотрено актом. |
| Generated DOCX/PDF | Derived artifact | `DocumentRevision` + `TemplateVersion` provenance | Не source of truth. |
| Registry row | Derived projection | `RegistryProjection` | Показывает акт, но не редактирует его первичные поля. |

### 4.3 Boundary guardrail

`Object` задаёт object context и `ObjectTemplate`, но не владеет внутренним
состоянием всех АОСР. Active linked acts читают template-owned values через
этот template; manual/released states фиксируют необходимые значения.
`Certificate`, `ExecutiveScheme`, form `Template` и `Package` сохраняют
самостоятельные lifecycle.

---

## 5. AOSR Structure Overview

### 5.1 Top-level blocks

Полная предметная структура АОСР:

| Block | Purpose | Primary data character |
| --- | --- | --- |
| Header | Идентифицирует акт и его контекст | Document-owned fields plus linked/manual template resolution; released output freezes exact values. |
| Work | Описывает скрытые работы и основания выполнения | AOSR typed data plus WorkItem/ProjectDrawingSet relations. |
| Participants | Фиксирует стороны и представителей освидетельствования | Linked object-template assignments or one full manual snapshot; released revision freezes resolved output. |
| Materials | Описывает применённые материалы и оборудование | MaterialUsage typed data and optional catalog refs. |
| Certificates | Подтверждает quality evidence | Links to file-backed `Certificate` aggregates. |
| Executive schemes | Связывает фактические схемы/съёмки | Links to file-backed `ExecutiveScheme`. |
| Attachments | Перечисляет приложенные подтверждающие документы | Typed attachment references and display ordering. |
| Acceptance / subsequent works | Фиксирует вывод освидетельствования | AOSR-owned structured conclusion/notes. |
| Validation metadata | Объясняет возможность finalization | Findings of current/released revision; mostly internal. |
| Rendering provenance | Объясняет generated output | Revision and immutable TemplateVersion references. |

### 5.2 Conceptual composition

```text
Document<AOSR>
  + Header
  + Work and acceptance data
  + Participant snapshots
  + MaterialUsage entries
  + Certificate links
  + ExecutiveScheme links
  + Attachment references
  + Validation findings
  + TemplateVersion and generated artifact provenance
```

Это conceptual composition, а не схема базы данных или API payload.

---

## 6. Header Block

### 6.1 Fields and ownership

| Field / concept | Meaning | Owner/source | Rendered in act | Snapshot/revision relevance |
| --- | --- | --- | --- | --- |
| `document_type = AOSR` | Семантика документа | `Document` | Название формы | Immutable for lifetime. |
| `DocumentNumber` | Номер акта: prefix, sequence, suffix, rendered number | `Document` governed by numbering policy | Да | Фиксируется в released revision. |
| `DocumentDate` | Дата оформления акта | `Document` | Да | Основа certificate validation; фиксируется в revision. |
| Object identity/name/address | Объект работ | `Object` / output-relevant object snapshot | Да | Значения, использованные в final output, воспроизводимы. |
| Engineering system/section | ОВиК, ВК или уточнённая система | Object-context relation | Обычно да | Фиксируется в content/revision when output-relevant. |
| Folder placement | Где акт организован пользователем | Folder reference | Не обязано печататься | Влияет на scope/registry/package selection, не на смысл формы само по себе. |
| `status` | Draft/final/archived/deleted | `Document` | Обычно внутреннее значение | Lifecycle-relevant. |
| `revision` | Издание содержимого акта | `Document` | Может выводиться по policy формы; решение открыто | Всегда сохраняется в provenance. |

### 6.2 Header baseline for finalization

Для перехода АОСР в `final` в draft baseline должны существовать:

- immutable type `AOSR`;
- уникально определённый документ в object context;
- номер акта;
- дата акта;
- объект и необходимые для формы реквизиты объекта;
- engineering system/section либо явно допустимое отсутствие в утверждённой форме;
- выбранная `TemplateVersion` для выпуска.

Точный printed layout и обязательность отображения служебных полей (`revision`, internal status) зависят от формы и остаются вне этой предметной спецификации.

---

## 7. Work Block

### 7.1 Meaning

Work block отвечает на вопрос: какие именно скрытые работы были предъявлены, где и когда они выполнены и по каким основаниям.

### 7.2 Structured content

| Content | Meaning | Ownership |
| --- | --- | --- |
| Work description | Отображаемое описание скрытых работ | AOSR payload; может ссылаться на `WorkItem`. |
| Work type | Вид выполняемой работы | Structured AOSR/work value; каталогизация open. |
| Engineering systems | Одна или несколько систем, которых касается работа | Object-context references captured for revision where used. |
| Work location | Помещение, участок, оси, отметка, этаж/зона | Structured typed values with rendered text. |
| Execution period | Начало/окончание выполнения предъявленных работ | AOSR payload / `WorkItem` relation as later ratified. |
| Project drawing references | Комплект/шифр рабочих чертежей | Reference to `ProjectDrawingSet` plus rendered snapshot/value. |
| Normative/PPR references | Нормативы или ППР, указанные в акте | Typed textual/reference entries; normalization degree remains open. |
| Subsequent works permission | Решение о разрешении последующих работ или замечаниях | AOSR-owned conclusion. |

### 7.3 WorkItem relationship

Связь с `WorkItem` необходима на смысловом уровне: АОСР освидетельствует определённую выполненную работу либо связанный набор работ. Data Model V1 оставляет открытым, является ли `WorkItem` самостоятельным aggregate в первой реализации. Поэтому данная спецификация требует явной relation semantics, но не принимает физическую boundary.

### 7.4 Draft baseline constraints

- У final АОСР должно быть непустое описание освидетельствуемых работ.
- Должно быть понятно место выполнения в форме, достаточной для выбранного типа работ и проекта.
- Если акт заявляет ссылку на рабочие чертежи, она не должна быть только неотслеживаемой случайной строкой при наличии `ProjectDrawingSet`.
- Обязательность отдельных полей location и перечня нормативов для каждой формы требует ратификации.

---

## 8. Participants Block

### 8.1 Participant parties

В АОСР могут участвовать стороны и роли, включая:

- технического заказчика / представителя строительного контроля заказчика;
- лицо, осуществляющее строительство / генерального подрядчика;
- представителя строительного контроля лица, осуществляющего строительство;
- лицо, выполнившее скрытые работы / подрядчика;
- представителя строительного контроля подрядчика;
- проектировщика или авторский надзор, если применимо;
- иных представителей, участвующих в освидетельствовании.

Точный обязательный набор сторон зависит от применимой формы и требований объекта и остаётся open question; спецификация требует типизированных ролей для тех участников, которые присутствуют.

### 8.2 Resolved participant output contents

| Output field | Meaning |
| --- | --- |
| Participant role | Семантическая роль в освидетельствовании. |
| Organization displayed | Организация, от имени которой действует представитель. |
| Position | Должность в печатной форме. |
| Full/rendered name | ФИО или инициалы в требуемом отображении. |
| Authority basis | Приказ, доверенность, устав или иное основание полномочий. |
| Authority document details | Номер/дата и иные реквизиты, если указаны. |
| Optional registry/NRS details | Номер реестра специалиста, если применим. |
| Subtitle/caption | Подстрочный текст/подпись роли в форме. |
| Display order | Порядок появления в акте. |

### 8.3 Origin and ownership

Canonical representative originates in the global user-level library. The
object template stores an assignment/reference with object-specific role,
group, order and captions. A linked act resolves the current library/template
state. Creating a new person from the act flow first creates the global library
record and object assignment; act-only free-text/temporary representative is
not a valid final source.

An explicit switch to manual mode captures the whole template-owned section,
not a partial participant override. A released revision separately stores the
resolved participant output so later library/template changes cannot rewrite
the published act.

### 8.4 Display rules

- Порядок представителей является meaningful document data.
- В одном role block может быть несколько представителей, если это допускает выбранная форма.
- Subtitle/caption может иметь default из шаблона или object setup, но отображаемое значение конкретной released revision должно быть зафиксировано.
- Представитель реестра не предполагается автоматически равным представителю АОСР.

---

## 9. Materials Block

### 9.1 Purpose

Materials block описывает материалы и оборудование, фактически применённые в освидетельствуемых работах, и создаёт предметную основу для ссылок на документы качества.

### 9.2 MaterialUsage entries

| Content | Meaning | Requirement status |
| --- | --- | --- |
| Name/description | Материал или оборудование, использованное в работе | Required where material/equipment is claimed in act. |
| Category | Material versus equipment or уточнённый тип | Draft baseline; classification depth open. |
| Brand/type/model | Идентификация позиции, если применимо | Required when needed to explain evidence relation. |
| Manufacturer | Производитель, если отражён в evidence/форме | May derive from confirmed certificate metadata where appropriate. |
| Quantity/unit | Количество и единица измерения | Applicability depends on document form/use case. |
| Batch/lot | Партия, если качество подтверждается партией | Required only when applicable. |
| Application location | Где материал использован | May reuse work location or be more specific. |
| Certificate links | Подтверждающие документы качества | Required where such evidence is invoked. |

### 9.3 Material boundary

`MaterialUsage` фиксирует применение внутри работы/АОСР. Полноценный reusable `Material` catalog ещё не утверждён для MVP; отсутствие такого каталога не позволяет заменять typed usage произвольным текстом без связи с certificate evidence.

### 9.4 Equipment treatment

Оборудование учитывается тем же typed usage block с возможностью указать отдельную категорию и документ качества. Нужен ли отдельный каталог оборудования или специальные rules для его паспортов, остаётся открытым вопросом.

---

## 10. Certificate Block

### 10.1 Purpose and relation

Certificate block связывает заявленные в АОСР материалы/оборудование с существующими library entities `Certificate`, подтверждёнными physical files и metadata. АОСР не владеет самим сертификатом; он владеет смыслом ссылки и порядком отображения в конкретном акте.

```text
AOSR MaterialUsage -> DocumentCertificateLink -> Certificate -> original evidence file
```

### 10.2 Allowed certificate types

Связанным документом качества может быть:

- сертификат соответствия;
- декларация о соответствии;
- паспорт качества;
- технический паспорт;
- исходящее, отказное или информационное письмо;
- иной утверждённый документ качества.

### 10.3 Display content

Печатная форма АОСР может отображать по связям:

- наименование материала/оборудования;
- тип документа качества;
- регистрационный номер;
- производителя и/или issuer, если требуется формой;
- дату выдачи и срок действия, если применимо;
- rendered reference на приложение.

Displayed values должны происходить из confirmed certificate metadata и зафиксированного document/revision context, а не из вручную набранной неподтверждённой строки.

### 10.4 Inclusion rules

Inherited rules:

- Нельзя считать certificate reference выполненной, если в library нет `Certificate` с physical original file.
- Один `Certificate` может подтверждать несколько material usages/documents в допустимой tenant-области.
- Certificate relation должна объяснять, какой material/equipment она подтверждает.
- Physical file, использованный в released revision или package snapshot, нельзя молча заменить или удалить.

Draft baseline:

- Для material usage, в котором акт указывает документ качества, relation к `Certificate` обязательна до finalization.
- Порядок отображения нескольких certificate links является document data.
- Приложение файла к package следует из package scope и evidence inclusion rules, а не из копирования номера в текст акта.

### 10.5 Verification and file confirmation

Перед finalization linked certificate должен иметь:

- физически сохранённый original file;
- определимый document kind;
- registration number, когда он имеется у документа качества;
- metadata, используемые в rendering/validation, подтверждённые пользователем, если они пришли из OCR.

OCR/AI extraction является только proposal workflow. Неподтверждённые извлечённые значения не могут незаметно стать published evidence metadata.

### 10.6 Validity relative to document date

Certificate validity оценивается относительно `DocumentDate` АОСР:

```text
certificate applicability date = AOSR document date
```

Если сертификат был действителен на дату АОСР, позднейшее истечение срока не делает historical released revision автоматически недействительной. Если срок истёк до даты создаваемого/изменяемого АОСР, возникает warning согласно принятому проектному правилу.

### 10.7 Certificate findings

| Scenario | Finding level | Rationale |
| --- | --- | --- |
| Certificate link referenced, but original file отсутствует | `ERROR` | Нарушено обязательное правило physical evidence. |
| Rendered certificate number введён без relation к library item | `ERROR` | Нарушено source-of-truth и package evidence правило. |
| OCR-proposed fields нужны для published output, но не подтверждены | `ERROR` for finalization | Неподтверждённые AI values не являются source data. |
| Certificate expired relative to AOSR document date | `WARNING` | Уже принятое правило допускает продолжение с предупреждением. |
| Certificate will expire/currently expired relative to today, but valid on historical AOSR date | `INFO` or no blocking finding | Историческая валидность определяется датой документа. |
| Material-to-certificate applicability unclear | `WARNING` pending stricter rule | Требует проверки пользователем; hard-block policy не утверждена. |

---

## 11. Executive Scheme Block

### 11.1 Relation to AOSR

`ExecutiveScheme` является file-backed evidence entity, отражающей фактическое выполнение работ. АОСР может ссылаться на одну или несколько схем через explicit link и указывать их как приложения.

### 11.2 Required displayed information when linked

При включении схемы в акт или список приложений могут отображаться:

- title;
- registration number;
- date;
- sheet count;
- note or attachment caption;
- order in attachments.

Эти значения происходят из structured metadata `ExecutiveScheme`, а физический файл включается в package по правилам состава комплекта.

### 11.3 Mandatory or conditional status

Общее правило обязательности исполнительной схемы для каждого АОСР ещё не принято. Draft baseline:

- если выбранная форма, вид работ или package requirement требует схему, отсутствие link/file является blocking error для finalization либо package readiness по ратифицированному правилу;
- если схема указана в печатной форме как приложение, она обязана существовать как `ExecutiveScheme` с physical file;
- схема не подменяется `ProjectDrawingSet`: первое подтверждает фактическое выполнение, второе является рабочей документацией.

### 11.4 Replacement rule

Если содержание исполнительной схемы меняется, исторически использованный файл не перезаписывается молча. Модель новой entity либо формального supersession остаётся open, но released AOSR/package snapshot должен сохранять provenance использованного файла.

---

## 12. Attachments Block

### 12.1 Purpose

Attachments block перечисляет документы и файлы, которые сопровождают конкретный АОСР либо на которые он явно ссылается. Attachment presence не превращает файл в source of truth для полей АОСР.

### 12.2 Attachment categories

| Attachment type | Typical owner/source | Relation to AOSR |
| --- | --- | --- |
| Executive scheme / as-built drawing | `ExecutiveScheme` | Explicit linked evidence; может входить в package. |
| Certificate / declaration / passport | `Certificate` | Evidence for materials/equipment; physical file required. |
| Test protocol or measurement record | Future typed document or attachment concept | Можно сослаться как supporting file; boundary требует детализации. |
| Photo evidence | Attachment concept to be ratified | Может подтверждать выполнение, но domain status не утверждён. |
| Project/extract/reference document | `ProjectDrawingSet` or other controlled reference | Основание/приложение; не является as-built scheme. |
| Other additional document | Controlled typed attachment category | Требует purpose/caption and file provenance. |

### 12.3 Attachment rules

- Каждый attachment, отображаемый как приложенный файл, должен иметь identity, type/purpose, display name/order и physical file reference либо ссылку на file-backed domain entity.
- Certificate and ExecutiveScheme use their own aggregates; АОСР не дублирует их originals.
- Порядок и captions приложений, отображаемые в released act, фиксируются в revision snapshot.
- Полный catalog supporting attachments и обязательность фотографий/протоколов остаются open.

---

## 13. Validation Rules

### 13.1 Validation principle

Validation проверяет structured AOSR data и explicit links. Она не проверяет документ по тому, присутствует ли визуально строка в вручную отредактированном DOCX. `draft` может содержать findings; переход в `final` невозможен при blocking errors.

Правила ниже включают inherited invariants и AOSR draft baseline, необходимый для обсуждения полноценного typed contract. Заказчик/форма могут впоследствии вводить дополнительные обязательные поля.

### 13.2 Errors

Для перевода АОСР в `final` blocking errors включают:

| Validation error | Reason |
| --- | --- |
| `document_type` не равен `AOSR` либо отсутствует | Нарушена typed-document identity. |
| Document не связан с одним допустимым `Object` context | Акт не имеет объекта выполнения работ. |
| Отсутствует номер акта или дата документа | Документ не идентифицируем и certificate date validation невозможна. |
| Отсутствует description скрытых работ | Акт не описывает предмет освидетельствования. |
| Отсутствует необходимое отображаемое место работ для утверждённой формы | Нельзя определить участок освидетельствования. |
| Отсутствует решение/текст о последующих работах или результате освидетельствования, если он требуется формой | Акт не фиксирует результат. |
| Не сформирован требуемый набор participant snapshots для выбранной формы | Released act не воспроизводит участников и полномочия. |
| Linked certificate указан в content/rendering, но `Certificate` entity или physical file отсутствует | Нарушено evidence rule. |
| Номер документа качества набран вместо `Certificate` relation | Нарушено structured source-of-truth rule. |
| Linked certificate metadata, использованные в final output, состоят только из неподтверждённых OCR values | Нарушено assistant-only rule. |
| Приложенная исполнительная схема указана в АОСР, но `ExecutiveScheme` entity/file отсутствует | Указанное evidence не существует. |
| Выбранная форма требует ExecutiveScheme, но обязательный link/file отсутствует | Ошибка действует после ратификации требования для формы/вида работ. |
| Для выпуска отсутствует выбранная usable `TemplateVersion` | Generated output не имеет воспроизводимой формы. |

### 13.3 Warnings

Warnings не блокируют finalization по уже принятому baseline, но требуют видимого подтверждения/учёта:

| Validation warning | Reason |
| --- | --- |
| Срок certificate истёк относительно даты АОСР | Accepted rule: предупреждение, не автоматическая блокировка. |
| Certificate coverage неочевидно соответствует указанному material usage | Нужна инженерная проверка применимости. |
| Материал/оборудование заявлены без linked quality evidence там, где обязательность ещё не утверждена | Нужно решить требование формы/заказчика. |
| Execution period нелогично соотносится с document date | Возможна ошибка данных, точное blocking rule не принято. |
| Project drawing/normative reference отсутствует либо неполна там, где форма допускает черновое сохранение | Требует проверки перед выпуском по конкретной форме. |
| Scheme отсутствует для вида работы, где она обычно ожидается, но обязательность не ратифицирована | Не превращать практическое ожидание в молчаливое обязательство. |
| Document changed after earlier generated artifact/package snapshot | Требуется новый output/build для актуального выпуска. |

### 13.4 Info findings

| Information finding | Meaning |
| --- | --- |
| Certificate expired today but was valid on AOSR date | Historical act remains assessed by its document date. |
| Linked certificate reused by other acts | Допустимое переиспользование evidence within tenant scope. |
| AOSR uses object/company or participant snapshots differing from current live profiles | Историческое состояние сохранено намеренно. |
| New TemplateVersion available while act remains bound to used immutable version | Миграция формы требует явной операции/revision. |
| Historical package snapshot contains prior AOSR revision | Snapshot сохраняется; current output требует нового build if needed. |

### 13.5 Validation decisions still open

Требуют подтверждения владельцем проекта:

- какие participant roles обязательны для первой формы АОСР;
- когда scheme является обязательным приложением;
- обязателен ли certificate для каждого material usage либо только при заявленном документе качества;
- какие location/project reference fields являются hard errors;
- когда warning certificate applicability должен усиливаться до error по требованиям заказчика.

---

## 14. Registry Behaviour

### 14.1 Projection rule

АОСР попадает в реестр через `RegistryProjection`, а не через редактирование строки реестра. Projection читает конкретную revision `Document<AOSR>` и связанные structured entities/snapshots.

### 14.2 Exported registry values

Строка реестра АОСР может выводить:

- type/display name документа;
- work description;
- rendered document number;
- document date;
- note, если предусмотрено projection/override;
- system/folder/scope values, если нужны реестру;
- status/revision or readiness indicators во внутреннем представлении;
- relationship-driven inclusion of linked certificates and schemes in соответствующих блоках реестра/комплекта.

### 14.3 Values not owned by registry

Реестр не владеет и не должен непосредственно изменять:

- номер и дату АОСР;
- описание работы, location или execution period;
- participant snapshots;
- materials and certificate relations;
- certificate metadata/file;
- scheme metadata/file;
- AOSR lifecycle or revision;
- selected template version of released document.

Если изменение инициируется из registry-oriented workflow, оно должно быть командой владельцу соответствующих structured data и привести к пересчёту projection.

### 14.4 Overrides

`RegistryOverride` может управлять порядком, включением/скрытием строки и печатным примечанием для конкретного registry/package output. Он не меняет АОСР и не создаёт новую AOSR revision, если source content не изменилось.

---

## 15. Color Logic Mapping

### 15.1 AOSR source-sample mapping

| Color zone from AOSR analysis | Meaning in document | Source of truth | Domain entity/value | Snapshot/revision effect |
| --- | --- | --- | --- | --- |
| Yellow | Объектные данные и реквизиты | `ObjectTemplate` for linked work; manual/released snapshot where applicable | `Object`, object-template values and frozen resolved output | Printed values used by final revision must be reproducible. |
| Green | Представители и подписанты | Global library through `ObjectTemplate` for linked work; manual/released snapshot where applicable | Representative assignment, authority, caption and display order | Current values stay live only before manual/release freeze. |
| Gray | Номер акта | Typed document field and numbering policy | `DocumentNumber` in `Document` | Number change after final is revision-relevant. |
| Purple | Дата акта | Typed document field | `DocumentDate` in `Document` | Revision-relevant and base for certificate validity. |
| Cyan | Переменные данные конкретного акта | AOSR structured payload and evidence links | `AOSRPayload`, `WorkItem`, `MaterialUsage`, `Certificate`, `ExecutiveScheme`, attachments | Content/evidence changes in final create new revision. |

### 15.2 Relation to registry sample

В реестре АОСР отображается в серой зоне acts block из typed `Document` data. Связанные документы качества отображаются в красном certificate block из `Certificate`; схемы - в зелёном block из `ExecutiveScheme`; object header - из object data. Тем самым цветовая логика обоих примеров подтверждает derived registry rule и не создаёт параллельного source of truth.

---

## 16. Rendering Model

### 16.1 Rendered document content

Печатная форма АОСР должна иметь возможность отображать:

- название типа документа;
- номер и дату;
- объектные сведения, требуемые формой;
- участников, организации, полномочия, captions и порядок;
- описание работ, location и execution period;
- ссылки на рабочую/проектную и нормативную документацию;
- материалы и оборудование;
- rendered references to linked certificates;
- linked schemes/attachments и их перечень;
- разрешение последующих работ, заключение, замечания и подписи;
- иные поля утверждённой `TemplateVersion`.

### 16.2 Internal-only or provenance content

Следующие данные необходимы системе, но не обязаны печататься в форме:

- internal identities entities and links;
- tenant context;
- folder placement unless form requires it;
- validation findings and acknowledgement data;
- document lock/autosave state;
- package staleness and dependency markers;
- OCR proposal/confidence metadata;
- audit metadata;
- artifact provenance, если форма не выводит служебные реквизиты revision.

### 16.3 Rendering invariants

- Rendered DOCX/PDF is a generated artifact, not the editable master.
- Generated artifact points to the exact `DocumentRevisionSnapshot` and `TemplateVersion`.
- A used `TemplateVersion` cannot be silently edited.
- Изменение structured final content требует новой revision и нового output, а не правки прежнего файла как source data.

---

## 17. Snapshot Requirements

### 17.1 Required revision snapshot content

Для released `final` AOSR `DocumentRevisionSnapshot` обязан зафиксировать:

| Snapshot content | Why required |
| --- | --- |
| Document identity, immutable type, number, date, status and revision | Идентификация опубликованного акта. |
| Object/output-relevant object values | Воспроизводимость шапки акта. |
| Engineering system and rendered scope used in act | Воспроизводимость контекста работы. |
| Work description, location, execution period and conclusion | Смысл освидетельствования. |
| Project/normative references displayed in output | Основание выполненных работ. |
| Participant snapshots, authority, captions and order | Воспроизводимость участников/подписных блоков. |
| MaterialUsage entries rendered in act | Что было заявлено как применённое. |
| Certificate link identities and output-relevant confirmed values/file provenance | Каким evidence подтверждались materials. |
| ExecutiveScheme/attachment references displayed or included | Какие приложения сопровождали выпуск. |
| Validation outcome/findings acknowledged for release | Почему revision могла быть выпущена. |
| Chosen `TemplateVersion` | Воспроизводимость формы. |
| Generated artifact provenance when produced | Связь output с содержимым и формой. |

### 17.2 Working resolution before release

До release working act resolves according to its explicit template mode:

- linked act reads current `ObjectTemplate` and current global
  company/representative libraries as its source, not only as a picker hint;
- manual act reads the whole `manualTemplateSnapshot` captured by the explicit
  mode switch and no longer consumes template/library updates;
- current `Certificate` library metadata/files;
- current `ExecutiveScheme` list;
- available unused/new template versions.

Individual act data remains editable in either mode and does not switch the
mode. At release, the system captures exact resolved values/references in the
immutable `DocumentRevisionSnapshot`. After release, a live entity change must
not rewrite that released output.

### 17.3 Package snapshot relation

`PackageSnapshot` фиксирует точную AOSR revision, generated artifact provenance и included evidence files. Он не должен ссылаться только на "latest AOSR" без revision identity.

---

## 18. Revision Rules

### 18.1 Operations creating a new revision after final

Для `final` АОСР следующую revision создаёт содержательная правка:

- изменение номера или даты;
- изменение object/output context отображаемых реквизитов;
- изменение work description, location, execution period, project/normative references или conclusion;
- добавление, удаление или изменение material usage;
- добавление, удаление или изменение certificate relation либо отображаемых confirmed certificate values;
- добавление, удаление или изменение linked scheme/attachment либо порядка/caption, отображаемых в акте;
- изменение resolved/manual participant data, role, authority basis, caption or display order used by the new revision;
- смена `TemplateVersion` для нового опубликованного представления;
- изменение поля, влияющего на validation результата выпуска.

### 18.2 Operations not creating an AOSR revision by themselves

Сами по себе новую AOSR revision не создают:

- heartbeat/expiration `DocumentLock`;
- autosave незавершённого `draft`, пока не выполнено lifecycle действие фиксации revision;
- просмотр, скачивание или повторная выдача уже созданного artifact;
- пересчёт registry projection без изменения source AOSR;
- `RegistryOverride`, меняющий только presentation registry/package, а не акт;
- новая package build, включающая прежнюю AOSR revision;
- изменение live profile while no new released revision is created; linked
  working preview may change, but historical revisions remain untouched.

### 18.3 Draft revision policy remains open

Когда именно draft-state фиксируется в revision history, помимо autosave snapshots, остаётся открытым решением общей document lifecycle policy. Эта спецификация не превращает каждое автосохранение в published revision.

### 18.4 Consequences of a new final revision

Новая final revision:

- проходит validation заново;
- требует regenerated document artifact для актуального вывода;
- делает ранее актуальные package outputs stale для нового состояния, если package scope должен включать изменённый акт;
- не уничтожает прежнюю revision или historical package snapshots.

---

## 19. Package Builder Interaction

### 19.1 Inclusion

АОСР участвует в комплекте как конкретная final revision и соответствующий generated document artifact. Его связанные evidence entities могут участвовать в других блоках комплекта:

- `Certificate` originals - в блоке документов качества;
- `ExecutiveScheme` files - в блоке исполнительных схем/приложений;
- row derived from AOSR - в registry artifact.

### 19.2 Conceptual inclusion flow

```text
Package scope
  -> RegistryProjection includes AOSR row
  -> AOSR final DocumentRevisionSnapshot + TemplateVersion produce act artifact
  -> Linked Certificate originals included per scope without duplicate textual substitution
  -> Linked ExecutiveScheme originals included per scope
  -> PackageSnapshot records exact revision, files, order and provenance
```

### 19.3 Staleness triggers caused by AOSR

Актуальный package требует нового asynchronous build, если изменились:

- included AOSR final revision;
- generated artifact provenance for the included revision/template context;
- AOSR certificate relations или evidence file selected for package;
- AOSR scheme/attachment relations или included files;
- AOSR-derived registry values or package ordering/registry overrides;
- object/company/participant snapshot values, если новый document revision/output на них основан;
- `TemplateVersion` выбранная для нового AOSR output.

### 19.4 Historical behavior

Stale означает, что snapshot не является текущим выпуском после изменения dependency. Уже созданный `PackageSnapshot` остаётся историческим свидетельством включённой revision и файлов и не переписывается при изменении АОСР.

---

## 20. Audit Requirements

### 20.1 Events that must be attributable

История должна позволять установить actor, target document/revision, время и смысл изменения по крайней мере для:

- создания АОСР;
- изменения status;
- finalization and creation of a released revision;
- содержательных правок final документа и выпуска новой revision;
- изменения номера или даты;
- изменения work description, conclusion or critical output content;
- добавления/удаления material usage;
- привязки/удаления certificate link;
- validation finding о сроке certificate и подтверждения продолжения при warning, если policy это предусматривает;
- привязки/удаления scheme or attachment;
- изменения participant snapshot/order/authority;
- выбора или изменения `TemplateVersion` для выпуска;
- генерации document artifact;
- включения AOSR revision в package snapshot;
- invalidation/staleness package output из-за изменения АОСР;
- soft deletion/archive/restore actions.

### 20.2 Related evidence audit

События в других aggregates, которые затрагивают объяснимость АОСР, должны быть доступны через provenance или related history:

- загрузка/замена/архивирование certificate evidence;
- подтверждение OCR-proposed certificate metadata пользователем;
- загрузка/замена executive scheme file;
- создание/использование immutable `TemplateVersion`;
- package build success/failure and produced snapshot.

### 20.3 Operational events

Lock heartbeat и autosave могут иметь operational history по будущей policy, но не должны выглядеть как содержательные released revisions.

---

## 21. Risks and Open Questions

### 21.1 Risks

| Risk | Impact | Mitigation in this specification |
| --- | --- | --- |
| АОСР будет смоделирован как редактируемый файл или форма без связей | Потеря проверки evidence, registry consistency и воспроизводимости | Typed `Document<AOSR>` and structured blocks are mandatory. |
| Certificate number будет храниться строкой | Package cannot prove or include quality document | Physical-file-backed `Certificate` relation is required. |
| Live participant/company updates изменят старый акт | Исторически неверная форма/подписи | Released revision captures snapshots. |
| Registry row начнёт редактировать акт независимо | Diverging sources of truth | Registry remains derived; owner commands update AOSR. |
| Scheme and working drawing set are confused | Неверное основание/приложение документа | `ProjectDrawingSet` and `ExecutiveScheme` are explicitly distinct. |
| Excessive hard validation is assumed too early | Valid practical cases blocked without owner decision | Unratified requirements remain warnings/open questions. |
| Final AOSR correction overwrites released history | Historical package loses explainability | Final edits create new revision and stale current packages without rewriting history. |
| OCR-proposed values silently enter released output | Incorrect evidence metadata | Human confirmation required before verified use. |

### 21.2 Open questions requiring domain confirmation

1. Какая точная утверждённая форма АОСР является первой template baseline, и отличаются ли обязательные блоки у заказчиков?
2. Какие participant roles обязательны для первой формы и в каких случаях допустимы несколько представителей в одном блоке?
3. Какие work location components обязательны: свободный description, axes, elevation, floor/zone либо сочетание?
4. Насколько структурируются `ProjectDrawingSet`, нормативные ссылки и ППР в первой версии АОСР?
5. Должен ли каждый material usage иметь certificate link, либо правило зависит от вида материала/оборудования и формы?
6. Когда ExecutiveScheme обязательна для АОСР, а когда является optional attachment?
7. Должны ли фото и протоколы стать типизированными supporting documents или достаточно controlled attachments на первом этапе?
8. Нужны ли дополнительные status/review/signature semantics сверх `draft`, `final`, `archived`, `deleted`?
9. Как именно обрабатывается conscious acceptance warning о просроченном сертификате для аудита и package readiness?
10. Какова future replacement/supersession policy для certificate and executive scheme files, уже использованных в released acts?

### 21.3 Decisions not introduced by this document

Эта спецификация не выбирает базу данных, ORM, storage provider, API, UI implementation, template engine, OCR provider или юридическую модель электронной подписи. Она не изменяет фундаментальные ADR; она применяет их к typed document `AOSR` и оставляет новые domain choices видимыми для последующей ратификации.
