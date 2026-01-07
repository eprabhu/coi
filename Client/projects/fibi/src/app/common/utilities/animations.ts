import { animate, state, style, transition, trigger, group, keyframes } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  state('in', style({ height: '*', opacity: 0 })),
  transition(':leave', [
    style({ height: '*', opacity: 1 }),
    group([
      animate(300, style({ height: 0 })),
      animate('200ms ease-in-out', style({ 'opacity': '0' }))
    ])
  ]),
  transition(':enter', [
    style({ height: '0', opacity: 0 }),
    group([
      animate(300, style({ height: '*' })),
      animate('400ms ease-in-out', style({ 'opacity': '1' }))
    ])
  ])
]);
export const slowSlideInOut = trigger('slowSlideInOut', [
  state('in', style({ height: '*', opacity: 0 })),
  transition(':leave', [
    style({ height: '*', opacity: 1 }),
    group([
      animate(800, style({ height: 0 })),
      animate('600ms ease-in-out', style({ 'opacity': '0' }))
    ])
  ]),
  transition(':enter', [
    style({ height: '0', opacity: 0 }),
    group([
      animate(800, style({ height: '*' })),
      animate('800ms ease-in-out', style({ 'opacity': '1' }))
    ])
  ])
]);
export const fadeDown = trigger('fadeDown', [
  transition(':enter', [
    animate('1s ease-in', keyframes([
      style({ opacity: 0, transform: 'translateY(-30%)', offset: 0 }),
      style({ opacity: .5, transform: 'translateY(5px)', offset: 0.3 }),
      style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
    ]))
  ]),
  transition(':leave', [
    animate('1s ease-in', keyframes([
      style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
      style({ opacity: .5, transform: 'translateY(5px)', offset: 0.3 }),
      style({ opacity: 0, transform: 'translateY(-30%)', offset: 1.0 }),
    ]))
  ])
]);
export const easeInOUt =  trigger('items', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0)', opacity: 1 }),
    animate('400ms', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);
export const itemAnim = trigger('itemAnim', [
  transition(':enter', [
      animate('1s ease-in', keyframes([
          style({ opacity: 0, transform: 'translateY(-30%)', offset: 0 }),
          style({ opacity: .5, transform: 'translateY(5px)', offset: 0.3 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
      ]))
  ])
]);

export const slideHorizontal = trigger(
    'enterAnimation', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('1200ms', style({ transform: 'translateX(0)', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate('1500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
    ])
  ]);

  export const slideHorizontalOverlay = trigger(
    'enterAnimation', [
    transition(':enter', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      animate('800ms', style({ transform: 'translateX(0)', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate('1000ms', style({ transform: 'translateX(100%)', opacity: 0 }))
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