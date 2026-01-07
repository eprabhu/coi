

--
--  `rights_type`
--

DROP TABLE IF EXISTS `rights_type`;

CREATE TABLE `rights_type` (
  `RIGHTS_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`RIGHTS_TYPE_CODE`)
);

