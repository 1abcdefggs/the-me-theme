// src/ui/controllers/modal-controller.ts

export class ModalController {
    static show(id: string) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    }

    static hide(id: string) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    static attachCloseListeners() {
        const mapping: Record<string, string> = {
            'close-modal-btn': 'license-modal',
            'close-import-modal-btn': 'import-modal',
            'close-blank-modal-btn': 'create-blank-modal',
            'close-export-modal-btn': 'export-settings-modal',
            'close-mode-modal-btn': 'mode-notification-modal',
            'close-advanced-import-x': 'advanced-import-modal',
            'cancel-advanced-import-btn': 'advanced-import-modal'
        };

        for (const [btnId, modalId] of Object.entries(mapping)) {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.hide(modalId);
                });
            }
        }
    }
}
