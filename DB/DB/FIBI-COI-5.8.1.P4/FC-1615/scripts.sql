SET SQL_SAFE_UPDATES = 0;
UPDATE DISCLOSURE_ACTION_TYPE SET MESSAGE = '{FCOI /Project /Travel} Disclosure <b>Recall requested</b>' WHERE (ACTION_TYPE_CODE = '32');
UPDATE DISCLOSURE_ACTION_TYPE SET MESSAGE = '{FCOI /Project /Travel} Disclosure <b>Recall request denied</b>' WHERE (ACTION_TYPE_CODE = '33');
SET SQL_SAFE_UPDATES = 1;
