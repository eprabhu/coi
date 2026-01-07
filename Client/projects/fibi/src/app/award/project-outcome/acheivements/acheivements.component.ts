import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ProjectOutcomeService } from '../project-outcome.service';
import { CommonService } from '../../../common/services/common.service';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonDataService } from '../../services/common-data.service';

@Component({
  selector: 'app-acheivements',
  templateUrl: './acheivements.component.html',
  styleUrls: ['./acheivements.component.css']
})
export class AcheivementsComponent implements OnInit, OnDestroy {

  uploadedFile: any = [];
  awardAcheivement: any = {};
  awardAcheivementList: any = [];
  commentWarningMsg: string;
  awardAcheivementAttachId;
  deleteIndex: number;
  editIndex: number;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(public _outcomeService: ProjectOutcomeService,
     private _commonService: CommonService,
    private _wafAttachmentService: WafAttachmentService,
    private _commonData: CommonDataService) { }

  ngOnInit() {
    this.awardAcheivementList = this._outcomeService.outcomesData.awardAcheivements;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * @param  {} filelist
   * add new attactment to a specific activity
   * files.length > 0 is checked for solving issue of adding cv in IE, This function is called twice in IE.
   * The second call returns an empty file array, which caused the issue
   */
  addAttachments(filelist) {
    if (filelist.length > 0) {
      this.uploadedFile = [];
      this.uploadedFile.push(filelist[0]);
      this.awardAcheivement.fileName = this.uploadedFile.length > 0 ? this.uploadedFile[0].name : null;
      this._commonData.isAwardDataChange = true;
    }
  }

  setAcheivementObject() {
    this.awardAcheivement.awardId = this._outcomeService.awardData.awardId;
    this.awardAcheivement.awardNumber = this._outcomeService.awardData.awardNumber;
    this.awardAcheivement.sequenceNumber = this._outcomeService.awardData.sequenceNumber;
    this.awardAcheivement.updateUser = this._commonService.getCurrentUserDetail('userName');
  }
  /**
   * Add Acheivement if comment is added and
   * push the returned object to the acheivement list
   */
  addAcheivement() {
    if (this.awardAcheivement.comment && !this.isSaving) {
      this.isSaving = true;
      this.setAcheivementObject();
      if (!this._commonService.isWafEnabled) {
        this.$subscriptions.push(this._outcomeService.addAwardAcheivement(this.awardAcheivement, this.uploadedFile)
          .subscribe((data: any) => {
            this.addAchievementActions(data);
            this._commonData.isAwardDataChange = false;
            this.isSaving = false;
          }, error => {
            this.showErrorToast();
            this.isSaving = false;
          },
          ));
      } else {
        this.addAcheivementWaf();
      }
    } else {
      this.commentWarningMsg = '*please add an achievement.';
    }
  }
  /** if file is uploaded, sets parameters and calls saveAttachment function in _wafAttachmentService
   * Otherwise calls saveWafRequest function in _wafAttachmentService
   */
  async addAcheivementWaf() {
    const requestObject: any = {
      awardAcheivement: this.awardAcheivement,
      personId: this._commonService.getCurrentUserDetail('personID')
    };
    if (this.uploadedFile.length > 0) {
      const data = await this._wafAttachmentService.saveAttachment(requestObject, null, this.uploadedFile,
        '/addAwardAcheivementsForWaf', null, null);
      this.checkAchievementAdded(data);
    } else {
      this._wafAttachmentService.saveWafRequest(requestObject, '/addAwardAcheivementsForWaf').then(data => {
        this.checkAchievementAdded(data);
        this._commonData.isAwardDataChange = false;
        this.isSaving = false;
      }).catch(error => {
        this.checkAchievementAdded(error);
        this.isSaving = false;
      });
    }
  }
  /**
  * @param  {} data
  * if data doesn't contain error, achievement is added, otherwise shows error toast
  */
  checkAchievementAdded(data) {
    if (data && !data.error) {
      this.addAchievementActions(data);
    } else {
      this.showErrorToast();
    }
  }
  /**
   * @param  {} data
   * actions to perform in common for both waf enabled and disabled services after getting response data
   */
  addAchievementActions(data) {
    if (!this.awardAcheivement.awardAcheivementAttachId) {
      this.awardAcheivementList.push(data.awardAcheivement);
    } else {
      this.awardAcheivementList[this.editIndex] = Object.assign({}, data.awardAcheivement);
    }
    this.showSuccessToast();
    this.clearAchievementFields();
  }

  /* shows message in toast according to whether the achievement is added or updated */
  showSuccessToast() {
    const toastMsg = this.awardAcheivement.awardAcheivementAttachId ? 'Achievement updated successfully.' :
      'Achievement added successfully.';
    this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
  }
  /**shows error toast based on whether the achievement is added or updated and waf enabled or not */
  showErrorToast() {
    let toastMsg;
    if (this.awardAcheivement.awardAcheivementAttachId) {
      toastMsg = this._commonService.isWafEnabled ? 'Waf blocked request for updating the achievement.' :
        'Updating Achievement failed. Please try again.';
    } else {
      toastMsg = this._commonService.isWafEnabled ? 'Waf blocked request for adding the achievement.' :
        'Adding Achievement failed. Please try again.';
    }
    this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
  }

  /**
   * @param  {} acheivement
   * Download acheivement attachment w.r.t awardAcheivementAttachId
   */
  downloadAcheivement(acheivement) {
    this.$subscriptions.push(this._outcomeService.downloadAttachment(acheivement.awardAcheivementAttachId).subscribe((data: any) => {
      const a = document.createElement('a');
      const blob = new Blob([data], { type: data.type });
      a.href = URL.createObjectURL(blob);
      a.download = acheivement.fileName;
      a.id = 'attachment';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }));
  }

  /**
  * @param  {} acheivement
  * @param  {} index
  * Delete acheivement attachment w.r.t awardAcheivementAttachId
  */

  deleteAcheivement(index, awardAcheivementAttachId) {
    this.awardAcheivementList.splice(index, 1);
    this.$subscriptions.push(this._outcomeService.deleteAwardAcheivement({
      'awardAcheivementId': awardAcheivementAttachId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe(data => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Achievement deleted successfully.');
    },err=>{
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Achievement failed. Please try again.');
    }));
  }

  /**
   * @param  {} index
   *   edits achievement details
   */
  editAchievement(index) {
    this.editIndex = index;
    this.awardAcheivement = JSON.parse(JSON.stringify(this.awardAcheivementList[index]));
    this.commentWarningMsg = null;
    this._commonData.isAwardDataChange = true;
  }

  /* clears achievement fields */
  clearAchievementFields() {
    this.uploadedFile = [];
    this.awardAcheivement = {};
    this.commentWarningMsg = null;
    this.editIndex = null;
    this._commonData.isAwardDataChange = false;
  }

}
