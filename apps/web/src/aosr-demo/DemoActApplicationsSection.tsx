import type { DemoActApplication, DemoAosrDraft } from './demo-aosr-workspace.js';

interface DemoActApplicationsSectionProps {
  readonly allApplications: readonly DemoActApplication[];
  readonly selectedDraft: DemoAosrDraft;
  readonly onToggleApplication: (applicationId: string) => void;
}

export function DemoActApplicationsSection({
  allApplications,
  selectedDraft,
  onToggleApplication,
}: DemoActApplicationsSectionProps): React.JSX.Element {
  return (
    <section
      className="form-section act-editor-card act-editor-card--featured application-control"
      aria-labelledby="act-applications-title"
    >
      <div className="scope-heading">
        <p className="section-tag">Финальная часть акта</p>
        <h3 id="act-applications-title">Приложения к акту</h3>
        <p className="helper-note">
          Все приложения включены по умолчанию. Чекбокс управляет только итоговым перечнем и
          предпросмотром, не снимая исходный материал или документ с акта.
        </p>
      </div>

      <div className="application-checklist" role="group" aria-label="Приложения текущего акта">
        {allApplications.length > 0 ? (
          allApplications.map((application) => {
            const isChecked = !selectedDraft.excludedApplicationIds.includes(application.id);

            return (
              <label className="checkbox-row checkbox-row--application" key={application.id}>
                <input
                  checked={isChecked}
                  onChange={() => {
                    onToggleApplication(application.id);
                  }}
                  type="checkbox"
                />
                <span>
                  <strong>{application.title}</strong>
                  <small>{application.source}</small>
                </span>
              </label>
            );
          })
        ) : (
          <p className="empty-state">Приложения появятся после выбора материалов и документов.</p>
        )}
      </div>
    </section>
  );
}
