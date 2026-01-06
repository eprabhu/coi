

--
--  `workflow_status`
--

DROP TABLE IF EXISTS `workflow_status`;

CREATE TABLE `workflow_status` (
  `APPROVAL_STATUS` varchar(1) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` date DEFAULT NULL,
  PRIMARY KEY (`APPROVAL_STATUS`)
);

