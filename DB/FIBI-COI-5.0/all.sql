\. ./FIBI-COI-5.0/drop_routines.sql
\. ./FIBI-COI-5.0/create_tables.sql
\. ./FIBI-COI-5.0/scripts.sql
\. ./FIBI-COI-5.0/insert_scripts.sql
\. ./FIBI-COI-5.0/procedures_functions.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0', 'Success', 'COI', now());
