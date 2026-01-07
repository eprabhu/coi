

--
--  `recipient_status`
--

DROP TABLE IF EXISTS `recipient_status`;

CREATE TABLE `recipient_status` (
  `STATUS` varchar(255) NOT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime(6) DEFAULT NULL,
  `UPDATE_USER` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`STATUS`)
);

