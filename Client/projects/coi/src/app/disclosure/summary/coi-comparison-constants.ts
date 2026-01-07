export interface Section {
    reviewSectionCode: number;
    reviewSectionDescription: string;
    documentId: string;
    subSectionCode?: string;
    isShowProjectList?: boolean;
    isExpanded?: boolean;
}

export const COISection: Array<Section> = [
    { reviewSectionCode: 801, reviewSectionDescription: 'Screening Questionnaire', documentId: 'COI801' },
    { reviewSectionCode: 802, reviewSectionDescription: 'Engagements', documentId: 'COI802' },
    { reviewSectionCode: 803, reviewSectionDescription: 'Relationship', documentId: 'COI803', isShowProjectList: true, isExpanded: true },
    { reviewSectionCode: 804, reviewSectionDescription: 'Certify', documentId: 'COI804' }
];
