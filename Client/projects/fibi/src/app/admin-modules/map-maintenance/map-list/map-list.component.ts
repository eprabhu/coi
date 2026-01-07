/** last updated by Archana R on 04-12-2019 **/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from '../common/map.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import {concatUnitNumberAndUnitName} from "../../../common/utilities/custom-utilities"
import { AuditLogService } from '../../../common/services/audit-log.service';
@Component({
  selector: 'app-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.css'],
  providers: [AuditLogService,
  { provide: 'moduleName', useValue: 'MAP_MAINTENANCE' }]
})
export class MapListComponent implements OnInit, OnDestroy {

  result: any;
  mapList = [];
  mapData = [];
  resultReturns: any = {
  };
  stopGroupList: any[];
  stopGroupListKeys: any[];
  mapDetails: any = {
    mapDetailList: []
  };
  isDesc: any;
  column = 'UPDATE_TIMESTAMP';
  direction = -1;
  mapId: null;
  isActive: '';
  updateTimestamp: '';
  updateUser: '';
  mapName: '';
  unitName: '';
  unitNumber: '';
  helpInfo = false;
  searchText: '';
  tempStop = null;
  stopName: any = [];
  $subscriptions: Subscription[] = [];
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private router: Router, private mapService: MapService, private _auditLogService: AuditLogService) { }

  ngOnInit() {
    this.getMapList();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  getMapList() {
    this.$subscriptions.push(this.mapService.getDashboardMapList().subscribe(
      data => {
        this.result = data;
        this.mapList = this.result.mapMaintenance.map;
      }));
  }

  createMap() {
    this.router.navigate(['fibi/mapMaintainance/create']);
  }
  /**
   * @param  {} mapId
   * @param  {} unitName
   * fetches the map details and check for the duplication of stop name in same stop.
   * set single stop nmae in the map and deletes when duplication occurs.
   * If stop nmae is empty assigns stop name to index value.
   */
  viewMap(mapId, unitName, mapname, unitNumber) {
    this.unitName = unitName;
    this.unitNumber = unitNumber;
    this.mapName = mapname;
    this.mapId = mapId;
    this.mapData = [];
    this.$subscriptions.push(this.mapService.getMapDetailsById(mapId).subscribe(
      data => {
        this.resultReturns = data;
        this.resultReturns.mapDetails.mapDetailList.sort(function (firstMap, secondMap) {
          return firstMap.APPROVAL_STOP_NUMBER - secondMap.APPROVAL_STOP_NUMBER;
        });
        this.stopGroupList = this.groupBy(this.resultReturns.mapDetails.mapDetailList, 'APPROVAL_STOP_NUMBER');
        const map = new Map();
        let index = 0;
        const KEYS = Object.keys(this.stopGroupList);
        while (index < KEYS.length) {
          for (const stop of this.stopGroupList[KEYS[index]]) {
            stop.STOP_NAME = stop.STOP_NAME ? ' Stop: ' + stop.STOP_NAME : ' Stop: ' + (index + 1);
            if (map.has(stop.APPROVAL_STOP_NUMBER)) {
              delete stop.STOP_NAME;
            } else {
              map.set(stop.APPROVAL_STOP_NUMBER, true);
            }
          }
          index++;
        }
        this.stopGroupListKeys = Object.keys(this.stopGroupList);
      }));
  }

  sortBy(property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  deleteMap(mapId) {
    this.mapId = mapId;
  }

  editMap(mapId) {
    this.router.navigate(['create'], { queryParams: { mapId: mapId } });
  }

  delete(mapids) {
    let deleteMap = this.mapList.find(ele => ele.MAP_ID === mapids);
    let before = {'DESCRIPTION': deleteMap.DESCRIPTION, 'MAP_NAME': deleteMap.MAP_NAME};
    this.$subscriptions.push(this.mapService.deleteMap(mapids).subscribe(
      data => {
        this.result = data;
        if (this.result.countOfMapUsed > 0) {
          document.getElementById('deleteErrorButton').click();
        } else {
          this.mapList = this.result.mapMaintenance.map;
          this._auditLogService.saveAuditLog('D', before, {}, null, Object.keys(before), mapids);
        }
      }));
  }

  groupBy(jsonData, key) {
    return jsonData.reduce(function (objResult, item) {
      (objResult[item[key]] = objResult[item[key]] || []).push(item);
      return objResult;
    }, {});
  }
}
