\. ./COI/create_tables.sql
\. ./COI/scripts.sql
\. ./COI/insert_scripts.sql
\. ./COI/drop_routines.sql
\. ./COI/procedures_functions.sql
\. ./COI/create_views.sql

-- \. ./COI/migration_scripts.sql [MIT Specific review the alter]
INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'COI Vanilla', 'Success', 'COI', now());
