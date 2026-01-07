import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-no-information',
  templateUrl: './no-information.component.html',
  styleUrls: ['./no-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoInformationComponent {

  @Input() isBorderNeeded = true;
  @Input() customClass = '';
  @Input() canShowAddButton = false;
  @Input() buttonName = '';
  @Output() buttonAction = new EventEmitter<any>();

  emitButtonEvent(){
    this.buttonAction.emit(true);
  }
}
