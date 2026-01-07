

--
--  `sftp_configuration_data`
--

DROP TABLE IF EXISTS `sftp_configuration_data`;

CREATE TABLE `sftp_configuration_data` (
  `CONFIGURATION_KEY` varchar(100) NOT NULL,
  `CONFIGURATION_VALUE` varchar(250) DEFAULT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`CONFIGURATION_KEY`)
);

