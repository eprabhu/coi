

--
--  `organization_type`
--

DROP TABLE IF EXISTS `organization_type`;

CREATE TABLE `organization_type` (
  `ORGANIZATION_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  `IS_DEFAULT_ENTRY_REQUIRED` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`ORGANIZATION_TYPE_CODE`)
);

