SET @SQL := (
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'DYN_ELEMENT_CONFIG'
                  AND COLUMN_NAME = 'INSTRUCTION'
            ) 
            THEN 
                (CASE 
                    WHEN (
                        SELECT CHARACTER_MAXIMUM_LENGTH
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = DATABASE()
                          AND TABLE_NAME = 'DYN_ELEMENT_CONFIG'
                          AND COLUMN_NAME = 'INSTRUCTION'
                    ) < 5000
                    THEN 'ALTER TABLE `DYN_ELEMENT_CONFIG` MODIFY `INSTRUCTION` VARCHAR(5000);'
                    ELSE 'DO 1'
                END)
            ELSE 'DO 1'
        END
);
PREPARE STMT FROM @SQL;
EXECUTE STMT;
DEALLOCATE PREPARE STMT;

INSERT IGNORE INTO DYN_MODULES_CONFIG (MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER)
    VALUES ('CC28', 'Declarations', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO DYN_SECTION_CONFIG (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER)
    VALUES('CC281', 'CC28', 'Declaration Actions', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO DYN_SECTION_CONFIG (SECTION_CODE, MODULE_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) 
    VALUES ('CC282', 'CC28', 'Declaration Info Message', 'Y', UTC_TIMESTAMP(), 'admin');


INSERT IGNORE INTO DYN_SUBSECTION_CONFIG (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER)
    VALUES('281', 'CC281', 'Declaration Actions', 'Y', UTC_TIMESTAMP(), 'admin');

INSERT IGNORE INTO DYN_SUBSECTION_CONFIG (SUB_SECTION_CODE, SECTION_CODE, DESCRIPTION, IS_ACTIVE, UPDATE_TIMESTAMP, UPDATE_USER) 
    VALUES ('282', 'CC282', 'Declaration Info Message', 'Y', UTC_TIMESTAMP(), 'admin');
    

-- print modal
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-print-modal-header-1', 'MFTRP Declaration Print Modal Header', '281', 'CC281', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-print-modal-header-1');

-- submit modal
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-submit-modal-header-1', 'MFTRP Declaration Submit Modal Header', '281', 'CC281', 'You are about to submit MFTRP', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-submit-modal-header-1');

-- return modal
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-return-modal-header-1', 'MFTRP Declaration Return Modal Header', '281', 'CC281', 'You are about to return MFTRP', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-return-modal-header-1');

-- withdraw modal
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-withdraw-modal-header-1', 'MFTRP Declaration Withdraw Modal Header', '281', 'CC281', 'You are about to withdraw MFTRP', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-withdraw-modal-header-1');

-- complete final review modal
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-final-modal-header-1', 'MFTRP Declaration Complete Final Review Modal Header', '281', 'CC281', 'You are about to complete the final review of the MFTRP', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-final-modal-header-1');
    
-- return decription
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-return-modal-desc-1', 'MFTRP Declaration Return Modal Description', '281', 'CC281', 'Please provide the reason for return', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-return-modal-desc-1');

-- withdraw decription
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-withdraw-modal-desc-1', 'MFTRP Declaration Withdraw Modal Description', '281', 'CC281', 'Please provide the reason for withdrawal', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-withdraw-modal-desc-1');

-- complete final review decription
INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, UPDATE_TIMESTAMP, UPDATE_USER)
    SELECT 'decl-final-modal-desc-1', 'MFTRP Declaration Complete Final Review Modal Description', '281', 'CC281', 'Please provide the reason for approval/rejection', UTC_TIMESTAMP(), 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM DYN_ELEMENT_CONFIG WHERE UI_REFERENCE_ID = 'decl-final-modal-desc-1'); 

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, HELP, INSTRUCTION, UPDATE_USER, UPDATE_TIMESTAMP)
    SELECT 'coi-decl-form-info-text-1', 'Declaration Form Info Message', '282', 'CC282', '', 'The term \"malign foreign talent recruitment program\" means: (A) any program, position, or activity that includes compensation in the form of cash, in-kind compensation, including research funding, promised future compensation, complimentary foreign travel, things of non de minimis value, honorific titles, career advancement opportunities, or other types of remuneration or consideration directly provided by a foreign country at any level (national, provincial, or local) or their designee, or an entity based in, funded by, or affiliated with a foreign country, whether or not directly sponsored by the foreign country, to the targeted individual, whether directly or indirectly stated in the arrangement, contract, or other documentation at issue, in exchange for the individual (i) engaging in the unauthorized transfer of intellectual property, materials, data products, or other nonpublic information owned by a United States entity or developed with a Federal research and development award to the government of a foreign country or an entity based in, funded by, or affiliated with a foreign country regardless of whether that government or entity provided support for the development of the intellectual property, materials, or data products; (ii) being required to recruit trainees or researchers to enroll in such program, position, or activity; (iii) establishing a laboratory or company, accepting a faculty position, or undertaking any other employment or appointment in a foreign country or with an entity based in, funded by, or affiliated with a foreign country if such activities are in violation of the standard terms and conditions of a Federal research and development award; (iv) being unable to terminate the foreign talent recruitment program contract or agreement except in extraordinary circumstances; (v) through funding or effort related to the foreign talent recruitment program, being limited in the capacity to carry out a research and development award or required to engage in work that would result in substantial overlap or duplication with a Federal research and development award; (vi) being required to apply for and successfully receive funding from the sponsoring foreign government\'s funding agencies with the sponsoring foreign organization as the recipient; (vii) being required to omit acknowledgment of the recipient institution with which the individual is affiliated, or the Federal research agency sponsoring the research and development award, contrary to the institutional policies or standard terms and conditions of the Federal research and development award; (viii) being required to not disclose to the Federal research agency or employing institution the participation of such individual in such program, position, or activity; or (ix) having a conflict of interest or conflict of commitment contrary to the standard terms and conditions of the Federal research and development award; and\n\n(B) that is sponsored by <strong>the People\'s Republic of China, the Democratic People\'s Republic of Korea, the Russian Federation, the Islamic Republic of Iran or an entity based in any such foreign country of concern</strong>, whether or not directly sponsored by the foreign country of concern; or an academic institution or talent plan listed here.\n\nFor any questions on interpreting the definition of “malign foreign talent recruitment program,” please see <a href="https://www.law.cornell.edu/uscode/text/42/19237" target="_blank">42 U.S.C. 19237(4)</a> or reach out to <a href="mailto:research-compliance-help@mit.edu" target="_blank">research-compliance-help@mit.edu</a>.', 'admin', UTC_TIMESTAMP()
    WHERE NOT EXISTS (
    SELECT 1
    FROM DYN_ELEMENT_CONFIG
    WHERE UI_REFERENCE_ID = 'coi-decl-form-info-text-1');

INSERT INTO DYN_ELEMENT_CONFIG (UI_REFERENCE_ID, DESCRIPTION, SUB_SECTION_CODE, SECTION_CODE, UPDATE_USER, UPDATE_TIMESTAMP)
    SELECT 'coi-decl-history-info-1', 'Declaration Form Histroy Message', '282', 'CC282', 'admin', UTC_TIMESTAMP()
    WHERE NOT EXISTS (
    SELECT 1
    FROM DYN_ELEMENT_CONFIG
    WHERE UI_REFERENCE_ID = 'coi-decl-history-info-1');
