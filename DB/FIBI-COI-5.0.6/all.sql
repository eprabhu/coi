
\. ./FIBI-COI-5.0.6/create_tables.sql
\. ./FIBI-COI-5.0.6/insert_scripts.sql
\. ./FIBI-COI-5.0.6/scripts.sql
\. ./FIBI-COI-5.0.6/drop_routines.sql
\. ./FIBI-COI-5.0.6/procedures_functions.sql
\. ./FIBI-COI-5.0.6/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.6', 'Success', 'COI', now());
