import { animate, style, transition, trigger, group, keyframes, query, stagger, AnimationTriggerMetadata, state } from '@angular/animations';

export const fadeIn =  trigger('fadeIn', [
  transition(':enter', [
    animate('400ms ease-in', keyframes([
      style({opacity: 0,  offset: 0}),
      style({opacity: .5, offset: 0.5}),
      style({opacity: 1, offset: 1.0}),
    ]))
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-10px)' }),
      stagger('100ms', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])], { optional: true }
    )
  ])
]);

export const quickListAnimation = trigger('quickListAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-10px)' }),
      stagger('50ms', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])], { optional: true }
    )
  ])
]);

export const leftSlideInOut = trigger('leftSlideInOut', [
  transition(':enter', [
    animate('300ms ease-in-out', keyframes([
      style({ opacity: 0, transform: 'translateX(-20px)', offset: 0 }),
      style({ opacity: .3, transform: 'translateX(-10px)', offset: 0.3 }),
      style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 }),
    ]))
  ]),
  transition(':leave', [
    animate('300ms ease-in-out', keyframes([
      style({ opacity: 1, transform: 'translateX(0)', offset: 0 }),
      style({ opacity: .3, transform: 'translateX(-5px)', offset: 0.3 }),
      style({ opacity: 0, transform: 'translateX(-10px)', offset: 1.0 }),
    ]))
  ])
]);

export const topSlideInOut = trigger('topSlideInOut', [
  transition(':enter', [
    style({ height: '0', opacity: 0 }),
    group([
      animate(200, style({ height: '*' })),
      animate('300ms ease-in-out', style({ 'opacity': '1' }))
    ])
  ]),
  transition(':leave', [
    animate('250ms ease-in-out', keyframes([
      style({ opacity: 1, height: '*', transform: 'translateY(0)', offset: 0 }),
      style({ opacity: .3, transform: 'translateY(-5px)', offset: 0.3 }),
      style({ opacity: 0, height: 0, transform: 'translateY(-10px)', offset: 1.0 }),
    ]))
  ])
]);

export const fadeInOutHeight  = trigger('fadeInOutHeight', [
  transition(':enter', [
    style({ height: '0', opacity: 0 }),
    group([
      animate('400ms ease-in-out', style({ 'opacity': '1' }))
    ])
  ]),
  transition(':leave', [
    style({ height: '*', opacity: 1 }),
    group([
      animate('200ms ease-in-out', style({ 'opacity': '0' }))
    ])
  ])
]);

export function slideInAnimation(translateXValue: string, translateYValue: string, duration: number = 400, name: string = 'slideInAnimation'): AnimationTriggerMetadata {
  return trigger(`${name}`, [
    transition(':enter', [
      style({ opacity: 0, transform: `translate(${translateXValue}, ${translateYValue})` }),
      animate(`${duration}ms cubic-bezier(0.35, 0, 0.25, 1)`,
        style({ opacity: 1, transform: 'translate(0,0)' }))
    ])
  ]);
}

export function slideOutAnimation(translateXValue: string, translateYValue: string, duration: number = 400, name: string = 'slideOutAnimation'): AnimationTriggerMetadata {
  return trigger(`${name}`, [
    transition(':leave', [
      style({ opacity: 1, transform: `translate(0,0)` }),
      animate(`${duration}ms cubic-bezier(0.35, 0, 0.25, 1)`,
        style({ opacity: 0, transform: `translate(${translateXValue}, ${translateYValue})` }))
    ])
  ]);
}

export function scaleOutAnimation(translateXValue: string, translateYValue: string, duration: number = 400, name: string = 'scaleOutAnimation'): AnimationTriggerMetadata {
  return trigger(`${name}`, [
    transition(':leave', [
      style({ opacity: 1, transform: 'translate(0,0) scaleX(1)' }),
      group([
        animate(`${duration}ms ease-in-out`, style({ opacity: 0, transform: `translate(${translateXValue}, ${translateYValue})` })),
        animate(`${duration}ms ease-in-out`, style({ width: '0' }))
      ])
    ])
  ]);
}

export function scaleInAnimation(translateXValue: string, translateYValue: string, duration: number = 400, name: string = 'scaleInAnimation'): AnimationTriggerMetadata {
  return trigger(`${name}`, [
    transition(':enter', [
      style({ opacity: 1, transform: `translate(${translateXValue}, ${translateYValue}) scaleX(0)` }),
      group([
        animate(`${duration}ms ease-in-out`, style({ opacity: 0, transform: `translate(${translateXValue}, ${translateYValue}) scaleX(1)` })),
        animate(`${duration}ms ease-in-out`, style({ width: '0' }))
      ])
    ])
  ]);
}

export function heightAnimation(min_height: string, max_height: string, duration: number = 300, name: string = 'heightAnimation'): AnimationTriggerMetadata {
  return trigger(`${name}`, [
      transition(':enter', [
          style({ height: min_height, opacity: 0, 'padding-top': '0', 'padding-bottom': '0', overflow: 'hidden' }),
          group([
              animate(duration, style({ height: max_height })),
              animate(`${duration}ms ease-in-out`, style({ opacity: '1', 'padding-top': '*', 'padding-bottom': '*' }))
          ])
      ]),
      transition(':leave', [
          style({ height: max_height, opacity: 1, 'padding-top': '*', 'padding-bottom': '*', overflow: 'hidden' }),
          group([
              animate(duration, style({ height: min_height })),
              animate(`${duration}ms ease-in-out`, style({ opacity: '0', 'padding-top': '0', 'padding-bottom': '0' }))
          ])
      ])
  ]);
}

export const dockerFadeIn = trigger('fadeIn', [
    transition(':enter', [
        animate('400ms ease-in', keyframes([
            style({ opacity: 0, offset: 0 }),
            style({ opacity: .5, offset: 0.5 }),
            style({ opacity: 1, offset: 1.0 }),
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
