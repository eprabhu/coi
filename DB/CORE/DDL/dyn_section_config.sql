

--
--  `dyn_section_config`
--

DROP TABLE IF EXISTS `dyn_section_config`;

CREATE TABLE `dyn_section_config` (
  `SECTION_CODE` varchar(6) NOT NULL,
  `MODULE_CODE` varchar(5) NOT NULL,
  `DESCRIPTION` varchar(200) NOT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER` varchar(60) NOT NULL,
  PRIMARY KEY (`SECTION_CODE`),
  KEY `DYN_SECTION_CONFIG_FK1` (`MODULE_CODE`),
  CONSTRAINT `DYN_SECTION_CONFIG_FK1` FOREIGN KEY (`MODULE_CODE`) REFERENCES `dyn_modules_config` (`MODULE_CODE`)
);

