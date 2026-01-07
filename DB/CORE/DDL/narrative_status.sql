

--
--  `narrative_status`
--

DROP TABLE IF EXISTS `narrative_status`;

CREATE TABLE `narrative_status` (
  `NARRATIVE_STATUS_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(20) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`NARRATIVE_STATUS_CODE`)
);

