import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderBy'})
export class OrderByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {

        const getKeyValueFromObject: any | null = (object: any, keyNames: string[]) => {
            let obj = object;
            for (let i = 0; i < keyNames.length; i++) {
                if (!obj) {
                    return null;
                }
                obj = obj[keyNames[i]];
            }
            return obj;
        };

        return records.sort(function (a, b): number {

            let valueA = getKeyValueFromObject(a, args.property.split('.'));
            valueA = valueA ? typeof valueA === 'string' ? valueA.trim().toLowerCase() : valueA : '';
            let valueB = getKeyValueFromObject(b, args.property.split('.'));
            valueB = valueB ? typeof valueB === 'string' ? valueB.trim().toLowerCase() : valueB : '';

            if (valueA === '') {
                return 1;
            } else if (valueB === '') {
                return -1;
            } else if (valueA < valueB) {
                return -1 * args.direction;
            } else if (valueA > valueB) {
                return 1 * args.direction;
            } else {
                return 0;
            }
        });
    }


}
