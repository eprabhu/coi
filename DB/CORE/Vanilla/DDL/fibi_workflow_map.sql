

--
--  `fibi_workflow_map`
--

DROP TABLE IF EXISTS `fibi_workflow_map`;

CREATE TABLE `fibi_workflow_map` (
  `MAP_ID` int(11) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  `MAP_TYPE` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`MAP_ID`)
);

