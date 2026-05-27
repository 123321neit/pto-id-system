# 13. Domain Lifecycle, Immutability and Validation V1

# PTO ID System

# Политика lifecycle, исторической воспроизводимости, нумерации и validation после Schema V1

Статус: conceptual/storage-neutral architecture follow-up for review before Backend/API Architecture.

Дата фиксации: 2026-05-27.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание: `docs/12-database-schema-v1.md`, ADR 0001-0005, анализ АОСР и реестра.

Этот документ закрывает domain/policy gaps, выявленные при review conceptual Database Schema V1. Он определяет команды, состояния, неизменяемые исторические результаты и validation gates без выбора SQL, ORM, migrations, API, backend/frontend stack, storage provider, queue или renderer.

Неприкосновенные принципы:

- structured domain data и подтвержденные связи являются source of truth;
- DOCX, PDF, ZIP и другие generated artifacts являются производными результатами;
- Registry является derived projection, а не редактируемой master-таблицей;
- `Certificate` и `ExecutiveScheme` являются file-backed evidence roots;
- `final` означает validated published revision, а не запрет исправления документа;
- SaaS остается специализированным рабочим инструментом инженера ПТО, а не enterprise workflow platform или универсальным file manager.

---

## 1. Domain Lifecycle Model

### 1.1 Общий vocabulary

Lifecycle описывает бизнес-состояние сущности, а не физическую таблицу или endpoint.

| Concept | Значение |
| --- | --- |
| Working state | Текущее редактируемое structured-состояние. Оно может быть неполным и содержать validation findings. |
| Released revision | Опубликованный снимок typed document, прошедший finalization validation. После публикации он неизменяем. |
| Current desired output | Комплект или artifact, который должен отражать актуальные выбранные зависимости. Может стать stale. |
| Historical output | Выпущенный package snapshot или artifact, состав и provenance которого нельзя переписывать. |
| `ERROR` | Блокирующее несоответствие на соответствующем gate. |
| `WARNING` | Неблокирующее замечание, показываемое пользователю и при необходимости фиксируемое в release/build context. |

Одна сущность не получает новый lifecycle только потому, что пользователь открыл preview, скачал файл или система получила heartbeat блокировки.

### 1.2 `Document`: `AOSR`, `TestAct`, `TechnicalReadinessAct`

`Document` является typed aggregate. Один общий lifecycle применим к АОСР, утвержденным типам актов испытаний и акту технической готовности после утверждения typed contract конкретного типа.

| Status / marker | Meaning in PTO workflow | Mutable? |
| --- | --- | --- |
| `DRAFT` | Инженер заполняет акт, связывает сертификаты/схемы, уточняет номер и дату. | Да, structured working state редактируемо. |
| `FINAL` | Последняя revision валидирована и опубликована как готовый акт для реестра/комплекта. | Сам статус не запрещает исправление; опубликованная revision immutable. |
| `ARCHIVED` | Документ убран из текущей работы, но сохраняется для истории и старых комплектов. | Только восстановление или допустимые lifecycle actions; revisions сохраняются. |
| `DELETED` | Soft-deleted из рабочей области/Trash. | Не физическое удаление, если есть historical references. |
| `has_unpublished_changes` | UI/read-model marker: после исправления final существует новая рабочая revision, еще не опубликованная заново. | Не новый бизнес-статус. |

Минимальная transition model:

| From | Command / инициатор | Validation | Result |
| --- | --- | --- | --- |
| none | `create_document`, инженер ПТО с правом создания | Shape/type and tenant/object/folder checks | `DRAFT`, задан immutable `document_type`. |
| `DRAFT` | autosave/manual save, редактор | Draft validation запускается для feedback, но не блокирует сохранение неполного акта | Обновлен working state; released revision не создается. |
| `DRAFT` | `finalize_document`, редактор/роль с publish permission | Finalization validation; любой `ERROR` блокирует | При успехе создается immutable released revision `N`, документ становится `FINAL`. |
| `FINAL` | `edit_final_document`, редактор | Permission/lock check и draft validation измененного состояния | Создается working revision `N+1`, marker `has_unpublished_changes`; released revision `N` остается неизменной; зависимые current package results помечаются stale/invalidated. |
| `FINAL` + changes | `publish_revised_document`, редактор/публикатор | Full finalization validation для revision `N+1` | Новая immutable released revision становится latest; старые revision и released snapshots сохраняются. |
| `DRAFT` or `FINAL` | `archive_document`, authorized user | Проверка отсутствия запрещенного текущего workflow; historical references не удаляются | `ARCHIVED`. |
| `ARCHIVED` | `restore_document`, authorized user | Access/object state checks | Возврат к последнему применимому working/final state. |
| any active | `soft_delete_document`, authorized user | Retention/reference checks | `DELETED`; historical revisions/package items остаются доступными в пределах policy. |

Правила по типам:

| Document type | Lifecycle application | Что остается открытым |
| --- | --- | --- |
| `AOSR` | Lifecycle применяется непосредственно к structured `AOSRPayload`, certificate/scheme links и participant snapshots. | Точный обязательный набор участников, местоположений и приложений первой формы. |
| `TestAct` | Та же модель после утверждения конкретного subtype contract, например hydraulic/pressure/flushing. | Какие subtypes войдут в первый MVP и какие результаты/параметры обязательны. |
| `TechnicalReadinessAct` | Та же модель должна применяться, если тип включается в продукт; generic release запрещен. | Включение в MVP, payload, validations и template. |

Наличие lifecycle policy не означает, что неутвержденные `TestAct` или `TechnicalReadinessAct` уже разрешено финализировать.

### 1.3 `Certificate` lifecycle

`Certificate` включает сертификат, декларацию, паспорт и утвержденные виды документов качества. Это evidence root с физическим original file, а не строка номера в акте.

| State | Meaning | Allowed actions |
| --- | --- | --- |
| `UPLOADED_UNCONFIRMED` | Файл загружен; metadata вводятся пользователем или предложены OCR, но еще не подтверждены. | Review/correct/confirm metadata; не использовать для final evidence link до confirmation требуемых полей. |
| `CONFIRMED` | Пользователь подтвердил structured metadata и файл пригоден для ссылок из документов. | Reuse в актах внутри разрешенного workspace scope; validation на дату каждого акта. |
| `SUPERSEDED` | Для будущего использования выбран новый evidence item/file по явной причине замены. | Старый item/file сохраняется для released references и package snapshots. |
| `ARCHIVED` | Не предлагается в текущем выборе, но исторически доступен. | Read/historical rebuild. |
| `DELETED` | Soft-delete marker. | Физический original нельзя удалить, если на него ссылается released revision/snapshot. |

| Transition | Initiator | Validation / effect |
| --- | --- | --- |
| upload -> `UPLOADED_UNCONFIRMED` | Инженер загружает документ качества | Physical file и tenant ownership обязательны; OCR может только предложить metadata. |
| confirm -> `CONFIRMED` | Пользователь с правом review | Required metadata checks; review attribution сохраняется. |
| link to document | Редактор typed document | Наличие physical file и confirmed identity; срок проверяется по `document_date`. |
| supersede/archive/delete | Authorized user | Reference/retention check; никаких silent overwrite старого файла. |

Номер сертификата без связанного физического файла является `ERROR`; просрочка относительно даты акта является `WARNING`, а не глобальным статусом недействительности сертификата.

### 1.4 `ExecutiveScheme` lifecycle

`ExecutiveScheme` подтверждает фактически выполненные работы файлом схемы и structured metadata. Она не является `ProjectDrawingSet` и не редактируется системой как чертеж.

| State | Meaning | Allowed actions |
| --- | --- | --- |
| `DRAFT` | Physical scheme file загружен, title/registration number/date/sheet count уточняются. | Редактирование metadata до использования в released output. |
| `AVAILABLE` | Metadata подтверждены пользователем; схема доступна для связи с актом и включения в комплект. | Link/include с file validation. |
| `SUPERSEDED` | Измененная схема оформлена новым file-backed item или явной replacement relation. | Старый файл остается историческим источником. |
| `ARCHIVED` / `DELETED` | Скрытие из активной работы / soft delete. | Released references и snapshots не уничтожаются. |

| Transition | Initiator | Validation / effect |
| --- | --- | --- |
| upload -> `DRAFT` | Инженер ПТО | Physical file и object/workspace scope обязательны. |
| confirm -> `AVAILABLE` | Инженер/reviewer | Required display metadata и file presence. |
| link/include | Редактор акта или package builder selection | Схема `AVAILABLE`, original file существует. |
| change after historical use | Authorized user | Создать новую сущность/file или explicit supersession; не переписывать использованный original. |

### 1.5 `Package`, `PackageBuild` и `PackageSnapshot` lifecycle

`Package` хранит текущий scope/configuration комплекта ИД. `PackageBuild` является асинхронной попыткой сборки. `PackageSnapshot` фиксирует конкретный собранный результат.

| Concept | State / marker | Meaning |
| --- | --- | --- |
| `Package` | `ACTIVE`, `ARCHIVED` | Редактируемая конфигурация scope, inclusion и ordering. |
| `Package` | `requires_rebuild` | Текущая конфигурация или зависимость изменилась после последнего подходящего build. |
| `PackageBuild` | `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED` | Operational async workflow с progress/failure result. |
| `PackageSnapshot` | `BUILT` | Успешно сформированный immutable result, который может быть просмотрен перед выпуском. |
| `PackageSnapshot` | `RELEASED` | Выбранный immutable historical комплект, выданный/опубликованный пользователю. |
| `PackageSnapshot` | freshness `CURRENT` / `STALE` | Оценка пригодности для текущей конфигурации; не изменяет frozen contents. |

| Transition | Initiator | Validation / effect |
| --- | --- | --- |
| configure package | Пользователь | Selection/scope/ordering checks; прежний current snapshot может стать stale. |
| request build | Пользователь | Package readiness validation запускается до/при постановке в очередь. |
| queued -> running -> succeeded | Async builder | Build validation разрешает exact dependencies/files/templates; создается новый immutable `BUILT` snapshot и outputs. |
| built -> released | Пользователь с publish permission | Release readiness проверяет отсутствие `ERROR` и фиксирует warnings/manifest | Snapshot становится historical `RELEASED`, без изменения состава. |
| dependency changed | Domain command / invalidation service | Target package freshness check | Соответствующий snapshot отмечается `STALE`; для текущего результата нужен новый build. |

Успешный snapshot не переписывается даже до release; release добавляет бизнес-смысл и retention guarantee, а не разрешает mutation.

### 1.6 Generated artifacts lifecycle

Generated artifacts включают DOCX/PDF документа, registry output, package PDF/ZIP и иные производные outputs.

| State | Meaning |
| --- | --- |
| `REQUESTED` / `GENERATING` | Создание artifact запрошено или выполняется. |
| `AVAILABLE` | Новый output создан из зафиксированных dependencies. |
| `STALE` | Output больше не представляет current desired state из-за изменения dependency. |
| `FAILED` | Generation attempt не завершился корректным output. |
| `RETAINED` | Artifact входит в released historical revision/package и хранится с provenance. |

| Transition | Initiator | Validation / effect |
| --- | --- | --- |
| request document/registry artifact | Пользователь через export/finalization workflow либо package builder | Для published output разрешаются exact released revision/projection inputs и applicable template version; domain `ERROR` не обходится export-командой. |
| request package artifact | Async `PackageBuild` | Package readiness/build validation, exact manifest files/templates/order/override; output связывается с новым snapshot. |
| generating -> `AVAILABLE` | Generation worker/application service | Generation success и provenance completeness; сохраняется новый artifact/file identity. |
| dependency changed -> `STALE` | Domain invalidation после revision/supersession/config change | Старый artifact не переписывается; для current output запрашивается новая generation. |
| available -> `RETAINED` | Release package/document output workflow | Artifact зафиксирован в historical context и защищен retention rules. |

Artifacts не редактируются на месте. Исправление данных, шаблона, порядка или override создает новую generation operation и новый artifact. Вручную измененный выгруженный DOCX/PDF не изменяет source data.

---

## 2. Final vs Immutable Policy

### 2.1 Что означает `final`

`final` относится к опубликованной revision typed document:

```text
final = validated published revision
final != permanently locked document identity
```

Инженер ПТО может исправить уже готовый АОСР или иной акт: например, уточнить номер, дату, материал, ссылку на сертификат или подписанта. Запрет таких исправлений не соответствует реальной подготовке исполнительной документации.

### 2.2 Edit policy

| Action | Required consequence |
| --- | --- |
| Edit a `DRAFT` document | Working state обновляется; draft validation пересчитывается; final snapshot еще отсутствует либо не заменяется. |
| Edit a `FINAL` document | Начинается revision `N+1`; immutable revision `N` остается; affected current package snapshots/artifacts становятся stale/invalidated. |
| Publish edited final | После успешной finalization validation revision `N+1` становится новым `FINAL` release. |
| Abandon edits | Existing released revision остается доступной; отмена working changes не переписывает history. Правило восстановления/удаления черновых изменений является UI/retention detail. |

Инвалидация после meaningful edit final выполняется сразу для текущего package workflow, чтобы пользователь не выдал комплект, не учитывающий внесенные исправления.

### 2.3 Что действительно immutable

- каждая опубликованная `DocumentRevisionSnapshot` и ее frozen structured content/links;
- использованная `TemplateVersion`;
- successful `PackageSnapshot`, а особенно released historical snapshot, его manifest, ordering и included files;
- generated artifact, retained как результат конкретной revision/snapshot;
- original evidence file identity, уже зафиксированная released revision или package snapshot.

Generated output заменяется только созданием нового output из новой либо той же зафиксированной dependency set; байты существующего historical output не редактируются.

---

## 3. Historical Immutability & Rebuild Guarantees

### 3.1 Mutable, immutable and superseded data

| Category | May be edited currently | Historical rule |
| --- | --- | --- |
| Draft typed document working state | Да | Не меняет released revision; autosave/recovery policy применяется отдельно. |
| Final document identity | Да, через новую revision | Старые published revisions immutable. |
| Live `CompanyProfile` | Да | Не обновляет существующий `ObjectCompanySnapshot`. |
| Object company context | Только явным принятием нового snapshot | Snapshot, использованный в output, immutable. |
| Confirmed certificate metadata/file | Для будущего использования только через correction/supersession policy | Exact file/version/reference в historical package сохраняется. |
| Executive scheme metadata/file | До historical use; затем новая сущность/file или supersession | Exact scheme file/reference сохраняется. |
| Package configuration | Да | Released package snapshots не меняются. |
| Registry presentation configuration | Да | Snapshot stores exact applied override version. |
| Generated artifact | Нет | Новый artifact supersedes current use; historical retained output сохраняется. |

### 3.2 Immutable package dependency manifest

Каждый successful `PackageSnapshot` хранит dependency manifest, достаточный для объяснения и повторного формирования того же результата. Для released package manifest является историческим доказательством состава.

В manifest фиксируются:

- `package_snapshot_id`, package scope и frozen package ordering;
- идентификаторы документов и exact released `document_revision_id`;
- frozen numbering values и даты из document revisions;
- certificate ids, exact physical file/version/binding references и включенные display values;
- executive scheme ids, exact physical file/reference и включенные display values;
- точная версия `RegistryOverride`, использованная для projection;
- registry projection result/input reference, если реестр входит в package;
- template version ids для актов, реестра и package outputs;
- `ObjectCompanySnapshot` и иные object/output snapshot references, фактически использованные в выдаче;
- generated artifact identities и/or retained file identities включенного результата;
- captured validation outcome/warnings, если они сопровождают release.

### 3.3 Rebuild через годы

Чтобы пользователь смог восстановить ранее выданный комплект через годы, система обязана сохранять:

| Frozen dependency | Guarantee |
| --- | --- |
| Template version freeze | Used `TemplateVersion` и необходимые assets не меняются; новая форма получает новую version. |
| Object company snapshot freeze | Смена реквизитов или директора в live company profile не меняет старый комплект. |
| Document revision freeze | Пакет ссылается на точный published content каждого АОСР/акта, включая number/date/participants/links. |
| Certificate freeze | Пакет хранит exact certificate identity и physical file/version/reference, а не latest certificate lookup. |
| Executive scheme freeze | Пакет хранит exact scheme identity и physical file/reference, а не актуальную схему объекта. |
| Registry override and order freeze | Выведенный реестр и порядок комплекта восстанавливаются в той презентации, которая была выпущена. |

Детерминированный rebuild означает: при доступности зафиксированных renderer rules/assets и файлов тот же manifest дает семантически тот же комплект. Выбор формата checksum, renderer/container и долговременного file storage остается для Backend/API и infrastructure design, но не может ослабить это требование.

### 3.4 Replacement rather than overwrite

Certificate original, executive scheme original, template version и released package artifact, использованные исторически, допускают только:

- supersession/replacement с provenance для будущего current workflow;
- retention/archival handling по еще утверждаемой policy;
- новый build/output.

Silent overwrite или deletion, из-за которых старый комплект перестает объясняться или восстанавливаться, запрещены.

---

## 4. Numbering Architecture

### 4.1 Structured numbering contract

Номер акта является structured domain value, а не свободной строкой в DOCX или строке реестра.

| Value | Meaning |
| --- | --- |
| `numbering_scope_kind` | `OBJECT` или `FOLDER`. |
| `numbering_scope_reference` | Объект или business folder, внутри которого применяется sequence. |
| `prefix` | Например `ОВ`, `ПД`, `1/12`. |
| `sequence` | Контролируемое порядковое значение в scope. |
| `suffix` | Дополнительная структурированная часть, если политика номера ее допускает. |
| `rendered_number` | Вычисленное/зафиксированное отображение, например `ОВ-2`; не единственное canonical поле. |
| `numbering_policy_reference` | Правило, на основании которого номер назначен/пересчитан. |

Working document хранит выбранные numbering values; released revision и package manifest замораживают фактически опубликованные значения.

### 4.2 Object-scoped and folder-scoped numbering

| Mode | PTO example | Rule |
| --- | --- | --- |
| Object-scoped | Все акты ОВ объекта продолжают `ОВ-1`, `ОВ-2`, `ОВ-3` независимо от месяца. | Sequence уникален по принятой document-type/policy области объекта. |
| Folder-scoped | В папках `Октябрь` и `Ноябрь` допускается отдельная последовательность. | Scope явно ссылается на folder business collection; перенос требует решения пользователя. |

Точные collision rules между типами документов и дисциплинами должны быть определены в Backend/API contracts на основании выбранной numbering policy, а не зашиты как свободное текстовое поле.

### 4.3 Renumber engine

`RenumberEngine` является domain operation concept, а не технологическим сервисом в этом документе. Он должен:

1. получить scope, policy, выбранные documents и порядок;
2. предложить новые structured values и показать collisions/affected final documents;
3. потребовать подтверждение пользователя перед изменением опубликованных номеров;
4. применить changes как document commands;
5. для измененного final document создать следующую revision и инвалидировать affected package outputs;
6. записать attribution результата операции.

Массовый renumber не редактирует Registry row и не переписывает released package snapshot.

### 4.4 Move document between folders

При перемещении документа UI/domain command требует явного выбора:

| Choice | Result |
| --- | --- |
| `keep_numbering` | Меняется placement; номер и revision не изменяются, если других content changes нет. |
| `recalculate_numbering` | Номер пересчитывается по destination policy; для final document создается новая revision и affected packages становятся stale. |

Folder move никогда не меняет номер молча.

### 4.5 Clone folder strategies

Дублирование папки, например `Октябрь -> Ноябрь`, является business cloning flow.

| Strategy | Meaning |
| --- | --- |
| `copy_numbering` | Новые draft documents получают скопированные number values только если policy допускает отсутствие collision; иначе требуется renumber resolution. |
| `continue_numbering` | Новые draft documents получают следующие sequence values в выбранном scope. |
| `reset_numbering` | Новая последовательность начинается с policy-defined initial sequence. |

Клонированные документы создаются как новые draft identities. Копирование ссылок на certificates/schemes требует явной выбранной clone strategy и обычной validation; final status и released revisions оригинала не копируются как новые опубликованные документы.

---

## 5. Validation Architecture

### 5.1 Severity model

| Severity | Meaning | Gate effect |
| --- | --- | --- |
| `ERROR` | Документ или комплект нарушает domain invariant либо не может быть подтвержден физическим источником. | Блокирует finalization и release/package build, для которых требование релевантно. |
| `WARNING` | Потенциальный риск/неполнота, которую инженер должен видеть, но которая не доказывает невозможность выпуска. | Не блокирует по baseline; отображается и может требовать acknowledgement в published/build context. |

AI suggestion не становится `ERROR`/`WARNING` автоматически. Formal validation finding возникает из утвержденного domain rule.

### 5.2 Validation timing

| Timing | Purpose | Blocking behavior |
| --- | --- | --- |
| Draft editing/autosave | Раннее объяснимое feedback при заполнении АОСР/акта, выборе evidence и numbering. | Ошибки показываются, но неполный draft сохраняется. |
| Document finalization/re-finalization | Проверить published revision до включения в реестр/комплект. | Любой относящийся к документу `ERROR` блокирует `FINAL`; warnings показываются/фиксируются. |
| Package readiness | Проверить выбранный scope до запуска/выпуска сборки: released documents, evidence originals, schemes, registry config, templates. | `ERROR` блокирует release-ready комплект и не маскируется ordering/hidden overrides. |
| Package build/release | Разрешить exact dependencies, files, template versions, manifest и результаты генерации. | Missing/inconsistent dependency дает failed build или блок release; warnings сохраняются с snapshot согласно UX policy. |

### 5.3 Baseline blocking errors

Следующие cases являются `ERROR` в релевантном finalization/package gate:

- АОСР или другой act с упоминанием/выводом номера документа качества без связи с `Certificate`, имеющим retained physical original file;
- certificate link с отсутствующим или недоступным physical file;
- executive scheme, включенная в акт или package, без retained physical original file;
- отсутствующее обязательное structured поле утвержденного typed document contract, например дата/номер/заключение или required participant после ратификации формы;
- попытка finalized release неутвержденного generic `TestAct` или `TechnicalReadinessAct` без typed schema/validation contract;
- unresolved numbering collision в выбранном numbering scope;
- package, включающий draft или измененную, но не опубликованную revision вместо required final revision;
- package build без exact document revision, template version или file dependency, необходимой для manifest;
- `RegistryOverride`, пытающийся заменить source fact либо скрыть domain error.

### 5.4 Baseline warnings

Следующие cases являются `WARNING` по текущему baseline:

- срок действия certificate истек на дату документа, в котором он используется;
- optional `page_count` certificate или scheme не заполнен, когда конкретная форма не объявила его required;
- optional note/caption/display metadata не заполнены;
- документ имеет evidence, которое требует внимания пользователя по policy, но физический файл и обязательная связь присутствуют;
- available newer template version существует, но released/current output сознательно использует зафиксированную более раннюю version.

Критическое правило срока:

```text
certificate validity is evaluated against document_date, not current date
```

Например, сертификат, действовавший на дату АОСР 2023 года и истекший в 2025 году, не делает исторический акт ошибочным в 2026 году.

### 5.5 Registry and validation boundary

Registry projection может отображать validation state, warnings и состав, но не исправляет findings сама. `RegistryOverride.hidden`, ordering или note не имеют права:

- удалить blocking error у source document/evidence/package;
- выдать строку с certificate number без файла;
- превратить draft act в final;
- исключить обязательную зависимость из released package только для обхода readiness rule.

---

## 6. RegistryOverride Safety Rules

### 6.1 Allowed surface

`RegistryOverride` предназначен только для presentation/configuration конкретного registry/package output.

| Allowed field/operation | Example in PTO registry |
| --- | --- |
| `hidden` / include toggle | Не показывать необязательную строку в выбранной выдаче, если это не скрывает required evidence/error. |
| `sort_order` | Переместить сертификаты, акты или схемы в требуемую заказчиком последовательность. |
| `note` | Добавить печатное примечание к строке/разделу без изменения факта. |
| signer selection | Выбрать подписанта реестра и зафиксировать `RegistrySignerSnapshot`. |
| package display config | Настроить порядок/группировку отображения в конкретном комплекте. |

Override имеет собственную version/identity для включения в package manifest.

### 6.2 Forbidden source substitutions

`RegistryOverride` запрещено использовать для изменения или подмены:

- certificate registration number, issuer, validity, file presence или evidence identity;
- date, number, type, work description, revision или final status акта;
- company legal/requisite data из `ObjectCompanySnapshot`;
- scheme title, registration number, date или physical file identity;
- document validation outcome или наличие required attachment;
- template version, якобы использованной для существующего artifact.

Исправление этих значений выполняется в owning domain entity с revision/supersession/invalidation consequences.

### 6.3 Risky display titles

`custom_display_title` не входит в разрешенный V1 override surface. Он остается deferred, поскольку свободный заголовок легко подменит название схемы, вида акта или документа качества.

Если позднее business review подтвердит такую потребность, поле может быть допущено только как явно маркированный display caption для не-фактического section/header, с сохранением рядом canonical source title и запретом применения к certificate/act/scheme/company facts.

---

## 7. Package Determinism

### 7.1 Async build boundary

`PackageBuild` всегда asynchronous domain operation: генерация актов, вычисление реестра, включение original evidence, PDF merge и формирование package output не должны выполняться как синхронное сохранение документа.

Независимо от будущей queue technology workflow обязан предоставлять status/progress/failure и создавать snapshot только из успешно разрешенного manifest.

### 7.2 Required dependency manifest

Каждый `PackageSnapshot` фиксирует dependency manifest:

| Dependency group | Exact frozen data |
| --- | --- |
| Documents | Document ids, exact released revision ids, type, frozen number/date/output references. |
| Certificates | Certificate ids, exact physical file/binding/version references and included confirmed display metadata. |
| Executive schemes | Scheme ids, exact physical file/reference and included metadata. |
| Registry | Registry scope, exact `RegistryOverride` version, signer snapshot and projection/input reference. |
| Templates | Exact template versions/assets used for each generated document/registry/package output. |
| Object context | Exact `ObjectCompanySnapshot` and other output-visible object snapshot references used. |
| Composition | Inclusion decisions, package ordering, generated artifact/file references. |
| Validation/provenance | Release/build validation summary and build attribution needed to explain output. |

### 7.3 Deterministic rebuild rule

Для одного и того же manifest rebuild должен получать тот же логический состав, порядок, frozen values и template inputs. Generated binary reproducibility requirements (например, timestamps в PDF metadata) должны быть отдельно определены rendering design, но не могут разрешить изменение содержимого или источников одного manifest.

| Situation | Required action |
| --- | --- |
| Document получает новую revision | Новый build/snapshot; ранее released snapshot остается unchanged и может помечаться stale для current use. |
| Certificate/scheme replacement или metadata correction affects output | Новый build/snapshot с новой exact dependency; старый original сохраняется. |
| Override, ordering, company snapshot или template choice меняется | Новый build/snapshot. |
| Пользователь повторно скачивает historical release | Выдать retained artifact или rebuild strictly from its frozen manifest; не подтягивать latest data. |

Нельзя мутировать old released snapshot для экономии storage или для представления его как текущего.

---

## 8. AI/OCR Review Flow

### 8.1 Assistant-only rule

AI/OCR помогает вводить metadata сертификатов, схем и project source materials либо выявлять возможные несоответствия. Он не утверждает факты ПТО, не финализирует акты и не закрывает validation findings.

```text
extraction/finding -> user review -> explicit domain command -> confirmed structured data
```

### 8.2 Required proposal record

Каждый extraction result или finding до review должен хранить как минимум:

| Required data | Purpose |
| --- | --- |
| Source file/reference and citations | Показать страницу/область/источник, из которого взято предложение. |
| Proposed field/relation and value or finding explanation | Дать пользователю конкретное reviewable действие. |
| Confidence and/or explanation | Помочь review, не заменить его. |
| Extractor/model/provider/version identity | Объяснить происхождение результата согласно будущей approved processing policy. |
| `created_at` and processing run reference | Сохранить время и контекст обработки. |
| Review status | `PENDING`, `ACCEPTED`, `EDITED_AND_ACCEPTED`, `REJECTED`, `STALE` или `DISCARDED` по retention policy. |
| Reviewer/timestamp and resulting target reference | Связать решение пользователя с domain change. |

### 8.3 Review transitions

| Action | Initiator | Result |
| --- | --- | --- |
| Generate proposal/finding | Authorized async assistance request | `PENDING`; confirmed data не меняются. |
| Accept value/link | Authorized user | Domain validation и explicit update/create command; accepted value становится confirmed domain data. |
| Correct and accept | Authorized user | В confirmed state попадает исправленное пользователем значение; original proposal остается traceable. |
| Reject/dismiss | Authorized user | Confirmed data не меняются; proposal остается traceable либо удаляется только по утвержденной retention policy. |
| Source/target changed before review | Domain workflow | Proposal помечается `STALE`, не применяется автоматически. |

Если accepted proposal изменяет final document либо dependency текущего package, к нему применяются обычные revision и invalidation rules.

### 8.4 Hard prohibitions

- no silent auto-approval;
- no AI-created certificate reference without physical certificate file;
- no promotion of project drawing to `ExecutiveScheme` by inference;
- no rewriting released document revisions or package snapshots;
- no cross-workspace processing/linking;
- no processing real source contents outside approved privacy/data-processing policy.

Точные provider, retention period, access roles и privacy/consent model остаются открытыми вопросами, а не скрытым implementation choice.

---

## 9. FolderTree Boundary

`FolderTree` является business collection для работы ПТО: раздел/месяц/участок, внутри которого удобно разместить акты, схемы и package views. Он не является универсальным диском и не владеет смыслом документа.

| Boundary rule | Consequence |
| --- | --- |
| `FolderTree` принадлежит одному `Object`. | Нельзя переместить placement в другой объект как обычный drag-and-drop. |
| `Document` ссылается на `folder_id`/placement и остается своим aggregate root. | Folder не финализирует, не валидирует и не переписывает payload документа. |
| Folder move is organizational. | Изменение lifecycle/number требует отдельной явной команды; при keep numbering revision не меняется. |
| Folder duplication is business cloning logic. | Стратегии dates, links, certificates и numbering выбираются осознанно; копии документов являются drafts. |
| Evidence roots остаются отдельными. | Папка не превращает certificate PDF или scheme PDF в произвольный user file. |

Не проектируется universal Google Drive abstraction: нет произвольных файловых workflow, generic shares/comments/collaboration и folder-owned document lifecycle. Нужны только операции, ускоряющие подготовку ИД.

---

## 10. Backend/API Readiness Checklist

### 10.1 Documented for Backend/API Architecture review

После принятия этого документа Backend/API Architecture сможет опираться на следующие V1 policies:

- typed `Document` release/correction lifecycle для АОСР и будущих утвержденных актов: final editable through next revision, historical revision immutable;
- `Certificate` и `ExecutiveScheme` как file-backed evidence roots с явным supersession вместо silent overwrite;
- async `PackageBuild`, immutable `PackageSnapshot`, manifest dependencies, staleness и deterministic rebuild requirement;
- generated artifacts как immutable generated instances, заменяемые только новой генерацией;
- object/folder numbering contract, renumber command, move choice и clone numbering strategies;
- `ERROR`/`WARNING` severity, validation gates, certificate-by-document-date rule и blocking absence of certificate file;
- presentation-only safety boundary `RegistryOverride` и deferred `custom_display_title`;
- assistant-only AI/OCR proposal/review/confirmation flow с provenance;
- `FolderTree` как bounded business collection, не generic file manager.

### 10.2 Questions intentionally still open

Следующие вопросы сохраняются открытыми и должны быть решены либо явно оставлены за пределами первого implementation scope в ходе следующего design stage:

- какие concrete `TestAct` subtypes и нужен ли `TechnicalReadinessAct` в первом MVP, включая их payload/templates/blocking fields;
- какой точный обязательный field/participant/scheme/evidence set применяется к первой форме АОСР;
- требуется ли reusable material/equipment catalog, расширенный representative boundary или будущий shared `WorkItem`;
- detailed evidence/project-source supersession, retention, hard-delete/legal retention и original-file access/privacy policy;
- package-specific policy acknowledgement warnings, customer-specific form/readiness requirements и точный audit retention;
- template engine, renderer/PDF reproducibility mechanism, physical storage, integrity mechanism и async job implementation;
- workspace ownership/invites/fine-grained RBAC, cross-workspace export/copy, sensitive data/support access и SaaS entitlement details;
- AI/OCR provider, real-content processing consent/privacy, roles, citation granularity и retention;
- search, frontend state/lock UX, API commands/read models, transactions, concurrency и production physical database mapping.

### 10.3 Gate to the next architecture stage

Этот документ является conceptual policy follow-up к Schema V1, а не разрешением начать кодинг, SQL, migrations, API или infrastructure selection.

```text
Backend/API Architecture may start only after
docs/13-domain-lifecycle-immutability-validation-v1.md is reviewed and accepted.
```

Если review изменит source-of-truth, typed document, registry, template versioning, evidence root или snapshot principles, такое изменение требует явного архитектурного решения и при необходимости ADR до Backend/API design.
