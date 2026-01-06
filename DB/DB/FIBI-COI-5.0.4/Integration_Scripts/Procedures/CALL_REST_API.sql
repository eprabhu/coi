create or replace procedure CALL_REST_API is
  req   UTL_HTTP.req;
  resp  UTL_HTTP.resp;
  url   VARCHAR2(4000) := 'http://192.168.1.149/kc-connect/recieveProposalDetails';
  buffer VARCHAR2(32767);
    json_data VARCHAR2(32767) := '{
    "homeUnit": "000001",
    "coiProjectTypeCode": "3",
    "moduleItemKey": 26487,
    "personId": "10000000001"
}'; 
  amt   NUMBER;
BEGIN
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