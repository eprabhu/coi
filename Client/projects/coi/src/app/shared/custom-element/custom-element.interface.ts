export interface CustomElement {
    customDataElementId: number;
    columnName: string;
    defaultValue: string;
    dataType: string;
    isRequired: string;
    options: Option[];
    answers: Answer[];
    moduleItemCode: number;
    moduleItemKey: string;
    dataLength: number;
    lookupWindow: string;
    lookupArgument: string;
    filterType: string;
    orderNumber: number;
    isActive: any;
    customElementName: any;
    isMultiSelectLookup: string;
    dynamicSubSectionConfig: any;
    helpDescription: string;
    helpLink: string;
}

export interface Option {
    optionName: string;
    customDataOptionId: string;
}

export interface Answer {
    customDataElementsId: any;
    customDataId: number;
    description: string;
    moduleItemCode: any;
    moduleItemKey: any;
    moduleSubItemCode: any;
    moduleSubItemKey: any;
    updateTimestamp: any;
    updateUser: any;
    value: string;
}

export interface AutoSaveRequestObject {
    customElements: CustomElement[];
    moduleCode: number;
    moduleItemKey: number;
    updateTimestamp: number;
}

export interface AutoSaveResponse {
    customElements: CustomElement[];
    moduleCode: number;
    moduleItemKey: number;
    updateTimestamp: number;
    updateUser: string;
}
