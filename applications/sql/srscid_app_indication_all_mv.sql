DROP MATERIALIZED VIEW SRSCID_APP_INDICATION_ALL_MV;

CREATE MATERIALIZED VIEW SRSCID_APP_INDICATION_ALL_MV 
    (ID,APPLICATION_ID,APP_TYPE,APP_NUMBER,INDICATION)
NOCACHE
NOLOGGING
NOCOMPRESS
BUILD IMMEDIATE
REFRESH FORCE
START WITH SYSDATE
NEXT TRUNC(SYSDATE+1) + 4/24          
WITH PRIMARY KEY
AS 
SELECT DISTINCT
       a.app_type || a.app_number || ida.indication AS id,
       a.app_type || a.app_number                   AS application_id,
       a.app_type,
       a.app_number,
       ida.indication_essential                     AS indication
  FROM SRSCID_APP_INDICATION_MV ida, SRSCID_APPLICATION_MV a
 WHERE ida.app_type = a.app_type AND ida.app_number = a.app_number
UNION
SELECT DISTINCT TO_CHAR (A.APPLICATION_ID) AS id,
                TO_CHAR (a.application_id) AS application_id,
                a.app_type,
                a.app_number,
                i.indication
  FROM SRSCID_APP_INDICATION_SRS i, SRSCID_APPLICATION_SRS a
 WHERE i.application_id_fk = a.application_id;
 
 
