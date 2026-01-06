import {Component, Input} from '@angular/core';
import {NO_DATA_FOUND_MESSAGE} from '../../../../app-constants';

@Component({
  selector: 'form-no-data-label',
  templateUrl: './no-data-label.component.html',
  styleUrls: ['./no-data-label.component.scss']
})
export class FormNoDataLabelComponent {

  @Input() valueToShow: string | number | any[] = '';
  @Input() classesToApply = 'ms-2 fs-14';
  @Input() customNoDataFoundMessage = NO_DATA_FOUND_MESSAGE;


  isArrayAndEmpty(value) {
    if (Array.isArray(value))
    return value.length > 0;
    if (typeof value == "string") 
      return value != '';
    return (value != null || value === 0);
  }
}
