DROP MATERIALIZED VIEW SRSCID_APPLICATION_TYPE_ALL_MV;

CREATE MATERIALIZED VIEW SRSCID_APPLICATION_TYPE_ALL_MV 
    (APPLICATION_TYPE_ID,PRODUCT_ID,APP_TYPE,APP_NUMBER,BDNUM,
     SUBSTANCE_KEY,SUBSTANCE_KEY_TYPE,INGREDIENT_TYPE,APPLICANT_INGRED_NAME,FROMTABLE)
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
       a.app_type || a.app_number || a.substance_key || a.activity
           AS application_type_id,
       a.app_type || a.app_number AS product_id,
       a.app_type,
       a.app_number,
       a.substance_key            AS BDNUM,
       a.substance_key            AS substance_key,
       a.substance_key_type       AS substance_key_type,
       a.activity                 AS ingredient_type,
       NULL                       AS applicant_ingred_name,
       'Integrity'                AS fromtable
  FROM SRSCID_APPLICATION_TYPE_MV a
UNION
SELECT DISTINCT TO_CHAR (a.application_type_id),
                TO_CHAR (a.product_id),
                a.app_type,
                a.app_number,
                a.substance_key      AS BDNUM,
                a.substance_key      AS substance_key,
                a.substance_key_type AS substance_key_type,
                a.ingredient_type,
                a.applicant_ingred_name,
                'GSRS'               AS fromtable
  FROM SRSCID_APPLICATION_TYPE_SRS a;


CREATE UNIQUE INDEX APP_TYPE_ALL_MV_PK ON SRSCID_APPLICATION_TYPE_ALL_MV (APPLICATION_TYPE_ID);

CREATE INDEX APPTYPEALLMV_BDNUM_INDX ON SRSCID_APPLICATION_TYPE_ALL_MV (BDNUM);

CREATE INDEX APPTYPEALLMV_INGREDTYPE_INDX ON SRSCID_APPLICATION_TYPE_ALL_MV (INGREDIENT_TYPE);

CREATE INDEX APPTYPEALLMV_PRODUCTID_INDX ON SRSCID_APPLICATION_TYPE_ALL_MV (PRODUCT_ID);

CREATE INDEX APPTYPEALLMV_SUBSTANCEKEY_INDX ON SRSCID_APPLICATION_TYPE_ALL_MV (SUBSTANCE_KEY);

