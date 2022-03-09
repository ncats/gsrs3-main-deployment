DROP MATERIALIZED VIEW SRSCID_APPLICATION_ALL_MV;

CREATE MATERIALIZED VIEW SRSCID_APPLICATION_ALL_MV 
    (APPLICATION_ID,APP_TYPE,APP_NUMBER,CENTER,PROVENANCE,
     FROMTABLE,APPLICATION_TITLE,NONPROPRIETARY_NAME,SPONSOR_NAME,APP_SUB_TYPE,
     STATUS,APPLICATION_UPDATE_DATE,STATUS_DATE,SUBMIT_DATE,DIVISION_CLASS_DESC,
     IN_DARRTS_DETAIL)
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
SELECT DISTINCT a.app_type || a.app_number     AS application_id,
                a.app_type,
                a.app_number,
                'CDER'                         AS center,
                'DARRTS'                       AS provenance,
                'Integrity'                    AS fromtable,
                NULL                           AS application_title,
                NULL                           AS nonproprietary_name,
                a.sponsor_name,
                a.app_sub_type,
                a.app_status                   AS status,
                a.app_status_date              AS application_update_date,
                a.app_status_date              AS status_date,
                NULL                           AS submit_date,
                a.division_class_desc,
                NVL2 (a.app_type, 'yes', 'no') AS in_darrts_detail
  FROM SRSCID_APPLICATION_MV a
UNION
SELECT DISTINCT TO_CHAR (a.application_id) AS application_id,
                a.app_type,
                a.app_number,
                a.center,
                a.provenance,
                'GSRS'                     AS fromtable,
                a.application_title,
                a.nonproprietary_name,
                a.sponsor_name,
                a.app_sub_type,
                a.status                   AS status,
                a.modify_date              AS application_update_date,
                a.status_date,
                a.submit_date,
                a.division_class_desc,
                NULL                       AS in_darrts_detail
  FROM SRSCID_APPLICATION_SRS a;


CREATE INDEX APPALLMV_APPLICATION_ID_INDX ON SRSCID_APPLICATION_ALL_MV
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

CREATE INDEX APPALLMV_APPNUM_INDX ON SRSCID_APPLICATION_ALL_MV
(APP_NUMBER)
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

CREATE INDEX APPALLMV_APPSUBTYPE_INDX ON SRSCID_APPLICATION_ALL_MV
(APP_SUB_TYPE)
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

CREATE INDEX APPALLMV_APPTYPE_INDX ON SRSCID_APPLICATION_ALL_MV
(APP_TYPE)
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

CREATE INDEX APPALLMV_CENTER_INDX ON SRSCID_APPLICATION_ALL_MV
(CENTER)
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

CREATE INDEX APPALLMV_DIVCLASS_INDX ON SRSCID_APPLICATION_ALL_MV
(DIVISION_CLASS_DESC)
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

CREATE INDEX APPALLMV_FROMTAB_INDX ON SRSCID_APPLICATION_ALL_MV
(FROMTABLE)
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

CREATE INDEX APPALLMV_PROVENANCE_INDX ON SRSCID_APPLICATION_ALL_MV
(PROVENANCE)
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

CREATE INDEX APPALLMV_SPONNAME_INDX ON SRSCID_APPLICATION_ALL_MV
(SPONSOR_NAME)
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

CREATE INDEX APPALLMV_STATUS_INDX ON SRSCID_APPLICATION_ALL_MV
(STATUS)
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

