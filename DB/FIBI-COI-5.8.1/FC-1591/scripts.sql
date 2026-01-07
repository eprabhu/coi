set sql_safe_updates = 0;
DELETE FROM `FB_COMP_CUSTOM_ELEMENT` WHERE (`DATA_TYPE` = 'NE');
set sql_safe_updates = 1;
