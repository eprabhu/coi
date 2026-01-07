

--
--  `mq_router_trigger_configuration`
--

DROP TABLE IF EXISTS `mq_router_trigger_configuration`;

CREATE TABLE `mq_router_trigger_configuration` (
  `MQ_ROUTER_TRIGGER_CONFIG_ID` int(11) NOT NULL AUTO_INCREMENT,
  `TRIGGER_TYPE` varchar(255) DEFAULT NULL,
  `IS_ACTIVE` varchar(255) DEFAULT NULL,
  `QUEUE_NAME` varchar(255) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MQ_ROUTER_TRIGGER_CONFIG_ID`)
);

