/**
 * authour Mahesh Sreenath V M
 * A custom search filter for searching. It does support searching in deep objects
 * deep keys should be specified like as an array of string ['key.deepObjectKey'] deep object keys can be listed with '.' as separator.
 * if no array of string specified, then only one level Array<objects> search is supported.
 * please don't use this pipe for very large(10000) and above. tested with 1000 data.
 * added support for data specific search by specifying search text within single quotes(') eg: 'will, smith' for exact string matching
 */
import { Pipe, PipeTransform } from '@angular/core';
import { getValueFromObject } from '../../common/utilities/custom-utilities';

@Pipe({
  name: 'SearchFilter'
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], searchText: string, keys: string[] = []): any[] {
        if (!items) {
            return [];
        }
        if (!searchText) {
            return items;
        }
        if (keys.length) {
            return items.filter(item => {
                return keys.reduce((acc, key) => acc + `'${(getValueFromObject(item, key) || '')}'`, '')
                    .toLowerCase()
                    .includes(searchText.trim().toLowerCase());
            });
        }
        return items.filter( L => {
            return Object.values(L).join().toLowerCase().includes(searchText.trim().toLowerCase());
        });
    }
}
