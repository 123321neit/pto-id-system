// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AiDocumentationAssistant } from './AiDocumentationAssistant.js';

afterEach(() => {
  cleanup();
});

describe('AiDocumentationAssistant', () => {
  it('switches scope and prepares the selected section', async () => {
    const user = userEvent.setup();
    const onPrepare = vi.fn();

    render(
      <AiDocumentationAssistant
        folderName="Октябрь 2026"
        initialScope="folder"
        onClose={vi.fn()}
        onPrepare={onPrepare}
        sectionFolderCount={2}
        sectionName="Вентиляция"
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Сделать ИД с ИИ' });
    await user.click(within(dialog).getByRole('radio', { name: /Во всём разделе/u }));
    await user.click(within(dialog).getByRole('button', { name: 'Подготовить ИД в разделе' }));

    expect(onPrepare).toHaveBeenCalledWith('section');
  });

  it('supports the close button, Escape, backdrop and cancel without preparing documents', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onPrepare = vi.fn();

    const { rerender } = render(
      <AiDocumentationAssistant
        folderName="Октябрь 2026"
        initialScope="folder"
        onClose={onClose}
        onPrepare={onPrepare}
        sectionFolderCount={2}
        sectionName="Вентиляция"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Закрыть ИИ-помощник' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);

    const overlay = screen.getByRole('dialog', { name: 'Сделать ИД с ИИ' }).parentElement;
    if (overlay === null) {
      throw new Error('Для ИИ-помощника нужен фон диалога.');
    }
    fireEvent.mouseDown(overlay);
    expect(onClose).toHaveBeenCalledTimes(3);

    rerender(
      <AiDocumentationAssistant
        folderName="Октябрь 2026"
        initialScope="folder"
        onClose={onClose}
        onPrepare={onPrepare}
        sectionFolderCount={2}
        sectionName="Вентиляция"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(onClose).toHaveBeenCalledTimes(4);
    expect(onPrepare).not.toHaveBeenCalled();
  });

  it('disables preparation when a section has no folders', () => {
    render(
      <AiDocumentationAssistant
        initialScope="section"
        onClose={vi.fn()}
        onPrepare={vi.fn()}
        sectionFolderCount={0}
        sectionName="Новый раздел"
      />,
    );

    expect(screen.getByRole('button', { name: 'Подготовить ИД в разделе' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
