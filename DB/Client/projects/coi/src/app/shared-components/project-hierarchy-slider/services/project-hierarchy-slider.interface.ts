import { SharedProjectDetails } from "../../../common/services/coi-common.interface";

export class ProjectHierarchySliderPayload {
    isOpenSlider: boolean = false;
    projectNumber: string = null;
    projectTypeCode: string | number = null;
}

export class HierarchyProjectTree {
    projectIcon: string = '';
    projectType: string = '';
    projectNumber: string = '';
    projectTypeCode: string = '';
    linkedModule: HierarchyProjectTree[] = []; // Recursive relationship for nested modules
}

export class HierarchyProjectDetails extends SharedProjectDetails {
    projectPersons?: ProjectKeyPerson[] = [];
}

export class ProjectKeyPerson {
    keyPersonId?: string = null;
    keyPersonName?: string = null;
    keyPersonRole?: string = null;
    homeUnitName?: string = null;
    homeUnitNumber?: string = null;
    nonEmployeeFlag?: 'Y' | 'N' | null = null;
    disclosureRequired?: 'Y' | 'N' | null = null;
    disclosures?: HierarchyProjectDisclosure[] = [];
}

export class HierarchyProjectDisclosure {
    disclosureId?: number = null;
    reviewStatus?: string = null;
    disclosureType?: string = null;
    disclosureStatus?: string = null;
    dispositionStatus?: string = null;
    certificationDate?: number = null;
    canOpenDisclosure?: boolean = false;
}
