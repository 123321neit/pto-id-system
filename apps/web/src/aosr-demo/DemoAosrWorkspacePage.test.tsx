import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DemoAosrWorkspacePage } from './DemoAosrWorkspacePage.js';
import {
  buildDemoAosrPreviewLines,
  demoAosrWorkspace,
  updateDemoAosrDraftField,
} from './demo-aosr-workspace.js';

describe('DemoAosrWorkspacePage', () => {
  it('renders the mock workspace header, draft list, editable form and preview', () => {
    const html = renderToStaticMarkup(<DemoAosrWorkspacePage />);

    expect(html).toContain('DEMO / mock data / not production');
    expect(html).toContain('Clinic renovation sample project');
    expect(html).toContain('Draft queue');
    expect(html).toContain('Basic act data');
    expect(html).toContain('Act of hidden works inspection');
    expect(html).toContain('AOSR-001');
  });

  it('updates editable act fields without mutating the source mock draft', () => {
    const sourceDraft = demoAosrWorkspace.drafts[0];

    if (!sourceDraft) {
      throw new Error('Expected demo workspace to include a draft.');
    }

    const editedDraft = updateDemoAosrDraftField(
      sourceDraft,
      'workDescription',
      'Updated concealed HVAC bracket inspection.',
    );

    expect(editedDraft.workDescription).toBe('Updated concealed HVAC bracket inspection.');
    expect(sourceDraft.workDescription).toBe(
      'Hidden ventilation duct installation before insulation.',
    );
    expect(buildDemoAosrPreviewLines(editedDraft)).toContain(
      'Work: Updated concealed HVAC bracket inspection.',
    );
  });
});
