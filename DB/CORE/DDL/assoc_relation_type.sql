

--
--  `assoc_relation_type`
--

DROP TABLE IF EXISTS `assoc_relation_type`;

CREATE TABLE `assoc_relation_type` (
  `ASSOC_RELATION_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(100) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`ASSOC_RELATION_TYPE_CODE`)
);

