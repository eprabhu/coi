import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
	selector: 'app-person-rolodex-card',
	templateUrl: './person-rolodex-card.component.html',
	styleUrls: ['./person-rolodex-card.component.css']
})
export class PersonRolodexCardComponent implements OnChanges {
	@Input() personRolodexObject;
	@Output() ShowElasticResults: EventEmitter<any> = new EventEmitter<any>();

	selectedContactMember: any = {};

	constructor() { }

	ngOnChanges() {
		this.fetchPersonRolodexDetails();
	}

	fetchPersonRolodexDetails() {
		this.selectedContactMember.fullName = this.personRolodexObject.full_name || this.personRolodexObject.fullName;
		if (this.personRolodexObject.organizations) {
			this.selectedContactMember.organization = this.personRolodexObject.organizations.organizationName || null;
		} else if (this.personRolodexObject.organizationName) {
			this.selectedContactMember.organization = this.personRolodexObject.organizationName || null;
		} else {
			this.selectedContactMember.organization = this.personRolodexObject.organization || null;
		}
		this.selectedContactMember.designation = this.personRolodexObject.primary_title || this.personRolodexObject.designation;
		this.selectedContactMember.email = this.personRolodexObject.email_addr || this.personRolodexObject.email_address ||
			this.personRolodexObject.emailAddress;
		this.selectedContactMember.unit_name = this.personRolodexObject.unit_name || null;
		this.selectedContactMember.phoneNumber = this.personRolodexObject.phone_nbr || this.personRolodexObject.phone_number ||
			this.personRolodexObject.phoneNumber;
		this.selectedContactMember.isEmployee = this.personRolodexObject.prncpl_id ? true : false;
		this.selectedContactMember.isExternalUser = this.personRolodexObject.external === 'Y' ? true : false;
		this.selectedContactMember.createUser = this.personRolodexObject.create_user || this.personRolodexObject.createUserFullName ||
		this.personRolodexObject.createUser;
		this.selectedContactMember.address = this.personRolodexObject.address || this.getFullAddress(this.personRolodexObject) || null;
	}

	emitShowElasticResult() {
		this.ShowElasticResults.emit({ 'isShowElasticResults': false });
	}

	getFullAddress(data: any) {
		let fullAddress;
		if (data.addressLine1) {
			fullAddress = data.addressLine1;
		}
		if (data.addressLine2) {
			fullAddress = fullAddress ? fullAddress + ', ' + data.addressLine2 : data.addressLine2;
		}
		if (data.addressLine3) {
			fullAddress = fullAddress ? fullAddress + ', ' + data.addressLine3 : data.addressLine3;
		}
		return fullAddress;
	}
}
