import { Injectable } from '@angular/core';

@Injectable()
export class IntersectionObserverService {
    private observers: Map<Element, IntersectionObserver> = new Map();

    constructor() { }

    /**
     * Observes an element using the Intersection Observer API.
     * 
     * @param element The DOM element to observe.
     * @param callback The callback function to execute when the element intersects.
     * @param options Optional IntersectionObserverInit options.
     */
    observe(element: Element, callback: IntersectionObserverCallback, options?: IntersectionObserverInit): void {
        const CACHE_OBSERVER = this.observers.get(element);

        if (CACHE_OBSERVER) {
            CACHE_OBSERVER.observe(element);
        } else {
            const NEW_CACHE_OBSERVER = new IntersectionObserver(callback, options);
            this.observers.set(element, NEW_CACHE_OBSERVER);
            NEW_CACHE_OBSERVER.observe(element);
        }
    }

    /**
     * Stops observing the specified element.
     * 
     * @param element The DOM element to stop observing.
     */
    unobserve(element: Element): void {
        const observer = this.observers.get(element);
        if (observer) {
            observer.unobserve(element);
            if (this.isObserverUnused(observer)) {
                observer.disconnect();
                this.observers.delete(element);
            }
        }
    }

    /**
     * Checks if the observer is no longer observing any elements.
     * 
     * @param observer The IntersectionObserver instance.
     * @returns A boolean indicating if the observer is unused.
     */
    private isObserverUnused(observer: IntersectionObserver): boolean {
        return Array.from(this.observers.values()).filter(obs => obs === observer).length <= 1;
    }
}
