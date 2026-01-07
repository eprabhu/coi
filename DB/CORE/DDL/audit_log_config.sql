

--
--  `audit_log_config`
--

DROP TABLE IF EXISTS `audit_log_config`;

CREATE TABLE `audit_log_config` (
  `MODULE` varchar(45) NOT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`MODULE`)
);

