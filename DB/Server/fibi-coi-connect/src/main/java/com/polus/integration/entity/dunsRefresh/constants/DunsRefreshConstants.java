package com.polus.integration.entity.dunsRefresh.constants;

public interface DunsRefreshConstants {

    String REFRESH_TYPE_UPDATE = "UPDATE";
    String ACTIVE = "ACTIVE";
    String PENDING = "PENDING";
    Integer LANGUAGE_DNBCODE_ENGLISH = 331;

    //REFRESH STATUSES
    String REFRESH_STATUS_PENDING = "1";
    String REFRESH_STATUS_COMPLETED = "2";
    String REFRESH_STATUS_ERROR = "3";
    String REFRESH_STATUS_NO_CHANGE_DETECTED = "4";

    //REFRESH TYPES
    String REFRESH_TYPE_CODE_UPDATE = "1";
    String REFRESH_TYPE_CODE_DELETE = "2";
    String REFRESH_TYPE_CODE_ENTER = "3";
    String REFRESH_TYPE_CODE_EXIT = "4";
    String REFRESH_TYPE_CODE_REVIEWED = "5";
    String REFRESH_TYPE_CODE_SEED = "6";
    String REFRESH_TYPE_CODE_TRANSFER = "7";
    String REFRESH_TYPE_CODE_UNDELETE = "8";
    String REFRESH_TYPE_CODE_UNDER_REVIEW = "9";
    String REFRESH_TYPE_CODE_UNIDENTIFIED = "10";
}
