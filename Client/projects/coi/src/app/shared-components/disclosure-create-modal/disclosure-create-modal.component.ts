import {Component, EventEmitter, HostListener, Input, OnInit, Output, } from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {
    getEndPointOptionsForDepartment,
    getEndPointOptionsForLeadUnit,
    getEndPointOptionsForSponsor
} from '../../../../../fibi/src/app/common/services/end-point.config';
import {
    COI_DISPOSITION_STATUS_BADGE,
    COI_REVIEW_STATUS_BADGE,
    CREATE_DISCLOSURE_ROUTE_URL,
    CREATE_TRAVEL_DISCLOSURE_ROUTE_URL,
    DISCLOSURE_CONFLICT_STATUS_BADGE,
    DISCLOSURE_TYPE,
    HTTP_ERROR_STATUS,
    HTTP_SUCCESS_STATUS
} from '../../app-constants';
import {CommonService} from '../../common/services/common.service';
import {DisclosureCreateModalService} from './disclosure-create-modal.service';
import { Disclosure, FCOIDisclosureCreateRO, FcoiReviseRO } from '../shared-interface';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { checkForVowelInFirstLetter,  deepCloneObject, hideModal } from '../../common/utilities/custom-utilities';
import { CoiProjectType, COIValidationModalConfig } from '../../common/services/coi-common.interface';
import { getEndPointOptionsForCoiAwardNumber, getEndPointOptionsForProposalDisclosure } from '../../common/services/end-point.config';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HeaderService } from '../../common/header/header.service';
import { COMMON_DISCL_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-disclosure-create-modal',
    templateUrl: './disclosure-create-modal.component.html',
    styleUrls: ['./disclosure-create-modal.component.scss'],
    providers: [DisclosureCreateModalService]
})

export class DisclosureCreateModalComponent implements OnInit {

    @Input() activeDisclosures;
    @Input() triggeredFrom: any;
    @Output() emitCreateOrRevise: EventEmitter<any> = new EventEmitter<any>();

    clearField = false;
    unitSearchOptions: any = {};
    isHideEndpointSearch = true;
    reviseObject = new FcoiReviseRO();
    isShowResultCard = false;
    clearProjectField: String;
    clearSponsorField: String;
    clearPrimeSponsorField: String;
    clearPIField: String;
    clearLUField: String;
    manualProjectAddDetails: any = {};
    projectDisclosureValidation = new Map();
    projectSearchOptions: any;
    isSearchExternalProject = false;
    $subscriptions: Subscription[] = [];
    piElasticSearchOptions: any = {};
    unitHttpOptions: any = {};
    primeSponsorSearchOptions: any = {};
    sponsorSearchOptions: any = {};
    projectTypes: CoiProjectType[] = [];
    selectedProjectType = null;
    existingDisclosureDetails: Disclosure = new Disclosure();
    isShowExistingDisclosure = false;
    mandatoryList = new Map();
    disclosureNumber: any;
    hasFCOI: any;
    canReviseFCOI: any;
    homeUnitName: null;
    title = '';
    isShowConcurrencyWarning = false;
    searchHelpText = '';
    unitHelpText = `To disclose at any other unit, please click on the 'Edit' icon near the unit field, and proceed to disclosure creation.
                    To revert to the original unit, click on the 'Reset' button.`
    travelDescHelpText = 'Please provide the purpose of the trip.';
    projectTypeHelpText = 'Please select a project type to proceed with disclosure creation.';
    projectTitle: string = '';
    canEditDisclosureUnit = false;
    errorMessage = '';
    isShowErrorMessage = false;
    isFcoiRequiredForProjects = false;
    isProjectsBtnDisabled = false;
    isValidationLoading = false;
    isNotEligibleToCreateDisclosure = false;
    projectDisclCreationValidationMsg = COMMON_DISCL_LOCALIZE.PROJECT_DISCL_CREATION_VALIDATION_MSG;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;
    disclosureConflictBadge = DISCLOSURE_CONFLICT_STATUS_BADGE;
    dispositionStatusBadge = COI_DISPOSITION_STATUS_BADGE;
    reviewStatusBadge = COI_REVIEW_STATUS_BADGE;
    constructor(public commonService: CommonService, private _disclosureCreateModalService: DisclosureCreateModalService,
                private _router: Router, private _elasticConfig: ElasticConfigService, private _headerService: HeaderService) {
    }

    ngOnInit() {
        this.canEditDisclosureUnit = this.commonService?.canEditDisclosureUnit;
        this.setSearchOptions();
        if (this.triggeredFrom === 'FCOI_DISCLOSURE') {
            this.checkForFCOIActive();
            this.openDisclosureCreateModal();
            this.checkEligibleForDisclCreation();
        } else if (this.triggeredFrom == 'TRAVEL_DISCLOSURE') {
            this.openDisclosureCreateModal();
        } else {
            this.projectTypes = this.commonService.coiProjectTypes;
            this.openDisclosureCreateModal();
            this.checkIfFcoiRequired();
            this.checkFcoiDisclosureExist();
        }
    }

    private async checkIfFcoiRequired(): Promise<void> {
        const PROJECT_DISCLOSURE_NEEDED_LIST = this.projectTypes.filter(project => project?.projectDisclosureNeeded);
        this.isFcoiRequiredForProjects = PROJECT_DISCLOSURE_NEEDED_LIST.every(project => project?.fcoiNeeded);
        if (this.isFcoiRequiredForProjects) {
            await this.checkForFinancialEngagementCreated();
            this.isProjectsBtnDisabled = this.isShowErrorMessage;
        }
    }

    private openDisclosureCreateModal(): void {
        document.getElementById('open-create-or-revise-modal')?.click();
    }

    private checkForFinancialEngagementCreated(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.$subscriptions.push(
                this._disclosureCreateModalService.checkFinancialEngagementCreated().subscribe((data: any) => {
                    this.isValidationLoading = false;
                    resolve();
                },
                    (error) => {
                        if (error?.status === 406) {
                            this.errorMessage = error.error ? error.error : `Error in creating project disclosure, please try again.`;
                            this.isShowErrorMessage = !!this.errorMessage?.trim();
                        }
                        this.isValidationLoading = false;
                        resolve();
                    }
                ));
        })
    }

    private checkFcoiDisclosureExist(): void {
        if(!this._headerService.activeDisclosures.length) {
            this.isShowErrorMessage = true;
            this.errorMessage = this.projectDisclCreationValidationMsg;
        }
    }

    private checkEligibleForDisclCreation(): void {
        this.$subscriptions.push(this._disclosureCreateModalService.checkEligibleForDisclCreation().subscribe((data: string) => {
            // The success response is not used here, as the primary check is based on the error response.
            // If the user has no active projects, the API returns a 405 error, which is handled to prevent disclosure creation.
            // If the user has active projects, the API succeeds, allowing FCOI disclosure creation.
        },
            (err) => {
                if (err?.status === 405) {
                    this.isShowErrorMessage = true;
                    this.errorMessage = err?.error;
                    this.isNotEligibleToCreateDisclosure = true;
                }
            }
        ));
    }

    clearModal(): void {
        setTimeout(() => {
            this.mandatoryList.clear();
            this.clearProjectDisclosure();
            this.reviseObject = new FcoiReviseRO();
            this.emitCreateOrRevise.emit({ closeModal: false });
            this.clearProjectField = new String('true');
        }, 200);
    }

    resetHomeUnit(): void {
        this.isHideEndpointSearch = true;
        this.reviseObject.homeUnit = this.commonService.currentUserDetails.unitNumber;
        this.unitSearchOptions.defaultValue = this.commonService.currentUserDetails.unitNumber + ' - ' + this.commonService.currentUserDetails.unitName;
        this.mandatoryList.delete('homeUnit');
    }

    selectedUnitEvent(event): void {
        if (event) {
            this.reviseObject.homeUnit = event.unitNumber;
            this.homeUnitName = event.unitName;
            this.mandatoryList.delete('homeUnit');
        } else {
            this.reviseObject.homeUnit = null;
            this.homeUnitName = null;
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    validateSelectedProject(event: any): void {
        if (event) {
            this.projectDisclosureValidation.clear();
            this.mandatoryList.clear();
            const selectedModuleCode = this.selectedProjectType === 'Award' ? '1' : '3';
            // const moduleItemId = event ? this.selectedProjectType === 'Award' ? event.awardId : event.moduleItemId : null;
            const moduleItemKey = event ? this.selectedProjectType === 'Award' ? event.moduleItemKey : event.moduleItemKey : null;
            const projectTitle = event ? `${event.moduleItemKey} ${event.title}` : '';
            this._disclosureCreateModalService.checkIfDisclosureAvailable(selectedModuleCode, moduleItemKey).subscribe((data: any) => {
                if (data) {
                    if (data.projectDisclosure != null) {
                        this.isShowExistingDisclosure = true;
                        this.setExistingDisclosureDetails('Project', data.projectDisclosure, projectTitle);
                    } else if (data.fcoiProject != null) {
                        this.isShowExistingDisclosure = true;
                        this.setExistingDisclosureDetails(this.hasFCOI ? 'Revision' : 'Initial', data.fcoiProject, projectTitle);
                    } else {
                        this.assignSelectedProject(event);
                    }
                } else {
                    this.assignSelectedProject(event);
                }
            }, err => {
                this.commonService.showToast(HTTP_ERROR_STATUS, (err.error && err.error.errorMessage) ?
                    err.error.errorMessage : 'Error in selecting ' + this.selectedProjectType + '. Please try again.');
                    this.clearProjectDisclosure();
                    this.clearProjectField = new String('true');
                    this.selectedProjectType = null;
            });
        } else {
            this.clearProjectDisclosure();
        }
    }

    createOrReviseDisclosure(): void {
        !this.hasFCOI ? this.createFCOIDisclosure() : this.reviseDisclosure();
    }

    clearProjectDisclosure(): void {
        // this.clearProjectField = new String('true');
        this.clearSponsorField = new String('true');
        this.clearPrimeSponsorField = new String('true');
        this.clearPIField = new String('true');
        this.clearLUField = new String('true');
        this.manualProjectAddDetails = {};
        this.manualProjectAddDetails.moduleItemId = null;
        this.manualProjectAddDetails.title = null;
        this.projectDisclosureValidation.clear();
        this.isShowResultCard = false;
        this.existingDisclosureDetails = null;
        this.isShowExistingDisclosure = false;
    }

    createProjectDisclosureAPI(): void {
        if (this.validateProject()) {
            this.$subscriptions.push(this._disclosureCreateModalService.createInitialDisclosure(this.getCreateProjectRequestObject()).subscribe((data: any) => {
                if (data) {
                    hideModal('reviseOrCreateDisclosureModal');
                    this._headerService.triggerProjectsTabCount();
                    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], {queryParams: {disclosureId: data.disclosureId}});
                    });
                    this.clearModal();
                }
            }, err => {
                if (err.status === 405) {
                    this.isShowConcurrencyWarning = true;
                    this.setExistingDisclosureDetails('Project', err.error);
                } else if (err?.status === 406) {
                    hideModal('reviseOrCreateDisclosureModal');
                    this.clearModal();
                    const ERROR_MSG = err.error ? err.error : `Error in creating project disclosure, please try again.`;
                    const CONFIG = new COIValidationModalConfig();
                    CONFIG.errorList = [ERROR_MSG];
                    this.commonService.openCOIValidationModal(CONFIG);
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, (err.error && err.error.errorMessage) ?
                        err.error.errorMessage : 'Error in creating project disclosure, please try again.');
                }
            }));
        }
    }

    private validateTravelDisclosure(): boolean {
        if (!this.reviseObject.homeUnit) {
            this.mandatoryList.set('homeUnit', 'Please enter a valid unit to create a travel disclosure.');
        }
        return this.mandatoryList.size === 0 ? true : false;
    }

    private getCreateTravelRequestObject(): void {
        sessionStorage.setItem('travelCreateModalDetails', JSON.stringify(
            {
                homeUnit: this.reviseObject.homeUnit ? this.reviseObject.homeUnit : null,
                description: this.reviseObject.revisionComment,
                personId: this.commonService.getCurrentUserDetail('personID'),
                homeUnitName: this.homeUnitName
            }
        ));
    }

    navigateToTravelDisclosure(): void {
        if (this.validateTravelDisclosure()) {
            hideModal('reviseOrCreateDisclosureModal');
            if (this._router.url.includes('create-travel-disclosure')) {
                this.commonService.$globalEventNotifier.next(
                    {
                        uniqueId: 'CREATE_NEW_TRAVEL_DISCLOSURE',
                        content: {
                            homeUnit: this.reviseObject.homeUnit ? this.reviseObject.homeUnit : null,
                            description: this.reviseObject.revisionComment,
                            personId: this.commonService.getCurrentUserDetail('personID'),
                            homeUnitName: this.homeUnitName
                        }
                    });
            } else {
                this.getCreateTravelRequestObject();
                this._router.navigate([CREATE_TRAVEL_DISCLOSURE_ROUTE_URL], { queryParams: { disclosureId: null } });
            }
            this.clearModal();
        }
    }

    getCreateProjectRequestObject(): FCOIDisclosureCreateRO | any {
        if (this.isSearchExternalProject) {
            return {
                coiDisclosure: {
                    homeUnit: this.reviseObject.homeUnit,
                    revisionComment: this.reviseObject.revisionComment,
                    coiProjectTypeCode: this.getCoiProjectTypeFromCode(),
                    moduleItemKey: this.manualProjectAddDetails.moduleItemKey,
                    moduleCode: this.manualProjectAddDetails.moduleCode,
                    personId: this.commonService.getCurrentUserDetail('personID'),
                },
                [this.selectedProjectType == 'Award' ? 'coiProjectAward' : 'coiProjectProposal']: {
                    coiProjectTypeCode: this.getCoiProjectTypeFromCode(), ...this.getCreateDisclosureRO()
                }
            };
        } else {
            return {
                fcoiTypeCode: DISCLOSURE_TYPE.PROJECT,
                homeUnit: this.reviseObject.homeUnit,
                coiProjectTypeCode: this.getCoiProjectTypeFromCode(),
                revisionComment: this.reviseObject.revisionComment,
                moduleItemKey: this.manualProjectAddDetails.moduleItemKey,
                moduleCode: this.manualProjectAddDetails.moduleCode,
                personId: this.commonService.getCurrentUserDetail('personID')
            };
        }
    }

    createFCOIDisclosure(): void {
        const FCOI_DISCLOSURE_RO: FCOIDisclosureCreateRO = {
            fcoiTypeCode: DISCLOSURE_TYPE.INITIAL,
            homeUnit: this.reviseObject.homeUnit,
            revisionComment: this.reviseObject.revisionComment,
            personId: this.commonService.getCurrentUserDetail('personID')
        };
        if (this.validateFCOIForm()) {
            this._disclosureCreateModalService.createInitialDisclosure(FCOI_DISCLOSURE_RO).subscribe((data: any) => {
                hideModal('reviseOrCreateDisclosureModal');
                this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], {queryParams: {disclosureId: data.disclosureId}});
                this.clearModal();
            }, err => {
                if (err.status === 405) {
                    hideModal('reviseOrCreateDisclosureModal');
                    this.clearModal();
                    this.commonService.concurrentUpdateAction = COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL;
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, `Error in creating ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}, please try again.`);
                }
            });
        }
    }

     changeProjectType(type: CoiProjectType): void {
        this.isShowErrorMessage = false;
        if (type?.fcoiNeeded) {
            this.isValidationLoading = true;
            this.checkForFinancialEngagementCreated();
        }
        this.clearProjectDisclosure();
        this.clearProjectField = new String('true');
        switch (this.selectedProjectType) {
            case 'Award': {
                this.searchHelpText = '';
                setTimeout(() => {
                    this.searchHelpText = 'Please search and link an award.';
                });
                return this.projectSearchOptions = getEndPointOptionsForCoiAwardNumber(this.commonService.baseUrl);
            }
            case 'Development Proposal': {
                this.searchHelpText = '';
                setTimeout(() => {
                    this.searchHelpText = 'Please search and link a development proposal.';
                });
                return this.projectSearchOptions = getEndPointOptionsForProposalDisclosure(this.commonService.baseUrl);
            }
            default:
                this.selectedProjectType = null;
                break;
        }
    }

    switchExternalProject(isExternal: boolean): void {
        this.isSearchExternalProject = isExternal;
        this.resetManualProjectAddFields();
        this.clearProjectField = new String('true');
        this.isShowResultCard = false;
    }

    onPISelect(selectedValue: any): void {
        this.manualProjectAddDetails.piPersonId = selectedValue.prncpl_id;
        this.manualProjectAddDetails.piName = selectedValue.full_name;
    }

    onLeadUnitSelect(selectedValue: any): void {
        this.manualProjectAddDetails.leadUnitName = selectedValue.unitDetail;
    }

    onPrimeSponsorSelect(selectedValue: any): void {
        this.manualProjectAddDetails.primeSponsorName = selectedValue.sponsorName;
    }

    onSponsorSelect(selectedValue: any): void {
        this.manualProjectAddDetails.sponsorName = selectedValue.sponsorName;
    }

    getDisclosureConflictBadge(statusCode: string): string {
        switch (String(statusCode)) {
            case '1':
                return 'green-badge';
            case '2':
                return 'brown-badge';
            case '3':
                return 'red-badge';
            case '4':
                return 'green-badge';
        }
    }

    getDispositionStatusBadge(statusCode): string {
        switch (statusCode) {
            case '1':
                return 'yellow-badge';
            case '2':
            case '4':
            case '5':
                return 'blue-badge';
            case '3':
            case '6':
                return 'green-badge';
            default:
                return 'yellow-badge';
        }
    }

    navigateToDisclosure(disclosureId): void {
        hideModal('reviseOrCreateDisclosureModal');
        this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL], {
            queryParams: {
                disclosureId: disclosureId
            }
        });
    }

    private setSearchOptions(): void {
        this.unitSearchOptions = getEndPointOptionsForLeadUnit(this.commonService.currentUserDetails.unitNumber + '-' + this.commonService.currentUserDetails.unitName, this.commonService.fibiUrl, 'unitNumber - unitName');
        this.reviseObject.homeUnit = this.commonService.currentUserDetails.unitNumber;
        this.homeUnitName = this.commonService.currentUserDetails.unitName;
        this.piElasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.unitHttpOptions = getEndPointOptionsForDepartment();
        this.sponsorSearchOptions = getEndPointOptionsForSponsor();
        this.primeSponsorSearchOptions = getEndPointOptionsForSponsor();
    }

    private checkForFCOIActive(): void {
        //the revision condition is also applied in user disclosure component for showing revise btn in fcoi card.
        this.hasFCOI = this.activeDisclosures.find((disclosure: any) => [DISCLOSURE_TYPE.INITIAL, DISCLOSURE_TYPE.REVISION].includes(disclosure?.fcoiTypeCode) && disclosure?.versionStatus !== 'PENDING');
        this.canReviseFCOI = this.activeDisclosures.find(disclosure =>
            disclosure.fcoiTypeCode == DISCLOSURE_TYPE.INITIAL && disclosure.coiReviewStatusType.reviewStatusCode != '4'
        );
        this.disclosureNumber = this.hasFCOI ? this.hasFCOI.disclosureNumber : null;
    }

    private validateFCOIForm(): boolean {
        this.mandatoryList.clear();
        if (!this.reviseObject.revisionComment) {
            this.mandatoryList.set('reviseComment', `Please provide the reason ${this.hasFCOI ? 'for revising the disclosure.' : `to create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}.`}`);
        }
        if (!this.reviseObject.homeUnit) {
            this.mandatoryList.set('homeUnit', `Please select a valid unit ${this.hasFCOI ? 'for revising the disclosure.' : `to create the ${COMMON_DISCL_LOCALIZE.TERM_COI_INITIAL_DISCL}.`}`);
        }
        return this.mandatoryList.size !== 0 ? false : true;
    }

    private reviseDisclosure(): void {
        this.reviseObject.disclosureId = this.hasFCOI ? this.hasFCOI.disclosureId : null;
        if (this.validateFCOIForm()) {
            if (!this.canReviseFCOI) {
                this.$subscriptions.push(this._disclosureCreateModalService.reviseFcoiDisclosure(this.reviseObject)
                    .subscribe((data: any) => {
                        this.commonService.showToast(HTTP_SUCCESS_STATUS, 'New version of disclosure created.');
                        hideModal('reviseOrCreateDisclosureModal');
                        this._headerService.triggerProjectsTabCount();
                        this._router.navigate([CREATE_DISCLOSURE_ROUTE_URL],
                            { queryParams: { disclosureId: data.disclosureId }});
                        this.clearModal();
                    }, err => {
                        if (err.status === 405) {
                            hideModal('reviseOrCreateDisclosureModal');
                            this.clearModal();
                            this.commonService.concurrentUpdateAction = 'revision';
                            // this.isShowConcurrencyWarning = true;
                            // this.setExistingDisclosureDetails('Revision', err.error);
                        } else {
                            const ERROR_MSG = (err.error && err.error.errorMessage) ? err.error.errorMessage : 'Error in revising the disclosure, please try again.';
                            this.commonService.showToast(HTTP_ERROR_STATUS, ERROR_MSG);
                        }
                }));
            } else {
                this.isShowExistingDisclosure = true;
                this.setReviseDisclosure();
            }
        }
    }

    private setReviseDisclosure(): void {
        this.existingDisclosureDetails.disclosureType = 'Revision';
        this.existingDisclosureDetails.adminGroupId = this.canReviseFCOI.adminGroupId;
        this.existingDisclosureDetails.adminPersonId = this.canReviseFCOI.adminPersonId;
        this.existingDisclosureDetails.certifiedAt = this.canReviseFCOI.certifiedAt;
        this.existingDisclosureDetails.createTimestamp = this.canReviseFCOI.createTimestamp;
        this.existingDisclosureDetails.reviewStatus = this.canReviseFCOI.coiReviewStatusType ? this.canReviseFCOI.coiReviewStatusType.description : null;
        this.existingDisclosureDetails.reviewStatusCode = this.canReviseFCOI.coiReviewStatusType ? this.canReviseFCOI.coiReviewStatusType.reviewStatusCode : null;
        this.existingDisclosureDetails.createUserFullName = this.canReviseFCOI.createUserFullName;
        this.existingDisclosureDetails.disclosureId = this.canReviseFCOI.disclosureId;
        this.existingDisclosureDetails.disclosureNumber = this.canReviseFCOI.disclosureNumber;
        this.existingDisclosureDetails.dispositionStatus = this.canReviseFCOI.coiDispositionStatusType ? this.canReviseFCOI.coiDispositionStatusType.description : null;
        this.existingDisclosureDetails.dispositionStatusCode = this.canReviseFCOI.coiDispositionStatusType ? this.canReviseFCOI.coiDispositionStatusType.dispositionStatusCode : null;
        this.existingDisclosureDetails.conflictStatus = this.canReviseFCOI.coiConflictStatusType ? this.canReviseFCOI.coiConflictStatusType.description : null;
        this.existingDisclosureDetails.conflictStatusCode = this.canReviseFCOI.coiConflictStatusType ? this.canReviseFCOI.coiConflictStatusType.coiConflictStatusCode : null;
        this.existingDisclosureDetails.expirationDate = this.canReviseFCOI.expirationDate;
        this.existingDisclosureDetails.homeUnit = this.canReviseFCOI.homeUnit;
        this.existingDisclosureDetails.homeUnitName = this.canReviseFCOI.homeUnit ? this.canReviseFCOI.unit.unitName : null;
        this.existingDisclosureDetails.personId = this.canReviseFCOI.personId;
        this.existingDisclosureDetails.updateTimestamp = this.canReviseFCOI.updateTimestamp;
        this.existingDisclosureDetails.updateUserFullName = this.canReviseFCOI.updateUserFullName;
        this.existingDisclosureDetails.versionNumber = this.canReviseFCOI.versionNumber;
        this.existingDisclosureDetails.versionStatus = this.canReviseFCOI.versionStatus;
        this.existingDisclosureDetails.disclosurePersonFullName = this.canReviseFCOI.disclosurePersonFullName;
    }

    private setExistingDisclosureDetails(type: 'Project' | 'Initial' | 'Revision', data: any, projectTitle: string = ''): void {
        this.disclosureNumber = data.disclosureNumber;
        this.existingDisclosureDetails = deepCloneObject(data);
        this.existingDisclosureDetails['disclosureType'] = type;
        if (type == 'Project') {
            this.existingDisclosureDetails['type'] = this.selectedProjectType;
            this.projectTitle = projectTitle;
        }
        this.isShowResultCard = true;
    }

    private assignSelectedProject(event): void {
        if (event) {
            this.manualProjectAddDetails.moduleItemId = this.selectedProjectType == 'Award' ? event.moduleItemId : event.moduleItemId;
            this.manualProjectAddDetails.moduleItemKey = this.selectedProjectType == 'Award' ? event.moduleItemKey : event.moduleItemKey;
            this.manualProjectAddDetails.moduleCode = this.selectedProjectType == 'Award' ? event.moduleCode : event.moduleCode;
            this.manualProjectAddDetails.title = (this.selectedProjectType == 'Award' ? event.moduleItemKey : event.moduleItemId)  + ' - ' + event.title ;
            this.manualProjectAddDetails.principalInvestigator = this.selectedProjectType == 'Award' ? event.principalInvestigator : event.principalInvestigator;
            this.manualProjectAddDetails.unitName = this.selectedProjectType == 'Award' ? event.unitName : event.unitName;
            this.manualProjectAddDetails.startDate = this.selectedProjectType == 'Award' ? event.startDate : event.startDate;
            this.manualProjectAddDetails.endDate = this.selectedProjectType == 'Award' ? event.endDate : event.endDate;
            this.manualProjectAddDetails.sponsor = this.selectedProjectType == 'Award' ? event.sponsor : event.sponsor;
            this.manualProjectAddDetails.reporterRole = this.selectedProjectType =='Award' ? event.reporterRole : event.reporterRole;
            this.manualProjectAddDetails.primeSponsorName = this.selectedProjectType == 'Award' ? event.primeSponsor : event.primeSponsor;
            this.isShowResultCard = true;
        }
    }

    private getCreateDisclosureRO(): any {
        const RO = {
            ...this.manualProjectAddDetails,
            [this.selectedProjectType == 'Award' ? 'awardNumber' : 'proposalNumber']: this.manualProjectAddDetails.moduleItemId
        };
        delete RO.moduleItemId;
        return RO;
    }

    private getCoiProjectTypeFromCode(description = this.selectedProjectType): string {
        return this.projectTypes.find(type => type.description === description).coiProjectTypeCode;
    }

    private validateProject(): boolean {
        this.projectDisclosureValidation.clear();
        this.mandatoryList.clear();
        if (!this.selectedProjectType) {
            this.projectDisclosureValidation.set('projectSelect', 'Please select any one of the given Project Type');
        }
        if (!this.manualProjectAddDetails || !this.manualProjectAddDetails.moduleItemId) {
            this.projectDisclosureValidation.set('proposalSearch', 'Please select '+ checkForVowelInFirstLetter(this.selectedProjectType) + ' to create disclosure.');
        }
        if (!this.reviseObject.homeUnit) {
            this.mandatoryList.set('homeUnit', 'Please enter a valid unit to create a Project disclosure.');
        }
        return this.projectDisclosureValidation.size === 0 && this.mandatoryList.size === 0 ? true : false;
    }

    private resetManualProjectAddFields(): void {
        this.clearSponsorField = new String('true');
        this.clearPIField = new String('true');
        this.clearLUField = new String('true');
        this.manualProjectAddDetails = {};
        this.manualProjectAddDetails.moduleItemId = null;
        this.manualProjectAddDetails.title = null;
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.clearModal();
        }
    }

}
