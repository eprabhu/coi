

--
--  `file_type`
--

DROP TABLE IF EXISTS `file_type`;

CREATE TABLE `file_type` (
  `FILE_TYPE_CODE` varchar(255) NOT NULL,
  `EXTENSION` varchar(255) DEFAULT NULL,
  `FILE_TYPE` varchar(30) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`FILE_TYPE_CODE`)
);

