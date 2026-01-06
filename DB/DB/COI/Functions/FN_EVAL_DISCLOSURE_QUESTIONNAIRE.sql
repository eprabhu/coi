DELIMITER //
CREATE FUNCTION `FN_EVAL_DISCLOSURE_QUESTIONNAIRE`(
AV_MODULE_CODE    		 INT,
AV_SUB_MODULE_CODE    	 INT,
AV_MODULE_ITEM_KEY   INT
) RETURNS int(11)
    DETERMINISTIC
BEGIN

DECLARE LI_QUES_ANS_HEADER_ID INT;
DECLARE LI_ANS_COUNT INT;
DECLARE LI_ANSWER VARCHAR(40);
DECLARE LI_QUESTIONNAIRE_ID INT;

SELECT 
    MAX(QUESTIONNAIRE_ANS_HEADER_ID)
INTO LI_QUES_ANS_HEADER_ID FROM
    QUEST_ANSWER_HEADER
WHERE
    MODULE_ITEM_CODE = AV_MODULE_CODE
        AND MODULE_SUB_ITEM_CODE = AV_SUB_MODULE_CODE
        AND MODULE_ITEM_KEY = AV_MODULE_ITEM_KEY;
        
SELECT QUESTIONNAIRE_ID into LI_QUESTIONNAIRE_ID FROM quest_answer_header  where QUESTIONNAIRE_ANS_HEADER_ID =LI_QUES_ANS_HEADER_ID;

SELECT COUNT(1) INTO LI_ANS_COUNT FROM coi_quest_answer where QUESTIONNAIRE_ANS_HEADER_ID = LI_QUES_ANS_HEADER_ID and QUESTION_ID in (SELECT QUESTION_ID FROM quest_question where QUESTIONNAIRE_ID = LI_QUESTIONNAIRE_ID and 
QUESTION ='3.Over the last 12 months, or do you expect to receive over the next 12 months: Payments for intellectual property such as copyrights or royalties from any source other than the University (excludes scholarly works)?'
or QUESTION = '4.Over the last 12 months, or do you expect to receive over the next 12 months: Compensation for any board positions, including science advisory boards?'
or QUESTION = '5.Over the last 12 months, or do you expect to receive over the next 12 months: Consulting, salary or other income for services work performed or other services provided?'
or QUESTION = '6.Do you have Equity interest in a non-publically traded company (any amount)?'
or QUESTION = '8.Publically traded stock or stock options in excess of $5,000 must only be disclosed in certain circumstances: when it is held in combination with other relationships described above (Income) when the company sponsors the Investigator') and ANSWER ='no';

IF LI_ANS_COUNT > 0 THEN
   RETURN 0;
ELSE
    SELECT ANSWER INTO  LI_ANSWER FROM coi_quest_answer where QUESTIONNAIRE_ANS_HEADER_ID = LI_QUES_ANS_HEADER_ID and 
    QUESTION_ID = (SELECT QUESTION_ID FROM quest_question where QUESTIONNAIRE_ID = LI_QUESTIONNAIRE_ID and 
    QUESTION ='7.What is the range of publically traded stock in leu of payment for services provided?');
     
	IF (LI_ANSWER = 'Between $5000 & $10000') THEN 
	 RETURN 1;
    END IF; 

END IF;

RETURN 0;
END
//