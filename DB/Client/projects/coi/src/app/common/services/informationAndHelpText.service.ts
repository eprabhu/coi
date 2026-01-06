import { Injectable } from '@angular/core';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';

@Injectable()
export class InformationAndHelpTextService {

    moduleConfiguration = {};


    constructor() { }

    getInFormationText(subSectionId: string | number, elementId: string): string {
        if (!isEmptyObject(this.moduleConfiguration)) {
            if (subSectionId && elementId) {
                const ELEMENT_DETAILS = this.moduleConfiguration?.[subSectionId]?.elementConfig?.find(ele => ele?.uiReferenceId === elementId);
                if (ELEMENT_DETAILS) {
                    return ELEMENT_DETAILS.instruction;
                }
            } else if (subSectionId) {
                return this.moduleConfiguration[subSectionId]?.instruction;
            }
        }
    }

    getHelpText(subSectionId: string | number, elementId: string): string {
        if (!isEmptyObject(this.moduleConfiguration)) {
            if (subSectionId && elementId) {
                const ELEMENT_DETAILS = this.moduleConfiguration?.[subSectionId]?.elementConfig?.find(ele => ele?.uiReferenceId === elementId);
                if (ELEMENT_DETAILS) {
                    return ELEMENT_DETAILS.help;
                }
            } else if (subSectionId) {
                return this.moduleConfiguration[subSectionId]?.help;
            }
        }
    }

}
