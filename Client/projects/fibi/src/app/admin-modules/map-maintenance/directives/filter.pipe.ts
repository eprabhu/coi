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
  transform(items: any[], searchText: any ): any[] {
          if (!items) {return []; }
          if (!searchText) {return items; }
          searchText = searchText.toLowerCase();
          return items.filter( row => {
            let concatenatedText = '';
            for (const key in row) {
                if (key.length > 0) {
                  concatenatedText += row[key];
                }
            }
            if (concatenatedText.toLowerCase().includes(searchText)) {
                return row;
            }
        });
  }
}

