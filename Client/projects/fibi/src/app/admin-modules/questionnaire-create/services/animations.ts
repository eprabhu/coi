import { trigger, transition, animate, keyframes, style } from '@angular/animations';

export const easeInOUt =  trigger('items', [
    transition(':enter', [
      animate('1s ease-in', keyframes([
        style({opacity: 0, transform: 'translateY(-30%)', offset: 0}),
        style({opacity: .5, transform: 'translateY(5px)',  offset: 0.3}),
        style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
      ]))
    ]),
    transition(':leave', [
      animate('1s ease-in', keyframes([
        style({opacity: 1, transform: 'translateY(0)', offset: 0}),
        style({opacity: .5, transform: 'translateY(5px)',  offset: 0.3}),
        style({opacity: 0, transform: 'translateY(-30%)',     offset: 1.0}),
      ]))
    ])
]);

export const easeIn =  trigger('items', [
    transition(':enter', [
      animate('1s ease-in', keyframes([
        style({opacity: 0, transform: 'translateY(-30%)', offset: 0}),
        style({opacity: .5, transform: 'translateY(5px)',  offset: 0.3}),
        style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
      ]))
    ])
]);
