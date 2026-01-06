import { Injectable } from '@angular/core';
import { PersonDetails } from './common/role-maintenance';

@Injectable()

export class RoleMaintainanceService {

	editPersonDetails: PersonDetails = new PersonDetails();
	assignPersonDetails: PersonDetails = new PersonDetails();
	editUnitDetails: any = {};
	assignUnitDetails: any = {};
	tempAssignUnitDetails: any = {};
	tempAssignPersonDetails: PersonDetails = new PersonDetails();
	isPersonChangedAndSearched = false;
	isUnitChangedAndSearched = false;
	isSearchClicked = false;

	constructor() { }
}
