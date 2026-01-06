DELIMITER //
CREATE PROCEDURE `VALIDATE_PROJECT_DISCLOSURE`(
    AV_PERSON_ID varchar(40),
    AV_MODULE_CODE int(3),
    AV_MODULE_ITEM_KEY varchar(40)
)
BEGIN

        IF AV_MODULE_CODE IS NOT NULL AND AV_MODULE_ITEM_KEY IS NOT NULL THEN

            SELECT
                (CASE WHEN t1.EXPIRATION_DATE > CURDATE() THEN false ELSE true END) AS isExpired,
                t1.DISCLOSURE_ID AS projectDisclosure,
                NULL AS fcoiDisclosure
            FROM COI_DISCLOSURE t1
            INNER JOIN COI_DISCL_PROJECTS t2
                ON t2.DISCLOSURE_ID = t1.DISCLOSURE_ID
            WHERE
                t2.MODULE_CODE = AV_MODULE_CODE
                AND t2.MODULE_ITEM_KEY = AV_MODULE_ITEM_KEY
                AND t1.PERSON_ID = AV_PERSON_ID
                AND t1.VERSION_STATUS = 'PENDING'
                AND t1.FCOI_TYPE_CODE = 2
                AND t1.DISPOSITION_STATUS_CODE != 2;

        ELSE
            SELECT
                (CASE WHEN t1.EXPIRATION_DATE > CURDATE() THEN false ELSE true END) AS isExpired,
                NULL AS projectDisclosure,
                t1.DISCLOSURE_ID AS fcoiDisclosure
            FROM COI_DISCLOSURE t1
            WHERE
                t1.PERSON_ID = AV_PERSON_ID
                AND (t1.VERSION_STATUS = 'PENDING' OR t1.VERSION_STATUS = 'ACTIVE')
                AND t1.FCOI_TYPE_CODE IN (1, 3);

        END IF;

END
//

