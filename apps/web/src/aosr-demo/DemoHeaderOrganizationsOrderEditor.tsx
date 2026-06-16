import type { DemoAosrHeaderOrganization } from './demo-aosr-workspace.js';
import type { MoveDirection } from './demo-aosr-ui.js';

interface DemoHeaderOrganizationsOrderEditorProps {
  readonly headerOrganizations: readonly DemoAosrHeaderOrganization[];
  readonly isFromDefaults: boolean;
  readonly onMoveHeaderOrganization: (
    headerOrganizationId: string,
    direction: MoveDirection,
  ) => void;
  readonly onResetHeaderOrganizationsToObjectDefault: () => void;
}

export function DemoHeaderOrganizationsOrderEditor({
  headerOrganizations,
  isFromDefaults,
  onMoveHeaderOrganization,
  onResetHeaderOrganizationsToObjectDefault,
}: DemoHeaderOrganizationsOrderEditorProps): React.JSX.Element {
  return (
    <section
      className="form-section act-editor-card act-editor-card--featured"
      aria-labelledby="act-organizations-title"
    >
      <div className="scope-heading scope-heading--with-action">
        <span>
          <h3 id="act-organizations-title">Организации, участвующие в акте</h3>
          <p className="helper-note">
            Порядок этих блоков используется в верхней части печатного АОСР.
          </p>
          <span className="source-chip">
            {isFromDefaults ? 'По параметрам по умолчанию' : 'Изменено в документе'}
          </span>
        </span>
        {isFromDefaults ? null : (
          <button
            className="compact-toggle"
            onClick={onResetHeaderOrganizationsToObjectDefault}
            type="button"
          >
            Вернуть из параметров по умолчанию
          </button>
        )}
      </div>

      <ol className="print-order-list" aria-label="Порядок организаций в акте">
        {headerOrganizations.map((headerOrganization, index) => (
          <li className="print-order-item" key={headerOrganization.id}>
            <span className="print-order-item__position">{index + 1}</span>
            <span className="print-order-item__body">
              <strong>{headerOrganization.label}</strong>
              <small>{headerOrganization.organizationName}</small>
              <small>{headerOrganization.details}</small>
            </span>
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
          </li>
        ))}
      </ol>
    </section>
  );
}
