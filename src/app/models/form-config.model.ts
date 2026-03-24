import { Control } from "./control.model";

export class FormConfig {
    controls!: Control[];

    constructor(config: FormConfig) {
        Object.assign(this, config);
    }
}