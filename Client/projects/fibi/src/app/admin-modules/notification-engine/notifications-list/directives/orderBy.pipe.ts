import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })
export class OrderrByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        return records.sort(function (a, b) {
            let first = '';
            let second = '';
            if (args.property === 'module') {
                first = a[args.property][0].toLowerCase();
                second = b[args.property][0].toLowerCase();
            } else {
                first = args.property === 'notificationTypeId' ? a[args.property] : a[args.property].toLowerCase();
                second = args.property === 'notificationTypeId' ? b[args.property] : b[args.property].toLowerCase();
            }
            if (first < second) {
                return -1 * args.direction;
            } else if (first > second) {
                return 1 * args.direction;
            } else {
                return 0;
            }
        });
    }
}
