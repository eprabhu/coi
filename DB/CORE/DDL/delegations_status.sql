

--
--  `delegations_status`
--

DROP TABLE IF EXISTS `delegations_status`;

CREATE TABLE `delegations_status` (
  `DELEGATION_STATUS_CODE` varchar(1) NOT NULL,
  `DESCRIPTION` varchar(15) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`DELEGATION_STATUS_CODE`)
);

