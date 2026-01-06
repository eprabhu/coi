\. ./Fibi-COI-5.1.3.P3/FC-1061/all.sql
\. ./Fibi-COI-5.1.3.P3/FC-1085/scripts.sql
\. ./Fibi-COI-5.1.3.P3/FC-1134-Unified-Questionnaire/all.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.1.3P3', 'Success', 'COI', now());
