

--
--  `pre_review_attachment_file`
--

DROP TABLE IF EXISTS `pre_review_attachment_file`;

CREATE TABLE `pre_review_attachment_file` (
  `FILE_DATA_ID` varchar(255) NOT NULL,
  `ATTACHMENT` longblob,
  PRIMARY KEY (`FILE_DATA_ID`)
);

