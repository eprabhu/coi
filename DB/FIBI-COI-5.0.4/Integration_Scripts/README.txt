SCRIPT EXECUTION STEPS:

Step 1:

Execute the integration_Scripts.sql script file in the MySQL database.

Step 2:

Verify that the following tables are created in the MySQL database:

1)FIBI_COI_CONNECT_DUMMY
2)COI_INT_STAGE_DEV_PROPOSAL
3)COI_INT_STAGE_DEV_PROPOSAL_PERSON
4)MQ_EXCEPTION_LOG

Step 3:

Execute the Oracle_Script.sql script in the Oracle database.

Step 4:

Verify that the following objects are created in the Oracle database:

1)INTEGRATION_EXCEPTION_LOG_SEQ
2)INTEGRATION_EXCEPTION_LOG

Step 5:

To ensure seamless connectivity between the integration API and the Oracle database, the API needs to be configured using the Access Control List (ACL) feature. Execute the acl_connection_script.sql in the Oracle database to establish the connection.

Step 6:

Check the 'DBA_NETWORK_ACLS' table to verify if the ACL name associated with the host name is available:

SELECT * FROM dba_network_acls;

Step 7:

Execute the CALL_REST_API.sql script file in the Oracle database. This file contains a procedure for our trial test to determine whether the API specified in the procedure is successfully invoked by the Oracle database procedure.

Step 8:

Execute the query to call the CALL_REST_API procedure for trial test purposes:


EXEC CALL_REST_API;

Step 9:

Verify the data in the "FIBI_COI_CONNECT_DUMMY" table.

Step 10:

Execute the following trigger and procedure scripts in the Oracle database:

1)EPS_PROPOSAL_BFR_INSERT_TRG
2)GET_DEV_PROPOSAL_NUMBER
3)GET_DEV_PROPOSAL_DETAILS

Step 11:

Verify that the objects are created in the Oracle database.

Step 12:

Test the integration process by altering the data in the "EPS_PROPOSAL" table and verify that the same proposal data is reflected in the MySQL database staging tables.