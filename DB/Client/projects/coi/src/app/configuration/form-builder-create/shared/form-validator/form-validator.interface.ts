export interface ValidationResponse {
    formBuilderId: number
    sectionId: number
    sectionName: string
    componentId: string
    navigationURL: string
    validationType: 'VE' | 'VW' | 'VM'
    validationMessage: string,
    componentType: string,
    questionnaire?: any,
    questionId?: number
}

export class ValidationConfig {
    isShowValidationIcon = true;
    isShowNavigationBar = true;
    proceedBtnName = 'Submit';
    headerOffSetValue: number = 0;
}

export interface ValidationMessageObj {
    validation: ValidationResponse,
    ELEMENT: HTMLElement,
    messagePlacement: 'top' | 'bottom'
}

export class ValidationClickResult {
  elementId: string | null = null;
  buttonId: string | null = null;
}
