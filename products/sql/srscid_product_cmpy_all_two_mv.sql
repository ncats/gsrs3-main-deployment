DROP MATERIALIZED VIEW SRSCID_PRODUCT_CMPY_ALL_TWO_MV;

CREATE MATERIALIZED VIEW SRSCID_PRODUCT_CMPY_ALL_TWO_MV 
    (ID,PRODUCTID,LABELERNAME,LABELERDUNS,FEINUMBER,
     NDC_LABELER_CODE,ADDRESS,CITY,STATE,ZIP,
     COUNTRY,COUNTRYWITHOUTCODE,FROMTABLE)
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
NEXT TRUNC(SYSDATE+1) + 5/24           
WITH PRIMARY KEY
AS
SELECT DISTINCT
       p.productid || e.firm_name || establishment_id AS id,
       p.productid                                    AS productid,
       e.firm_name                                    AS labelername,
       TO_CHAR (e.DUNS_NUMBER)                        AS labelerduns,
       TO_CHAR (e.fei_number)                         AS feinumber,
       e.ndc_labeler_code,
       address,
       city,
       state,
       zip,
       e.country,
       SUBSTR (
           e.country,
           0,
           DECODE (INSTR (e.country, '('),
                   0, LENGTH (e.country),
                   INSTR (e.country, '(') - 2))
           AS countrywithoutcode,
       'SPL'                                          AS fromtable
  FROM (SELECT DISTINCT p1.productid, p1.labelerndc
          FROM elist_product_mv p1) p,
       elist_establishment  e
 WHERE p.labelerndc = TO_CHAR (e.ndc_labeler_code(+))
UNION ALL
SELECT TO_CHAR (product_company_id) AS id,
       TO_CHAR (pv.product_id)      AS productid,
       company_name                 AS labelername,
       company_code                 AS LABELERDUNS,
       NULL                         AS feinumber,
       NULL                         AS ndclabercode,
       company_address              AS address,
       company_city                 AS city,
       company_state                AS state,
       company_zip                  AS zip,
       company_country              AS country,
       SUBSTR (
           company_country,
           0,
           DECODE (INSTR (company_country, '('),
                   0, LENGTH (company_country),
                   INSTR (company_country, '(') - 2))
           AS countrywithoutcode,
       'GSRS'                       AS fromtable
  FROM srscid_product_company c, srscid_product_provenance pv
 WHERE c.product_provenance_id = pv.product_provenance_id;


CREATE INDEX SRSCID.PRODCMPYALLTWOMV_ID_INDX ON SRSCID_PRODUCT_CMPY_ALL_TWO_MV
(ID)
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

CREATE INDEX SRSCID.PRODCMPYALLTWOMV_PRODID_INDX ON SRSCID_PRODUCT_CMPY_ALL_TWO_MV
(PRODUCTID)
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

