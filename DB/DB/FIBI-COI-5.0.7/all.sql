
\. ./FIBI-COI-5.0.7/create_tables.sql
\. ./FIBI-COI-5.0.7/scripts.sql
\. ./FIBI-COI-5.0.7/insert_scripts.sql
\. ./FIBI-COI-5.0.7/drop_routines.sql
\. ./FIBI-COI-5.0.7/procedures_functions.sql
\. ./FIBI-COI-5.0.7/create_views.sql
-- \. ./FIBI-COI-5.0.7/migration_scripts.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.7', 'Success', 'COI', now());
