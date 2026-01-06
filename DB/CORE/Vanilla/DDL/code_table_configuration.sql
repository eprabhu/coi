

--
--  `code_table_configuration`
--

DROP TABLE IF EXISTS `code_table_configuration`;

CREATE TABLE `code_table_configuration` (
  `TABLE_NAME` varchar(60) NOT NULL,
  `DISPLAY_NAME` varchar(60) DEFAULT NULL,
  `CONTENT` longtext,
  `GROUP_NAME` varchar(60) DEFAULT NULL,
  `DESCRIPTION` varchar(1000) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `IS_LOG_ENABLED` varchar(1) DEFAULT 'N',
  PRIMARY KEY (`TABLE_NAME`)
);

