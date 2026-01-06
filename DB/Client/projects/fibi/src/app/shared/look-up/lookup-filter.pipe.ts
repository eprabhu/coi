import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lookupFilter'
})
export class LookupFilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        return items.filter( L => {
            return Object.values(L).join().toLowerCase().includes(searchText.toLowerCase());
        });
    }
}
