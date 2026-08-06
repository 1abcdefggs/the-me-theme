// src/ui/controllers/editor-controller.ts

export class EditorController {
    private static instance: any = null;
    private static isLoaded = false;
    private static savedCustomizationsJson: string | null = null;

    static setInstance(inst: any) {
        this.instance = inst;
    }

    static getInstance() {
        return this.instance;
    }

    static setLoaded(loaded: boolean) {
        this.isLoaded = loaded;
    }

    static getIsLoaded() {
        return this.isLoaded;
    }

    static getValue(): string {
        return this.instance ? this.instance.getValue() : '';
    }

    static setValue(val: string) {
        if (this.instance) {
            this.instance.setValue(val);
        }
    }

    static updateOptions(options: any) {
        if (this.instance) {
            this.instance.updateOptions(options);
        }
    }

    static saveCustomizations() {
        if (this.instance) {
            this.savedCustomizationsJson = this.instance.getValue();
        }
    }

    static restoreCustomizations() {
        if (this.instance && this.savedCustomizationsJson !== null) {
            this.instance.setValue(this.savedCustomizationsJson);
        }
    }
}
