import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })

export class OrderrByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        return records.sort(function (a, b) {
            if (args.property) {
                if (a[args.property].toLowerCase() < b[args.property].toLowerCase()) {
                    return -1 * args.direction;
                } else if (a[args.property].toLowerCase() > b[args.property].toLowerCase()) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
        });
    }
}
