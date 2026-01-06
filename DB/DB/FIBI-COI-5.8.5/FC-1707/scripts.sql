UPDATE `notification_type` SET `SENT_TO_INITIATOR` = 'N' WHERE (`NOTIFICATION_TYPE_ID` = '8105');
UPDATE `notification_type`
SET `SENT_TO_INITIATOR` = 'N',
    `SUBJECT` = 'Action required: You are assigned as an Administrator for the Declaration Submitted by {DECLARATION_DETAIL#REPORTER_NAME}.'
WHERE `NOTIFICATION_TYPE_ID` = '8107';
