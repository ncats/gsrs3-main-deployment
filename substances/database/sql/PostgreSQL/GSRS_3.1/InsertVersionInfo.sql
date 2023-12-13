CREATE OR REPLACE PROCEDURE insert_version_row(entity_string VARCHAR(255), version_string VARCHAR(255))
language plpgsql     
as $$
DECLARE
  	row_count INTEGER; 
	row_id INTEGER; 
BEGIN	
  	SELECT COUNT(*) FROM ix_core_db_gsrs_version WHERE  entity = entity_string AND version_info = version_string INTO row_count;
  	IF row_count < 1 THEN
    	SELECT nextval('db_gsrs_version_seq') INTO row_id;
   	 	INSERT INTO ix_core_db_gsrs_version VALUES (row_id, entity_string, null, CURRENT_TIMESTAMP, version_string);
  	END IF;
END $$;

call insert_version_row('adverse-events','3.1-SNAPSHOT');
call insert_version_row('applications','3.1-SNAPSHOT');
call insert_version_row('clinical-trials','3.1-SNAPSHOT');
call insert_version_row('substances','3.1-SNAPSHOT');
call insert_version_row('impurities','3.1-SNAPSHOT');
call insert_version_row('products','3.1-SNAPSHOT');
call insert_version_row('sg4m','3.1-SNAPSHOT');