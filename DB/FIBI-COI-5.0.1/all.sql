\. ./FIBI-COI-5.0.1/create_tables.sql
\. ./FIBI-COI-5.0.1/scripts.sql
\. ./FIBI-COI-5.0.1/insert_scripts.sql
\. ./FIBI-COI-5.0.1/drop_routines.sql
\. ./FIBI-COI-5.0.1/procedures_functions.sql
\. ./FIBI-COI-5.0.1/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.1', 'Success', 'COI', now());
