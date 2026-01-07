

--
--  `societal_challenge_area`
--

DROP TABLE IF EXISTS `societal_challenge_area`;

CREATE TABLE `societal_challenge_area` (
  `CHALLENGE_AREA_CODE` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`CHALLENGE_AREA_CODE`)
);

