import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })
export class OrderrByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        if (records) {
            return records.sort(function (a, b) {
                if (args.property === 'assigneeFullName') {
                    if (a[args.property].toLowerCase() < b[args.property].toLowerCase()) {
                        return -1 * args.direction;
                    } else if (a[args.property].toLowerCase() > b[args.property].toLowerCase()) {
                        return 1 * args.direction;
                    } else {
                        return 0;
                    }
                }
                if (args.property === 'taskStatus' || args.property === 'taskType') {
                    if (a[args.property].description.toLowerCase() < b[args.property].description.toLowerCase()) {
                        return -1 * args.direction;
                    } else if (a[args.property].description.toLowerCase() > b[args.property].description.toLowerCase()) {
                        return 1 * args.direction;
                    } else {
                        return 0;
                    }
                }
                if (args.property === 'startDate' || args.property === 'dueDate') {
                    if (new Date(a[args.property]).getTime() < new Date(b[args.property]).getTime()) {
                        return -1 * args.direction;
                    } else if (new Date(a[args.property]).getTime() > new Date(b[args.property]).getTime()) {
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
}
