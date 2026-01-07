
\. ./FIBI-COI-5.1/BugFix_Patch1/all.sql
\. ./FIBI-COI-5.1/scripts.sql
\. ./FIBI-COI-5.1/create_scripts.sql
\. ./FIBI-COI-5.1/insert_scripts.sql
\. ./FIBI-COI-5.1/FC-859-Corporate-Family/all.sql
\. ./FIBI-COI-5.1/FC-974-entity-validation/all.sql
\. ./FIBI-COI-5.1/FC-1032-Sort-On-Project-Tab/all.sql
\. ./FIBI-COI-5.1/FC-1016-Integration/all.sql
\. ./FIBI-COI-5.1/FC-479-notes/all.sql
\. ./FIBI-COI-5.1/FC-1022-Entity-Cleanup/all.sql
\. ./FIBI-COI-5.1/FC-1029-Award-Disclosure-Creation/all.sql
\. ./FIBI-COI-5.1/FC-959-Custom-data-entity-overview/all.sql
\. ./FIBI-COI-5.1/FC-1048/all.sql
-- \. ./FIBI-COI-5.1/Integration_Scripts/all.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.1', 'Success', 'COI', now());
