

--
--  `parameter`
--

DROP TABLE IF EXISTS `parameter`;

CREATE TABLE `parameter` (
  `PARAMETER_NAME` varchar(100) NOT NULL,
  `VALUE` varchar(255) DEFAULT NULL,
  `DESCRIPTION` varchar(500) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(40) NOT NULL,
  PRIMARY KEY (`PARAMETER_NAME`)
);

