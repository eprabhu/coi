import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { InstituteProposal } from '../institute-proposal-interfaces';

@Injectable()
export class DataStoreService {

  currentStartDate: any;
  currentEndDate: any;

  constructor() { }

  private InstituteProposalData = new InstituteProposal();

  dataEvent = new Subject();

  getData(keys: Array<string>): any {
    const data = {};
    keys.forEach(key => {
      data[key] = this.InstituteProposalData[key];
    });
    return JSON.parse(JSON.stringify(data));
  }

  updateStoreData(updatedData) {
    const KEYS = Object.keys(updatedData);
    KEYS.forEach(key => {
      if (typeof (updatedData[key]) === 'object') {
        this.InstituteProposalData[key] = JSON.parse(JSON.stringify(updatedData[key]));
      } else {
        this.InstituteProposalData[key] = updatedData[key];
      }
    });
    this.dataEvent.next(KEYS);
  }

  setInstituteProposal(data: InstituteProposal) {
    this.InstituteProposalData = data;
  }

}
