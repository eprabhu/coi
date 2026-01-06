\. ./FIBI-COI-5.0.2/create_tables.sql
\. ./FIBI-COI-5.0.2/scripts.sql
\. ./FIBI-COI-5.0.2/insert_scripts.sql
\. ./FIBI-COI-5.0.2/drop_routines.sql
\. ./FIBI-COI-5.0.2/procedures_functions.sql
\. ./FIBI-COI-5.0.2/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.2', 'Success', 'COI', now());
