import type { DemoAosrHeaderOrganization } from './demo-aosr-workspace.js';
import type { MoveDirection } from './demo-aosr-ui.js';

interface DemoHeaderOrganizationsOrderEditorProps {
  readonly differentSourceLabel: string;
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly isTemplateEditable: boolean;
  readonly linkedHeaderOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onUpdateHeaderOrganization: (
    headerOrganizationId: string,
    field: 'caption' | 'details' | 'label' | 'organizationName',
    value: string,
  ) => void;
  readonly sourceLabel: string;
}

export function DemoHeaderOrganizationsOrderEditor({
  differentSourceLabel,
  headerOrganizations,
  isTemplateEditable,
  linkedHeaderOrganizations,
  onMoveHeaderOrganization,
  onUpdateHeaderOrganization,
  sourceLabel,
}: DemoHeaderOrganizationsOrderEditorProps): React.JSX.Element {
  return (
    <section
      className="form-section act-editor-card act-editor-card--featured"
      aria-labelledby="act-organizations-title"
    >
      <details className="template-data-disclosure" open={isTemplateEditable ? true : undefined}>
        <summary>
          <span>
            <strong id="act-organizations-title">3. Представители / подписанты</strong>
            <small>Блоков в печатном порядке: {headerOrganizations.length}</small>
          </span>
          {isTemplateEditable ? <span className="source-chip">{sourceLabel}</span> : null}
        </summary>

        <div className="template-data-disclosure__body">
          <ol className="print-order-list" aria-label="Порядок организаций в акте">
            {headerOrganizations.map((headerOrganization, index) => {
              const linkedHeaderOrganization = linkedHeaderOrganizations.find(
                ({ id }) => id === headerOrganization.id,
              );
              const isDifferent =
                isTemplateEditable &&
                (linkedHeaderOrganization?.label !== headerOrganization.label ||
                  linkedHeaderOrganization.organizationName !==
                    headerOrganization.organizationName ||
                  linkedHeaderOrganization.details !== headerOrganization.details ||
                  (linkedHeaderOrganization.caption ?? '') !== (headerOrganization.caption ?? ''));

              return (
                <li className="print-order-item" key={headerOrganization.id}>
                  <span className="print-order-item__position">{index + 1}</span>
                  <span className="print-order-item__body">
                    <strong>{headerOrganization.label}</strong>
                    <small>{headerOrganization.organizationName}</small>
                    <small>{headerOrganization.details}</small>
                    {isDifferent ? (
                      <small className="source-chip">{differentSourceLabel}</small>
                    ) : null}
                    {isTemplateEditable ? (
                      <details className="manual-snapshot-editor">
                        <summary>Изменить организацию</summary>
                        <div className="act-form-grid">
                          <label>
                            Название блока
                            <input
                              aria-label={`Название блока ${headerOrganization.label}`}
                              onChange={(event) => {
                                onUpdateHeaderOrganization(
                                  headerOrganization.id,
                                  'label',
                                  event.currentTarget.value,
                                );
                              }}
                              value={headerOrganization.label}
                            />
                          </label>
                          <label>
                            Организация
                            <input
                              aria-label={`Организация блока ${headerOrganization.label}`}
                              onChange={(event) => {
                                onUpdateHeaderOrganization(
                                  headerOrganization.id,
                                  'organizationName',
                                  event.currentTarget.value,
                                );
                              }}
                              value={headerOrganization.organizationName}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Печатный текст
                            <textarea
                              aria-label={`Печатный текст блока ${headerOrganization.label}`}
                              onChange={(event) => {
                                onUpdateHeaderOrganization(
                                  headerOrganization.id,
                                  'details',
                                  event.currentTarget.value,
                                );
                              }}
                              rows={3}
                              value={headerOrganization.details}
                            />
                          </label>
                          <label className="act-form-grid__wide">
                            Подстрочное пояснение
                            <textarea
                              aria-label={`Подстрочное пояснение блока ${headerOrganization.label}`}
                              onChange={(event) => {
                                onUpdateHeaderOrganization(
                                  headerOrganization.id,
                                  'caption',
                                  event.currentTarget.value,
                                );
                              }}
                              rows={2}
                              value={headerOrganization.caption ?? ''}
                            />
                          </label>
                        </div>
                      </details>
                    ) : null}
                  </span>
                  {isTemplateEditable ? (
                    <span className="inline-actions">
                      <button
                        aria-label={`Переместить организацию ${headerOrganization.label} вверх`}
                        disabled={index === 0}
                        onClick={() => {
                          onMoveHeaderOrganization(headerOrganization.id, 'up');
                        }}
                        type="button"
                      >
                        Вверх
                      </button>
                      <button
                        aria-label={`Переместить организацию ${headerOrganization.label} вниз`}
                        disabled={index === headerOrganizations.length - 1}
                        onClick={() => {
                          onMoveHeaderOrganization(headerOrganization.id, 'down');
                        }}
                        type="button"
                      >
                        Вниз
                      </button>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </details>
    </section>
  );
}
