SET SQL_SAFE_UPDATES = 0;

UPDATE `notification_type` SET `MESSAGE` = '<p>Dear Reviewer,</p><p>Your assigned {COI_DISCL_REVIEW#REVIEW_LOCATION} Review for<strong> COI Annual Disclosure </strong>submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME} </strong>was completed by <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong>.</p><p>No more action required from your side</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://mycoi-opa-dev.mit.edu/fibi-core/%7BCOI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p><p>  </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8081');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {TRAVEL_OTHER#ADMINISTRATOR_NAME},</p><p>The Travel Administrator <strong>{TRAVEL_OTHER#ADMIN_ASSIGNED_BY}</strong> removed you as a Administrator for the Travel Disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>by <strong>{TRAVEL_DETAILS#REPORTER_NAME}</strong>.</p><p>You are no longer responsible for reviewing this disclosure.</p><p><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Please find the details below:</span></p><p><strong>Department </strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8050');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {TRAVEL_OTHER#ADMIN_ASSIGNED_TO},</p><p>Travel Administrator <strong>{TRAVEL_OTHER#ADMIN_ASSIGNED_BY}</strong> assigned you as the Administrator of the Travel Disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>by <strong>{TRAVEL_DETAILS#REPORTER_NAME}.</strong></p><p>Please find the details below:</p><p><strong>Department</strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8049');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello Admins,</p><p>The assigned review for the COI Annual Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> by <strong>{COI_DISCLOSURE#REPORTER_NAME} </strong>has been completed by administrator <strong>{OPA_OTHER#ADMINISTRATOR_NAME}.</strong></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Location:</strong> {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8018');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello COI Admin,</p><p>COI Reviewer <strong>{COI_DISCL_REVIEW#REVIEWER_NAME}</strong> has completed the review of the COI Annual Disclosure submitted on <span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong></span><span style=\"color:hsl(0,0%,0%);\"><strong> </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Location:</strong> {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8017');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello Reviewer,</span></p><p><span style=\"color:hsl(0,0%,0%);\">COI Administrator <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong> assigned you to review the COI Annual Disclosure submitted on </span><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong></span><span style=\"color:hsl(0,0%,0%);\"> by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Location:</strong> {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8016');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello {COI_DISCL_OTHER#ADMIN_ASSIGNED_TO},</span></p><p><span style=\"color:hsl(0,0%,0%);\">The COI Administrator <strong>{COI_DISCL_OTHER#ADMIN_ASSIGNED_BY}</strong> assigned you as the Administrator of the COI Annual Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p><span style=\"color:hsl(0,0%,0%);\">Details are given below:</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8012');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello {COI_DISCLOSURE#ADMINISTRATOR_NAME},</span></p><p><span style=\"color:hsl(0,0%,0%);\">COI Administrator removed you as a Administrator for the COI Annual Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8005');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello {COI_DISCL_OTHER#ADMIN_ASSIGNED_TO},</span></p><p><span style=\"color:hsl(0,0%,0%);\">The COI Administrator <strong>{COI_DISCL_OTHER#ADMIN_ASSIGNED_BY} </strong>assigned you as the Administrator of the COI Annual Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong>.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Details are given below:</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8004');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear Admins,</p><p><span style=\"color:hsl(0,0%,0%);\">A COI Annual Disclosure was submitted by <strong>{COI_DISCLOSURE#REPORTER_NAME} </strong>on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> is Recalled for the following reason “<strong>{COI_DISCL_OTHER#WITHDRAWAL_REASON}</strong>”</span></p><p><span style=\"color:hsl(0,0%,0%);\">Details are given below:</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Disclosure Status</strong>: {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8001');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear Admins,</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\">A COI Annual Disclosure was submitted by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong> on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}.</strong></span></p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8000');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required - Resubmitted COI Annual Disclosure ' WHERE (`NOTIFICATION_TYPE_ID` = '8027');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required: COI Annual Disclosure Submitted by  {COI_DISCLOSURE#REPORTER_NAME} has been returned by the admin {COI_DISCLOSURE#ADMINISTRATOR_NAME} ' WHERE (`NOTIFICATION_TYPE_ID` = '8002');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hi,</p><p>Your Travel Disclosures Reimbursed cost limit is exceeded against engagement {TRAVEL_OTHER#ENGAGEMENT_NAME}. Please create or revise COI Annual Disclosure.</p><p>No. of Travels : {TRAVEL_OTHER#NO_OF_TRAVELS}</p><p>Total Reimbursed cost : {TRAVEL_OTHER#TOTAL_REIMBURSED_COST}</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p> </p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span> </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8044');
UPDATE `notification_type` SET `MESSAGE` = '<p>A Travel Disclosure was submitted by <strong>{TRAVEL_DETAILS#REPORTER_NAME}</strong> on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE}</strong>. </p><p>Please find the details below:</p><p><strong>Department</strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date:</strong> {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8046');
UPDATE `notification_type` SET `MESSAGE` = '<p>A Travel Disclosure was submitted by {TRAVEL_DETAILS#REPORTER_NAME} on {TRAVEL_DETAILS#CERTIFICATION_DATE} is Recalled for the following reason “{TRAVEL_OTHER#WITHDRAWAL_REASON}”</p><p>Department : {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p>Entity Name: {TRAVEL_DETAILS#ENTITY_NAME}</p><p>Travel Start date: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p>Travel End Date: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please follow <a href=\"{TRAVEL_URL#TRAVEL_URL}\">this link</a> to review the application.</p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8047');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {TRAVEL_DETAILS#REPORTER_NAME},</p><p>Your Travel disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>was returned for the following reason: {TRAVEL_OTHER#RETURN_REASON}.</p><p><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Please find the details below:</span></p><p><strong>Department </strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8048');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {TRAVEL_OTHER#ADMIN_ASSIGNED_TO},</p><p>Travel Administrator <strong>{TRAVEL_OTHER#ADMIN_ASSIGNED_BY}</strong> assigned you as the Administrator of the Travel Disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>by <strong>{TRAVEL_DETAILS#REPORTER_NAME}.</strong></p><p>Please find the details below:</p><p><strong>Department</strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8049');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {TRAVEL_OTHER#ADMINISTRATOR_NAME},</p><p>The Travel Administrator <strong>{TRAVEL_OTHER#ADMIN_ASSIGNED_BY}</strong> removed you as a Administrator for the Travel Disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>by <strong>{TRAVEL_DETAILS#REPORTER_NAME}</strong>.</p><p>You are no longer responsible for reviewing this disclosure.</p><p><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Please find the details below:</span></p><p><strong>Department </strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8050');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {TRAVEL_OTHER#ADMIN_ASSIGNED_TO},</p><p>Travel Administrator <strong>{TRAVEL_OTHER#ADMIN_ASSIGNED_BY}</strong> assigned you as the Administrator of the Travel Disclosure submitted on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>by <strong>{TRAVEL_DETAILS#REPORTER_NAME}.</strong></p><p><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Please find the details below:</span></p><p><strong>Department </strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8051');
UPDATE `notification_type` SET `MESSAGE` = '<p>A Travel Disclosure previously withdrawn has been resubmitted by<strong> {TRAVEL_DETAILS#REPORTER_NAME}</strong> on <strong>{TRAVEL_DETAILS#CERTIFICATION_DATE} </strong>and is now awaiting your review.</p><p><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Please find the details below:</span></p><p><strong>Department </strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date</strong>: {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email. </p>' WHERE (`NOTIFICATION_TYPE_ID` = '8057');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {OPA_DETAILS#REPORTER_NAME},</p><p>Your OPA disclosure submitted on {OPA_DETAILS#CERTIFICATION_DATE} has been returned for the following reason:<br><strong>“{OPA_OTHER#RETURN_REASON}”</strong>.</p><p>Please take the necessary action as required.</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8067');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {OPA_OTHER#ADMINISTRATOR_NAME},</p><p>The OPA Administrator {OPA_OTHER#ADMIN_ASSIGNED_BY} removed you as an Administrator for the OPA Disclosure submitted on {OPA_DETAILS#CERTIFICATION_DATE} by {OPA_DETAILS#REPORTER_NAME}.</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>You are no longer responsible for reviewing this disclosure.</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8070');
UPDATE `notification_type` SET `MESSAGE` = '<p>Your OPA disclosure has been <strong>rejected</strong> by <strong>{OPA_OTHER#ADMINISTRATOR_NAME}</strong> at the <strong>{OPA_OTHER#APPROVER_STOP_NAME}</strong> stop for the following reason:</p><p><i>\"{OPA_OTHER#WORKFLOW_COMMENT}\"</i></p><p>Please find the key details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} – {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status:</strong> {OPA_DETAILS#DISPOSITION_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8072');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {OPA_DETAILS#REPORTER_NAME},</p><p>Your OPA disclosure submitted on <strong>{OPA_DETAILS#CERTIFICATION_DATE}</strong> has been <strong>approved</strong> by <strong>{OPA_OTHER#ADMINISTRATOR_NAME}</strong>.<br>Please find the key details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Expiration Date:</strong> {OPA_DETAILS#EXPIRATION_DATE}</p><p><strong>Disclosure Status:</strong> {OPA_DETAILS#DISPOSITION_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8074');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello Reviewer,</p><p>OPA Administrator <strong>{OPA_OTHER#ADMINISTRATOR_NAME}</strong> has assigned you to review the OPA disclosure submitted by <strong>{OPA_DETAILS#REPORTER_NAME}</strong> on <strong>{OPA_DETAILS#CERTIFICATION_DATE}</strong>. Please find the details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} – {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status:</strong> {OPA_DETAILS#DISPOSITION_STATUS}</p><p><strong>Review Location:</strong> {OPA_DISCL_REVIEW#REVIEW_LOCATION}</p><p><strong>Review Status:</strong> {OPA_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8075');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {OPA_DETAILS#PRIMARY_ADMINISTRATOR_NAME},</p><p>The OPA Reviewer, <strong>{OPA_OTHER#REVIEWER_NAME}</strong>, has completed the review of the OPA Disclosure submitted by <strong>{OPA_DETAILS#REPORTER_NAME}</strong> on <strong>{OPA_DETAILS#CERTIFICATION_DATE}</strong>. Please find the details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} – {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status:</strong> {OPA_DETAILS#DISPOSITION_STATUS}</p><p><strong>Review Location:</strong> {OPA_DISCL_REVIEW#REVIEW_LOCATION}</p><p><strong>Review Status:</strong> {OPA_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8076');
UPDATE `notification_type` SET `MESSAGE` = '<p style=\"margin-left:0px;\">Dear {OPA_DETAILS#REPORTER_NAME},</p><p style=\"margin-left:0px;\"><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">Your Master OPA disclosure has reached its expiration date. Please review and submit your revised disclosure if needed. Below are the details of the expired or pending revised disclosure:</span></p><p style=\"margin-left:0px;\"><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p style=\"margin-left:0px;\"><strong>Certification Date:</strong> <span style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\">{OPA_DETAILS#CERTIFICATION_DATE}</span></p><p style=\"margin-left:0px;\"><strong>Expiration Date:</strong> <span style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\">{OPA_DETAILS#EXPIRATION_DATE}</span></p><p style=\"margin-left:0px;\"><strong>Disposition Status</strong>: {OPA_DETAILS#DISPOSITION_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8078');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello Admins,</p><p>The assigned review for the OPA Disclosure submitted on <strong>{OPA_DETAILS#CERTIFICATION_DATE}</strong> by <strong>{OPA_DETAILS#REPORTER_NAME}</strong> has been completed by administrator <strong>{OPA_OTHER#ADMINISTRATOR_NAME}</strong>.</p><p>Please find the details below:</p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} – {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status:</strong> {OPA_DETAILS#DISPOSITION_STATUS}</p><p><strong>Review Location:</strong> {OPA_DISCL_REVIEW#REVIEW_LOCATION}</p><p><strong>Review Status:</strong> {OPA_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8082');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear Reviewer,</p><p>Your assigned <strong>{OPA_OTHER#REVIEW_LOCATION}</strong> review for the OPA Disclosure submitted on <strong>{OPA_DETAILS#CERTIFICATION_DATE}</strong> by <strong>{OPA_DETAILS#REPORTER_NAME}</strong> has been completed by <strong>{OPA_OTHER#ADMINISTRATOR_NAME}</strong>.</p><p>No further action is required from your side.</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8084');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello Admin,</span></p><p><span style=\"color:hsl(0,0%,0%);\">On {OPA_DISCL_REVIEW#REVIEW_ASSIGNED_DATE}, COI Administrator {OPA_OTHER#ADMINISTRATOR_NAME} assigned you to review the OPA Disclosure submitted on </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">{OPA_DETAILS#CERTIFICATION_DATE}</span><span style=\"color:hsl(0,0%,0%);\"> by {OPA_DETAILS#REPORTER_NAME}.</span></p><p><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} – {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p><strong>Disclosure Status</strong>: {OPA_DETAILS#DISPOSITION_STATUS}</p><p><strong>Review Location</strong>: {OPA_DISCL_REVIEW#REVIEW_LOCATION}</p><p><strong>Review Status</strong>: {OPA_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8086');
UPDATE  `notification_type` SET `SUBJECT` = 'Action Required :Travel Disclosure Resubmitted for Review. ' WHERE (`NOTIFICATION_TYPE_ID` = '8057');
UPDATE  `notification_type` SET `SUBJECT` = 'Action Required: OPA Disclosure Submitted by you has been returned by the admin {OPA_OTHER#ADMINISTRATOR_NAME} ' WHERE (`NOTIFICATION_TYPE_ID` = '8067');
UPDATE  `notification_type` SET `SUBJECT` = 'Your OPA Disclosure Has Been Approved. ' WHERE (`NOTIFICATION_TYPE_ID` = '8074');
UPDATE  `notification_type` SET `SUBJECT` = 'Action required: OPA disclosure Submitted by {OPA_DETAILS#REPORTER_NAME} waiting for your review at {OPA_DISCL_REVIEW#REVIEW_LOCATION} location. ' WHERE (`NOTIFICATION_TYPE_ID` = '8075');
UPDATE  `notification_type` SET `SUBJECT` = 'Review Completed – No Further Action Required ' WHERE (`NOTIFICATION_TYPE_ID` = '8084');
UPDATE `notification_type` SET `SUBJECT` = 'FYI: Assigned Review Completed by Admin {OPA_OTHER#ADMINISTRATOR_NAME} for OPA Disclosure Submitted by {OPA_DETAILS#REPORTER_NAME}.' WHERE (`NOTIFICATION_TYPE_ID` = '8082');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required: OPA Disclosure Submitted by {OPA_DETAILS#REPORTER_NAME} is Awaiting Review at {OPA_DISCL_REVIEW#REVIEW_LOCATION}.' WHERE (`NOTIFICATION_TYPE_ID` = '8086');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required: Approval for OPA Disclosure at {OPA_OTHER#APPROVER_STOP_NAME} stop. ', `MESSAGE` = '<p>Dear Reviewer,</p><p>The following OPA Disclosure has been submitted for approval. Please find the details below:</p><p><strong>Submitted by</strong>: {OPA_DETAILS#REPORTER_NAME}</p><p><strong>Department</strong>: {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8062');
UPDATE `notification_type` SET `SUBJECT` = 'Action required: Approval for OPA Disclosure Submitted by {OPA_DETAILS#REPORTER_NAME}. ', `MESSAGE` = '<p>Hello Admins,</p><p style=\"margin-left:0px;\">A OPA Disclosure has been submitted for your review:</p><p style=\"margin-left:0px;\"><strong>Submitted By:</strong> {OPA_DETAILS#REPORTER_NAME}</p><p style=\"margin-left:0px;\"><strong>Submission Date:</strong> {OPA_DETAILS#CERTIFICATION_DATE}</p><p style=\"margin-left:0px;\"><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8063');
UPDATE `notification_type` SET `SUBJECT` = 'Recall of OPA Disclosure Submitted by {OPA_DETAILS#REPORTER_NAME}. ', `MESSAGE` = '<p>A OPA Disclosure was submitted by {OPA_DETAILS#REPORTER_NAME} on {OPA_DETAILS#CERTIFICATION_DATE} is Recalled for the following reason: <strong>“{OPA_OTHER#WITHDRAWAL_REASON}”</strong></p><p><strong>Department</strong>: {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>Please go to<strong> </strong><a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8064');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required - Resubmitted OPA Disclosure (Previously Recalled) ', `MESSAGE` = '<p>Hello Admins,</p><p style=\"margin-left:0px;\"><span style=\"background-color:rgb(255,255,255);color:rgb(64,64,64);\">An OPA Disclosure that was previously Recalled has been resubmitted for your review:</span></p><p style=\"margin-left:0px;\"><strong>Submitted By:</strong> {OPA_DETAILS#REPORTER_NAME}</p><p style=\"margin-left:0px;\"><strong>Submission Date:</strong> {OPA_DETAILS#CERTIFICATION_DATE}</p><p style=\"margin-left:0px;\"><strong>Department:</strong> {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8065');
UPDATE `notification_type` SET `SUBJECT` = 'OPA has been bypassed at {OPA_OTHER#APPROVER_STOP_NAME} stop. ', `MESSAGE` = '<p>Dear Reviewer,</p><p>Your assigned OPA was bypassed by {OPA_OTHER#WORKFLOW_ACTION_USER_NAME} for the following reason <strong>“{OPA_OTHER#WORKFLOW_COMMENT}”</strong>. Therefore, no further action is required from your side. Please find the disclosure details below:</p><p><strong>Submitted by</strong>: {OPA_DETAILS#REPORTER_NAME}</p><p><strong>Department</strong>: {OPA_DETAILS#HR_ORG_UNIT_NUMBER} - {OPA_DETAILS#HR_ORG_UNIT_NAME}</p><p>Please go to <a href=\"{OPA_URL#OPA_URL}\"><strong>this link</strong></a> to view the details.</p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8073');

UPDATE `notification_type` SET `MESSAGE` = '<p style=\"margin-left:0px;\">Dear COI Admin ,CA</p><p style=\"margin-left:0px;\">All key personnel for <strong>{COI_DISCLOSURE#PROJECT_NUMBER}</strong> - <strong>{COI_DISCLOSURE#PROJECT_TITLE} </strong>have submitted their disclosures.</p><p style=\"margin-left:0px;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p style=\"margin-left:0px;\"><strong>Project </strong>: {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p style=\"margin-left:0px;\">Details are given below:</p><p style=\"margin-left:0px;\"><strong>Principal Investigator</strong> : {COI_DISCLOSURE#PRINCIPAL_INVESTIGATOR}</p><p style=\"margin-left:0px;\"><strong>Submission Status</strong> : {COI_DISCL_OTHER#PROJECT_SUBMISSION_STATUS}</p><p style=\"margin-left:0px;\"><strong>Overall Review Status</strong> : {COI_DISCL_OTHER#PROJECT_OVERALL_REVIEW_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{PROJ_DASHBOARD_URL#PROJ_DASHBOARD_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8059');
UPDATE `notification_type` SET `MESSAGE` = '<p style=\"margin-left:0px;\">Dear CA,</p><p>The COI Admin has completed the review for all key persons\' disclosures associated with <strong>{COI_DISCLOSURE#PROJECT_NUMBER}</strong> - <strong>{COI_DISCLOSURE#PROJECT_TITLE}</strong>.</p><p>Details are given below:</p><p style=\"margin-left:0px;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p style=\"margin-left:0px;\"><strong>Project</strong> : {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p style=\"margin-left:0px;\"><strong>Principal Investigator</strong> : {COI_DISCLOSURE#PRINCIPAL_INVESTIGATOR}</p><p style=\"margin-left:0px;\"><strong>Overall Review Status</strong> : {COI_DISCL_OTHER#PROJECT_OVERALL_REVIEW_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{PROJ_DASHBOARD_URL#PROJ_DASHBOARD_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8060');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Dear Admin,</span></p><p><span style=\"color:hsl(0,0%,0%);\">On <strong>{COI_DISCL_REVIEW#REVIEW_ASSIGNED_DATE}</strong>, COI Administrator <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong> assigned you to review the Project Disclosure submitted on </span><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong></span><span style=\"color:hsl(0,0%,0%);\"> by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8085');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:hsl(0,0%,0%);\">Hello Reviewer,</span></p><p><span style=\"color:hsl(0,0%,0%);\">On <strong>{COI_DISCL_REVIEW#REVIEW_ASSIGNED_DATE}</strong>, COI Administrator <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME} </strong>assigned you to review the FCOI Disclosure submitted on </span><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong></span><span style=\"color:hsl(0,0%,0%);\"> by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Department</strong>: </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">{COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Disclosure Status</strong>: </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">{COI_DISCLOSURE#DISCLOSURE_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:hsl(0,0%,0%);\"><strong>Review Status</strong>: {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>' WHERE (`NOTIFICATION_TYPE_ID` = '8087');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"color:rgb(0,0,0);\">Hello,</span></p><p><span style=\"color:rgb(0,0,0);\">COI Administrator <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong> assigned you to review the Project Disclosure submitted on </span><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong><span style=\"color:rgb(0,0,0);\"> by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8032');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Dear {COI_DISCLOSURE#REPORTER_NAME},</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Your Project disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>was returned for the following reason <strong>“{COI_DISCL_OTHER#RETURN_REASON}”</strong>.</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Details are given below:</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Thank you.</span><br> </p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Note: This is a system-generated email. Please do not reply to this email.</span></p>' WHERE (`NOTIFICATION_TYPE_ID` = '8009');
UPDATE `notification_type` SET `MESSAGE` = '<p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Hello COI Admin,</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">A Project Disclosure was resubmitted by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong> on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}.</strong></span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Details are given below:</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://mycoi-opa-dev.mit.edu/fibi-core/%7BCOI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Thank you.</span><br><br> </p><p><span style=\"font-family:\'Times New Roman\', Times, serif;\">Note: This is a system-generated email. Please do not reply to this email.</span></p>' WHERE (`NOTIFICATION_TYPE_ID` = '8028');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear Reviewer,</p><p>Your assigned {COI_DISCL_REVIEW#REVIEW_LOCATION} Review for<strong> </strong>Project Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong> was completed by <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong>.</p><p>No more action required from your side</p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8083');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME,}</p><p>Your COI annual disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> is approved.</p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location:</strong> {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://mycoi-opa-dev.mit.edu/fibi-core/%7BCOI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8003');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME},</p><p>Your request to Recall the disclosure has been declined for the following</p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://mycoi-opa-dev.mit.edu/fibi-core/%7BCOI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8040');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello Admins,</p><p>A Project Disclosure was submitted by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong> on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE} </strong>is Recalled for the following reason “<strong>{COI_DISCL_OTHER#WITHDRAWAL_REASON}</strong>”</p><p>Details are given below:</p><p style=\"margin-left:0px;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p style=\"margin-left:0px;\"><strong>Project</strong> : {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8008');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello Admins,</p><p>A Project Disclosure was submitted by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong> on<strong> {COI_DISCLOSURE#CERTIFICATION_DATE}.</strong></p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8007');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello COI Admin,</p><p>COI Reviewer <strong>{COI_DISCL_REVIEW#REVIEWER_NAME}</strong> has completed the review of the Project Disclosure submitted on <span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong></span><span style=\"color:hsl(0,0%,0%);\"><strong> </strong>by <strong>{COI_DISCLOSURE#REPORTER_NAME}.</strong></span></p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8033');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello COI Admin</p><p>COI Administrator <strong>{COI_DISCLOSURE#ADMINISTRATOR_NAME}</strong> has completed the review of the Project Disclosure submitted by<strong> {COI_DISCLOSURE#REPORTER_NAME}</strong> on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong>.</p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location</strong>: {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:\'Times New Roman\', Times, serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:\'Times New Roman\', Times, serif;\"> </span><span style=\"font-family:\'Times New Roman\', Times, serif;\">to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8034');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hello {COI_DISCL_OTHER#ADMIN_ASSIGNED_TO},</p><p>COI Administrator<strong> {COI_DISCL_OTHER#ADMIN_ASSIGNED_BY} </strong>assigned you as the Administrator of the Project Disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> by <strong>{COI_DISCLOSURE#REPORTER_NAME}</strong>.</p><p>Details are given below:</p><p><strong>Project:</strong> {COI_DISCLOSURE#PROJECT_TYPE}: {COI_DISCLOSURE#PROJECT_NUMBER} - {COI_DISCLOSURE#PROJECT_TITLE}</p><p><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</p><p><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"font-family:Arial, Helvetica, sans-serif;\">to view the details.</span></p><p>Thank you.<br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8010');
UPDATE `notification_type` SET `MESSAGE` = '<p>Hi Reviewer,</p><p>From the Disclosure of {COI_DISCLOSURE#REPORTER_NAME} submitted on {COI_DISCLOSURE#CERTIFICATION_DATE}, you have been removed from Reviewer.</p><p><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">Please follow</span><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\">this link</span></a><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\"> </span><span style=\"color:hsl(0,0%,0%);font-family:Arial, Helvetica, sans-serif;\">to review the application.</span></p><p><span style=\"color:hsl(0,0%,0%);\">Note: This is a system-generated email. Please do not reply to this email.</span></p>' WHERE (`NOTIFICATION_TYPE_ID` = '8038');

UPDATE `notification_type` SET `SUBJECT` = 'Annual COI Disclosure submitted by you on {COI_DISCLOSURE#CERTIFICATION_DATE} is Approved.' WHERE (`NOTIFICATION_TYPE_ID` = '8003');
UPDATE `notification_type` SET `SUBJECT` = 'Action Required: Project Disclosure Submitted by you has been returned by the admin {COI_DISCLOSURE#ADMINISTRATOR_NAME}' WHERE (`NOTIFICATION_TYPE_ID` = '8009');
UPDATE `notification_type` SET `SUBJECT` = ' You\'ve Been Removed as Reviewer for {COI_DISCLOSURE#REPORTER_NAME}\'s FCOI Disclosure.' WHERE (`NOTIFICATION_TYPE_ID` = '8037');
UPDATE `notification_type` SET `SUBJECT` = ' You\'ve Been Removed as Reviewer for {COI_DISCLOSURE#REPORTER_NAME}\'s Project Disclosure.' WHERE (`NOTIFICATION_TYPE_ID` = '8038');

UPDATE `notification_type` SET `MESSAGE` = '<p>Hi,</p><p>Your Travel Disclosures Reimbursed cost limit is exceeded against engagement <strong>{TRAVEL_OTHER#ENGAGEMENT_NAME}</strong>. Please create or revise COI Annual Disclosure.</p><p>Please find the details below:</p><p><strong>No. of Travels</strong> : {TRAVEL_OTHER#NO_OF_TRAVELS}</p><p><strong>Total Reimbursed cost</strong> : {TRAVEL_OTHER#TOTAL_REIMBURSED_COST}</p><p><strong>Department</strong>: {TRAVEL_DETAILS#DEPARTMENT_NUMBER} - {TRAVEL_DETAILS#DEPARTMENT_NAME}</p><p><strong>Entity Name</strong>: {TRAVEL_DETAILS#ENTITY_NAME}</p><p><strong>Travel Start date</strong>: {TRAVEL_DETAILS#TRAVEL_START_DATE}</p><p><strong>Travel End Date:</strong> {TRAVEL_DETAILS#TRAVEL_END_DATE}</p><p>Please go to <a href=\"{TRAVEL_URL#TRAVEL_URL}\"><strong>this link</strong></a><strong> </strong>to view the details.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8044');
UPDATE `notification_type` SET `MESSAGE` = '<p>Dear {COI_DISCLOSURE#REPORTER_NAME,}</p><p>Your COI annual disclosure submitted on <strong>{COI_DISCLOSURE#CERTIFICATION_DATE}</strong> is approved.</p><p>Details are given below:</p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Department </strong>: {COI_DISCLOSURE#DEPARTMENT_NUMBER} - {COI_DISCLOSURE#DEPARTMENT_NAME}</span></p><p><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>Disclosure Status:</strong> {COI_DISCLOSURE#DISPOSITION_STATUS}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Location:</strong> {COI_DISCL_REVIEW#REVIEW_LOCATION}</span></p><p><span style=\"color:rgb(0,0,0);\"><strong>Review Status:</strong> {COI_DISCL_REVIEW#REVIEWER_REVIEW_STATUS}</span></p><p><span style=\"color:rgb(23,43,77);font-family:Arial, Helvetica, sans-serif;\">Please go to </span><a href=\"{COI_DISCL_URL#DISCLOSURE_URL}\"><span style=\"font-family:Arial, Helvetica, sans-serif;\"><strong>this link</strong></span></a><span style=\"font-family:Arial, Helvetica, sans-serif;\"> to view the details.</span></p><p>Thank you.<br><br> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>' WHERE (`NOTIFICATION_TYPE_ID` = '8003');

SET SQL_SAFE_UPDATES = 1;

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`, 
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8000 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        52 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8000
      AND `ROLE_TYPE_CODE` = 52
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'COI Administrators'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8071 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        66 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'OPA Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8071
      AND `ROLE_TYPE_CODE` = 66
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'OPA Administrators'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8070 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        66 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'OPA Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8070
      AND `ROLE_TYPE_CODE` = 66
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'OPA Administrators'
);

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`, 
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        19 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'PRIMARY_ADMINISTRATOR_NAME' AS QUERY_COLUMN_NAME,
        'Primary Administrator Name' AS LABEL_NAME,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 19
      AND `QUERY_COLUMN_NAME` = 'PRIMARY_ADMINISTRATOR_NAME'
);

DELETE FROM `notification_recipient` 
WHERE `NOTIFICATION_TYPE_ID` IN (8049,8050,8051,8012,8005,8075,8032,8011,8013);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8049 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        61 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
         UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'Travel Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8049
      AND `ROLE_TYPE_CODE` = 61
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'Travel Administrators'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8049 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        63 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
         UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'Travel Primary Administrator' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8049
      AND `ROLE_TYPE_CODE` = 63
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'Travel Primary Administrator'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8050 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        62 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
         UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'Travel Admin Group' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8050
      AND `ROLE_TYPE_CODE` = 62
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'Travel Admin Group'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8051 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        62 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'Travel Admin Group' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8051
      AND `ROLE_TYPE_CODE` = 62
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'Travel Admin Group'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8075 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        69 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'OPA Admin Group' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8075
      AND `ROLE_TYPE_CODE` = 69
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'OPA Admin Group'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8075 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        66 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
       UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'OPA Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8075
      AND `ROLE_TYPE_CODE` = 66
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'OPA Administrators'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8075 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        70 AS ROLE_TYPE_CODE,
        NULL AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'OPA Reviewer' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8075
      AND `ROLE_TYPE_CODE` = 70
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'OPA Reviewer'
);

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`,
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        19 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'HR_ORG_UNIT_NUMBER' AS QUERY_COLUMN_NAME,
        'HR Org Unit Number' AS LABEL_NAME,
         UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 19
      AND `QUERY_COLUMN_NAME` = 'HR_ORG_UNIT_NUMBER'
);

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`,
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        19 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'HR_ORG_UNIT_NAME' AS QUERY_COLUMN_NAME,
        'HR Org Unit Name' AS LABEL_NAME,
         UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 19
      AND `QUERY_COLUMN_NAME` = 'HR_ORG_UNIT_NAME'
);

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`,
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        19 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'PERSON_UNIT_NUMBER' AS QUERY_COLUMN_NAME,
        'Project Unit Number' AS LABEL_NAME,
         UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 19
      AND `QUERY_COLUMN_NAME` = 'PERSON_UNIT_NUMBER'
);

INSERT INTO `notify_placeholder_columns` 
(`NOTIFY_PLACEHOLDER_HEADER_ID`, `QUERY_COLUMN_NAME`, `LABEL_NAME`,
 `UPDATE_TIMESTAMP`, `UPDATE_USER`, `BASE_URL_ID`, `URL_PATH`)
SELECT * FROM (
    SELECT 
        19 AS NOTIFY_PLACEHOLDER_HEADER_ID,
        'PERSON_UNIT_NAME' AS QUERY_COLUMN_NAME,
        'Project Unit Name' AS LABEL_NAME,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        NULL AS BASE_URL_ID,
        NULL AS URL_PATH
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notify_placeholder_columns` 
    WHERE `NOTIFY_PLACEHOLDER_HEADER_ID` = 19
      AND `QUERY_COLUMN_NAME` = 'PERSON_UNIT_NAME'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_USER`,
 `CREATE_TIMESTAMP`, `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8032 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        57 AS ROLE_TYPE_CODE,
        'admin' AS CREATE_USER,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        'admin' AS UPDATE_USER,
        UTC_TIMESTAMP() AS UPDATE_TIMESTAMP,
        'TO' AS RECIPIENT_TYPE,
        'COI Reviewer' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8032
      AND `ROLE_TYPE_CODE` = 57
      AND `RECIPIENT_TYPE` = 'TO'
      AND `RECIPIENT_NAME` = 'COI Reviewer'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_TIMESTAMP`,
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8032 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        54 AS ROLE_TYPE_CODE,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'COI Admin Group' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8032
      AND `ROLE_TYPE_CODE` = 54
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'COI Admin Group'
);

INSERT INTO `notification_recipient` 
(`NOTIFICATION_TYPE_ID`, `RECIPIENT_PERSON_ID`, `ROLE_TYPE_CODE`, `CREATE_TIMESTAMP`,
 `UPDATE_USER`, `UPDATE_TIMESTAMP`, `RECIPIENT_TYPE`, `RECIPIENT_NAME`)
SELECT * FROM (
    SELECT 
        8032 AS NOTIFICATION_TYPE_ID,
        NULL AS RECIPIENT_PERSON_ID,
        52 AS ROLE_TYPE_CODE,
        UTC_TIMESTAMP() AS CREATE_TIMESTAMP,
        NULL AS UPDATE_USER,
        NULL AS UPDATE_TIMESTAMP,
        'CC' AS RECIPIENT_TYPE,
        'COI Administrators' AS RECIPIENT_NAME
) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM `notification_recipient` 
    WHERE `NOTIFICATION_TYPE_ID` = 8032
      AND `ROLE_TYPE_CODE` = 52
      AND `RECIPIENT_TYPE` = 'CC'
      AND `RECIPIENT_NAME` = 'COI Administrators'
);
