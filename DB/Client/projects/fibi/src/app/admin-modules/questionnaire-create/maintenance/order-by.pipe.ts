import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderBy' })
export class OrderbyPipe implements PipeTransform {
  transform(records: Array<Object>, args?: any): any {
    if (records) {
      return records.sort(function (a, b) {
        if (args.property === 'QUESTIONNAIRE_LABEL' || args.property === 'RULE' || args.property === 'IS_FINAL') {
          if (a[args.property].toLowerCase() < b[args.property].toLowerCase()) {
              return -1 * args.direction;
          } else if (a[args.property].toLowerCase() > b[args.property].toLowerCase()) {
              return 1 * args.direction;
          } else {
              return 0;
          }
      }
      if (args.property === 'QUESTIONNAIRE_NUMBER' || args.property === 'SORT_ORDER' || args.property === 'UPDATE_TIMESTAMP') {
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
