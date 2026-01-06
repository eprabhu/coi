import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customTagRemover'
})
export class CustomTagRemoverPipe implements PipeTransform {

    transform(data: any, currentMethod?: any): any {
        if (currentMethod + '' === 'COMPARE') {
            return data && (data.toString().includes('ins') || data.toString().includes('del')) ?
                    data : data && data.toString().replace(/<[^>]*>/g, '');
        } else {
            return data && data.toString().replace(/<[^>]*>/g, '');
        }
    }

}
