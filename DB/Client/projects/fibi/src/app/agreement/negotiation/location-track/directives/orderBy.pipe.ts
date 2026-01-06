import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })
export class OrderrByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        return records.sort(function (a, b) {
            if (args.property === 'negotiationsLocationType' || args.property === 'negotiationLocationStatus') {
                if (a[args.property].description.toLowerCase() < b[args.property].description.toLowerCase()) {
                    return -1 * args.direction;
                } else if (a[args.property].description.toLowerCase() > b[args.property].description.toLowerCase()) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }  else if (args.property === 'person') {
                const A = a[args.property] ? a[args.property].fullName.toLowerCase() : '';
                const B = b[args.property] ? b[args.property].fullName.toLowerCase() : '';
                if (A < B) {
                    return -1 * args.direction;
                } else if (A > B) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            } else {
                if (a[args.property] < b[args.property]) {
                    return -1 * args.direction;
                } else if (a[args.property] > b[args.property]) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
        });
    }
}
