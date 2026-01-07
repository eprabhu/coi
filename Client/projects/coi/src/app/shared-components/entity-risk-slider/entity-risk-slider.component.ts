import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { EntityDetailsService } from '../../disclosure/entity-details/entity-details.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { closeSlider, openCoiSlider, openCommonModal, openSlider } from '../../common/utilities/custom-utilities';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
@Component({
    selector: 'app-entity-risk-slider',
    templateUrl: './entity-risk-slider.component.html',
    styleUrls: ['./entity-risk-slider.component.scss'],
})
export class EntityRiskSliderComponent implements OnInit {
    @Input() isVisible = false;
    @Input() isOpenSlider = true;
    @Input() entityDetails:any;
    @Input() Risk: any;
    @Output() closePage: EventEmitter<any> = new EventEmitter;
    @Input() entitySliderSectionConfig : any = {};
    riskLevelLookup = [];
    $subscriptions: Subscription[] = [];
    riskLevelChanges = [];
    coiConflictStatusType = [];
    isReadMore: boolean[] = [];
    riskValidationMap = new Map();
    entityRiskRO: any;
    isStatusEdited = false;
    riskHistoryLogs: any = {};
    currentRiskCategorycode: any;
    currentRiskType: any;
    revisionComment: any;
    helpText = [
        'Modify the Risk of this Entity from the Risk field.',
        'Provide an adequate reason for your decision in the description field provided.'
    ];
    riskCategoryCode: string;
    isEmptyObject = isEmptyObject;
    isConcurrency = false;

    constructor(public entityDetailsService: EntityDetailsService,
        private _commonService: CommonService,
        public dataFormatPipe: DateFormatPipeWithTimeZone, private _informationAndHelpTextService: InformationAndHelpTextService) { }


    ngOnInit() {
        this.getEntitySliderSectionConfig();
        this.getSFILookup();
        this.riskHistory();
        setTimeout(() => {
            openCoiSlider('risk-conflict-slider');
        });
    }

    closeConflictSlider() {
        setTimeout(() => {
            this.closePage.emit();
        }, 500);
    }

    leavePageClicked() {
        setTimeout(() => {
            this.closeConflictSlider();
        }, 100);
    }

    sortNull() { return 0; }


    private getSFILookup(): void {
        this.$subscriptions.push(this.entityDetailsService.loadSFILookups().subscribe((res: any) => {
            this.riskLevelLookup = res.entityRiskCategories;
            this.currentRiskCategorycode = null;
        }));
    }


    clearConflictModal() {
        this.riskValidationMap.clear();
        this.entityRiskRO = {};
        this.revisionComment = '';
        this.isStatusEdited = false;
        this.currentRiskType  = this.entityDetails.entityRiskCategory.description;
        this.currentRiskCategorycode = null;
    }

    private getEntityRiskRO() {
        this.entityRiskRO.entityId = this.entityDetails?.entityId;
        this.entityRiskRO.entityNumber = this.entityDetails?.entityNumber;
        this.entityRiskRO.riskCategoryCode = this.currentRiskCategorycode;
        this.entityRiskRO.revisionReason = this.revisionComment;
        return this.entityRiskRO;
    }

    checkForModification() {
        this.$subscriptions.push(this.entityDetailsService.riskAlreadyModified({
            'riskCategoryCode': this.entityDetails.riskCategoryCode,
            'entityId': this.entityDetails.entityId
        }).subscribe((data: any) => {
            this.updateProjectRelationship();
        }, err => {
            if (err.status === 405) {
                this.isConcurrency = true;
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, please try again.');
            }
        }))
    }

    updateProjectRelationship() {
        if (this.checkForMandatory()) {
            this.$subscriptions.push(
                this.entityDetailsService.entityRisk(this.getEntityRiskRO())
                    .subscribe((data: any) => {
                        this.coiConflictStatusType = data;
                        this.entityDetails.revisionReason = this.revisionComment;
                        this.entityDetails.riskCategoryCode = this.currentRiskCategorycode;
                        this.entityDetails.entityRiskCategory.description = this.currentRiskType;
                        this.entityDetails.entityRiskCategory.riskCategoryCode = this.currentRiskCategorycode;
                        this.clearConflictModal();
                        this.riskHistory();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Conflict modified successfully.');
                    }, _err => {
                        if (_err.status === 405) {
                          this.isConcurrency = true;
                        } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in modifying conflict status. Please try again.');
                        }
                    }));
        }
        this.checkForMandatory();
    }

    riskHistory() {
        this.$subscriptions.push(this.entityDetailsService.riskHistory(this.entityDetails.entityId).subscribe((data: any) => {
            this.updateHistoryLogs(data);
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching conflict status history. Please try again.');
        }));

    }
    updateHistoryLogs(data: any) {
        if (data.length) {
            this.riskHistoryLogs = {};
            data.forEach((historyObj) => {
                const date = this.dataFormatPipe.transform(historyObj.updateTimestamp);
                this.riskHistoryLogs[date] = this.riskHistoryLogs[date] ? this.riskHistoryLogs[date] : [];
                this.riskHistoryLogs[date].push(historyObj);
            });
        }
    }

    removeValidationMap(TYPE): void {
        TYPE === 'COMMENT' ? this.riskValidationMap.delete('comment') :  this.riskValidationMap.delete('riskLevelCode');
        this.isStatusEdited = true;
    }

    setCoiProjConflictStatusType(): void {
        this.currentRiskType = this.riskLevelLookup.find
        (details => details.riskCategoryCode === this.currentRiskCategorycode)?.description || null;
    }

    public checkForMandatory(): boolean {
        this.riskValidationMap.clear();
        if (!this.currentRiskCategorycode || this.currentRiskCategorycode === 'null') {
            this.riskValidationMap.set('riskLevelCode', 'Please select a risk level');
        }
        if (!this.revisionComment) {
            this.riskValidationMap.set('comment', 'Please add a reason.');
        }
        if (this.currentRiskCategorycode  === this.entityDetails.riskCategoryCode) {
            this.riskValidationMap.set('duplicateRisk', 'You are trying to update the risk with the current risk level of the disclosure.');
            this.riskValidationMap.delete('riskLevelCode');
        }
        return this.riskValidationMap.size === 0 ? true : false;
    }

    isFieldValueChanges(): boolean {
        return !!((this.isStatusEdited || this.revisionComment));
    }

    getEntitySliderSectionConfig(){
        this._informationAndHelpTextService.moduleConfiguration = this._commonService.getSectionCodeAsKeys(this.entitySliderSectionConfig);
    }
}

