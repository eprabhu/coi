
\. ./FIBI-COI-5.1.3.P4/FC-1122-Bug-Fixes/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1080-Handle-multiple-disclosure-submissions/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1169-Configurable-Action-List-Priority/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1128-Travel-Enhancement/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1119-Entity-Modification/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1166-Bug-Fixes/all.sql
\. ./FIBI-COI-5.1.3.P4/FC-1046-Handling-Non-Employee/all.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.1.3P4', 'Success', 'COI', now());
