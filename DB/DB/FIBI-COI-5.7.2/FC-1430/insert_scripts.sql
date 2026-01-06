INSERT INTO RIGHTS (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE) 
VALUES ((SELECT A.ID FROM (SELECT MAX(RIGHT_ID) + 1 AS ID FROM RIGHTS ) AS A), 'VIEW_IMPORT_ENTITY', 'To access the Import Entity tab and view the list of import batches in COI application', 'quickstart', now(), '1');

INSERT INTO RIGHTS (RIGHT_ID, RIGHT_NAME, DESCRIPTION, UPDATE_USER, UPDATE_TIMESTAMP, RIGHTS_TYPE_CODE) 
VALUES ((SELECT A.ID FROM (SELECT MAX(RIGHT_ID) + 1 AS ID FROM RIGHTS ) AS A), 'MANAGE_IMPORT_ENTITY', 'To access the Import Entity tab and perform Review and Re-review actions, including bulk actions, within the Import Entity tab', 'quickstart', now(), '1');
