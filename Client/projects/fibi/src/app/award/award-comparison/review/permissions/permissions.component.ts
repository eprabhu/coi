import { Component, OnDestroy, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subscription, forkJoin, Observable, of } from 'rxjs';
import { CompareDetails } from '../../interfaces';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { compareArray } from '../../../../common/utilities/array-compare';
import { AwardPermissions } from '../../comparison-constants';
import { PermissionService } from './permission.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PermissionService]
})
export class PermissionsComponent implements OnChanges, OnDestroy {

  @Input() comparisonDetails: CompareDetails;
  @Input() currentMethod: string;
  roleList: any = [];
  personRolesList = [];
  isPermissions = false;
  $subscriptions: Subscription[] = [];
  permissionCache: any = {};

  constructor(
    private _permissionService: PermissionService, private _CDRef: ChangeDetectorRef,
    private _toolKitEvents: ToolkitEventInteractionService) { }

  ngOnChanges() {
    if (this.comparisonDetails.baseAwardId) {
      this.currentMethod + '' === 'COMPARE'
      && (this._toolKitEvents.checkSectionTypeCode('107', this.comparisonDetails.moduleVariableSections)
      || this.comparisonDetails.isActiveComparison )  ? this.comparePermissions() : this.setCurrentView();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @returns void
   * compare the data actually it fetches the data for comparison.
   * Since wee need two different award version data to compare. forkJoin is used so that
   * we trigger the compare function once both version data has been loaded.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  comparePermissions(): void {
    this.$subscriptions.push(forkJoin(this.getPermissionData('base'), this.getPermissionData('current')).subscribe(
      data => {
        this.updateCache(data[0], 'base');
        this.updateCache(data[1], 'current');
        this.compare(data[0], data[1]);
        this.updateCurrentMethod('COMPARE');
        this._CDRef.detectChanges();
      }));
  }

  /**
   * @returns void
   * sets the value to view baseAwardId is used since base is always compared to current.
   * This also updates the data to the cache so that the next time we can
   * reuse the same data instead of making a DB call. improves performance
   */
  setCurrentView(): void {
    this.$subscriptions.push(this.getPermissionData('base').subscribe((data: any) => {
      this.updateCache(data, 'base');
      this.roleList = data.moduleDerivedRoles;
      this.personRolesList = data.awardPersonRoles ? data.awardPersonRoles : [];
      this.updateCurrentMethod('VIEW');
      this._CDRef.detectChanges();
    }));
  }

  /**
   * @param  {any} base
   * @param  {any} current
   * @returns void
   * Compare the versions of the data. Compare method is used according to the type of the
   * data that need to be compared. Here since Array is the data type it is used.
   */
  compare(base: any, current: any): void {
    this.personRolesList = compareArray(base[AwardPermissions.reviewSectionName],
      current[AwardPermissions.reviewSectionName],
      AwardPermissions.reviewSectionUniqueFields,
      AwardPermissions.reviewSectionSubFields);
  }

  /**
   * @param  {string} type
   * @returns Observable
   * fetches the data from server if its not available in cache. only return the Observable.
   * Subscription will be done at the function which invokes this method.
   */
  getPermissionData(type: string): Observable<any> {
    const AWARD_ID = this.getAwardId(type);
    if (this.checkInCache(AWARD_ID)) {
      return of(this.deepCopy(this.permissionCache[AWARD_ID]));
    } else {
      const REQ_BODY = {
        'awardId': AWARD_ID,
        'awardNumber': this.comparisonDetails.awardNumber,
        'isActiveAward': this.comparisonDetails.awardSequenceStatus === 'ACTIVE' ? true : false
      };
      return this._permissionService.fetchAwardPersonRoles(REQ_BODY);
    }
  }
  /**
   * @param  {string} type
   * @returns string
   * return the award id from the input Comparison details according to the Type.
   * if base is the type reruns baseAwardId other wise currentAwardId.
   */
  getAwardId(type: string): string {
    return type === 'base' ? this.comparisonDetails.baseAwardId : this.comparisonDetails.currentAwardId;
  }

  checkInCache(cacheName: string) {
    return !!Object.keys(this.permissionCache).find(key => key === cacheName);
  }

  deepCopy(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  updateCache(data: any, type: string): void {
    const awardId = this.getAwardId(type);
    if (!this.checkInCache(awardId)) {
      this.permissionCache[awardId] = this.deepCopy(data);
    }
  }

  updateCurrentMethod(method: string) {
    this.currentMethod = method;
  }

  /**
* @param  {} roleId
* returns the list persons which comes under the role id
*/
  filterPersonPerRole(roleId) {
    if (this.personRolesList.length) {
      return this.personRolesList.filter(person => (person.roleId === roleId));
    }
  }
}
