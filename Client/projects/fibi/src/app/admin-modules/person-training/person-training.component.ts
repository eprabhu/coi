import { Component, OnInit } from '@angular/core';
import { PersonTrainingService } from './person-training.service';

@Component({
    selector: 'app-person-training',
    template: `
        <router-outlet></router-outlet>`,
    providers: [PersonTrainingService]
})
export class PersonTrainingComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
