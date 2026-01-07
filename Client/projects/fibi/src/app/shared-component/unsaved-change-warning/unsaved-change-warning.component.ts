import {Component, Input, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
    selector: 'app-unsaved-change-warning',
    templateUrl: './unsaved-change-warning.component.html',
    styleUrls: ['./unsaved-change-warning.component.css'],
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({opacity: 0}),
                    animate('250ms ease-in', style({opacity: 1}))
                ]),
                transition(':leave', [
                    style({opacity: 1}),
                    animate('250ms ease-in', style({opacity: 0}))
                ])
            ]
        )
    ],
})
export class UnsavedChangeWarningComponent implements OnInit {

    @Input() hasUnsavedChanges: boolean;
    @Input() buttonName: string = 'Add Button';

    constructor() {
    }

    ngOnInit() {
    }

}
