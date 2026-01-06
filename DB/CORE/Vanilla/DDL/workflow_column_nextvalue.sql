

--
--  `workflow_column_nextvalue`
--

DROP TABLE IF EXISTS `workflow_column_nextvalue`;

CREATE TABLE `workflow_column_nextvalue` (
  `RULE_ID` int(11) NOT NULL,
  `WORKFLOW_ID` int(11) DEFAULT NULL,
  `WORKFLOW_DETAIL_ID` int(11) DEFAULT NULL,
  `MAP_ID` int(11) DEFAULT NULL,
  `MAP_DETAIL_ID` int(11) DEFAULT NULL,
  `RULES_EXPERSSION_ID` int(11) DEFAULT NULL,
  `RULES_EXPERSSION_ARG_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`RULE_ID`)
);

