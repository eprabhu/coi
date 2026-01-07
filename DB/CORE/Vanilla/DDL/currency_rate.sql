

--
--  `currency_rate`
--

DROP TABLE IF EXISTS `currency_rate`;

CREATE TABLE `currency_rate` (
  `COUNTRY_CODE` varchar(3) NOT NULL,
  `CURRENCY_RATE` float NOT NULL,
  `UPDATE_USER` varchar(40) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  PRIMARY KEY (`COUNTRY_CODE`)
);

