export interface SponsorHierarchyList {
    sponsorGroupId: number;
    sponsorGroupName: string;
    sponsorOriginatingGroupId?: number;
    sponsorRootGroupId?: string;
    sponsorCode?: number;
    sponsor?: string;
    childSponsorHierarchies?: ChildSponsorHierarchy[];
    orderNumber: number;
    createTimestamp: number|Date;
    createUser: string;
    updateTimestamp: number|Date;
    updateUser: string;
    emptyGroup: boolean;
    visible: boolean;
    isAddGroup: boolean;
    isEditMode: boolean;
}

export interface Sponsor {
    sponsorCode: string;
    sponsorName: string;
    sponsorTypeCode: string;
    active: boolean;
    acronym: string;
    unitNumber: string;
}

export interface ChildSponsorHierarchy2 {
    sponsorGroupId: number;
    sponsorGroupName: string;
    sponsorOriginatingGroupId: number;
    sponsorRootGroupId: number;
    sponsorCode: string;
    sponsor: Sponsor;
    childSponsorHierarchies?: string;
    orderNumber: number;
    createTimestamp: number|Date;
    createUser: string;
    updateTimestamp: number|Date;
    updateUser: string;
}

export interface ChildSponsorHierarchy {
    sponsorGroupId: number;
    sponsorGroupName: string;
    sponsorOriginatingGroupId: number;
    sponsorRootGroupId: number;
    sponsorCode?: number;
    sponsor?: Sponsor;
    childSponsorHierarchies: ChildSponsorHierarchy2[];
    orderNumber: number;
    createTimestamp: number|Date;
    createUser: string;
    updateTimestamp: number|Date;
    updateUser: string;
}

export interface RootObject {
    sponsorGroupId: number;
    sponsorGroupName: string;
    sponsorOriginatingGroupId?: number;
    sponsorRootGroupId?: number;
    sponsorCode?: number;
    sponsor?: string;
    childSponsorHierarchies: ChildSponsorHierarchy[];
    orderNumber: number;
    createTimestamp: number|Date;
    createUser: string;
    updateTimestamp: number|Date;
    updateUser: string;
}

export type SelectOrDeleteEvent = 'select' | 'delete' | 'update'| 'append' | 'refresh';
