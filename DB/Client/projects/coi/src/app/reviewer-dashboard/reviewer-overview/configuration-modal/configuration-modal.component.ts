import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormSharedModule } from '../../../configuration/form-builder-create/shared/shared.module';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { ReviewerDashboardService } from '../../services/reviewer-dashboard.service';
import { closeCommonModal } from '../../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { DISCLOSURE_CONFIGURATION_MODAL_ID, REVIEWER_MODULE_SECTION_CODE } from '../../reviewer-dashboard-constants';
import { DisclConfigurationModalConfig, PreferenceRequest, UserPreferenceData, UserSelectedWidget, WidgetResponse } from '../../reviewer-dashboard.interface';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { FormsModule } from '@angular/forms';
import { getEndPointOptionsForLoggedPersonUnit } from '../../../common/services/end-point.config';

@Component({
    selector: 'app-configuration-modal',
    templateUrl: './configuration-modal.component.html',
    styleUrls: ['./configuration-modal.component.scss'],
    standalone: true,
    imports: [CommonModule,
        SharedModule,
        SharedComponentModule,
        FormSharedModule,
        FormsModule,
        DragDropModule]
})
export class ConfigurationModalComponent implements OnInit {

    @Input() disclosureConfigurationModalConfig: DisclConfigurationModalConfig;
    @Input() preferredUnit: UserPreferenceData;
    @Input() personPreferenceForChildUnit: UserPreferenceData;
    @Input() defaultUnitName: string;

    modalConfig = new CommonModalConfig(DISCLOSURE_CONFIGURATION_MODAL_ID, '', 'Close', 'lg');
    isInboxInfo = true;
    leadUnitSearchOptions: any = {};
    isIncludeChildUnits = false;
    isSaving = false;
    isDataChange = false;
    $subscriptions: Subscription[] = [];
    validationMap = new Map();
    unitObject: any;
    widgetResponseData: WidgetResponse;
    isLoading = false;
    selectedWidgetIds: Set<number> = new Set<number>();
    isDefaultDataChanged = false;
    formattedWidgets: any[] = [];
    unitSearchCleared = false;
    isShowIncludeChildUnit = false;
    dragAndDropEnabled = true;
    reorderInProgress = false;

    get isDropDisabled(): boolean {
        return this.isLoading || this.reorderInProgress;
    }

    constructor(public reviewerDashboardService: ReviewerDashboardService, private _commonService: CommonService) { }

    ngOnInit() {
        this.getWidgetLookups();
        this.setSearchOptions();
        this.setDefaultUnitValue();
        this.isShowIncludeChildUnit = Boolean(this.preferredUnit?.value);
    }

    private setSearchOptions(): void {
        this.leadUnitSearchOptions = getEndPointOptionsForLoggedPersonUnit(this._commonService.baseUrl);
    }

    private setDefaultUnitValue(): void {
        this.leadUnitSearchOptions.defaultValue = this.defaultUnitName;
        this.isIncludeChildUnits = this.personPreferenceForChildUnit?.value === 'Y';
    }

    private getWidgetLookups(): void {
        this.isLoading = true;
        this.$subscriptions.push(this.reviewerDashboardService.getWidgetLookups(REVIEWER_MODULE_SECTION_CODE)
            .subscribe({
                next: (data: WidgetResponse) => {
                    this.isLoading = false;
                    if (data != null) {
                        this.widgetResponseData = data;
                        this.initializeSelectedWidgets();
                        this.formatWidgetData();
                    }
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch widgets, please try again.');
                }
            })
        );
    }

    private initializeSelectedWidgets(): void {
        this.selectedWidgetIds.clear();
        if (this.widgetResponseData.userSelectedWidgets) {
            this.widgetResponseData.userSelectedWidgets.forEach(widget => {
                this.selectedWidgetIds.add(widget.widgetId);
            });
        }
    }

    private addWidget(widgetDetails: any): void {
        this.selectedWidgetIds.add(widgetDetails.widgetId);
        const CURRENT_INDEX = this.formattedWidgets.findIndex(w => w.widgetId === widgetDetails.widgetId);
        const SORT_ORDER = CURRENT_INDEX + 1;
        const REQUEST_OBJECT = {
            selectedWidgetId: null,
            widgetId: widgetDetails.widgetId,
            widgetLookup: {
                description: widgetDetails.description,
                dynModulesConfigCode: widgetDetails.dynModulesConfigCode,
                widgetId: widgetDetails.widgetId,
                widgetName: widgetDetails.widgetName
            },
            sortOrder: widgetDetails.sortOrder,
            personId: this._commonService.getCurrentUserDetail('personID')
        };
        if (CURRENT_INDEX !== -1) {
            this.formattedWidgets[CURRENT_INDEX].isUserSelected = true;
            this.formattedWidgets[CURRENT_INDEX].sortOrder = SORT_ORDER;
        }
        this.saveWidget(REQUEST_OBJECT);
    }

    private removeWidget(widgetDetails: any): void {
        this.selectedWidgetIds.delete(widgetDetails.widgetId);
        const USER_SELECTED_WIDGET = this.widgetResponseData.userSelectedWidgets?.find(
            widget => widget.widgetId === widgetDetails.widgetId
        );
        if (USER_SELECTED_WIDGET) {
            this.deleteWidget(USER_SELECTED_WIDGET.selectedWidgetId, widgetDetails.widgetId);
        } else {
            this.formatWidgetData();
        }
    }

    private saveWidget(REQUEST_OBJECT: UserSelectedWidget): void {
        this.$subscriptions.push(
            this.reviewerDashboardService.saveUserSelectedWidget({ userSelectedWidget: REQUEST_OBJECT })
                .subscribe({
                    next: (response) => {
                        this.isDefaultDataChanged = true;
                        if (response?.userSelectedWidget) {
                            const EXISTING_WIDGETS = this.widgetResponseData.userSelectedWidgets || [];
                            const UPDATED_WIDGETS = EXISTING_WIDGETS.filter(
                                widget => widget.widgetId !== REQUEST_OBJECT.widgetId
                            );
                            this.widgetResponseData.userSelectedWidgets = [
                                ...UPDATED_WIDGETS,
                                response.userSelectedWidget
                            ];
                        }
                        this.formatWidgetData();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Configuration saved successfully');
                    },
                    error: (error) => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save Configuration');
                        this.selectedWidgetIds.delete(REQUEST_OBJECT.widgetId);
                        const WIDGET_INDEX = this.formattedWidgets.findIndex(w => w.widgetId === REQUEST_OBJECT.widgetId);
                        if (WIDGET_INDEX !== -1) {
                            this.formattedWidgets[WIDGET_INDEX].isUserSelected = false;
                        }
                    }
                })
        );
    }

    private deleteWidget(selectedWidgetId: number, widgetId: number): void {
        this.$subscriptions.push(this.reviewerDashboardService.deleteUserSelectedWidget(selectedWidgetId)
            .subscribe({
                next: (response) => {
                    this.isDefaultDataChanged = true;
                    this.widgetResponseData.userSelectedWidgets = this.widgetResponseData.userSelectedWidgets?.filter(
                        widget => widget.widgetId !== widgetId) || [];
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Configuration removed successfully');
                },
                error: (error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to remove Configuration');
                    this.selectedWidgetIds.add(this.findWidgetIdBySelectedId(selectedWidgetId));
                }
            })
        );
    }

    private findWidgetIdBySelectedId(selectedWidgetId: number): number {
        const WIDGET = this.widgetResponseData.userSelectedWidgets?.find(w => w.selectedWidgetId === selectedWidgetId);
        return WIDGET?.widgetId || 0;
    }

    private formatWidgetData(): void {
        if (!this.widgetResponseData) return;
        const { userSelectedWidgets = [], widgetLookups = [] } = this.widgetResponseData;
        const SORTED_USER_WIDGETS = this.getSortedUserWidgets(userSelectedWidgets);
        const USER_SELECTED_WIDGET_IDS = new Set(SORTED_USER_WIDGETS.map(w => w.widgetId));
        const AVAILABLE_WIDGETS = widgetLookups.filter(widget => 
            !USER_SELECTED_WIDGET_IDS.has(widget.widgetId)
        );
        const SELECTED_FORMATTED_WIDGETS = this.formatSelectedWidgets(SORTED_USER_WIDGETS, widgetLookups);
        const AVAILABLE_FORMATTED_WIDGETS = this.formatAvailableWidgets(AVAILABLE_WIDGETS, SORTED_USER_WIDGETS.length);
        this.formattedWidgets = [...SELECTED_FORMATTED_WIDGETS, ...AVAILABLE_FORMATTED_WIDGETS];
        this.maintainVisualOrderForSelectedWidgets();
    }
    
    private getSortedUserWidgets(userWidgets: any[]): any[] {
        return [...userWidgets].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    
    private formatSelectedWidgets(userWidgets: any[], allLookups: any[]): any[] {
        return userWidgets.map((userWidget, index) => {
            const lookupData = allLookups.find(lookup => lookup.widgetId === userWidget.widgetId);
            return {
                ...lookupData,
                ...userWidget,
                isUserSelected: true,
                sortOrder: userWidget.sortOrder ?? (index + 1)
            };
        });
    }
    
    private formatAvailableWidgets(availableWidgets: any[], selectedCount: number): any[] {
        return availableWidgets.map((widget, index) => ({
            ...widget,
            isUserSelected: this.selectedWidgetIds.has(widget.widgetId),
            selectedWidgetId: undefined,
            sortOrder: selectedCount + index + 1
        }));
    }
    
    private maintainVisualOrderForSelectedWidgets(): void {
        const SELECTED_WIDGETS = this.formattedWidgets.filter(w => this.selectedWidgetIds.has(w.widgetId));
        SELECTED_WIDGETS.forEach((widget, index) => {
            const VISUAL_INDEX = this.formattedWidgets.findIndex(w => w.widgetId === widget.widgetId);
            if (VISUAL_INDEX !== -1) {
                widget.sortOrder = VISUAL_INDEX + 1;
            }
        });
    }

    private unitValidation(): boolean {
        this.validationMap.clear();
        if (!this.unitObject?.unitNumber && !this.defaultUnitName) {
            this.validationMap.set('unit', 'Please specify the Default Unit.');
        }
        return this.validationMap.size === 0 ? true : false;
    }

    private setRequestObject(): PreferenceRequest[] {
        const personId = this._commonService.getCurrentUserDetail('personID');
        const UNIT_NUMBER = this.unitSearchCleared ? null : (this.unitObject?.unitNumber || this.preferredUnit?.value);
        const INCLUDE_CHILD_UNITS = this.unitSearchCleared ? 'N' : (this.isIncludeChildUnits ? 'Y' : 'N');
        return [
            new PreferenceRequest({
                preferenceId: this.preferredUnit?.preferenceId || null,
                personId,
                preferencesTypeCode: 8001,
                value: UNIT_NUMBER
            }),
            new PreferenceRequest({
                preferenceId: this.personPreferenceForChildUnit?.preferenceId || null,
                personId,
                preferencesTypeCode: 8002,
                value: INCLUDE_CHILD_UNITS
            })
        ];
    }

    private assignSortOrderToWidgets(): void {
        this.formattedWidgets.forEach((widget, index) => widget.sortOrder = index + 1);
    }

    private buildWidgetSortOrderPayload(): UserSelectedWidget[] {
        const personId = this._commonService.getCurrentUserDetail('personID');
        return this.formattedWidgets
            .filter(widget => this.selectedWidgetIds.has(widget.widgetId))
            .map((widget, index) => {
                const VISUAL_INDEX = this.formattedWidgets.findIndex(w => w.widgetId === widget.widgetId);
                const SORT_ORDER = VISUAL_INDEX !== -1 ? VISUAL_INDEX + 1 : index + 1;
                return {
                    selectedWidgetId: widget.selectedWidgetId || null,
                    widgetId: widget.widgetId,
                    sortOrder: SORT_ORDER,
                    personId
                };
            });
    }

    private updateWidgetSortOrder(previousState: any[]): void {
        const PAYLOAD = this.buildWidgetSortOrderPayload();
        if (!PAYLOAD.length) {
            this.reorderInProgress = false;
            return;
        }
        this.$subscriptions.push(
            this.reviewerDashboardService.updateWidgetSortOrder({ userSelectedWidgets: PAYLOAD })
                .subscribe({
                    next: (response: WidgetResponse) => {
                        const UPDATED_WIDGETS = response?.userSelectedWidgets || PAYLOAD;
                        this.widgetResponseData.userSelectedWidgets = UPDATED_WIDGETS;
                        this.patchSelectedWidgets(UPDATED_WIDGETS);
                        this.assignSortOrderToWidgets();
                        this.reorderInProgress = false;
                        this.isDefaultDataChanged = true;
                    },
                    error: () => {
                        this.formattedWidgets = previousState;
                        this.assignSortOrderToWidgets();
                        this.reorderInProgress = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Configuration order, please try again.');
                    }
                })
        );
    }

    private patchSelectedWidgets(updatedWidgets: UserSelectedWidget[]): void {
        if (!updatedWidgets?.length) {
            return;
        }
        const SELECTED_WIDGET_MAP = new Map(updatedWidgets.map(widget => [widget.widgetId, widget]));
        this.formattedWidgets = this.formattedWidgets.map(widget => {
            const UPDATED_WIDGET = SELECTED_WIDGET_MAP.get(widget.widgetId);
            if (UPDATED_WIDGET) {
                return {
                    ...widget,
                    ...UPDATED_WIDGET,
                    isUserSelected: true
                };
            }
            return {
                ...widget,
                isUserSelected: Boolean(widget.selectedWidgetId)
            };
        });
    }

    private cloneWidgets(widgets: any[]): any[] {
        return widgets.map(widget => ({
            ...widget,
            widgetLookup: widget.widgetLookup ? { ...widget.widgetLookup } : undefined
        }));
    }

    disclConfigurationModalAction(modalAction: ModalActionEvent): void {
        if (['CLOSE_BTN', 'SECONDARY_BTN'].includes(modalAction.action)) {
            closeCommonModal(DISCLOSURE_CONFIGURATION_MODAL_ID);
            setTimeout(() => {
                this.reviewerDashboardService.disclosureConfigurationModalConfig = new DisclConfigurationModalConfig();
            }, 200);
            this._commonService.$globalEventNotifier.next({ uniqueId: 'REFRESH_OVERVIEW_TAB', content: { isDefaultDataChanged: this.isDefaultDataChanged } });
        }
    }

    saveDefaultUnit() {
        if (!this.isSaving && this.isDataChange && this.unitValidation()) {
            this.isSaving = true;
            this.$subscriptions.push(this.reviewerDashboardService.setUserPreference({ personPreferences: this.setRequestObject() })
                .subscribe((result: any) => {
                    let PREFERENCE_DETAILS = {};
                    result.personPreferences.forEach(element => {
                        PREFERENCE_DETAILS[element.preferencesTypeCode] = element;
                    });
                    this.preferredUnit = PREFERENCE_DETAILS[8001];
                    this.personPreferenceForChildUnit = PREFERENCE_DETAILS[8002];
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Default Unit saved successfully.');
                    this.isSaving = false;
                    this.isDataChange = false;
                    this.isDefaultDataChanged = true;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, "Error Saving Default Unit, Please try again.");
                    this.isSaving = false;
                }));
        }
    }

    onUnitChange(unit: any): void {
        this.isDataChange = true;
        if (unit?.unitNumber) {
            this.unitObject = unit || null;
            this.unitSearchCleared = false;
            this.isShowIncludeChildUnit = true;
        } else {
            this.unitSearchCleared = true;
            this.isShowIncludeChildUnit = false;
        }
    }

    isWidgetSelected(widgetId: number): boolean {
        return this.selectedWidgetIds.has(widgetId);
    }

    emitActions(event: any, widgetDetails: UserSelectedWidget): void {
        const TOGGLED_YES = event;
        if (TOGGLED_YES) {
            this.addWidget(widgetDetails);
        } else {
            this.removeWidget(widgetDetails);
        }
    }

    onWidgetDrop(event: CdkDragDrop<any[]>): void {
        if (this.isDropDisabled || !event || event.previousIndex === event.currentIndex) {
            return;
        }
        const PREVIOUS_STATE = this.cloneWidgets(this.formattedWidgets);
        moveItemInArray(this.formattedWidgets, event.previousIndex, event.currentIndex);
        this.assignSortOrderToWidgets();
        this.reorderInProgress = true;
        this.updateWidgetSortOrder(PREVIOUS_STATE);
    }

    trackByWidgetId(index: number, widget: any): number | string {
        return widget?.selectedWidgetId ?? widget?.widgetId ?? index;
    }
}
