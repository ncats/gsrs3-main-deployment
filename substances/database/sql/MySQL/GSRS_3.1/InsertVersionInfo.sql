DELIMITER //
DROP PROCEDURE IF EXISTS insert_version_row;
CREATE PROCEDURE insert_version_row (IN entity_string VARCHAR(1023), IN version_string VARCHAR(1023))
DETERMINISTIC
BEGIN	
	DECLARE nextid INT;
	select next_val into nextid from db_gsrs_version_seq;
	INSERT INTO  ix_core_db_gsrs_version VALUES (nextid, entity_string, null, CURRENT_TIMESTAMP, version_string);
    update db_gsrs_version_seq set next_val= nextid+1;
	commit;
END
//
DELIMITER ;

SET SQL_SAFE_UPDATES = 0;
call insert_version_row('adverse-events','3.1-SNAPSHOT');
call insert_version_row('applications','3.1-SNAPSHOT');
call insert_version_row('clinical-trials','3.1-SNAPSHOT');
call insert_version_row('substances','3.1-SNAPSHOT');
call insert_version_row('impurities','3.1-SNAPSHOT');
call insert_version_row('products','3.1-SNAPSHOT');
call insert_version_row('sg4m','3.1-SNAPSHOT');