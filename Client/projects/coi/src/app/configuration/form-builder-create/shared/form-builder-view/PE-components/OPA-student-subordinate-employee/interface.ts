
export class StudentSubordinateEmployee {
    opaDisclosureId: number;
    opaPersonTypeCode: number = null;
    personId: string;
    personEntityId: number;
    natureOfWork: string;
    relationWithPerson: string;
    numOfDays: number;
    actionType: string;
    numOfDaysSummer: any;
    numOfDaysAcademic: any;
    numOfDaysInYear: any;
}

export class StudentSubordinatePE {
    actionType: string;
    data: Array<StudentSubordinateEmployee>;
}
