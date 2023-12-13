CREATE OR REPLACE PROCEDURE insert_version_row(entity_string IN VARCHAR2,version_string IN VARCHAR2)
AS
  row_count NUMBER;
  row_id NUMBER;  
  
BEGIN
  SELECT COUNT(*) INTO  row_count FROM  ix_core_db_gsrs_version
  WHERE  entity = entity_string AND version_info = version_string;
  IF row_count < 1 THEN
    SELECT db_gsrs_version_seq.NEXTVAL INTO row_id FROM dual;
    INSERT INTO ix_core_db_gsrs_version VALUES (row_id, entity_string, null, CURRENT_TIMESTAMP, version_string);
  END IF;
END;
/

BEGIN
    insert_version_row('adverse-events','3.1-SNAPSHOT');
    insert_version_row('applications','3.1-SNAPSHOT');
    insert_version_row('clinical-trials','3.1-SNAPSHOT');
    insert_version_row('substances','3.1-SNAPSHOT');
    insert_version_row('impurities','3.1-SNAPSHOT');
    insert_version_row('products','3.1-SNAPSHOT');
    insert_version_row('sg4m','3.1-SNAPSHOT');
END;