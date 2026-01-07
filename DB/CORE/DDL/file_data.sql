

--
--  `file_data`
--

DROP TABLE IF EXISTS `file_data`;

CREATE TABLE `file_data` (
  `ID` varchar(36) NOT NULL,
  `DATA` longblob,
  `MODULE_CODE` varchar(3) DEFAULT NULL,
  `FILE_PATH` varchar(255) DEFAULT NULL,
  `ORIGINAL_FILE_NAME` varchar(500) DEFAULT NULL,
  `FILE_NAME` varchar(100) DEFAULT NULL,
  `IS_ARCHIVED` char(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`ID`)
);

