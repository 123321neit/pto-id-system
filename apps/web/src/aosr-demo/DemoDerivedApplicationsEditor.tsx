import type {
  DemoActApplication,
  DemoAosrDraft,
  DemoDerivedAttachment,
} from './demo-aosr-workspace.js';

interface DemoDerivedApplicationsEditorProps {
  readonly attachmentLibrary: readonly DemoDerivedAttachment[];
  readonly finalApplications: readonly DemoActApplication[];
  readonly selectedDraft: DemoAosrDraft;
  readonly onToggleAttachment: (attachmentId: string) => void;
}

export function DemoDerivedApplicationsEditor({
  attachmentLibrary,
  finalApplications,
  selectedDraft,
  onToggleAttachment,
}: DemoDerivedApplicationsEditorProps): React.JSX.Element {
  return (
    <section className="form-section" aria-labelledby="attachments-data-title">
      <h3 id="attachments-data-title">Производные приложения</h3>
      <p className="helper-note">
        Формируется из выбранных сертификатов, схем, фото и журналов. Свободного поля “приложения” в
        демо нет.
      </p>
      <div
        className="attachment-options"
        role="group"
        aria-label="Структурированные демо-приложения"
      >
        {attachmentLibrary.map((attachment) => (
          <label className="checkbox-row" key={attachment.id}>
            <input
              checked={selectedDraft.derivedAttachmentIds.includes(attachment.id)}
              onChange={() => {
                onToggleAttachment(attachment.id);
              }}
              type="checkbox"
            />
            <span>
              <strong>{attachment.title}</strong>
              <small>{attachment.reference}</small>
            </span>
          </label>
        ))}
      </div>

      <div className="selected-list" aria-labelledby="final-applications-title">
        <h4 id="final-applications-title">Итоговые приложения в акте</h4>
        <ol aria-label="Итоговые приложения текущего акта">
          {finalApplications.map((application) => (
            <li key={application.id}>
              <span>
                <strong>{application.title}</strong>
                <small>{application.source}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
