\. ./FIBI-COI-4.0/drop_routines.sql
\. ./FIBI-COI-4.0/create_tables.sql
\. ./FIBI-COI-4.0/insert_scripts.sql
\. ./FIBI-COI-4.0/scripts.sql
\. ./FIBI-COI-4.0/procedures_functions.sql
\. ./FIBI-COI-4.0/create_views.sql
-- \. ./FIBI-COI-4.0/migration_scripts.sql FOR Questionnaire configuration check and uddate

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 4.0', 'Success', 'FIBI-WEB', now());
