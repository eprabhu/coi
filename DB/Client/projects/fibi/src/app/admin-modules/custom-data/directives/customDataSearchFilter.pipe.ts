import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'CustomDataSearchFilter'
})
export class CustomDataSearchFilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        return items.filter( L => {
            const adminModule = [];
            L.customDataElementUsage.forEach(element => {
                adminModule.push(element.module.description);
            });
            const combinedData = adminModule
                .concat(L.columnLabel, L.customDataTypes.description, L.dataLength, L.defaultValue);
            return Object.values(combinedData).join().toLowerCase().includes(searchText.toLowerCase());
         });
    }
}
