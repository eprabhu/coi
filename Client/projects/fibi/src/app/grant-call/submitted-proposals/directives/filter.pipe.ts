import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {

  /**
   * @param  {any[]} items
   * @param  {any} searchText
   * @returns any
   * returns all matching rows of data with respect to the values enters in the search filter
   */
  transform(items: any[], args?: any): any[] {
    if (!items) { return []; }
    if (!args.pannel && !args.status) {
      return items;
    } else if (args.pannel && args.status) {
      return items.filter(row =>
        (row.scoringMapId === args.pannel && row.proposalStatus.statusCode === args.status));
     } else {
       return items.filter(row =>
        ((args.pannel && row.scoringMapId === args.pannel) ||  (args.status && row.proposalStatus.statusCode === args.status)));
     }
  }
}
