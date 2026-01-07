import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { MigratedEngagementsService } from '../migrated-engagements.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule, KeyValue } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
    selector: 'app-migrated-engagement-matrix',
    standalone: true,
    imports: [CommonModule, SharedModule],
    templateUrl: './migrated-engagement-matrix.component.html',
    styleUrls: ['./migrated-engagement-matrix.component.scss']
})
export class MigratedEngagementMatrixComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    columnList: string[] = [];
    matrixFormValue: any;

    @Input() engagementId: any;

    constructor(private _migratedEngagementService: MigratedEngagementsService, private _sanitizer: DomSanitizer) { }

    ngOnInit() { 
        this.fetchMatrixForm();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private fetchMatrixForm() {
        this.$subscriptions.push(this._migratedEngagementService.getLegacyEngagementMatrix(this.engagementId).subscribe((data: any) => {
            this.matrixFormValue = this.groupBy(data?.coiMatrixResponse, "coiMatrixQuestion", 'coiMatrixGroup', 'groupName');
            this.setColumnList();
            this.sortByGroupSort(this.matrixFormValue);
        }));
    }

    private groupBy(jsonData, key, innerKey, inner2) {
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key][innerKey][inner2]] = relationsTypeGroup[item[key][innerKey][inner2]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    private sortByGroupSort(obj) {
        const SORT_OBJ = Object.keys(obj).reduce((acc, key) => {
            acc[key] = obj[key].sort((a, b) => a.coiMatrixQuestion?.coiMatrixGroup?.sortId - b.coiMatrixQuestion?.coiMatrixGroup?.sortId);
            return acc;
        }, {} as any);
    }

    private setColumnList() {
        this.columnList = ['Self', 'Spouse/Domestic Partner', 'Dependents', 'Comments'];
    }

    getMatrixValueByRelation(answerList: any[], relCode: string): string | null {
        const MATCHED_DATA = answerList?.find(a => a.relationshipTypeCode === relCode);
        return MATCHED_DATA?.columnValue || null;
    }

    getSafeLabel(label: string): SafeHtml {
        return this._sanitizer.bypassSecurityTrustHtml(label);
    }

    keepOriginalOrder (a: KeyValue<string, any>, b: KeyValue<string, any>): number {
        return 0; // no default sorting, keep insertion order
    };

}
