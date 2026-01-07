

--
--  `degree_type`
--

DROP TABLE IF EXISTS `degree_type`;

CREATE TABLE `degree_type` (
  `DEGREE_CODE` varchar(10) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` date DEFAULT NULL,
  PRIMARY KEY (`DEGREE_CODE`)
);

