import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonService } from '../../../../../../common/services/common.service';
import { deepCloneObject, hideModal, openModal, setFocusToElement } from '../../../../../../common/utilities/custom-utilities';
import { DataStoreEvent } from '../../../../../../entity-management-module/shared/entity-interface';
import { TravelDataStoreService } from '../../../../../../travel-disclosure/services/travel-data-store.service';
import { TravelDisclosureService } from '../../../../../../travel-disclosure/services/travel-disclosure.service';
import { Subject, Subscription } from 'rxjs';
import { FormBuilderService } from '../../form-builder.service';
import { subscriptionHandler } from '../../../../../../common/utilities/subscription-handler';
import { getInvalidDateFormatMessage, compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../../../common/utilities/date-utilities';
import { DEFAULT_DATE_FORMAT } from '../../../../../../app-constants';
import { EndpointOptions } from '../../../../../../travel-disclosure/travel-disclosure.interface';
import { getEndPointOptionsForCountry } from '../../../form-builder-view/search-configurations';
import { isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';

@Component({
  selector: 'app-coi-travel-destination',
  templateUrl: './COI-travel-destination.component.html',
  styleUrls: ['./COI-travel-destination.component.scss']
})
export class COITravelDestinationComponent implements OnInit, OnDestroy, AfterViewInit {

@ViewChild('fromDateInput', { static: false }) fromDateInput?: ElementRef;
@ViewChild('toDateInput', { static: false }) toDateInput?: ElementRef;

  @Input() componentData: any = {};
  @Input() formBuilderId;
  @Input() externalEvents: Subject<any> = new Subject<any>();
  @Output() childEvents: EventEmitter<any> = new EventEmitter<any>();
  destinationDetails: any = {};
  mandatoryList = new Map();
  $subscriptions: Subscription[] = [];
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  editIndex = -1;
  isEditIndex: null | number = null;
  isEditMode = false;
  isSaving = false;
  entityDestinationDefaultValue = '';
  canManageEntity = false;
  countrySearchOptions: EndpointOptions;
  countryClearField = new String('true');
  dateValidationList = new Map();
  destinationDetailsRO: any = {};
  eventType: 'LINK' | 'NEW' = 'NEW';
  deleteIndex: number;
  dateFormatValidationMap = new Map();
  hideDestModalCloseBtn = true;
  addDestinationModalId = 'addDestinationDetails';

  constructor(public service: TravelDisclosureService,
    private _dataService: TravelDataStoreService,
    private _formBuilder: FormBuilderService,
    public commonService: CommonService) {
  }

  ngOnInit() {
    this.getDataFromStore();
    this.listenDataChangeFromStore();
    this.countrySearchOptions = getEndPointOptionsForCountry(this.commonService.fibiUrl);
    this.listenForExternalEvents();
  }

  ngAfterViewInit(): void {
    const MODAL_ELEMENT = document.getElementById(this.addDestinationModalId);
    if (MODAL_ELEMENT) {
      MODAL_ELEMENT.addEventListener('hidden.bs.modal', () => {
        this.clearDestinationDetails();
      });
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

	listenForExternalEvents(): void {
		this.$subscriptions.push(this.externalEvents.subscribe(res => {
			if (res.eventType === 'ERROR') {
				this.isSaving = false;
			} else {
				if (!isEmptyObject(this.destinationDetailsRO)) {
					if (this.destinationDetailsRO.actionType === 'SAVE') {
						this.isSaving = false;
						if (res?.data?.travelDestinations) {
							this.editIndex === -1 ? this.componentData.travelDestinations.push(res?.data?.travelDestinations[0])
								: this.componentData.travelDestinations[this.editIndex] = res?.data?.travelDestinations[0];
						}
					} else if (this.destinationDetailsRO.actionType === 'DELETE' && this.deleteIndex > -1) {
						this.componentData.travelDestinations.splice(this.deleteIndex, 1);
						hideModal('travelDestinationDeleteConfirm');
					}
					this.clearDestinationDetails();
					this.eventType = 'NEW';
				}
			}
		}));
	}

  addDestinationDetails(event) {
    if (event) {
      openModal(this.addDestinationModalId, {
        backdrop: 'static',
        keyboard: true,
        focus: false
      });
    }
  }

  private listenDataChangeFromStore() {
    this.$subscriptions.push(
      this._dataService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
        this.getDataFromStore();
      })
    );
  }

  private getDataFromStore() {
    this.isEditMode = this._dataService.getEditModeForDisclosure();
  }


  clearDestinationDetails() {
    hideModal(this.addDestinationModalId);
    this.service.setUnSavedChanges(false, '');
    setTimeout(() => {
      this.destinationDetails = {};
      this.mandatoryList.clear();
      this.dateValidationList.clear();
      this.countryClearField = new String('true');
      this.countrySearchOptions.defaultValue = null;
      this.entityDestinationDefaultValue = '';
      this.isEditIndex = null;
      this.isSaving = false;
      this.editIndex = -1;
      this.deleteIndex = -1;
      this.dateFormatValidationMap.clear();
    }, 200);
  }

  addDestination() {
    if (this.validateEntityDestination() && !this.isSaving) {
      this.destinationDetails.travelDisclosureId = this.formBuilderId;
      this.destinationDetails.actionType = 'SAVE';
      this.destinationDetailsRO = JSON.parse(JSON.stringify(this.destinationDetails));
      this.destinationDetailsRO.stayStartDate = parseDateWithoutTimestamp(this.destinationDetails.stayStartDate);
      this.destinationDetailsRO.stayEndDate = parseDateWithoutTimestamp(this.destinationDetails.stayEndDate);
      this.isSaving = true;
      try {
        this.childEvents.emit({ action: this.editIndex == -1 ? 'ADD' : 'UPDATE', data: this.destinationDetailsRO });
        this.emitEditOrSaveAction(this.editIndex == -1 ? 'ADD' : 'UPDATE', this.destinationDetailsRO);
      } catch (err) {
        if ((err.status === 405)) {
          this.childEvents.emit({ action: this.editIndex == -1 ? 'ADD' : 'UPDATE', data: this.destinationDetailsRO });
        }
      }
      return null;
    }
  }

  emitEditOrSaveAction(actionPerformed, event) {
    this._formBuilder.$formBuilderActionEvents.next({ action: actionPerformed, actionResponse: event, component: this.componentData });
  }


  editDestinationDetails(destination: any, index: number) {
    this.editIndex = index;
    this.setDestinationDetails(destination);
    delete this.destinationDetails.countryName;
    openModal(this.addDestinationModalId);
  }

  setDestinationDetails(destination) {
    const { updateTimestamp, updatedBy, ...copiedObject } = destination;
    this.countryClearField = new String('false');
    this.destinationDetails = JSON.parse(JSON.stringify(copiedObject));
    this.countrySearchOptions.defaultValue = destination.countryName;
  }

  cancelTriggerInDeleteConfirm(): void {
    this.clearDestinationDetails();
    hideModal('travelDestinationDeleteConfirm');
  }

  deleteDestination(): void {
      this.destinationDetailsRO.actionType = 'DELETE';
      delete this.destinationDetailsRO.updateTimestamp;
      delete this.destinationDetailsRO.countryName;
      this.childEvents.emit({ action: 'DELETE', data: this.destinationDetailsRO });
      this.emitEditOrSaveAction('DELETE', this.destinationDetailsRO);
  }

  confirmDelete(destination: any, index: number): void {
    this.deleteIndex = index;
    this.destinationDetailsRO = deepCloneObject(destination);
      openModal('travelDestinationDeleteConfirm', {
          backdrop: 'static',
          keyboard: false,
          focus: false
      });
  }

  validateEntityDestination() {
    this.mandatoryList.clear();
    if (!this.destinationDetails.city || this.destinationDetails.city.trim() === '') {
      this.mandatoryList.set('city', 'Please enter the City.');
    }
    if (!this.countrySearchOptions.defaultValue) {
      this.mandatoryList.set('country', 'Please select Country.');
    }
    return !this.validateDates() || this.mandatoryList.size !== 0 ? false : true;
  }

  validateDates(): boolean {
    this.dateValidationList.clear();
    if (!this.destinationDetails.stayStartDate) {
      this.dateValidationList.set('stayStartDate', 'Please select the start date.');
    }

    if (this.destinationDetails.stayEndDate) {
      if (!((compareDates(this.destinationDetails.stayStartDate,
        this.destinationDetails.stayEndDate) === 1) ? false : true)) {
        this.dateValidationList.set('stayEndDate', 'Please provide a valid end date.');
      }
    } else {
      this.dateValidationList.set('stayEndDate', 'Please select the end date.');
    }
    return this.dateValidationList.size ? false : true;
  }

  setLocalDateObject(response: any) {
    this.destinationDetails.stayStartDate = response?.travelStartDate ? getDateObjectFromTimeStamp(response.travelStartDate) : null;
    this.destinationDetails.stayEndDate = response?.travelEndDate ? getDateObjectFromTimeStamp(response.travelEndDate) : null;
  }

  selectTravelCountry(event: any): void {
    this.destinationDetails.countryCode = event ? event.countryCode : null;
    this.setUnSavedChangesTrue();
  }

  setUnSavedChangesTrue(): void {
    this.service.setUnSavedChanges(true, 'Travel Details');
  }

    validateDateFormat(fieldName: 'fromDate' | 'toDate'): void {
        const FROM_DATE = this.fromDateInput.nativeElement.value?.trim();
        const TO_DATE = this.toDateInput.nativeElement.value?.trim();
        if (!FROM_DATE && !TO_DATE) return;
        this.dateFormatValidationMap.delete(fieldName);
        const INPUT_DATE_VALUE = fieldName === 'fromDate' ? FROM_DATE : TO_DATE;
        const ERROR_MESSAGE = getInvalidDateFormatMessage(INPUT_DATE_VALUE);
        if (ERROR_MESSAGE) {
            this.dateFormatValidationMap.set(fieldName, ERROR_MESSAGE);
            const DATE_KEY = fieldName === 'fromDate' ? 'stayStartDate' : 'stayEndDate';
            this.dateValidationList.delete(DATE_KEY);
        }
        if (this.dateFormatValidationMap.size === 0) {
            this.validateDates();
        }
    }
}

