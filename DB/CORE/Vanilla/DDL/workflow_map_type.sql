

--
--  `workflow_map_type`
--

DROP TABLE IF EXISTS `workflow_map_type`;

CREATE TABLE `workflow_map_type` (
  `MAP_TYPE` varchar(1) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`MAP_TYPE`)
);

