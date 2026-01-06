create or replace PROCEDURE FIBI_COI_GET_DEV_PROP_NUM (
    AV_PROPOSAL_NUMBER IN EPS_PROPOSAL.PROPOSAL_NUMBER%TYPE,
    AV_QUESTIONNAIRE_ID IN QUEST_ANSWER_HEADER.QUESTIONNAIRE_ID%TYPE,
    AV_PERSON_ID IN PERSON.PERSON_ID%TYPE,
    
	AV_TYPE VARCHAR2
) IS
    req    UTL_HTTP.req;
    resp   UTL_HTTP.resp;
    url    VARCHAR2(4000);
    buffer VARCHAR2(32767);
   json_data VARCHAR2(32767) := '{"proposalNumber" : ' || AV_PROPOSAL_NUMBER || '}'; 
    amt    NUMBER;
BEGIN
    IF AV_TYPE = '1' THEN 

    json_data := '{"proposalNumber" : ' || AV_PROPOSAL_NUMBER || '}';
    url := 'https://fibi-compl-dev.mit.edu/kc-connect/feedProposal';

	ELSIF AV_TYPE = '2' THEN

   json_data := '{ 
   "proposalNumber" : '||AV_PROPOSAL_NUMBER ||', 
   "questionnaireId" :'||AV_QUESTIONNAIRE_ID ||', 
   "personId" : "'||AV_PERSON_ID||'"
    } ' ;
   url := 'https://fibi-compl-dev.mit.edu/kc-connect/createProposalDisclosure';

	END IF;

    req := UTL_HTTP.begin_request(url, 'POST');
    UTL_HTTP.set_header(req, 'Content-Type', 'application/json');
    UTL_HTTP.set_header(req, 'Content-Length', LENGTH(json_data));
    UTL_HTTP.write_text(req, json_data);
    resp := UTL_HTTP.get_response(req);
    UTL_HTTP.read_text(resp, buffer, 32767);
    DBMS_OUTPUT.put_line(buffer);
    UTL_HTTP.end_response(resp);
EXCEPTION
    WHEN UTL_HTTP.end_of_body THEN
        UTL_HTTP.end_response(resp);

END;