

--
--  `preference_type`
--

DROP TABLE IF EXISTS `preference_type`;

CREATE TABLE `preference_type` (
  `PREFERENCES_TYPE_CODE` varchar(5) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`PREFERENCES_TYPE_CODE`)
);

