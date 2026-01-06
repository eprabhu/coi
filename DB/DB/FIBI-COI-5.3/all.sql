\. ./FIBI-COI-5.3/FC-1146-Closed-Child-Awards/all.sql
\. ./FIBI-COI-5.3/FC-1218-Entity-Risk-Import/all.sql
\. ./FIBI-COI-5.3/FC-1105-Project-Hierarchy/all.sql
\. ./FIBI-COI-5.3/FC-1165/all.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.3', 'Success', 'COI', now());

