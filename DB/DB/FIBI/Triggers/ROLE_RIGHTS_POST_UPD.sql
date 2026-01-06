CREATE TRIGGER ROLE_RIGHTS_POST_UPD AFTER UPDATE ON ROLE_RIGHTS FOR EACH ROW BEGIN
	IF OLD.RIGHT_ID <> NEW.RIGHT_ID OR OLD.ROLE_ID <> NEW.ROLE_ID THEN
	   CALL ROLE_RIGHTS_AUDIT_PROC
								('ROLE_RIGHTS', 			
								'UPDATE',					
								OLD.ROLE_RIGHTS_ID,			
								NEW.ROLE_RIGHTS_ID,			
								NULL,						
								NULL,						
								NULL,						
								NULL,						
								OLD.ROLE_ID,				
								NEW.ROLE_ID,				
								OLD.RIGHT_ID,				
								NEW.RIGHT_ID,				
								NULL,						
								NULL,						
								NULL,						
								NULL,
								NEW.UPDATE_USER);						
    END IF;
END