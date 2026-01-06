

--
--  `section_type`
--

DROP TABLE IF EXISTS `section_type`;

CREATE TABLE `section_type` (
  `SECTION_CODE` varchar(4) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`SECTION_CODE`)
);

