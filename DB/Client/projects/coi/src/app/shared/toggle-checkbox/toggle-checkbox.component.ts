import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-toggle-checkbox',
    templateUrl: './toggle-checkbox.component.html',
    styleUrls: ['./toggle-checkbox.component.scss']
})
export class ToggleCheckboxComponent {

    @Input() label = '';
    @Input() isToggled = false;
    @Input() isDisabled = false;
    @Input() isShowToggleText = true;
    @Input() toggleValue: [string, string] = ['Off', 'On'];
    @Output() toggleClick: EventEmitter<boolean> = new EventEmitter<boolean>();

    toggleClicked(): void {
        this.isToggled = !this.isToggled;
        this.toggleClick.emit(this.isToggled);
    }
}
