

--
--  `fibi_workflow_status`
--

DROP TABLE IF EXISTS `fibi_workflow_status`;

CREATE TABLE `fibi_workflow_status` (
  `APPROVAL_STATUS_CODE` varchar(255) NOT NULL,
  `APPROVAL_STATUS` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`APPROVAL_STATUS_CODE`)
);

