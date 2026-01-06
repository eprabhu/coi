import { animate, style, transition, trigger, keyframes } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
    transition(':enter', [
        animate('400ms ease-in', keyframes([
            style({ opacity: 0, offset: 0 }),
            style({ opacity: .5, offset: 0.5 }),
            style({ opacity: 1, offset: 1.0 }),
        ]))
    ])
]);

export const slideDown = trigger('slideDown', [
    transition(":leave", [
        animate('500ms ease-in', keyframes([
            style({ left: '45%', top: '100%', opacity: '0.4', offset: 1 })
        ])),
    ])
])
