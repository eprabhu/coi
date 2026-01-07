create or replace PROCEDURE FIBI_COI_SYNC_ROLODEX_DETAILS (
    AV_ROLODEX_ID IN FIBI_COI_ROLODEX.ROLODEX_ID%TYPE,
	AV_DATE IN FIBI_COI_ROLODEX.UPDATE_TIMESTAMP%TYPE,
	cur_generic OUT SYS_REFCURSOR)
IS
    v_error_code     NUMBER;
    v_error_message  VARCHAR2(4000);
    v_error_Index    VARCHAR2(4000);
    v_faIled_rolodex_Id VARCHAR2(4000);
    v_column_name    VARCHAR2(4000);
    LI_COUNT NUMBER := 0;
    LS_ERROR_FLAG VARCHAR2(20) DEFAULT 'TRUE';
 
    LI_AFTER_DATA_COUNT NUMBER := 0;
    LI_TOTAL_COUNT NUMBER := 0;
    LS_ROLODEX_IDS CLOB := '';
	LI_AFFECTED_ROWS NUMBER := 1;
    LS_ERROR_MSG CLOB := '';
    
    LI_BEFORE_DATA_COUNT NUMBER;
    LI_DATA_COUNT        NUMBER;
   
    
    CURSOR ONE_TIME_MIGRATION IS
        SELECT 
            T1.ROLODEX_ID,
            T1.LAST_NAME,
            T1.FIRST_NAME,
            T1.MIDDLE_NAME,
            T1.FIRST_NAME || ' ' || NVL(T1.MIDDLE_NAME, '') || ' ' || T1.LAST_NAME AS FULL_NAME,
            T1.SUFFIX, T1.PREFIX, T1.TITLE,
            T1.ADDRESS_LINE_1,
            T1.ADDRESS_LINE_2,
            T1.ADDRESS_LINE_3,
            T1.FAX_NUMBER,
            T1.EMAIL_ADDRESS,
            T1.CITY,
            T1.COUNTY,
            T1.STATE,
            T1.POSTAL_CODE,
            T1.COMMENTS,
            T1.PHONE_NUMBER,
            T1.COUNTRY_CODE,
            T1.SPONSOR_CODE,
            T1.OWNED_BY_UNIT,
            T1.SPONSOR_ADDRESS_FLAG,
            T1.DELETE_FLAG,
            T1.CREATE_USER,
            SYSDATE AS UPDATE_TIMESTAMP,
            T1.UPDATE_USER,
            T1.ACTV_IND AS IS_ACTIVE,
            'I' AS FEED_STATUS
        FROM ROLODEX T1;
		
	CURSOR rolodex_cursor IS
		SELECT       
			source.ROLODEX_ID,
			source.LAST_NAME,
			source.FIRST_NAME,
			source.MIDDLE_NAME,
			source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME AS FULL_NAME,
			source.SUFFIX, 
			source.PREFIX, 
			source.TITLE,
			source.ADDRESS_LINE_1,
			source.ADDRESS_LINE_2,
			source.ADDRESS_LINE_3,
			source.FAX_NUMBER,
			source.EMAIL_ADDRESS,
			source.CITY,
			source.COUNTY,
			source.STATE,
			source.POSTAL_CODE,
			source.COMMENTS,
			source.PHONE_NUMBER,
			source.COUNTRY_CODE,
			source.SPONSOR_CODE,
			source.OWNED_BY_UNIT,
			source.SPONSOR_ADDRESS_FLAG,
			source.DELETE_FLAG,
			source.CREATE_USER,
			SYSDATE AS UPDATE_TIMESTAMP,
			source.UPDATE_USER,
			source.ACTV_IND AS IS_ACTIVE,
			'I' AS FEED_STATUS
		FROM ROLODEX source 
		LEFT JOIN FIBI_COI_ROLODEX target ON target.ROLODEX_ID = source.ROLODEX_ID
		WHERE ((
			NVL(target.LAST_NAME, ' ') != NVL(source.LAST_NAME, ' ') OR
			NVL(target.FIRST_NAME, ' ') != NVL(source.FIRST_NAME, ' ') OR
			NVL(target.MIDDLE_NAME, ' ') != NVL(source.MIDDLE_NAME, ' ') OR
			NVL(target.SUFFIX, ' ') != NVL(source.SUFFIX, ' ') OR
			NVL(target.PREFIX, ' ') != NVL(source.PREFIX, ' ') OR
			NVL(target.TITLE, ' ') != NVL(source.TITLE, ' ') OR
            NVL(target.FULL_NAME, ' ') !=NVL((source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME),' ') OR
			NVL(target.ADDRESS_LINE_1, ' ') != NVL(source.ADDRESS_LINE_1, ' ') OR
			NVL(target.ADDRESS_LINE_2, ' ') != NVL(source.ADDRESS_LINE_2, ' ') OR
			NVL(target.ADDRESS_LINE_3, ' ') != NVL(source.ADDRESS_LINE_3, ' ') OR
			NVL(target.FAX_NUMBER, ' ') != NVL(source.FAX_NUMBER, ' ') OR
			NVL(target.EMAIL_ADDRESS, ' ') != NVL(source.EMAIL_ADDRESS, ' ') OR
			NVL(target.CITY, ' ') != NVL(source.CITY, ' ') OR
			NVL(target.COUNTY, ' ') != NVL(source.COUNTY, ' ') OR
			NVL(target.STATE, ' ') != NVL(source.STATE, ' ') OR
			NVL(target.POSTAL_CODE, ' ') != NVL(source.POSTAL_CODE, ' ') OR
			NVL(target.COMMENTS, ' ') != NVL(source.COMMENTS, ' ') OR
			NVL(target.PHONE_NUMBER, ' ') != NVL(source.PHONE_NUMBER, ' ') OR
			NVL(target.COUNTRY_CODE, ' ') != NVL(source.COUNTRY_CODE, ' ') OR
			NVL(target.SPONSOR_CODE, ' ') != NVL(source.SPONSOR_CODE, ' ') OR
			NVL(target.OWNED_BY_UNIT, ' ') != NVL(source.OWNED_BY_UNIT, ' ') OR
			NVL(target.SPONSOR_ADDRESS_FLAG, ' ') != NVL(source.SPONSOR_ADDRESS_FLAG, ' ') OR
			NVL(target.DELETE_FLAG, ' ') != NVL(source.DELETE_FLAG, ' ') OR
			NVL(target.CREATE_USER, ' ') != NVL(source.CREATE_USER, ' ') OR
			NVL(target.UPDATE_USER, ' ') != NVL(source.UPDATE_USER, ' ') OR
			NVL(target.IS_ACTIVE, ' ') != NVL(source.ACTV_IND, ' ')
		) 
		OR target.ROLODEX_ID IS NULL)
		AND source.ROLODEX_ID = AV_ROLODEX_ID;
		
	CURSOR rolodex_dt_cursor IS
		SELECT 
        
			source.ROLODEX_ID,
			source.LAST_NAME,
			source.FIRST_NAME,
			source.MIDDLE_NAME,
			source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME AS FULL_NAME,
			source.SUFFIX, 
			source.PREFIX, 
			source.TITLE,
			source.ADDRESS_LINE_1,
			source.ADDRESS_LINE_2,
			source.ADDRESS_LINE_3,
			source.FAX_NUMBER,
			source.EMAIL_ADDRESS,
			source.CITY,
			source.COUNTY,
			source.STATE,
			source.POSTAL_CODE,
			source.COMMENTS,
			source.PHONE_NUMBER,
			source.COUNTRY_CODE,
			source.SPONSOR_CODE,
			source.OWNED_BY_UNIT,
			source.SPONSOR_ADDRESS_FLAG,
			source.DELETE_FLAG,
			source.CREATE_USER,
			SYSDATE AS UPDATE_TIMESTAMP,
			source.UPDATE_USER,
			source.ACTV_IND AS IS_ACTIVE,
			'I' AS FEED_STATUS
		FROM ROLODEX source 
		LEFT JOIN FIBI_COI_ROLODEX target ON target.ROLODEX_ID = source.ROLODEX_ID
		WHERE ((
			NVL(target.LAST_NAME, ' ') != NVL(source.LAST_NAME, ' ') OR
			NVL(target.FIRST_NAME, ' ') != NVL(source.FIRST_NAME, ' ') OR
			NVL(target.MIDDLE_NAME, ' ') != NVL(source.MIDDLE_NAME, ' ') OR
			NVL(target.SUFFIX, ' ') != NVL(source.SUFFIX, ' ') OR
			NVL(target.PREFIX, ' ') != NVL(source.PREFIX, ' ') OR
			NVL(target.TITLE, ' ') != NVL(source.TITLE, ' ') OR
            NVL(target.FULL_NAME, ' ') !=NVL((source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME),' ') OR
			NVL(target.ADDRESS_LINE_1, ' ') != NVL(source.ADDRESS_LINE_1, ' ') OR
			NVL(target.ADDRESS_LINE_2, ' ') != NVL(source.ADDRESS_LINE_2, ' ') OR
			NVL(target.ADDRESS_LINE_3, ' ') != NVL(source.ADDRESS_LINE_3, ' ') OR
			NVL(target.FAX_NUMBER, ' ') != NVL(source.FAX_NUMBER, ' ') OR
			NVL(target.EMAIL_ADDRESS, ' ') != NVL(source.EMAIL_ADDRESS, ' ') OR
			NVL(target.CITY, ' ') != NVL(source.CITY, ' ') OR
			NVL(target.COUNTY, ' ') != NVL(source.COUNTY, ' ') OR
			NVL(target.STATE, ' ') != NVL(source.STATE, ' ') OR
			NVL(target.POSTAL_CODE, ' ') != NVL(source.POSTAL_CODE, ' ') OR
			NVL(target.COMMENTS, ' ') != NVL(source.COMMENTS, ' ') OR
			NVL(target.PHONE_NUMBER, ' ') != NVL(source.PHONE_NUMBER, ' ') OR
			NVL(target.COUNTRY_CODE, ' ') != NVL(source.COUNTRY_CODE, ' ') OR
			NVL(target.SPONSOR_CODE, ' ') != NVL(source.SPONSOR_CODE, ' ') OR
			NVL(target.OWNED_BY_UNIT, ' ') != NVL(source.OWNED_BY_UNIT, ' ') OR
			NVL(target.SPONSOR_ADDRESS_FLAG, ' ') != NVL(source.SPONSOR_ADDRESS_FLAG, ' ') OR
			NVL(target.DELETE_FLAG, ' ') != NVL(source.DELETE_FLAG, ' ') OR
			NVL(target.CREATE_USER, ' ') != NVL(source.CREATE_USER, ' ') OR
			NVL(target.UPDATE_USER, ' ') != NVL(source.UPDATE_USER, ' ') OR
			NVL(target.IS_ACTIVE, ' ') != NVL(source.ACTV_IND, ' ')
		) 
		OR target.ROLODEX_ID IS NULL)
		AND TO_DATE(source.UPDATE_TIMESTAMP, 'DD-MM-YY') = TO_DATE(AV_DATE, 'DD-MM-YY');
		
	CURSOR rolodex_all_cursor IS
		SELECT 
     			source.ROLODEX_ID,
			source.LAST_NAME,
			source.FIRST_NAME,
			source.MIDDLE_NAME,
			source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME AS FULL_NAME,
			source.SUFFIX, 
			source.PREFIX, 
			source.TITLE,
			source.ADDRESS_LINE_1,
			source.ADDRESS_LINE_2,
			source.ADDRESS_LINE_3,
			source.FAX_NUMBER,
			source.EMAIL_ADDRESS,
			source.CITY,
			source.COUNTY,
			source.STATE,
			source.POSTAL_CODE,
			source.COMMENTS,
			source.PHONE_NUMBER,
			source.COUNTRY_CODE,
			source.SPONSOR_CODE,
			source.OWNED_BY_UNIT,
			source.SPONSOR_ADDRESS_FLAG,
			source.DELETE_FLAG,
			source.CREATE_USER,
			SYSDATE AS UPDATE_TIMESTAMP,
			source.UPDATE_USER,
			source.ACTV_IND AS IS_ACTIVE,
			'I' AS FEED_STATUS
		FROM ROLODEX source 
		LEFT JOIN FIBI_COI_ROLODEX target ON target.ROLODEX_ID = source.ROLODEX_ID
		WHERE ((
			NVL(target.LAST_NAME, ' ') != NVL(source.LAST_NAME, ' ') OR
			NVL(target.FIRST_NAME, ' ') != NVL(source.FIRST_NAME, ' ') OR
			NVL(target.MIDDLE_NAME, ' ') != NVL(source.MIDDLE_NAME, ' ') OR
			NVL(target.SUFFIX, ' ') != NVL(source.SUFFIX, ' ') OR
			NVL(target.PREFIX, ' ') != NVL(source.PREFIX, ' ') OR
			NVL(target.TITLE, ' ') != NVL(source.TITLE, ' ') OR
            NVL(target.FULL_NAME, ' ') !=NVL((source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME),' ') OR 
			NVL(target.ADDRESS_LINE_1, ' ') != NVL(source.ADDRESS_LINE_1, ' ') OR
			NVL(target.ADDRESS_LINE_2, ' ') != NVL(source.ADDRESS_LINE_2, ' ') OR
			NVL(target.ADDRESS_LINE_3, ' ') != NVL(source.ADDRESS_LINE_3, ' ') OR
			NVL(target.FAX_NUMBER, ' ') != NVL(source.FAX_NUMBER, ' ') OR
			NVL(target.EMAIL_ADDRESS, ' ') != NVL(source.EMAIL_ADDRESS, ' ') OR
			NVL(target.CITY, ' ') != NVL(source.CITY, ' ') OR
			NVL(target.COUNTY, ' ') != NVL(source.COUNTY, ' ') OR
			NVL(target.STATE, ' ') != NVL(source.STATE, ' ') OR
			NVL(target.POSTAL_CODE, ' ') != NVL(source.POSTAL_CODE, ' ') OR
			NVL(target.COMMENTS, ' ') != NVL(source.COMMENTS, ' ') OR
			NVL(target.PHONE_NUMBER, ' ') != NVL(source.PHONE_NUMBER, ' ') OR
			NVL(target.COUNTRY_CODE, ' ') != NVL(source.COUNTRY_CODE, ' ') OR
			NVL(target.SPONSOR_CODE, ' ') != NVL(source.SPONSOR_CODE, ' ') OR
			NVL(target.OWNED_BY_UNIT, ' ') != NVL(source.OWNED_BY_UNIT, ' ') OR
			NVL(target.SPONSOR_ADDRESS_FLAG, ' ') != NVL(source.SPONSOR_ADDRESS_FLAG, ' ') OR
			NVL(target.DELETE_FLAG, ' ') != NVL(source.DELETE_FLAG, ' ') OR
			NVL(target.CREATE_USER, ' ') != NVL(source.CREATE_USER, ' ') OR
			NVL(target.UPDATE_USER, ' ') != NVL(source.UPDATE_USER, ' ') OR
			NVL(target.IS_ACTIVE, ' ') != NVL(source.ACTV_IND, ' ')
		) 
		OR target.ROLODEX_ID IS NULL);
BEGIN
BEGIN
    SELECT COUNT(1) INTO LI_BEFORE_DATA_COUNT FROM FIBI_COI_ROLODEX;
    SELECT COUNT(1) INTO LI_DATA_COUNT FROM FIBI_COI_ROLODEX WHERE ROWNUM <= 2;

		IF LI_DATA_COUNT = 0 THEN -- ONE TIME MIGRATION
				BEGIN
						FOR rolodex_record IN ONE_TIME_MIGRATION LOOP
							BEGIN
								INSERT INTO FIBI_COI_ROLODEX (
									ROLODEX_ID, LAST_NAME, FIRST_NAME, MIDDLE_NAME, FULL_NAME, PREFIX, SUFFIX, TITLE, 									
									ADDRESS_LINE_1, ADDRESS_LINE_2, ADDRESS_LINE_3, 
									FAX_NUMBER, EMAIL_ADDRESS, CITY, COUNTY, STATE, POSTAL_CODE, COMMENTS, PHONE_NUMBER, 
									COUNTRY_CODE, SPONSOR_CODE, OWNED_BY_UNIT, SPONSOR_ADDRESS_FLAG, DELETE_FLAG, 
									CREATE_USER, UPDATE_TIMESTAMP, UPDATE_USER, IS_ACTIVE, FEED_STATUS
								) 
								VALUES (
									NVL(rolodex_record.ROLODEX_ID, 0),
									rolodex_record.LAST_NAME, 
									rolodex_record.FIRST_NAME, 
									rolodex_record.MIDDLE_NAME, 
									rolodex_record.FULL_NAME, 
									rolodex_record.PREFIX, 
									rolodex_record.SUFFIX, 
									rolodex_record.TITLE, 
									rolodex_record.ADDRESS_LINE_1, 
									rolodex_record.ADDRESS_LINE_2, 
									rolodex_record.ADDRESS_LINE_3, 
									rolodex_record.FAX_NUMBER, 
									rolodex_record.EMAIL_ADDRESS, 
									rolodex_record.CITY, 
									rolodex_record.COUNTY, 
									rolodex_record.STATE, 
									rolodex_record.POSTAL_CODE, 
									rolodex_record.COMMENTS, 
									rolodex_record.PHONE_NUMBER, 
									rolodex_record.COUNTRY_CODE, 
									rolodex_record.SPONSOR_CODE, 
									rolodex_record.OWNED_BY_UNIT, 
									rolodex_record.SPONSOR_ADDRESS_FLAG, 
									rolodex_record.DELETE_FLAG, 
									rolodex_record.CREATE_USER, 
									SYSDATE, 
									rolodex_record.UPDATE_USER, 
									rolodex_record.IS_ACTIVE, 
									rolodex_record.FEED_STATUS
								);
				
								COMMIT;  
				
							EXCEPTION
								WHEN OTHERS THEN
									v_error_message := DBMS_UTILITY.FORMAT_ERROR_STACK();
									v_error_Index := SQLERRM;
									v_faIled_rolodex_Id := rolodex_record.ROLODEX_ID;
									v_error_message := 'Error at ROLODEX_ID ' || v_faIled_rolodex_Id || ': ' || v_error_message;
				
									SELECT REPLACE(REGEXP_SUBSTR(v_error_message, '"[^"]+"', 1, 3), '"', '') INTO v_column_name FROM dual;
				
									INSERT INTO INTEGRATION_EXCEPTION_LOG (
										ID, EXCEPTION_TYPE, EXCEPTION_MESSAGE, CREATE_TIMESTAMP, REQUEST_OBJ, STACK_TRACE
									) VALUES (
										INTEGRATION_EXCEPTION_LOG_SEQ.NEXTVAL, 
										'ROLODEX_SYNC',  
										v_error_message, 
										SYSDATE, 
										v_faIled_rolodex_Id,
										v_column_name
									);
				
									COMMIT; 
                                END;
						END LOOP;
				END;
		END IF;
		
		IF AV_ROLODEX_ID IS NOT NULL AND LI_DATA_COUNT <> 0 THEN  -- ROLODEX_ID IS NOT NULL
		
				BEGIN
						FOR rolodex_record IN rolodex_cursor LOOP
                        LI_AFFECTED_ROWS := LI_AFFECTED_ROWS +1;
                        
							BEGIN
                            
								MERGE INTO FIBI_COI_ROLODEX target
										USING (
											SELECT * 
											FROM ROLODEX 
											WHERE ROLODEX_ID = rolodex_record.ROLODEX_ID
										) source
										ON (target.ROLODEX_ID = source.ROLODEX_ID)
										WHEN MATCHED THEN
											UPDATE
											SET LAST_NAME = source.LAST_NAME,
												FIRST_NAME = source.FIRST_NAME,
												MIDDLE_NAME = source.MIDDLE_NAME,
												FULL_NAME = source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME,
												SUFFIX = source.SUFFIX,
												PREFIX = source.PREFIX,
												TITLE = source.TITLE,
												ADDRESS_LINE_1 = source.ADDRESS_LINE_1,
												ADDRESS_LINE_2 = source.ADDRESS_LINE_2,
												ADDRESS_LINE_3 = source.ADDRESS_LINE_3,
												FAX_NUMBER = source.FAX_NUMBER,
												EMAIL_ADDRESS = source.EMAIL_ADDRESS,
												CITY = source.CITY,
												COUNTY = source.COUNTY,
												STATE = source.STATE,
												POSTAL_CODE = source.POSTAL_CODE,
												COMMENTS = source.COMMENTS,
												PHONE_NUMBER = source.PHONE_NUMBER,
												COUNTRY_CODE = source.COUNTRY_CODE,    
												SPONSOR_CODE = source.SPONSOR_CODE,
												OWNED_BY_UNIT = source.OWNED_BY_UNIT,
												SPONSOR_ADDRESS_FLAG = source.SPONSOR_ADDRESS_FLAG,
												DELETE_FLAG = source.DELETE_FLAG,
												CREATE_USER = source.CREATE_USER,
												UPDATE_USER = source.UPDATE_USER,
												IS_ACTIVE = source.ACTV_IND,
												FEED_STATUS = 'U',
												UPDATE_TIMESTAMP = TO_DATE(SYSDATE, 'DD-MM-YY')
																	
								
										WHEN NOT MATCHED THEN
											INSERT (
												ROLODEX_ID, LAST_NAME, FIRST_NAME, MIDDLE_NAME, SUFFIX, PREFIX, TITLE, 
												ADDRESS_LINE_1, ADDRESS_LINE_2, ADDRESS_LINE_3, FAX_NUMBER, 
												EMAIL_ADDRESS, CITY, COUNTY, STATE, POSTAL_CODE, COMMENTS, PHONE_NUMBER, 
												COUNTRY_CODE, SPONSOR_CODE, OWNED_BY_UNIT, SPONSOR_ADDRESS_FLAG, DELETE_FLAG, 
												CREATE_USER, UPDATE_TIMESTAMP, UPDATE_USER, IS_ACTIVE, FEED_STATUS
											)
											VALUES (
												source.ROLODEX_ID, source.LAST_NAME, source.FIRST_NAME, source.MIDDLE_NAME, 
												source.SUFFIX, source.PREFIX, source.TITLE, 
												source.ADDRESS_LINE_1, source.ADDRESS_LINE_2, source.ADDRESS_LINE_3, 
												source.FAX_NUMBER, source.EMAIL_ADDRESS, source.CITY, source.COUNTY, source.STATE, 
												source.POSTAL_CODE, source.COMMENTS, source.PHONE_NUMBER, source.COUNTRY_CODE, 
												source.SPONSOR_CODE, source.OWNED_BY_UNIT, source.SPONSOR_ADDRESS_FLAG, 
												source.DELETE_FLAG, source.CREATE_USER, TO_DATE(SYSDATE, 'DD-MM-YY'), 
												source.UPDATE_USER, source.ACTV_IND, 'I'
											);
								
								
								COMMIT;
				
				
							EXCEPTION
								WHEN OTHERS THEN
									v_error_message := DBMS_UTILITY.FORMAT_ERROR_STACK();
									v_error_Index := SQLERRM;
									v_faIled_rolodex_Id := rolodex_record.ROLODEX_ID;
									v_error_message := 'Error at ROLODEX_ID ' || v_faIled_rolodex_Id || ': ' || v_error_message;
				
									SELECT REPLACE(REGEXP_SUBSTR(v_error_message, '"[^"]+"', 1, 3), '"', '') INTO v_column_name FROM dual;
				
									INSERT INTO INTEGRATION_EXCEPTION_LOG (
										ID, EXCEPTION_TYPE, EXCEPTION_MESSAGE, CREATE_TIMESTAMP, REQUEST_OBJ, STACK_TRACE
									) VALUES (
										INTEGRATION_EXCEPTION_LOG_SEQ.NEXTVAL, 
										'ROLODEX_SYNC',  
										v_error_message, 
										SYSDATE, 
										v_faIled_rolodex_Id,
										v_column_name
									);
				
									COMMIT; 
						END;
						END LOOP;
				END;
		
		END IF;
		
		
		
		IF AV_DATE IS NOT NULL AND LI_DATA_COUNT <> 0 THEN  -- AV_DATE IS NOT NULL
		
				BEGIN
						FOR rolodex_record IN rolodex_dt_cursor LOOP
                        LI_AFFECTED_ROWS := LI_AFFECTED_ROWS +1;
							BEGIN
                            
								MERGE INTO FIBI_COI_ROLODEX target
										USING (
											SELECT * 
											FROM ROLODEX 
											WHERE ROLODEX_ID = rolodex_record.ROLODEX_ID
										) source
										ON (target.ROLODEX_ID = source.ROLODEX_ID)
										WHEN MATCHED THEN
											UPDATE
											SET LAST_NAME = source.LAST_NAME,
												FIRST_NAME = source.FIRST_NAME,
												MIDDLE_NAME = source.MIDDLE_NAME,
												FULL_NAME = source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME,
												SUFFIX = source.SUFFIX,
												PREFIX = source.PREFIX,
												TITLE = source.TITLE,												
												ADDRESS_LINE_1 = source.ADDRESS_LINE_1,
												ADDRESS_LINE_2 = source.ADDRESS_LINE_2,
												ADDRESS_LINE_3 = source.ADDRESS_LINE_3,
												FAX_NUMBER = source.FAX_NUMBER,
												EMAIL_ADDRESS = source.EMAIL_ADDRESS,
												CITY = source.CITY,
												COUNTY = source.COUNTY,
												STATE = source.STATE,
												POSTAL_CODE = source.POSTAL_CODE,
												COMMENTS = source.COMMENTS,
												PHONE_NUMBER = source.PHONE_NUMBER,
												COUNTRY_CODE = source.COUNTRY_CODE,    
												SPONSOR_CODE = source.SPONSOR_CODE,
												OWNED_BY_UNIT = source.OWNED_BY_UNIT,
												SPONSOR_ADDRESS_FLAG = source.SPONSOR_ADDRESS_FLAG,
												DELETE_FLAG = source.DELETE_FLAG,
												CREATE_USER = source.CREATE_USER,
												UPDATE_USER = source.UPDATE_USER,
												IS_ACTIVE = source.ACTV_IND,
												FEED_STATUS = 'U',
												UPDATE_TIMESTAMP = TO_DATE(SYSDATE, 'DD-MM-YY')
																	
								
										WHEN NOT MATCHED THEN
											INSERT (
												ROLODEX_ID, LAST_NAME, FIRST_NAME, MIDDLE_NAME, SUFFIX, PREFIX, TITLE,												
												ADDRESS_LINE_1, ADDRESS_LINE_2, ADDRESS_LINE_3, FAX_NUMBER, 
												EMAIL_ADDRESS, CITY, COUNTY, STATE, POSTAL_CODE, COMMENTS, PHONE_NUMBER, 
												COUNTRY_CODE, SPONSOR_CODE, OWNED_BY_UNIT, SPONSOR_ADDRESS_FLAG, DELETE_FLAG, 
												CREATE_USER, UPDATE_TIMESTAMP, UPDATE_USER, IS_ACTIVE, FEED_STATUS
											)
											VALUES (
												source.ROLODEX_ID, source.LAST_NAME, source.FIRST_NAME, source.MIDDLE_NAME, 
												source.SUFFIX, source.PREFIX, source.TITLE, 
												source.ADDRESS_LINE_1, source.ADDRESS_LINE_2, source.ADDRESS_LINE_3, 
												source.FAX_NUMBER, source.EMAIL_ADDRESS, source.CITY, source.COUNTY, source.STATE, 
												source.POSTAL_CODE, source.COMMENTS, source.PHONE_NUMBER, source.COUNTRY_CODE, 
												source.SPONSOR_CODE, source.OWNED_BY_UNIT, source.SPONSOR_ADDRESS_FLAG, 
												source.DELETE_FLAG, source.CREATE_USER, TO_DATE(SYSDATE, 'DD-MM-YY'), 
												source.UPDATE_USER, source.ACTV_IND, 'I'
											);
								
								
								COMMIT;
				
				
							EXCEPTION
								WHEN OTHERS THEN
									v_error_message := DBMS_UTILITY.FORMAT_ERROR_STACK();
									v_error_Index := SQLERRM;
									v_faIled_rolodex_Id := rolodex_record.ROLODEX_ID;
									v_error_message := 'Error at ROLODEX_ID ' || v_faIled_rolodex_Id || ': ' || v_error_message;
				
									SELECT REPLACE(REGEXP_SUBSTR(v_error_message, '"[^"]+"', 1, 3), '"', '') INTO v_column_name FROM dual;
				
									INSERT INTO INTEGRATION_EXCEPTION_LOG (
										ID, EXCEPTION_TYPE, EXCEPTION_MESSAGE, CREATE_TIMESTAMP, REQUEST_OBJ, STACK_TRACE
									) VALUES (
										INTEGRATION_EXCEPTION_LOG_SEQ.NEXTVAL, 
										'ROLODEX_SYNC',  
										v_error_message, 
										SYSDATE, 
										v_faIled_rolodex_Id,
										v_column_name
									);
				
									COMMIT; 
						END;
                        
						END LOOP;
				END;
		
		END IF;
		
		IF AV_ROLODEX_ID IS NULL AND AV_DATE IS NULL AND LI_DATA_COUNT > 0 THEN  
		
				BEGIN
						FOR rolodex_record IN rolodex_all_cursor LOOP
                        LI_AFFECTED_ROWS := LI_AFFECTED_ROWS +1;
							BEGIN
                            
								MERGE INTO FIBI_COI_ROLODEX target
										USING (
											SELECT * 
											FROM ROLODEX 
											WHERE ROLODEX_ID = rolodex_record.ROLODEX_ID
										) source
										ON (target.ROLODEX_ID = source.ROLODEX_ID)
										WHEN MATCHED THEN
											UPDATE
											SET LAST_NAME = source.LAST_NAME,
												FIRST_NAME = source.FIRST_NAME,
												MIDDLE_NAME = source.MIDDLE_NAME,
												FULL_NAME = source.FIRST_NAME || ' ' || NVL(source.MIDDLE_NAME, '') || ' ' || source.LAST_NAME,
												SUFFIX = source.SUFFIX,
												PREFIX = source.PREFIX,
												TITLE = source.TITLE,												
												ADDRESS_LINE_1 = source.ADDRESS_LINE_1,
												ADDRESS_LINE_2 = source.ADDRESS_LINE_2,
												ADDRESS_LINE_3 = source.ADDRESS_LINE_3,
												FAX_NUMBER = source.FAX_NUMBER,
												EMAIL_ADDRESS = source.EMAIL_ADDRESS,
												CITY = source.CITY,
												COUNTY = source.COUNTY,
												STATE = source.STATE,
												POSTAL_CODE = source.POSTAL_CODE,
												COMMENTS = source.COMMENTS,
												PHONE_NUMBER = source.PHONE_NUMBER,
												COUNTRY_CODE = source.COUNTRY_CODE,    
												SPONSOR_CODE = source.SPONSOR_CODE,
												OWNED_BY_UNIT = source.OWNED_BY_UNIT,
												SPONSOR_ADDRESS_FLAG = source.SPONSOR_ADDRESS_FLAG,
												DELETE_FLAG = source.DELETE_FLAG,
												CREATE_USER = source.CREATE_USER,
												UPDATE_USER = source.UPDATE_USER,
												IS_ACTIVE = source.ACTV_IND,
												FEED_STATUS = 'U',
												UPDATE_TIMESTAMP = TO_DATE(SYSDATE, 'DD-MM-YY')
																	
								
										WHEN NOT MATCHED THEN
											INSERT (
												ROLODEX_ID, LAST_NAME, FIRST_NAME, MIDDLE_NAME, SUFFIX, PREFIX, TITLE, 
												ADDRESS_LINE_1, ADDRESS_LINE_2, ADDRESS_LINE_3, FAX_NUMBER, 
												EMAIL_ADDRESS, CITY, COUNTY, STATE, POSTAL_CODE, COMMENTS, PHONE_NUMBER, 
												COUNTRY_CODE, SPONSOR_CODE, OWNED_BY_UNIT, SPONSOR_ADDRESS_FLAG, DELETE_FLAG, 
												CREATE_USER, UPDATE_TIMESTAMP, UPDATE_USER, IS_ACTIVE, FEED_STATUS												
											)
											VALUES (
												source.ROLODEX_ID, source.LAST_NAME, source.FIRST_NAME, source.MIDDLE_NAME, 
												source.SUFFIX, source.PREFIX, source.TITLE, 
												source.ADDRESS_LINE_1, source.ADDRESS_LINE_2, source.ADDRESS_LINE_3, 
												source.FAX_NUMBER, source.EMAIL_ADDRESS, source.CITY, source.COUNTY, source.STATE, 
												source.POSTAL_CODE, source.COMMENTS, source.PHONE_NUMBER, source.COUNTRY_CODE, 
												source.SPONSOR_CODE, source.OWNED_BY_UNIT, source.SPONSOR_ADDRESS_FLAG, 
												source.DELETE_FLAG, source.CREATE_USER, TO_DATE(SYSDATE, 'DD-MM-YY'), 
												source.UPDATE_USER, source.ACTV_IND, 'I'												
											);
								
								
								COMMIT;
				
				
							EXCEPTION
								WHEN OTHERS THEN
									v_error_message := DBMS_UTILITY.FORMAT_ERROR_STACK();
									v_error_Index := SQLERRM;
									v_faIled_rolodex_Id := rolodex_record.ROLODEX_ID;
									v_error_message := 'Error at ROLODEX_ID ' || v_faIled_rolodex_Id || ': ' || v_error_message;
				
									SELECT REPLACE(REGEXP_SUBSTR(v_error_message, '"[^"]+"', 1, 3), '"', '') INTO v_column_name FROM dual;
				
									INSERT INTO INTEGRATION_EXCEPTION_LOG (
										ID, EXCEPTION_TYPE, EXCEPTION_MESSAGE, CREATE_TIMESTAMP, REQUEST_OBJ, STACK_TRACE
									) VALUES (
										INTEGRATION_EXCEPTION_LOG_SEQ.NEXTVAL, 
										'ROLODEX_SYNC',  
										v_error_message, 
										SYSDATE, 
										v_faIled_rolodex_Id,
										v_column_name
									);
				
									COMMIT; 
						END;
                        
						END LOOP;
				END;
		
		END IF;
		
EXCEPTION WHEN OTHERS THEN
LS_ERROR_MSG:= 'Error occurred during MERGE: ' || SQLERRM ;
INSERT INTO INTEGRATION_EXCEPTION_LOG(ID,EXCEPTION_TYPE,EXCEPTION_MESSAGE,STACK_TRACE) SELECT integration_exception_log_seq.NEXTVAL,'ROLODEX_SYNC','Error at FIBI_COI_SYNC_ROLODEX_DETAILS Procedure',LS_ERROR_MSG FROM DUAL;
COMMIT;
LS_ERROR_FLAG :='FALSE';
END;


IF LI_AFFECTED_ROWS > 0 THEN
 SELECT COUNT(1) INTO LI_AFTER_DATA_COUNT FROM FIBI_COI_ROLODEX; 

 LI_TOTAL_COUNT := LI_AFTER_DATA_COUNT - LI_BEFORE_DATA_COUNT;


SELECT COUNT(1) INTO LI_COUNT
FROM FIBI_COI_ROLODEX
WHERE TRUNC(UPDATE_TIMESTAMP) = TRUNC(SYSDATE); 

SELECT RTRIM(XMLAGG(XMLELEMENT(e, ROLODEX_ID, ', ').EXTRACT('//text()') ORDER BY ROLODEX_ID).GetClobVal(), ', ')  INTO LS_ROLODEX_IDS
FROM FIBI_COI_ROLODEX
WHERE (TRUNC(UPDATE_TIMESTAMP) = TRUNC(SYSDATE) OR SYNC_STATUS = 'ERROR');

END IF;

UPDATE FIBI_COI_ROLODEX SET SYNC_STATUS = NULL WHERE SYNC_STATUS = 'ERROR';

   OPEN cur_generic FOR
SELECT LS_ROLODEX_IDS AS SYNCED_ROLODEX_IDS,LS_ERROR_FLAG as ROLODEX_SYNC_RESULT, ROUND(LI_COUNT-LI_TOTAL_COUNT) AS NUM_OF_SYNCED_UPDATED,LI_TOTAL_COUNT AS NUM_OF_RECORDS_INSERTED FROM DUAL;


END FIBI_COI_SYNC_ROLODEX_DETAILS;
