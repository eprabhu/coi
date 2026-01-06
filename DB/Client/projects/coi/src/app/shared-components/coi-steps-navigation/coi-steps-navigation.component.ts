import { Component, EventEmitter, Input, Output } from '@angular/core';

export type CoiStepsNavActionType = 'PREVIOUS' | 'PROCEED' | 'SUBMIT' | 'SAVE' | 'COMPLETE_ENGAGEMENT' | null;

export interface CoiStepsNavBtnConfig {
    title: string;
    btnName: string;
    matIcon: string;
    ariaLabel: string;
    isShowBtn: boolean;
    isDisabled: boolean;
    actionType: CoiStepsNavActionType;
}

export class PreviousBtnConfig implements CoiStepsNavBtnConfig {
    btnName = 'Previous';
    matIcon = 'keyboard_backspace';
    title = 'Click here to return to the previous step';
    ariaLabel = 'Click here to return to the previous step';
    isShowBtn = false;
    isDisabled = false;
    actionType: CoiStepsNavActionType = 'PREVIOUS';
}

export class ProceedBtnConfig implements CoiStepsNavBtnConfig {
    btnName = 'Proceed';
    matIcon = 'keyboard_backspace';
    title = 'Click here to continue to the next step';
    ariaLabel = 'Click here to continue to the next step';
    isShowBtn = false;
    isDisabled = false;
    actionType: CoiStepsNavActionType = 'PROCEED';
}

export class CoiStepsNavBtnDefaultConfig implements CoiStepsNavBtnConfig {
    btnName = '';
    matIcon = '';
    title = '';
    ariaLabel = '';
    isShowBtn = false;
    isDisabled = false;
    actionType: CoiStepsNavActionType = null;
}

export class CoiStepsNavConfig {
    previousBtnConfig = new PreviousBtnConfig();
    proceedBtnConfig = new ProceedBtnConfig();
    primaryBtnConfig = new CoiStepsNavBtnDefaultConfig();
}

@Component({
    selector: 'app-coi-steps-navigation',
    templateUrl: './coi-steps-navigation.component.html',
    styleUrls: ['./coi-steps-navigation.component.scss']
})
export class CoiStepsNavigationComponent {

    @Input() stepsNavBtnConfig = new CoiStepsNavConfig();
    @Input() stepsZIndex = 99;
    @Output() stepNavAction = new EventEmitter();

    constructor() {}

    emitAction(actionType: CoiStepsNavActionType): void {
        this.stepNavAction.emit({ actionType });
    }

}
