export interface Activity {
    acType?: string;
    activityTypeCode?: string|number;
    attachmentDataList?: [];
    createDate?: number;
    description?: string;
    endDate?: Date|number|string;
    followupDate?: Date|number|string;
    locationTypeCode?: number|string;
    negotiationId?: number|string;
    negotiationLocationId?: number|string;
    negotiationsActivityId?: number|string;
    negotiationsActivityType?: ActivityTypeCode;
    negotiationsLocation?: number|string;
    negotiationsLocationType?: number|string;
    noOfDays?: number;
    restricted?: number|string;
    startDate?: Date|number|string;
    updateTimestamp?: number;
    updateUser?: string;
    updateUserFullName?: string;
}

export interface ActivityTypeCode {
    activityTypeCode?: string;
    description?: string;
    isActive?: boolean;
    updateTimestamp?: number;
    updateUser?: string;
}
