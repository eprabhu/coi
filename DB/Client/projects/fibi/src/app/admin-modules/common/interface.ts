class Action {
    FIELD_METADATA: any = [];
    BEFORE: {};
    AFTER: {};
}
export class AuditLog {
    module = '';
    subModule = '';
    actionType = '';
    action = new  Action();
    moduleItemKey = null;
    changes = '';

    constructor(moduleName: string) {
        this.module = moduleName;
    }
}
