

--
--  `dyn_modules_config`
--

DROP TABLE IF EXISTS `dyn_modules_config`;

CREATE TABLE `dyn_modules_config` (
  `MODULE_CODE` varchar(5) NOT NULL,
  `DESCRIPTION` varchar(200) NOT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER` varchar(60) NOT NULL,
  PRIMARY KEY (`MODULE_CODE`)
);

