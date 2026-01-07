

--
--  `lock_configuration`
--

DROP TABLE IF EXISTS `lock_configuration`;

CREATE TABLE `lock_configuration` (
  `MODULE_CODE` int(11) NOT NULL,
  `SUB_MODULE_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(45) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) NOT NULL,
  `IS_CHAT_ENABLED` varchar(1) NOT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `MODULE_KEY` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`MODULE_CODE`,`SUB_MODULE_CODE`)
);

