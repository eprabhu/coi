import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { EntitySectionType } from '../shared/entity-constants';

@Injectable()
export class EntityComparisonService {

    selectedSectionDetails: EntitySectionType[] = [];
    sliderId = 'coi-entity-comparison-slider';
    selectedSectionId: string | number | null = null;

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    getEntityDetails(entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/fetch/${entityId}`);
    }

    getAllEntityVersion(entityNumber: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/version/${entityNumber}`);
    }

    fetchEntitySponsorDetails(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/sponsor/fetch/${entityId}`);
    }

    fetchEntitySubawardOrgDetails(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/organization/fetch/${entityId}`);
    }

    fetchEntityComplianceDetails(entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/compliance/fetch/${entityId}`);
    }

}

export function groupBy(jsonData: any[], key: string): {} {
    return jsonData?.reduce((relationsTypeGroup, item) => {
        const GROUP_BY = item?.[key]; // Accessing addressTypeCode directly
        if (GROUP_BY) {
            relationsTypeGroup[GROUP_BY] = relationsTypeGroup[GROUP_BY] || [];
            relationsTypeGroup[GROUP_BY].push(item);
        }
        return relationsTypeGroup;
    }, {});
}

export function compareGroupedData<T>(
    leftData: T[],
    rightData: T[],
    groupByKey: keyof T,
    compareFields: (keyof T)[],
    resultContainer: { ADD: T[]; DELETE: T[]; UPDATE: any[]; NO_CHANGE: T[] }
): void {
    const LEFT_GROUPED = groupBy(leftData || [], groupByKey as string);
    const RIGHT_GROUPED = groupBy(rightData || [], groupByKey as string);
    const ALL_GROUPS = new Set([...Object.keys(LEFT_GROUPED), ...Object.keys(RIGHT_GROUPED)]);

    ALL_GROUPS.forEach(groupKey => {
        const LEFT = [...(LEFT_GROUPED[groupKey] || [])];
        const RIGHT = [...(RIGHT_GROUPED[groupKey] || [])];

        const MATCHED_LEFT_INDICES = new Set<number>();
        const MATCHED_RIGHT_INDICES = new Set<number>();

        // Step 1: Exact Matches (NO_CHANGE)
        LEFT.forEach((leftItem, lIndex) => {
            RIGHT.forEach((rightItem, rIndex) => {
                if (MATCHED_RIGHT_INDICES.has(rIndex)) return;

                const IS_EXACT_MATCH = compareFields.every(field =>
                    leftItem?.[field]?.toString()?.trim() === rightItem?.[field]?.toString()?.trim()
                );

                if (IS_EXACT_MATCH) {
                    resultContainer.NO_CHANGE.push(leftItem);
                    MATCHED_LEFT_INDICES.add(lIndex);
                    MATCHED_RIGHT_INDICES.add(rIndex);
                }
            });
        });

        // Step 2: Partial Matches (UPDATE)
        LEFT.forEach((leftItem, lIndex) => {
            if (MATCHED_LEFT_INDICES.has(lIndex)) return;

            let bestMatchIndex: number | null = null;
            let bestScore = 0;

            RIGHT.forEach((rightItem, rIndex) => {
                if (MATCHED_RIGHT_INDICES.has(rIndex)) return;

                let score = 0;
                compareFields.forEach(field => {
                    if (leftItem?.[field]?.toString()?.trim() === rightItem?.[field]?.toString()?.trim()) {
                        score++;
                    }
                });

                if (score > bestScore) {
                    bestScore = score;
                    bestMatchIndex = rIndex;
                }
            });

            if (bestMatchIndex !== null && bestScore > 0 && bestScore < compareFields.length) {
                resultContainer.UPDATE.push({
                    leftSideDetails: leftItem,
                    rightSideDetails: RIGHT[bestMatchIndex]
                });
                MATCHED_LEFT_INDICES.add(lIndex);
                MATCHED_RIGHT_INDICES.add(bestMatchIndex);
            }
        });

        // Step 3: Remaining left → Update if unmatched right exists
        LEFT.forEach((leftItem, lIndex) => {
            if (MATCHED_LEFT_INDICES.has(lIndex)) return;

            const unmatchedRightIndex = RIGHT.findIndex((_, rIndex) => !MATCHED_RIGHT_INDICES.has(rIndex));
            if (unmatchedRightIndex !== -1) {
                resultContainer.UPDATE.push({
                    leftSideDetails: leftItem,
                    rightSideDetails: RIGHT[unmatchedRightIndex]
                });
                MATCHED_LEFT_INDICES.add(lIndex);
                MATCHED_RIGHT_INDICES.add(unmatchedRightIndex);
            }
        });

        // Step 4: Unmatched left → DELETE
        LEFT.forEach((leftItem, lIndex) => {
            if (!MATCHED_LEFT_INDICES.has(lIndex)) {
                resultContainer.DELETE.push(leftItem);
            }
        });

        // Step 5: Unmatched right → ADD
        RIGHT.forEach((rightItem, rIndex) => {
            if (!MATCHED_RIGHT_INDICES.has(rIndex)) {
                resultContainer.ADD.push(rightItem);
            }
        });
    });
}
