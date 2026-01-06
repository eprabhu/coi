export class DegreeRequestObject {
    personId = '';
    degreeCode = '';
    degreeType: DegreeType;
    degree = '';
    fieldOfStudy = '';
    specialization = '';
    school = '';
    graduationDate = '';
}

interface DegreeType {
    degreeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    fieldOfStudy: string;
    graduationDate: string;
}
