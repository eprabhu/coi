import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByIndex'
})
export class OrderByIndexPipe implements PipeTransform {

  transform(records: Array<any>, args?: any): any {

    return records.sort(function (a, b): number {

      let valueA = a[args.property] ? a[args.property] : '';
      valueA = typeof valueA === 'string' ? valueA.toLowerCase().trim() : valueA;
      let valueB = b[args.property] ? b[args.property] : '';
      valueB = typeof valueB === 'string' ? valueB.toLowerCase().trim() : valueB;

      if (valueA < valueB) {
        return -1 * args.direction;
      } else if (valueA > valueB) {
        return 1 * args.direction;
      } else {
        return 0;
      }
    });
  }

}
