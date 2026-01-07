import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LookUpClass } from '../../common/services/coi-common.interface';

export const DYNAMIC_SELECT_LIMIT = 3;

@Component({
    selector: 'app-dynamic-select',
    templateUrl: './dynamic-select.component.html',
    styleUrls: ['./dynamic-select.component.scss']
})
export class DynamicSelectComponent implements OnInit {

    @Input() label = '';
    @Input() uniqueId = '';
    @Input() isDisabled = false;
    @Input() isError = false;
    @Input() limit = DYNAMIC_SELECT_LIMIT;
    @Input() lookupList: LookUpClass[] = [];
    @Input() selectedValue: LookUpClass = null;
    
    @Output() selectedValueChange = new EventEmitter<LookUpClass>();

    ngOnInit(): void {
        if (!this.uniqueId) {
            this.uniqueId = 'dynamic-select-' + Math.random().toString(36).substring(2, 8);
        }
    }

    onInputChange(selectedCode: string | number): void {
        this.selectedValue = this.lookupList?.find(option => option?.code === selectedCode);
        this.selectedValueChange.emit(this.selectedValue);
    }
}
