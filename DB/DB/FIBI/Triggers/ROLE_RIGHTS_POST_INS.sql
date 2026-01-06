CREATE TRIGGER ROLE_RIGHTS_POST_INS AFTER INSERT ON ROLE_RIGHTS FOR EACH ROW BEGIN	
	CALL ROLE_RIGHTS_AUDIT_PROC
							('ROLE_RIGHTS', 	
							'INSERT', 			
							NULL,				
							NEW.ROLE_RIGHTS_ID, 
							NULL,				
							NULL,				
							NULL,				
							NULL,				
							NULL,				
							NEW.ROLE_ID,		
							NULL,				
							NEW.RIGHT_ID,		
							NULL,				
							NULL,				
							NULL,				
							NULL,
                            NEW.UPDATE_USER);				
END