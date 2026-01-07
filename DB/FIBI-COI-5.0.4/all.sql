-- \. ./FIBI-COI-5.0.4/fibi-base.sql [Check and run if anything missing add to fibi]
\. ./FIBI-COI-5.0.4/drop_routines.sql
\. ./FIBI-COI-5.0.4/create_tables.sql
\. ./FIBI-COI-5.0.4/insert_scripts.sql
\. ./FIBI-COI-5.0.4/integration_scripts.sql
\. ./FIBI-COI-5.0.4/procedures_functions.sql
-- \. ./FIBI-COI-5.0.4/oracle_all.sql
-- \. ./FIBI-COI-5.0.4/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.4', 'Success', 'COI', now());
