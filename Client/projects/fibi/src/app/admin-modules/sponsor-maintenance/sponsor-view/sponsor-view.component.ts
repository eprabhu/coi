import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { SponsorMaintenanceService } from '../sponsor-maintenance.service';
import {concatUnitNumberAndUnitName} from "../../../common/utilities/custom-utilities"

@Component({
  selector: 'app-sponsor-view',
  templateUrl: './sponsor-view.component.html',
  styleUrls: ['./sponsor-view.component.css']
})
export class SponsorViewComponent implements OnInit, OnDestroy {

  sponsorDetails: any = {};
  sponsorId: any = null;
  $subscriptions: Subscription[] = [];
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private _activatedRoute: ActivatedRoute, private router: Router, private _sponsorService: SponsorMaintenanceService) { }

  ngOnInit() {
    this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
      this.sponsorId = params['sponsorId'];
    }));
    this.getSponsorById(this.sponsorId);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getSponsorById(sponsorId) {
    this.$subscriptions.push(this._sponsorService.getSponsorData(sponsorId).subscribe((data: any) => {
      if (data) {
        this.sponsorDetails = data;
      }
    }));
  }
 
  loadSponsor() {
    return this.router.navigate(['fibi/sponsor-maintenance/sponsor-list']);
  }

  /**
 * @param  {} contactTypeCode
 * Function for find and return the description of designation based on contactTypeCode
 */
   getDesignationDescription(sponsorTypeCode) {
    let typeDescription: any = {};
    if (this.sponsorDetails.sponsorTypes && sponsorTypeCode) {
      typeDescription = this.sponsorDetails.sponsorTypes.find(code =>
        code.code === (sponsorTypeCode));
      return typeDescription.description;
    }
  }
}
