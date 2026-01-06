export interface Field {
    columnName: string;
    displayName: string;
    dataType: string;
    isEditable: string;
    length: string;
    canEmpty: string;
    visible: string;
    valueChanged: string;
    index: string;
    filterType: string;
    valueField: string;
    values: any[];
    isTransient: string;
    defaultValue: string;
    refColumnName: string;
}

export interface CodeTable {
    group: string;
    codeTableName: string;
    description: string;
    databaseTableName: string;
    fields: Field[];
    primaryKey: any[];
    dependency: any[];
    fileColumnName: any;
    actions: string;
}


export interface Dependency {
    columnName: string;
    displayName: string;
    tableName: string;
    showTableName: string;
}

export interface CodeTableJson {
    codeTableConfigurations: Array<CodeTableItem>;
    tableData: any;
    selectedColumnForDownload: any;
    updatedUser: any;
    promptMessage: any;
    promptCode: any;
    fileName: any;
    fileContent: any;
    length: any;
    remaining: any;
    fileTimestamp: any;
    contentType: any;
    personId: any;
}

export interface CodeTableSave {
    tableData: any[];
    primaryValues: any[];
    changedMap: Array<string>;
    selectedColumnForDownload?: string
    tableName: string;
    personId: string;
    updatedUser: string;
}

export interface CodeTableItem {
    tableName: string;
    displayName: string;
    content: CodeTable;
    groupName: string;
    description: string;
    updateUser: any;
    updateTimestamp?: any;
    codeTableName: string;
    isAuditLogEnabledInTable: boolean;
}
