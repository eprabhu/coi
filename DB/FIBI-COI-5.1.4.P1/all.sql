\. ./FIBI-COI-5.1.4.P1/FC-1220-Travel-Issue-Fixes/all.sql
\. ./FIBI-COI-5.1.4.P1/FC-1148-Project-Void-Issue-Fixes/all.sql
\. ./FIBI-COI-5.1.4.P1/FC-1187-Overall-Disclosure-History/all.sql
\. ./FIBI-COI-5.1.4.P1/FC-1225-Actionlist-Changes/all.sql

INSERT INTO build_details (`BUILD_ID`, `BUILD_VERSION`, `STATUS`, `APPLICATION_NAME`, `BUILD_UPDATE_TIMESTAMP`) VALUES (NULL, 'Fibi COI 5.1.4P1', 'Success', 'COI', now());
