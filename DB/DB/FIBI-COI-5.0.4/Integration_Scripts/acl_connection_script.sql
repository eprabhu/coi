BEGIN
  DBMS_NETWORK_ACL_ADMIN.create_acl (
    acl         => 'kc_fibi_coi_connect.xml',       
    description => 'Allow UTL_HTTP connections',
    principal   => 'kcso',          
    is_grant    => TRUE,
    privilege   => 'connect',
	start_date   => SYSTIMESTAMP,
    end_date     => NULL
  );

  DBMS_NETWORK_ACL_ADMIN.add_privilege (
    acl       => 'kc_fibi_coi_connect.xml',  
    principal => 'kcso',  
    is_grant  => TRUE,
    privilege => 'resolve'
  );


  DBMS_NETWORK_ACL_ADMIN.ASSIGN_ACL (
    acl  => 'kc_fibi_coi_connect.xml',
    host => 'fibi-compl-dev.mit.edu'
  );

  COMMIT;
END;
/
