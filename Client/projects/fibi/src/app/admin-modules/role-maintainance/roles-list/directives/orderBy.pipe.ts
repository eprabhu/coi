import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        return records.sort(function (a, b) {
            if (args.property === 'roleId') {
                if (a[args.property] < b[args.property]) {
                    return -1 * args.direction;
                } else if (a[args.property] > b[args.property]) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            } if (args.property === 'roleType') {
                if (a[args.property].roleType.toLowerCase() < b[args.property].roleType.toLowerCase()) {
                    return -1 * args.direction;
                } else if (a[args.property].roleType.toLowerCase() > b[args.property].roleType.toLowerCase()) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            } else {
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
