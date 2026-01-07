

--
--  `quick_links`
--

DROP TABLE IF EXISTS `quick_links`;

CREATE TABLE `quick_links` (
  `QUICK_LINK_ID` int(11) NOT NULL,
  `URL` varchar(2000) DEFAULT NULL,
  `NAME` varchar(200) DEFAULT NULL,
  `DESCRIPTION` varchar(2000) DEFAULT NULL,
  `TYPE` varchar(1) DEFAULT NULL,
  `START_DATE` datetime DEFAULT NULL,
  `END_DATE` datetime DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `SORT_ORDER` int(11) DEFAULT NULL,
  PRIMARY KEY (`QUICK_LINK_ID`)
);

