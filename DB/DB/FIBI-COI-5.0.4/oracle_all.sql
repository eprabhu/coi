Spool log_all.log;
set heading off;
set define off;
set term on;
set serveroutput on;
select '*-*-*-*-*-*-*- Started building ac database objects. 12012024'|| localtimestamp from dual;
@Integration_Scripts/Oracle_Script.sql
@Integration_Scripts/Procedures/FIBI_COI_GET_DEV_PROP_NUM.sql
@Integration_Scripts/Procedures/FIBI_COI_GET_DEV_PROP_DTLS.sql
@Integration_Scripts/Procedures/FIBI_COI_GET_DEV_PROP_PER_DTLS.sql
@Integration_Scripts/Procedures/FIBI_COI_GET_DEV_PROP_QNR_DTLS.sql

/
select '*-*-*-*-*-*-*- Completed building ac database objects. 12012024'|| localtimestamp from dual;
Spool Off;
Set define On;
Set feedback On;
EXIT
/
