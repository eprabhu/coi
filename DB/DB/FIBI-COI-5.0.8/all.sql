-- \. ./FIBI-COI-5.0.8/fibi_base.sql Check base is there or not
\. ./FIBI-COI-5.0.8/scripts.sql
\. ./FIBI-COI-5.0.8/drop_routines.sql
\. ./FIBI-COI-5.0.8/procedures_functions.sql
\. ./FIBI-COI-5.0.8/create_views.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.0.8', 'Success', 'COI', now());
