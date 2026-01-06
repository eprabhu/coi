import { Component, OnInit } from '@angular/core';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { DataStoreService } from '../services/data-store.service';
import { Subscription } from 'rxjs';
import { CoiService } from '../services/coi.service';
import { DataStoreEvent, EngagementSortType } from '../../common/services/coi-common.interface';

@Component({
  selector: 'app-sfi-list',
  templateUrl: './sfi-list.component.html',
  styleUrls: ['./sfi-list.component.scss']
})
export class SfiListComponent implements OnInit {
  coiData: any;
  $subscriptions: Subscription[] = [];
  sortType: EngagementSortType = 'COMPLETE_TO_INACTIVE';

  constructor(public dataStore: DataStoreService, public coiService: CoiService) { }

  ngOnInit() {
    this.listenDataChangeFromStore();
    this.getDataFromStore();
    window.scrollTo(0, 0);
  }

  private listenDataChangeFromStore() {
    this.$subscriptions.push(
        this.dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
            this.getDataFromStore();
        })
    );
  }

  private getDataFromStore(): void {
    const COI_DATA = this.dataStore.getData();
    if (isEmptyObject(COI_DATA)) { return; }
    this.coiData = COI_DATA;
  }

  ngOnDestroy() {
    this.coiService.focusSFIId = null;
  }

}
