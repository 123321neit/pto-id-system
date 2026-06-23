# SAMPLE — AOSR Example Analysis
# Source: Пример.docx
# Purpose: domain analysis and future AOSR template reference

Этот файл фиксирует структуру и смысл реального примера АОСР. Это не шаблон для немедленной генерации, а reference sample для архитектуры.

---

## 1. Document type

Тип документа:

```text
АКТ ОСВИДЕТЕЛЬСТВОВАНИЯ СКРЫТЫХ РАБОТ
```

Пример номера и даты:

```text
№ ПД-1
19 июля 2023 г.
```

---

## 2. Участники и представители

В примере есть блоки представителей:

- представитель технического заказчика по вопросам строительного контроля;
- представитель лица, осуществляющего строительство;
- представитель лица, осуществляющего строительство по вопросам строительного контроля;
- представитель лица, выполнившего работы, подлежащие освидетельствованию;
- представитель лица, выполнившего работы, по вопросам строительного контроля;
- иные представители лиц, участвующих в освидетельствовании.

Пример формата:

```text
Начальник отдела строительного контроля ООО "Верт-Строй" Ануфриенко М.Н., приказ №55/2022 от 01.11.2022 г., №С-666-177717
```

### Architectural meaning

Представитель — это не просто строка текста.

Нужны:

- representative role;
- organization;
- position;
- full name;
- initials/rendered name;
- authority document;
- authority date/number;
- NRS number, если есть;
- ordering;
- subtitle/caption.

При этом система должна поддерживать:

- global representatives;
- object-template representative assignments;
- linked acts that resolve current assignments;
- one complete manual snapshot after an explicit whole-act switch;
- несколько фамилий в одном блоке.

Act-only temporary/free-text representative and partial per-field overrides are
not valid final sources under ADR 0007.

---

## 3. Work description

Пример предъявленных работ:

```text
Монтаж воздуховодов систем противодымный вентиляции ВД1, ПД1, ПД2, ПД3 в осях 13-22/А-Д на отм. -3,600 (подвал)
```

### Architectural meaning

Это per-document variable data.

Нужно хранить структурировано:

- work type;
- systems;
- axes;
- elevation;
- floor/zone;
- free text description;
- possibly normalized WorkItem later.

На MVP допустимо хранить как typed text fields, но не как финальный DOCX.

---

## 4. Project documentation reference

Пример:

```text
Работы выполнены по проектной документации: шифр ООО "Девятый трест-Екатеринбург" 372-2018-01-ОВ2 от 22.04.2020г., СП 60.13330.2016 «Отопление, вентиляция, кондиционирование» и СП 73.13330.2012 «Внутренние санитарно-технические системы» отвечают требованиям их приемки и Проекту производства работ № 005-2018
```

### Architectural meaning

Это блок с ссылками на:

- ProjectDrawingSet;
- project code;
- project organization;
- normative documents;
- PPR/other references.

Нужно решить, что нормализуется сразу, а что остаётся typed text на MVP.

---

## 5. Materials and certificates

Пример:

```text
Воздуховоды и фасонные части к ним (Сертификат соответствия № РОСС RU.НХ37.Н10892)
```

### Architectural meaning

Это критический блок связи `AOSR → Certificates`.

Нельзя просто вписывать номер сертификата вручную.

Правило:

```text
Сначала сертификат должен быть загружен в Certificate Library.
Затем документ ссылается на certificate_id.
```

В printed/generated form номер сертификата появляется как rendered value.

---

## 6. AOSR color logic from project discussion

### Yellow — object data

Название объекта и объектные реквизиты.

Вводятся один раз на объект.

### Green — representatives

Подписанты и представители.

Вводятся один раз на объект, но могут быть переопределены в документе.

Подстрочный текст должен быть default + editable.

В одном блоке может быть несколько фамилий.

### Gray — document number

Автоматическая нумерация.

Поддерживаются prefix, sequence, suffix.

Примеры:

- ОВ-1;
- ОВ-2;
- 1/12-1;
- ПД-1.

### Purple — document date

Дата акта.

По умолчанию текущая дата.

Можно массово менять внутри папки.

### Cyan — per-document variable data

Переменные данные конкретного акта:

- работы;
- проектная документация;
- материалы;
- сертификаты;
- дальнейшие работы;
- приложения;
- примечания.

---

## 7. Suggested AOSR structured payload v1

```yaml
document_type: AOSR
numbering:
  prefix: "ПД"
  sequence: 1
  suffix: null
  rendered_number: "ПД-1"
date: "2023-07-19"
object_template_id: null
template_mode: linked
manual_template_snapshot: null
representative_assignments:
  - representative_id: null
    role: technical_customer_construction_control
    display_order: 1
  - representative_id: null
    role: contractor_representative
    display_order: 2
work:
  description: "Монтаж воздуховодов..."
  systems: []
  axes: null
  elevation: null
  floor: null
project_documentation:
  drawing_set_id: null
  rendered_text: null
materials:
  - name: "Воздуховоды и фасонные части"
    certificate_id: null
    rendered_certificate_number: null
attachments: []
validation:
  warnings: []
  errors: []
```

Это не финальная DB schema. Это ориентир для Data Model v1.

---

## 8. Final architectural conclusion

АОСР должен быть typed document.

Нельзя делать его просто DOCX-файлом или generic JSON blob.

Правильная модель:

```text
AOSR individual data + ObjectTemplate/global-library resolution (or one full manual snapshot) + linked certificates + numbering + form template version
→ HTML Preview
→ DOCX/PDF
→ Registry Projection
→ Package Builder
```

Released revision/package snapshots freeze the exact resolved output and
evidence provenance; the working linked act does not copy template-owned data.
