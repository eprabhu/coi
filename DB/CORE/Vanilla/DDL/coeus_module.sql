

--
--  `coeus_module`
--

DROP TABLE IF EXISTS `coeus_module`;

CREATE TABLE `coeus_module` (
  `MODULE_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(200) NOT NULL,
  `UPDATE_TIMESTAMP` datetime NOT NULL,
  `UPDATE_USER` varchar(60) NOT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `DYN_MODULE_CODE` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`MODULE_CODE`)
);

