

--
--  `web_socket_con_config`
--

DROP TABLE IF EXISTS `web_socket_con_config`;

CREATE TABLE `web_socket_con_config` (
  `CONFIGURATION_KEY` varchar(100) NOT NULL,
  `CONFIGURATION_VALUE` varchar(250) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`CONFIGURATION_KEY`)
);

