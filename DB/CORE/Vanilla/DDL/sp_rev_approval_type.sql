

--
--  `sp_rev_approval_type`
--

DROP TABLE IF EXISTS `sp_rev_approval_type`;

CREATE TABLE `sp_rev_approval_type` (
  `APPROVAL_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `IS_ACTIVE` varchar(1) DEFAULT 'Y',
  PRIMARY KEY (`APPROVAL_TYPE_CODE`)
);

