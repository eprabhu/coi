

--
--  `source_type`
--

DROP TABLE IF EXISTS `source_type`;

CREATE TABLE `source_type` (
  `SOURCE_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`SOURCE_TYPE_CODE`)
);

