DROP MATERIALIZED VIEW SRSCID_PRODUCT_SRS_ALL_MV;

CREATE MATERIALIZED VIEW SRSCID_PRODUCT_SRS_ALL_MV 
    (PRODUCT_ID,APPLICATION_ID,APP_TYPE,APP_NUMBER,PRODUCT_NAME,
     DOSAGE_FORM,ROUTE_OF_ADMINISTRATION,FROMTABLE)
TABLESPACE SRSCID
PCTUSED    0
PCTFREE    10
INITRANS   2
MAXTRANS   255
STORAGE    (
            INITIAL          64K
            NEXT             1M
            MINEXTENTS       1
            MAXEXTENTS       UNLIMITED
            PCTINCREASE      0
            BUFFER_POOL      DEFAULT
           )
NOCACHE
NOLOGGING
NOCOMPRESS
BUILD IMMEDIATE
REFRESH FORCE
START WITH SYSDATE
NEXT TRUNC(SYSDATE+1) + 4/24      
WITH PRIMARY KEY
AS
SELECT DISTINCT a.app_type || a.app_number AS product_id,
                a.app_type || a.app_number AS application_id,
                a.app_type,
                a.app_number,
                product_name               AS product_name,
                a.dosage_form_desc         AS dosage_form,
                a.route_of_admin           AS route_of_administration,
                'Integrity'                AS FROMTABLE
  FROM SRSCID_APPLICATION_MV a
UNION
SELECT DISTINCT TO_CHAR (a.product_id),
                TO_CHAR (a.application_id),
                a.app_type,
                a.app_number,
                a.product_name,
                a.dosage_form,
                a.route_of_administration,
                'GSRS' AS FROMTABLE
  FROM SRSCID_PRODUCT_SRS a;


CREATE INDEX APPPRODSRSALLMV_PRODNAME_INDX ON SRSCID_PRODUCT_SRS_ALL_MV
(PRODUCT_NAME)
LOGGING
TABLESPACE SRSCID
PCTFREE    10
INITRANS   2
MAXTRANS   255
STORAGE    (
            INITIAL          64K
            NEXT             1M
            MINEXTENTS       1
            MAXEXTENTS       UNLIMITED
            PCTINCREASE      0
            BUFFER_POOL      DEFAULT
           );

CREATE INDEX APPPRODSRS_ALL_APP_ID ON SRSCID_PRODUCT_SRS_ALL_MV
(APPLICATION_ID)
LOGGING
TABLESPACE SRSCID
PCTFREE    10
INITRANS   2
MAXTRANS   255
STORAGE    (
            INITIAL          64K
            NEXT             1M
            MINEXTENTS       1
            MAXEXTENTS       UNLIMITED
            PCTINCREASE      0
            BUFFER_POOL      DEFAULT
           );

