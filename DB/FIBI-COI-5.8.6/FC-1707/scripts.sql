
UPDATE notification_type 
SET 
    SUBJECT = 'MFTRP Review Required for {DECLARATION_DETAIL#REPORTER_NAME}',
    MESSAGE = '<p>Hello Admins,</p><p>A new MFTRP certification has been submitted and is awaiting your review:</p><p><strong>PI Name:</strong> {DECLARATION_DETAIL#REPORTER_NAME}</p><p><strong>Submission Date:</strong> {DECLARATION_DETAIL#CERTIFICATION_DATE}</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><span style="background-color:rgb(255,255,255);color:rgb(41,42,46);">Please complete your review in the </span><a href="{DECLARATION_URL#DECLARATION_URL}">MyCOI-OPA+</a> tool.</p><p>Thank you.</p><p> </p><p>Note: This is a system-generated email. Please do not reply to this email.</p>'
WHERE
    (NOTIFICATION_TYPE_ID = '8101');

UPDATE notification_type 
SET 
    SUBJECT = 'MFTRP Review Completed - Approved for {DECLARATION_DETAIL#REPORTER_NAME}',
    MESSAGE = '<p>Dear {DECLARATION_DETAIL#REPORTER_NAME},</p><p>Your MFTRP certification submission has been reviewed and approved.</p><p>Please find the key details below:</p><p><strong>Department:</strong> {DECLARATION_DETAIL#DEPARTMENT_NUMBER} - {DECLARATION_DETAIL#DEPARTMENT_NAME}</p><p><strong>Expiration Date:</strong> {DECLARATION_DETAIL#EXPIRATION_DATE}</p><p><strong>Declaration Status:</strong> {DECLARATION_DETAIL#DECLARATION_STATUS}</p><p>You can access your MFTRP certifications via the <a href="{DECLARATION_URL#DECLARATION_URL}">MyCOI-OPA+</a> tool.</p><p>Thank you.</p><p>Note: This is a system-generated email. Please do not reply to this email.</p>'
WHERE
    (NOTIFICATION_TYPE_ID = '8115');

DELETE FROM notification_recipient 
WHERE
    NOTIFICATION_TYPE_ID = '8115'
    AND ROLE_TYPE_CODE = '8066'
    AND RECIPIENT_TYPE = 'CC'
    AND RECIPIENT_NAME = 'Declaration Administrators';
