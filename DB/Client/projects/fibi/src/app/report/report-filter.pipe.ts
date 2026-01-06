import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reportFilter'
})
export class ReportFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) { return []; }
    if (!searchText) { return items; }
    searchText = searchText.toLowerCase();
    return items.filter(row => {
              if ((row.displayName).toLowerCase().includes(searchText)) {
                return row.displayName;
              }
    });
  }

}
