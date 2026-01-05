CREATE TRIGGER PER_ROLES_POST_INS AFTER INSERT ON PERSON_ROLES FOR EACH ROW BEGIN	
	CALL ROLE_RIGHTS_AUDIT_PROC
							('PER_ROLES', 			
							'INSERT',				
							NULL,					
							NULL,					
							NULL,					
							NEW.PERSON_ROLES_ID,	
							NULL,					
							NEW.PERSON_ID,			
							NULL,					
							NEW.ROLE_ID,			
							NULL,					
							NULL,					
							NULL,					
							NEW.UNIT_NUMBER,		
							NULL,					
							NEW.DESCEND_FLAG,
							NEW.UPDATE_USER);		
END