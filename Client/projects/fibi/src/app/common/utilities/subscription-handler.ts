/**
 * Author Mahesh Sreenath V M
 * just a function that takes an array of Subscriptions and unsubscribes from them
 * this function should be used in component destroy thus eliminating memory leaks
 * error handling while unsubscribing will be  handled here.
 * to Use this make sure you have pushed your subscriptions to an array.
 *
 *  declaration
 *      import { subscriptionHandler } from '../../common/utilities/subscription-handler';
 *      $Subscriptions: Subscription[] = []; -> variable to push subscription
 *      declare this on your component
 *
 *   usage -> just push your subscriptions to the array just like array.push()
 *      this.$Subscriptions.push(yourService(Params).subscribe(
 *          (success) => {},
 *          (err) => {},
 *          () => {}
 *      }));
 *
 *   unSubscription
 *      ngOnDestroy() {
 *          subscriptionHandler(this.$Subscriptions);
 *      }
 * Happy coding :)
 */
const isFunction = (fn: any) => typeof fn === 'function';

export const subscriptionHandler = (subscriptions: Array<any>) => {
    subscriptions.forEach(sub => sub && isFunction(sub.unsubscribe) && sub.unsubscribe());
};
