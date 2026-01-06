DELIMITER //
CREATE PROCEDURE `GET_COI_PROJECT_SUMMARY`(
    IN LI_MODULE_CODE INT,
    IN LS_PERSON_ID VARCHAR(60),
    IN LS_SEARCH_TEXT VARCHAR(200)
)
BEGIN
    SET LS_SEARCH_TEXT = CONCAT('%', IFNULL(LS_SEARCH_TEXT, ''), '%');

    IF LI_MODULE_CODE = 1 THEN
        SELECT
            IFNULL(a.PROJECT_NUMBER, ''),
            IFNULL(a.TITLE, ''),
            IFNULL(a.LEAD_UNIT_NUMBER, ''),
            IFNULL(a.LEAD_UNIT_NAME, ''),
            IFNULL(a.SPONSOR_CODE, ''),
            IFNULL(a.SPONSOR_NAME, ''),
            IFNULL(a.PRIME_SPONSOR_CODE, ''),
            IFNULL(a.PRIME_SPONSOR_NAME, ''),
            IFNULL(a.PROJECT_STATUS, ''),
            a.PROJECT_START_DATE,
            a.PROJECT_END_DATE,
            IFNULL(a.ACCOUNT_NUMBER, ''),
            'AWARD'
        FROM coi_int_stage_award a
        JOIN coi_int_stage_award_person ap
            ON ap.PROJECT_NUMBER = a.PROJECT_NUMBER
        WHERE ap.KEY_PERSON_ID = LS_PERSON_ID
          AND ap.STATUS = 'A'
          AND (
                a.PROJECT_NUMBER LIKE LS_SEARCH_TEXT OR
                a.TITLE LIKE LS_SEARCH_TEXT OR
                a.LEAD_UNIT_NUMBER LIKE LS_SEARCH_TEXT OR
                a.LEAD_UNIT_NAME LIKE LS_SEARCH_TEXT OR
                a.SPONSOR_CODE LIKE LS_SEARCH_TEXT OR
                a.SPONSOR_NAME LIKE LS_SEARCH_TEXT OR
                a.PRIME_SPONSOR_CODE LIKE LS_SEARCH_TEXT OR
                a.PRIME_SPONSOR_NAME LIKE LS_SEARCH_TEXT OR
                a.ACCOUNT_NUMBER LIKE LS_SEARCH_TEXT
              );

    ELSEIF LI_MODULE_CODE = 3 THEN
        SELECT
            IFNULL(p.PROPOSAL_NUMBER, ''),
            IFNULL(p.TITLE, ''),
            IFNULL(p.LEAD_UNIT, ''),
            IFNULL(p.LEAD_UNIT_NAME, ''),
            IFNULL(p.SPONSOR_CODE, ''),
            IFNULL(p.SPONSOR, ''),
            IFNULL(p.PRIME_SPONSOR_CODE, ''),
            IFNULL(p.PRIME_SPONSOR, ''),
            IFNULL(p.PROPOSAL_STATUS, ''),
            p.PROPOSAL_START_DATE,
            p.PROPOSAL_END_DATE,
            CAST(NULL AS CHAR(100)),
            'PROPOSAL'
        FROM coi_int_stage_dev_proposal p
        JOIN coi_int_stage_dev_proposal_person pp
            ON pp.PROPOSAL_NUMBER = p.PROPOSAL_NUMBER
        WHERE pp.KEY_PERSON_ID = LS_PERSON_ID
          AND pp.STATUS = 'A'
          AND (
                p.PROPOSAL_NUMBER LIKE LS_SEARCH_TEXT OR
                p.TITLE LIKE LS_SEARCH_TEXT OR
                p.LEAD_UNIT LIKE LS_SEARCH_TEXT OR
                p.LEAD_UNIT_NAME LIKE LS_SEARCH_TEXT OR
                p.SPONSOR_CODE LIKE LS_SEARCH_TEXT OR
                p.SPONSOR LIKE LS_SEARCH_TEXT OR
                p.PRIME_SPONSOR_CODE LIKE LS_SEARCH_TEXT OR
                p.PRIME_SPONSOR LIKE LS_SEARCH_TEXT
              );

    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Unsupported module code';
    END IF;

END
//
