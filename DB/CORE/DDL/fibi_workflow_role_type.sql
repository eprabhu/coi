

--
--  `fibi_workflow_role_type`
--

DROP TABLE IF EXISTS `fibi_workflow_role_type`;

CREATE TABLE `fibi_workflow_role_type` (
  `ROLE_TYPE_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ROLE_TYPE_CODE`)
);

