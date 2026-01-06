import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'orderBy' })
export class OrderrByPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        return records.sort(function (a, b) {
            if (args.property === 'totalCost' || args.property === 'total' || args.property === 'score') {
                if (a[args.property] < b[args.property]) {
                    return -1 * args.direction;
                } else if (a[args.property] > b[args.property]) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
            if (args.property === 'investigator') {
                const A = a[args.property].fullName ? a[args.property].fullName.toLowerCase() : '';
                const B = b[args.property].fullName ? b[args.property].fullName.toLowerCase() : '';
                if (A < B) {
                    return -1 * args.direction;
                } else if (A > B) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
            if (args.property === 'adjustedScore') {
                if (a.proposalEvaluationScore[args.property] < b.proposalEvaluationScore[args.property]) {
                    return -1 * args.direction;
                } else if (a.proposalEvaluationScore[args.property] > b.proposalEvaluationScore[args.property]) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
            if (args.property === 'proposalRank') {
                const A = a.proposalEvaluationScore[args.property] ? a.proposalEvaluationScore[args.property].toLowerCase() : '';
                const B = b.proposalEvaluationScore[args.property] ? b.proposalEvaluationScore[args.property].toLowerCase() : '';
                if (A < B) {
                    return -1 * args.direction;
                } else if (A > B) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
            if (args.property === 'proposalStatus') {
                const A = a[args.property].description ? a[args.property].description.toLowerCase() : '';
                const B = b[args.property].description ? b[args.property].description.toLowerCase() : '';
                if (A < B) {
                    return -1 * args.direction;
                } else if (a[args.property].description.toLowerCase() > b[args.property].description.toLowerCase()) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            } else {
                const A = a[args.property] ? a[args.property].toLowerCase() : '';
                const B = b[args.property] ? b[args.property].toLowerCase() : '';
                if (A < B) {
                    return -1 * args.direction;
                } else if (A > B) {
                    return 1 * args.direction;
                } else {
                    return 0;
                }
            }
        });
    }
}
