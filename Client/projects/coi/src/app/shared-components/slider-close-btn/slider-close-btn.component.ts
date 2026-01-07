import {Component, EventEmitter, Output} from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-slider-close-btn',
  templateUrl: './slider-close-btn.component.html',
  styleUrls: ['./slider-close-btn.component.scss']
})
export class SliderCloseBtnComponent {

  @Output() closeAction = new EventEmitter<any>();

  deployMap = environment.deployUrl;
  imgUrl = this.deployMap + 'assets/images/close-black.svg';

  close() {
    this.closeAction.emit();
  }
}
