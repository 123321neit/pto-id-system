import type { ReactNode, SyntheticEvent } from 'react';

import type { RepresentativeFormState } from './demo-aosr-ui.js';

interface RepresentativeFormLabels {
  readonly roleLabel: string;
  readonly fullName: string;
  readonly position: string;
  readonly organization: string;
  readonly authorityBasis: string;
  readonly nrsId: string;
  readonly details: string;
}

interface DemoRepresentativeFormProps {
  readonly afterFields?: ReactNode;
  readonly form: RepresentativeFormState;
  readonly labels: RepresentativeFormLabels;
  readonly onChange: (field: keyof RepresentativeFormState, value: string) => void;
  readonly onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly submitLabel: string;
}

export function DemoRepresentativeForm({
  afterFields,
  form,
  labels,
  onChange,
  onSubmit,
  submitLabel,
}: DemoRepresentativeFormProps): React.JSX.Element {
  return (
    <form className="inline-form inline-form--representative" onSubmit={onSubmit}>
      <label>
        {labels.roleLabel}
        <input
          onChange={(event) => {
            onChange('roleLabel', event.currentTarget.value);
          }}
          value={form.roleLabel}
        />
      </label>
      <label>
        {labels.fullName}
        <input
          onChange={(event) => {
            onChange('fullName', event.currentTarget.value);
          }}
          value={form.fullName}
        />
      </label>
      <label>
        {labels.position}
        <input
          onChange={(event) => {
            onChange('position', event.currentTarget.value);
          }}
          value={form.position}
        />
      </label>
      <label>
        {labels.organization}
        <input
          onChange={(event) => {
            onChange('organization', event.currentTarget.value);
          }}
          value={form.organization}
        />
      </label>
      <label>
        {labels.authorityBasis}
        <input
          onChange={(event) => {
            onChange('authorityBasis', event.currentTarget.value);
          }}
          value={form.authorityBasis}
        />
      </label>
      <label>
        {labels.nrsId}
        <input
          onChange={(event) => {
            onChange('nrsId', event.currentTarget.value);
          }}
          value={form.nrsId}
        />
      </label>
      <label className="act-form-grid__wide">
        {labels.details}
        <textarea
          className="medium-field"
          onChange={(event) => {
            onChange('details', event.currentTarget.value);
          }}
          rows={3}
          value={form.details}
        />
      </label>
      {afterFields}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
