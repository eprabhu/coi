

--
--  `faq_category`
--

DROP TABLE IF EXISTS `faq_category`;

CREATE TABLE `faq_category` (
  `CATEGORY_CODE` int(11) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  `CATEGORY_TYPE_CODE` int(11) DEFAULT NULL,
  `faq` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CATEGORY_CODE`)
);

