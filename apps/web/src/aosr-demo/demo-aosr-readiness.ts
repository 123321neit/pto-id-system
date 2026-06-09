export type DemoAosrReadinessStatus = 'ready' | 'needs-attention';

export interface DemoAosrReadinessInput {
  readonly complianceStatement: string;
  readonly materialsCount: number;
  readonly objectDocumentsCount: number;
  readonly signatoriesCount: number;
}

export interface DemoAosrReadiness {
  readonly issues: readonly string[];
  readonly status: DemoAosrReadinessStatus;
  readonly statusLabel: string;
}

// Frontend-only diagnostics for the mock demo. Future versions may validate attached
// files, signature presence, document statuses and issued/reviewed states here.
export function buildDemoAosrReadiness({
  complianceStatement,
  materialsCount,
  objectDocumentsCount,
  signatoriesCount,
}: DemoAosrReadinessInput): DemoAosrReadiness {
  const issues: string[] = [];

  if (signatoriesCount === 0) {
    issues.push('Нет подписантов');
  }

  if (materialsCount === 0) {
    issues.push('Не выбраны материалы');
  }

  if (objectDocumentsCount === 0) {
    issues.push('Не выбраны документы объекта');
  }

  if (complianceStatement.trim() === '') {
    issues.push('Не заполнена нормативная база');
  }

  const status: DemoAosrReadinessStatus = issues.length === 0 ? 'ready' : 'needs-attention';

  return {
    issues,
    status,
    statusLabel: status === 'ready' ? '🟢 Готов к выпуску' : '🟡 Требует заполнения',
  };
}
