DROP MATERIALIZED VIEW SRSCID_PRODUCT_NAME_ALL_TWO_MV;

CREATE MATERIALIZED VIEW SRSCID_PRODUCT_NAME_ALL_TWO_MV 
    (ID,PRODUCTID,PRODUCTNAME,FROMTABLE)
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
SELECT DISTINCT productid || proprietaryname AS id,
                productid,
                proprietaryname              AS productname,
                'SPL'                        AS fromtable
  FROM ELIST_PRODUCT_MV
UNION ALL
SELECT DISTINCT TO_CHAR (n.product_name_id) AS id,
                TO_CHAR (pv.product_id),
                n.product_name              AS productname,
                'GSRS'                      AS fromtable
  FROM srscid_product_name n, srscid_product_provenance pv
 WHERE n.product_provenance_id = pv.product_provenance_id;


CREATE INDEX SRSCID.PRODNAMEALLTWOMV_ID_INDX ON SRSCID_PRODUCT_NAME_ALL_TWO_MV
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

CREATE INDEX SRSCID.PRODNAMEALLTWOMV_PRODID_INDX ON SRSCID_PRODUCT_NAME_ALL_TWO_MV
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

CREATE INDEX SRSCID.PRODNAMEALLTWOMV_PRODNAME_INDX ON SRSCID_PRODUCT_NAME_ALL_TWO_MV
(PRODUCTNAME)
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


