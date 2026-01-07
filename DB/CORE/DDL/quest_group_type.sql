

--
--  `quest_group_type`
--

DROP TABLE IF EXISTS `quest_group_type`;

CREATE TABLE `quest_group_type` (
  `QUEST_GROUP_TYPE_CODE` varchar(3) NOT NULL,
  `DESCRIPTION` varchar(200) DEFAULT NULL,
  `UPDATE_TIMESTAMP` datetime DEFAULT NULL,
  `UPDATE_USER` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`QUEST_GROUP_TYPE_CODE`)
);

