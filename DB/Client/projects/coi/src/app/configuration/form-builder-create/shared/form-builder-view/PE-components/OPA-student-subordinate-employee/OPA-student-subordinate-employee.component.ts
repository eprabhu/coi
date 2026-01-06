import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { StudentSubordinateEmployee, StudentSubordinatePE } from './interface';
import { getEndPointForEntity } from '../../search-configurations';
import { FormBuilderService } from '../../form-builder.service';
import { CommonService } from '../../../../../../common/services/common.service';
import { OPAStudentSubordinateService } from './OPA-student-subordinate.service';
import { ElasticConfigService } from '../../../../../../common/services/elastic-config.service';

@Component({
    selector: 'app-OPA-student-subordinate-employee',
    templateUrl: './OPA-student-subordinate-employee.component.html',
    styleUrls: ['./OPA-student-subordinate-employee.component.scss'],
    providers: [OPAStudentSubordinateService]
})
export class OPAStudentSubordinateEmployeeComponent implements OnInit {

    @Input() componentData = new StudentSubordinatePE();
    @Input() formBuilderId;
    @Input() externalEvents: Subject<any> = new Subject<any>();
    @Output() childEvents: EventEmitter<any> = new EventEmitter<any>();
    @Input() isFormEditable = true;

    id: number;
    editIndex = -1;
    deleteIndex: number;
    $subscriptions = [];
    eventType: 'LINK'| 'NEW' =  'NEW';
    summerTotal = 0;
    academicTotal = 0;
    clearNameField: string;
    elasticPersonSearchOptions: any = {};
    entitySearchOptions: any = {};
    clearEntityField: any;
    opaPersonTypeList: any = [];
    myEntities = [];
    studentSubordinateData = new StudentSubordinateEmployee();

    constructor(private _elasticConfig: ElasticConfigService,
                private _formBuilder: FormBuilderService,
                public commonService: CommonService,
                private _studentSubordinateService: OPAStudentSubordinateService) { }

    ngOnInit() {
        this.setSearchOptions();
        this.getOpaPersonType();
        this.generateId();
        this.listenForExternalEvents();
    }

    getMyEntities(): void {
        this._studentSubordinateService.getEntities().subscribe((data: any) => {
            this.myEntities = data;
            this.markLinkableEntities();
        });
    }

    markLinkableEntities() {
        this.myEntities = this.myEntities.filter(E => !!!this.componentData.data.find(P => P.personEntityId === E.personEntityId));
    }

    getOpaPersonType(): void {
        this.$subscriptions.push(this._formBuilder.getOpaPersonType().subscribe(response => {
            this.opaPersonTypeList = response || [];
        }));
    }

    private setSearchOptions() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
    }

    private generateId() {
        this.id = new Date().getTime();
    }

    private listenForExternalEvents(): void {
        this.$subscriptions.push(this.externalEvents.subscribe(res => {
            if (this.studentSubordinateData.actionType === 'SAVE') {
                this.editIndex === -1 ? this.componentData.data.push(res.data.data[0]) :
                                        this.componentData.data[this.editIndex] = res.data.data[0];
                if (this.eventType === 'NEW') {
                    document.getElementById('item_add').click();
                }
            } else if (this.studentSubordinateData.actionType === 'DELETE' && this.deleteIndex > -1) {
                this.componentData.data.splice(this.deleteIndex, 1);
                document.getElementById('item_delete').click();
            }
            this.calculateTotal();
            this.clearData();
            this.eventType = 'NEW';
        }));
    }

    private calculateTotal() {
        this.academicTotal  = 0;
        this.summerTotal = 0;
        this.componentData.data.forEach(D => {
            this.academicTotal += Number(D.numOfDaysAcademic);
            this.summerTotal += Number(D.numOfDaysSummer);
        });
    }

    clearData() {
        this.studentSubordinateData = new StudentSubordinateEmployee();
        this.elasticPersonSearchOptions = {};
        this.entitySearchOptions = {};
        this.editIndex = -1;
        this.deleteIndex = -1;
    }

    setPersonData(event: any): void {
        this.studentSubordinateData.personId = event ? event.prncpl_id : '';
    }

    saveOrUpdateEntry(): StudentSubordinateEmployee {
        this.studentSubordinateData.opaDisclosureId = this.formBuilderId;
        this.studentSubordinateData.actionType = this.editIndex == -1 ? 'SAVE' : 'UPDATE';
        try {
            this.childEvents.emit({action: 'ADD', data: this.studentSubordinateData});
            this.emitEditOrSaveAction(this.editIndex == -1 ? 'ADD' : 'UPDATE', this.studentSubordinateData);
        } catch (err) {
            if ((err.status === 405)) {
                this.childEvents.emit({action: 'ADD', data: this.studentSubordinateData});
            }
        }
        return null;
    }

    onSelectEntity(event: any) {
        this.studentSubordinateData.personEntityId = event ? event.entityId : null;
    }

    emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilder.$formBuilderActionEvents.next({action: actionPerformed, actionResponse: event, component: this.componentData});
    }

}
