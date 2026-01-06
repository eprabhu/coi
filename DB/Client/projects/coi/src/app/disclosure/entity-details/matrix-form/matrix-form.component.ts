import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EntityDetailsService } from '../entity-details.service';
import { Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { ENGAGEMENT_FLOW_TYPE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, MATRXI_FORM, SFI_MIN_RANGE } from '../../../app-constants';
import { KeyValue } from '@angular/common';
import { COIMatrix, CoiMatrixAnswer } from '../engagement-interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LookUpClass } from '../../../common/services/coi-common.interface';
import { debounceTime } from 'rxjs/operators';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
class MatrixAnsClass {
    personEntityId: number = 0;
    personEntityNumber: number = 0;
    matrixQuestionId: number = 0;
    columnValue: string = '';
    relationshipTypeCode: string = '';
    comments: string = '';
    matrixAnswerId?: string | number;
}
@Component({
  selector: 'app-matrix-form',
  templateUrl: './matrix-form.component.html',
  styleUrls: ['./matrix-form.component.scss']
})
export class MatrixFormComponent {

    $subscriptions: Subscription[] = [];
    reviewerList = [];
    columnList: string[] = [];
    matrixFormValue: any;
    lookUpValues: any = {};
    matrixSaveArray: MatrixAnsClass[] = [];
    commentsArr: any[] = [];
    isTextChanged = false;
    matrixResArr = [];
    deleteHelpText = 'You are about to delete entity relationship.';
    isMatrixComplete = false;
    lookupZIndex = 12;
    matrixLabel = '';
    flow3 = ENGAGEMENT_FLOW_TYPE.FLOW_3;
    defaultColumns = ['Self', 'Spouse', 'Dependent', 'Comments'];
    matrixLookups: Record<string, LookUpClass[]> = {};
    $debounceTimer = new Subject<{ answer: CoiMatrixAnswer; type: 'CV' | 'CMNT' }>();
    private debounceTimers: {[key: string]: Subject<{answer: CoiMatrixAnswer, type: 'CV'|'CMNT'}>} = {};
    private debounceSubscriptions: {[key: string]: Subscription} = {};
    textAnswerArray = [];
    isMatrixSavingInProgress = false;
    isInitialSave = false;

    @Input() personEntityId: any;
    @Input() personEntityNumber: any;
    @Input() isEditMode = true;
    @Output() matrixLoaded  = new EventEmitter(); //This event emitter notifies the parent when the matrix section is loaded, allowing it to adjust the header's top position dynamically.

    constructor(private _entityDetailsService: EntityDetailsService, public commonService: CommonService,
                private sanitizer: DomSanitizer, public autoSaveService: AutoSaveService) {}

    ngOnInit() {
        this.matrixLabel = this.commonService.isUnifiedQuestionnaireEnabled ? MATRXI_FORM : 'Financial Relationship';
        this.listenGlobalSave();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['personEntityId'] || changes['personEntityNumber']) {
            this.fetchMatrixForm();
        }
    }

    private async fetchMatrixForm(): Promise<void> {
        this.matrixResArr = [];
        this.lookUpValues = {};
        this.$subscriptions.push(this._entityDetailsService.fetchMatrixJSON(this.personEntityId).subscribe(async (data: {coiMatrixResponse: COIMatrix[], matrixComplete: boolean}) => {
            await this.fetchAllMatrixLookups(data?.coiMatrixResponse);
            this.afterMatrixFetch(data)
            this.matrixLoaded.next();
        }));
    }

    afterMatrixFetch(data: {coiMatrixResponse: COIMatrix[], matrixComplete: boolean}): void {
        this._entityDetailsService.matrixResponse = data?.coiMatrixResponse;
        this.setAnswerObj(data?.coiMatrixResponse);
        this.getLookupDataTypeValues(data?.coiMatrixResponse);
        this.matrixFormValue = this.groupBy(data?.coiMatrixResponse, "coiMatrixQuestion", 'coiMatrixGroup', 'groupName');
        this.columnList = this.defaultColumns;
        this.matrixResArr = data?.coiMatrixResponse;
        this.isMatrixComplete = data?.matrixComplete;
        this._entityDetailsService.isMatrixComplete = data?.matrixComplete;
    }

    private setAnswerObj(data: COIMatrix[]): void{
        data?.forEach((ele: any) => {
            ele.coiMatrixAnswer =  ele.coiMatrixAnswer || [];
            ele.relationships.forEach((ele2) => {
                let relAnswer = ele.coiMatrixAnswer.find(ele => ele.relationshipTypeCode == ele2.relationshipTypeCode);
                if(!relAnswer) {
                    let answerObj = new MatrixAnsClass();
                    answerObj.relationshipTypeCode = ele2.relationshipTypeCode;
                    answerObj.matrixQuestionId = ele?.coiMatrixQuestion?.matrixQuestionId;
                    answerObj.personEntityId = this.personEntityId;
                    answerObj.personEntityNumber = this.personEntityNumber;
                    ele.coiMatrixAnswer.push(answerObj);
                }
            });
        }
        )
    }

    async fetchAllMatrixLookups(questionList: any[]): Promise<void> {
        const PENDING_LOOKUPS: Record<string, { tableName: string; columnName: string }> = {};
        const LOOKUP_RESULTS: Record<string, LookUpClass[]> = {};
        for (const { coiMatrixQuestion } of questionList) {
            const { lookupType, lookupValue } = coiMatrixQuestion;
            const KEY = `${lookupType}#${lookupValue}`;
            if (!PENDING_LOOKUPS[KEY]) {
                PENDING_LOOKUPS[KEY] = {
                    tableName: lookupType,
                    columnName: lookupValue,
                };
            }
        }
        const LOOKUP_PROMISES = Object.entries(PENDING_LOOKUPS).map(async ([KEY, { tableName, columnName }]) => {
            const RESULT = await this.commonService.getOrFetchFibiLookup(tableName, columnName);
            LOOKUP_RESULTS[KEY] = RESULT;
        });
        await Promise.all(LOOKUP_PROMISES);
        this.matrixLookups = LOOKUP_RESULTS;
    }

    private getLookupDataTypeValues(data: COIMatrix[]): void {
        data?.forEach((ele) => {
            if(ele.coiMatrixQuestion.answerTypeCode === '1') {
                ele.coiMatrixAnswer.forEach((ans: any) => {
                    const MATRIX_LOOKUP_KEY = ele?.coiMatrixQuestion?.lookupType + '#' + ele?.coiMatrixQuestion?.lookupValue;
                    const TRIMMED_VALUE = ans.columnValue?.trim();
                    const LOOKUP_DATA = TRIMMED_VALUE
                        ? this.matrixLookups[MATRIX_LOOKUP_KEY]?.find(({ description }) => description?.trim() === TRIMMED_VALUE)
                        : null;
                    const LOOKUP_KEY = ans.matrixQuestionId + ans.relationshipTypeCode;
                    this.lookUpValues[LOOKUP_KEY] = LOOKUP_DATA || new LookUpClass();
                });
            }
        });
    }

    private groupBy(jsonData: COIMatrix[], key: string, innerKey: string, inner2: string): {[groupKey: string]: COIMatrix[]}{
        return jsonData.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key][innerKey][inner2]] = relationsTypeGroup[item[key][innerKey][inner2]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

    keepOriginalOrder (a: KeyValue<string, any>, b: KeyValue<string, any>): number {
        return 0;
    };

    checkForRelationsExists(arg: { relationshipTypeCode: string }[], typeCode: string): boolean {
        return arg.some(ele => ele.relationshipTypeCode === typeCode);
    }

    onLookupSelect(event: LookUpClass, relation: COIMatrix, relationTypeCode: string): void {
        this._entityDetailsService.isMatrixChanged = true;
        if (!this._entityDetailsService.unSavedSections.some(ele => ele.includes(this.matrixLabel))) {
            this._entityDetailsService.unSavedSections.push(this.matrixLabel);
        }
        if(event) {
            let answer = relation.coiMatrixAnswer.find(ele => ele.relationshipTypeCode == relationTypeCode);
            if(!answer && event) {
                let answerObj = new MatrixAnsClass();
                answerObj.relationshipTypeCode = relationTypeCode;
                answerObj.matrixQuestionId = relation?.coiMatrixQuestion?.matrixQuestionId;
                answerObj.personEntityId = this.personEntityId;
                answerObj.personEntityNumber = this.personEntityNumber;
                answerObj.columnValue = event.description || undefined;
                this.matrixSaveArray.push(answerObj);
            }
            if(answer) {
                if (event) {
                    const EXISTING_INDEX = this.matrixSaveArray.findIndex(ele => ele.relationshipTypeCode == relationTypeCode && ele.matrixQuestionId == relation?.coiMatrixQuestion?.matrixQuestionId);
                    if (EXISTING_INDEX > -1) {
                        this.matrixSaveArray.splice(EXISTING_INDEX, 1);
                    }
                    answer.columnValue = event.description || undefined;
                    this.matrixSaveArray.push(answer);
                } else if(answer.matrixAnswerId) {
                    answer.columnValue = null;
                    this.matrixSaveArray.push(answer);
                }
            }
            if(event.description === SFI_MIN_RANGE) {
                this._entityDetailsService.isSFIMinRangeSelected = true;
            }
        }
        this.saveMatrix();
    }

    private listenGlobalSave(): void {
        this.$subscriptions.push(this._entityDetailsService.globalSave$.subscribe((data: any) => {
            this.saveMatrix();
        }));
    }

    saveMatrix(): void {
        if (!this.isInitialSave) {
            this.matrixSaveArray = this.matrixSaveArray.filter(reqObj => reqObj.matrixAnswerId || reqObj.columnValue || reqObj.comments);
            this.isInitialSave = this.matrixSaveArray.some((ele: MatrixAnsClass) => !ele.matrixAnswerId || (!ele.columnValue && !ele.comments))
            const RO = deepCloneObject(this.matrixSaveArray);
            this.matrixSaveArray = [];
            if (RO.length) {
                this.commonService.showAutoSaveSpinner();
                this.commonService.setChangesAvailable(true);
                this.commonService.setLoaderRestriction();
                this._entityDetailsService.isChangeinMatrix = true;
                this._entityDetailsService.saveMatrixForm(RO).subscribe((data: any) => {
                    const INDEX = this._entityDetailsService.unSavedSections.findIndex(ele => ele.includes(this.matrixLabel));
                    if (INDEX >= 0) {
                        this._entityDetailsService.unSavedSections.splice(INDEX, 1);
                    }
                    this._entityDetailsService.isMatrixChanged = false;
                    this.updateMatrixAnswers(this.matrixFormValue, data.response);
                    this.afterMatrixSave(data);
                    if (this.isInitialSave) {
                        this.isInitialSave = false;
                        if (this.matrixSaveArray.length) {
                            this._entityDetailsService.isMatrixChanged = true;
                            if (!this._entityDetailsService.unSavedSections.some(ele => ele.includes(this.matrixLabel))) {
                                this._entityDetailsService.unSavedSections.push(this.matrixLabel);
                            }
                            this.saveMatrix();
                        }
                    }
                }, err => {
                    this.matrixSaveArray = RO;
                    this.commonService.hideAutoSaveSpinner('ERROR');
                    this.commonService.setChangesAvailable(false);
                });
                this.commonService.removeLoaderRestriction();
            }
        }
    }

    afterMatrixSave(data: any) {
        this.commonService.hideAutoSaveSpinner('SUCCESS');
        this.commonService.setChangesAvailable(false);
        if (!this.matrixSaveArray.length) {
            this.commonService.$globalEventNotifier.next({ uniqueId: 'MATRIX_COMPLETED', content: data?.response?.[0]?.updateTimestamp });
        }
        this.isMatrixComplete = data?.isMatrixCompleted;
        this._entityDetailsService.isMatrixComplete = data?.isMatrixCompleted;
    }

    setIsTextChanged(answer: CoiMatrixAnswer, type: 'CV' | 'CMNT') {
        this.isTextChanged = true;
        this._entityDetailsService.isMatrixChanged = true;
        if (!this._entityDetailsService.unSavedSections.some(ele => ele.includes(this.matrixLabel))) {
            this._entityDetailsService.unSavedSections.push(this.matrixLabel);
        }
        const key = `${answer.matrixQuestionId}_${answer.relationshipTypeCode}`;
        if (!this.debounceTimers[key]) {
            this.debounceTimers[key] = new Subject();
            this.debounceSubscriptions[key] = this.debounceTimers[key].pipe(debounceTime(500)).subscribe(data => {
                this.insertIntoMatrixAnswer(data.answer, data.type);
            });
        }
        this.debounceTimers[key].next({ answer: { ...answer }, type });
    }

    insertIntoMatrixAnswer(answer: CoiMatrixAnswer, type:'CV'|'CMNT'): void {
        if(this.isTextChanged) {
            let INDEX = this.matrixSaveArray.findIndex(ele => ele.relationshipTypeCode == answer.relationshipTypeCode && ele.matrixQuestionId === answer.matrixQuestionId);
            answer.columnValue = answer.columnValue?.trim() ? answer.columnValue.trim() : null;
            answer.comments = answer.comments?.trim() ? answer.comments.trim() : null;
            if((type==='CV' && (answer.columnValue || (!answer.columnValue && answer.matrixAnswerId))) || (type==='CMNT' && (answer.comments || (!answer.comments && answer.matrixAnswerId)))) {
                if(INDEX > -1 && !answer?.matrixAnswerId) {
                    this.matrixSaveArray.splice(INDEX, 1, answer);
                } else {
                    this.matrixSaveArray.push(answer);
                }
                this.isTextChanged = false;
            }
        this.saveMatrix();
        }
    }

    getSafeLabel(label: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(label);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private updateMatrixAnswers(inputData: any, matrixInput: CoiMatrixAnswer[]): void {
        for (let category in inputData) {
            inputData[category].forEach(item => {
                item.coiMatrixAnswer.forEach(answer => {
                    matrixInput.forEach(newAnswer => {
                        if (item.coiMatrixQuestion.matrixQuestionId === newAnswer.matrixQuestionId &&
                            answer.relationshipTypeCode === newAnswer.relationshipTypeCode) {
                            answer.matrixAnswerId = newAnswer.columnValue || newAnswer.comments ? newAnswer.matrixAnswerId : undefined;
                            answer.updateTimestamp = newAnswer.updateTimestamp;
                            answer.updatedBy = newAnswer.updatedBy;
                        }
                    });
                });
            });
        }
        this.matrixSaveArray.forEach(reqObj => {
            matrixInput.forEach(response => {
                if (reqObj.matrixQuestionId === response.matrixQuestionId && reqObj.relationshipTypeCode === response.relationshipTypeCode) {
                    reqObj.matrixAnswerId = response.columnValue || response.comments ? response.matrixAnswerId : undefined;
                }
            });
        });
    }

    clearMatrix(relation: COIMatrix): void {
        let hasAnyDataPresent = false;
        const SAVE_ARRAY_TEMP = deepCloneObject(this.matrixSaveArray);
        relation.coiMatrixAnswer.forEach(matrixAnswer => {
            if (matrixAnswer.columnValue || matrixAnswer.comments) {
                hasAnyDataPresent = true;
            }
            if (matrixAnswer) {
                const EXISTING_INDEX = SAVE_ARRAY_TEMP.findIndex(ele =>
                    ele.relationshipTypeCode == matrixAnswer.relationshipTypeCode && ele.matrixQuestionId?.toString() === relation?.coiMatrixQuestion?.matrixQuestionId?.toString()
                );
                if (EXISTING_INDEX > -1) {
                    SAVE_ARRAY_TEMP.splice(EXISTING_INDEX, 1);
                }
                matrixAnswer.columnValue = null;
                matrixAnswer.comments = null;
                SAVE_ARRAY_TEMP.push(deepCloneObject(matrixAnswer));
                // for clearing html data
                const LOOKUP_KEY = matrixAnswer.matrixQuestionId + matrixAnswer.relationshipTypeCode;
                this.lookUpValues[LOOKUP_KEY] = new LookUpClass();
                // for clearing answer id
                matrixAnswer.matrixAnswerId = undefined;
            }
        });
        if (hasAnyDataPresent) {
            this._entityDetailsService.isMatrixChanged = true;
            if (!this._entityDetailsService.unSavedSections.some(ele => ele.includes(this.matrixLabel))) {
                this._entityDetailsService.unSavedSections.push(this.matrixLabel);
            }
            this.matrixSaveArray = SAVE_ARRAY_TEMP;
            this.saveMatrix();
        }
    }

    setCommentChanged(relation: COIMatrix, comments: string): void {
        this._entityDetailsService.isMatrixChanged = true;
        if (!this._entityDetailsService.unSavedSections.some(ele => ele.includes(this.matrixLabel))) {
            this._entityDetailsService.unSavedSections.push(this.matrixLabel);
        }
        relation.coiMatrixAnswer.forEach(matrixAnswer => {
            if (matrixAnswer) {
                const EXISTING_INDEX = this.matrixSaveArray.findIndex(ele =>
                    ele.relationshipTypeCode == matrixAnswer.relationshipTypeCode && ele.matrixQuestionId?.toString() === relation?.coiMatrixQuestion?.matrixQuestionId?.toString()
                );
                if (EXISTING_INDEX > -1) {
                    this.matrixSaveArray.splice(EXISTING_INDEX, 1);
                }
                matrixAnswer.comments = comments?.trim() || '';
                this.matrixSaveArray.push(deepCloneObject(matrixAnswer));
            }
        });
        const FIRST_MATRIX = relation.coiMatrixAnswer[0];
        const KEY = `${FIRST_MATRIX.matrixQuestionId}_${FIRST_MATRIX.relationshipTypeCode}_comments`;
        if (!this.debounceTimers[KEY]) {
            this.debounceTimers[KEY] = new Subject();
            this.debounceSubscriptions[KEY] = this.debounceTimers[KEY].pipe(debounceTime(500)).subscribe(data => {
                this.saveMatrix();
            });
        }
        this.debounceTimers[KEY].next();
    }

}

