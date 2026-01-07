import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PersonEventInteractionService {

$personList = new BehaviorSubject<any>([]);
$isPersonWidgetVisible = new BehaviorSubject(true);
$isGenerateOptionEnable = new BehaviorSubject(true);

constructor() { }
}
