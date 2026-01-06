CREATE OR REPLACE PROCEDURE FIBI_COI_GET_PERSON_PROJECTS (
        AV_PERSON_ID IN VARCHAR2,
        OUT_CURSOR OUT SYS_REFCURSOR
    )
    IS
        LS_PROJECT_NUMBERS CLOB;
        LS_PROPOSAL_NUMBERS CLOB;
    BEGIN
        BEGIN
            -- Query 1: Award
            SELECT RTRIM(XMLAGG(XMLELEMENT(E, A.AWARD_NUMBER || ',').EXTRACT('//text()') ORDER BY A.AWARD_NUMBER).GetClobVal(), ',')
            INTO LS_PROJECT_NUMBERS
            FROM award A
            INNER JOIN award_persons AP
                ON AP.award_id = A.award_id
            INNER JOIN eps_prop_person_role EPPR
                ON EPPR.prop_person_role_code = AP.contact_role_code
                AND EPPR.sponsor_hierarchy_name = 'DEFAULT'
            WHERE (AP.person_id = AV_PERSON_ID OR AP.rolodex_id = AV_PERSON_ID)
                AND A.award_sequence_status = 'ACTIVE'
                AND A.STATUS_CODE IN (1, 3, 6)
                AND A.SEQUENCE_NUMBER = (SELECT MAX(A1.SEQUENCE_NUMBER)
                                          FROM AWARD A1
                                          WHERE A1.AWARD_NUMBER = A.AWARD_NUMBER);
        EXCEPTION
            WHEN OTHERS THEN
                LS_PROJECT_NUMBERS := NULL;
        END;
    
        BEGIN
            -- Query 2: Proposal
            SELECT RTRIM(XMLAGG(XMLELEMENT(E, P.PROPOSAL_NUMBER || ',').EXTRACT('//text()') ORDER BY P.PROPOSAL_NUMBER).GetClobVal(), ',')
            INTO LS_PROPOSAL_NUMBERS
            FROM proposal P
            INNER JOIN proposal_persons PP
                ON PP.proposal_id = P.proposal_id
            INNER JOIN eps_prop_person_role EPP
                ON EPP.prop_person_role_code = PP.contact_role_code
                AND EPP.sponsor_hierarchy_name = 'DEFAULT'
            WHERE (PP.person_id = AV_PERSON_ID OR PP.rolodex_id = AV_PERSON_ID)
                AND P.proposal_sequence_status = 'ACTIVE'
                AND P.STATUS_CODE = 1
                AND P.SEQUENCE_NUMBER = (SELECT MAX(P1.SEQUENCE_NUMBER)
                                          FROM proposal P1
                                          WHERE P1.PROPOSAL_NUMBER = P.PROPOSAL_NUMBER);
        EXCEPTION
            WHEN OTHERS THEN
                LS_PROPOSAL_NUMBERS := NULL;
        END;
    
        OPEN OUT_CURSOR FOR
            SELECT LS_PROPOSAL_NUMBERS AS PROPOSAL_NUMBERS,
                   LS_PROJECT_NUMBERS AS PROJECT_NUMBERS
            FROM DUAL;
    END;
