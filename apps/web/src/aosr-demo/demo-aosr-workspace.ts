export interface DemoAosrWorkspace {
  readonly id: string;
  readonly name: string;
  readonly projectName: string;
  readonly projectCode: string;
  readonly ownerName: string;
  readonly demoNotice: string;
  readonly drafts: readonly DemoAosrDraft[];
}

export interface DemoAosrDraft {
  readonly id: string;
  readonly actDate: string;
  readonly actNumber: string;
  readonly contractorName: string;
  readonly documentReferences: string;
  readonly inspectorName: string;
  readonly objectName: string;
  readonly status: 'draft' | 'needs-review';
  readonly workDescription: string;
}

export type DemoAosrDraftField =
  | 'actDate'
  | 'actNumber'
  | 'contractorName'
  | 'documentReferences'
  | 'inspectorName'
  | 'objectName'
  | 'workDescription';

export const demoAosrWorkspace: DemoAosrWorkspace = {
  demoNotice: 'DEMO / mock data / not production',
  drafts: [
    {
      actDate: '2026-06-01',
      actNumber: 'AOSR-001',
      contractorName: 'OOO Montazh Stroy',
      documentReferences: 'RD-OV-12, RD-OV-14',
      id: 'aosr-draft-001',
      inspectorName: 'Nikita Haibulin',
      objectName: 'Ventilation chamber V-1',
      status: 'draft',
      workDescription: 'Hidden ventilation duct installation before insulation.',
    },
    {
      actDate: '2026-06-03',
      actNumber: 'AOSR-002',
      contractorName: 'OOO Montazh Stroy',
      documentReferences: 'RD-VK-03',
      id: 'aosr-draft-002',
      inspectorName: 'Awaiting assignment',
      objectName: 'Water supply riser B2',
      status: 'needs-review',
      workDescription: 'Pipe sleeve installation before concrete patching.',
    },
  ],
  id: 'workspace-demo-aosr',
  name: 'Demo AOSR Workspace',
  ownerName: 'Demo owner',
  projectCode: 'PTO-DEMO-2026',
  projectName: 'Clinic renovation sample project',
};

export function updateDemoAosrDraftField(
  draft: DemoAosrDraft,
  field: DemoAosrDraftField,
  value: string,
): DemoAosrDraft {
  return {
    ...draft,
    [field]: value,
  };
}

export function buildDemoAosrPreviewLines(draft: DemoAosrDraft): readonly string[] {
  return [
    `Act number: ${draft.actNumber}`,
    `Date: ${draft.actDate}`,
    `Object: ${draft.objectName}`,
    `Contractor: ${draft.contractorName}`,
    `Inspector: ${draft.inspectorName}`,
    `Work: ${draft.workDescription}`,
    `Design references: ${draft.documentReferences}`,
  ];
}
