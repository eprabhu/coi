
\. ./FIBI-COI-5.0.5/create_tables.sql
\. ./FIBI-COI-5.0.5/scripts.sql
\. ./FIBI-COI-5.0.5/drop_routines.sql
\. ./FIBI-COI-5.0.5/integration_scripts.sql
\. ./FIBI-COI-5.0.5/procedures_functions.sql
\. ./FIBI-COI-5.0.5/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.5', 'Success', 'COI', now());
