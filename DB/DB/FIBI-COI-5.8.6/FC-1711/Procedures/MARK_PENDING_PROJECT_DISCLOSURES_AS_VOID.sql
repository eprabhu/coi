DELIMITER //
CREATE PROCEDURE `MARK_PENDING_PROJECT_DISCLOSURES_AS_VOID`(
    IN AV_PERSON_ID   VARCHAR(50),
    IN AV_ACTION_TYPE VARCHAR(3),
    IN AV_MODULE_CODE VARCHAR(3)
)
BEGIN

	DECLARE LS_VOID_REASON TEXT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Start transaction
    START TRANSACTION;

    -- 1. Create TEMP table
    DROP TEMPORARY TABLE IF EXISTS VOID_DISCLOSURES;

    CREATE TEMPORARY TABLE VOID_DISCLOSURES (
        DISCLOSURE_ID      INT,
        DISCLOSURE_NUMBER  INT,
        COI_PROJECT_TYPE   VARCHAR(200),
        PROJECT_TITLE      VARCHAR(1000),
        PROJECT_NUMBER     VARCHAR(20)
    );

    -- Insert matching disclosures
    INSERT INTO VOID_DISCLOSURES (
        DISCLOSURE_ID,
        DISCLOSURE_NUMBER,
        COI_PROJECT_TYPE,
        PROJECT_TITLE,
        PROJECT_NUMBER
    )
    SELECT
        t1.disclosure_id,
        t1.disclosure_number,
        t6.description AS project_type,
        COALESCE(aw.TITLE, p.TITLE, ip.TITLE),
        COALESCE(aw.PROJECT_NUMBER, p.PROPOSAL_NUMBER, ip.PROJECT_NUMBER)
    FROM coi_disclosure t1
    INNER JOIN coi_discl_projects t2 
        ON t2.disclosure_id = t1.disclosure_id
    LEFT JOIN coi_int_stage_dev_proposal p
        ON p.PROPOSAL_NUMBER = t2.MODULE_ITEM_KEY
        AND t2.MODULE_CODE = 3
    LEFT JOIN coi_int_stage_award aw
        ON aw.PROJECT_NUMBER = t2.MODULE_ITEM_KEY
        AND t2.MODULE_CODE = 1
    LEFT JOIN coi_int_stage_proposal ip
        ON ip.PROJECT_NUMBER = t2.MODULE_ITEM_KEY
        AND t2.MODULE_CODE = 2
    INNER JOIN coi_project_type t6 
        ON t6.COI_PROJECT_TYPE_CODE = t1.COI_PROJECT_TYPE_CODE
    WHERE
        t1.person_id = AV_PERSON_ID
        AND t1.fcoi_type_code = 2
        AND t1.REVIEW_STATUS_CODE IN (1, 5, 6)
        AND t1.disposition_status_code != 2
        AND ((AV_MODULE_CODE IS NOT NULL AND t1.coi_project_type_code = AV_MODULE_CODE)
            OR (AV_MODULE_CODE IS NULL 
                AND t1.coi_project_type_code IN (
                    SELECT cpt.COI_PROJECT_TYPE_CODE
                    FROM coi_project_type cpt
                    WHERE cpt.FCOI_NEEDED = 'Y'
                )));

    IF EXISTS(SELECT 1 FROM VOID_DISCLOSURES) THEN
		SET SQL_SAFE_UPDATES = 0;
        -- 2. Update disclosures
        UPDATE coi_disclosure t1
        JOIN VOID_DISCLOSURES t
            ON t.disclosure_id = t1.disclosure_id
        SET 
            t1.version_status = 'ARCHIVE',
            t1.disposition_status_code = 2,
            t1.update_timestamp = UTC_TIMESTAMP(),
            t1.updated_by = AV_PERSON_ID;
    
        -- 3. Update INBOX
        UPDATE INBOX T0
        JOIN VOID_DISCLOSURES t 
            ON t.project_number = t0.MODULE_ITEM_KEY 
        SET 
            T0.OPENED_FLAG = 'E',
            T0.UPDATE_TIMESTAMP = UTC_TIMESTAMP()
        WHERE 
            T0.MESSAGE_TYPE_CODE = 8002
            AND T0.OPENED_FLAG = 'N';
        
        SET SQL_SAFE_UPDATES = 1;

        -- 4. Insert action log
        INSERT INTO disclosure_action_log (
            disclosure_id,
            disclosure_number,
            action_type_code,
            description,
            update_timestamp,
            update_user
        )
        SELECT 
            t1.disclosure_id,
            t1.disclosure_number,
            AV_ACTION_TYPE,
            t2.message,
            UTC_TIMESTAMP(),
            (SELECT user_name FROM person WHERE person_id = AV_PERSON_ID)
        FROM VOID_DISCLOSURES t1
        JOIN disclosure_action_type t2
            ON t2.action_type_code = AV_ACTION_TYPE;

        -- 5. Output results
        SELECT * FROM VOID_DISCLOSURES;

    END IF;

    COMMIT;

END;
//
