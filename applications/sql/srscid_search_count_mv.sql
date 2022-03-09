DROP MATERIALIZED VIEW SRSCID_SEARCH_COUNT_MV;

CREATE MATERIALIZED VIEW SRSCID_SEARCH_COUNT_MV 
    (UUID,CODE,SUBSTANCE_KEY,SUBSTANCE_KEY_TYPE,UNII,
     APPCOUNT,PRODACTIVECOUNT,PRODINACTIVECOUNT,CLINICALCOUNT,CASECOUNT,
     CENTER,PROVENANCE)
NOCACHE
NOLOGGING
NOCOMPRESS
BUILD IMMEDIATE
REFRESH FORCE
START WITH SYSDATE
NEXT TRUNC(SYSDATE+1) + 4/24      
WITH PRIMARY KEY
AS
SELECT s.UUID,
       cde.CODE                      AS CODE,
       cde.CODE                      AS substance_key,
       cde.code_system               AS substance_key_type,
       s.APPROVAL_ID                 AS UNII,
       NVL (app.appcount, 0)         AS appcount,
       NVL (b.prodactivecount, 0)    AS prodactivecount,
       NVL (b1.prodinactivecount, 0) AS prodinactivecount,
       NVL (c.clinicalcount, 0)      AS clinicalcount,
       NVL (ae_count.case_count, 0)  AS casecount,
       app.center                    AS Center,
       app.provenance                AS Provenance
  FROM GSRS_PROD.IX_GINAS_CODE            cde,
       GSRS_PROD.IX_GINAS_SUBSTANCE       s,
       (  SELECT app_grp.substance_key,
                 app_grp.substance_key_type,
                 app_grp.center,
                 app_grp.provenance,
                 COUNT (*) AS appcount
            FROM (SELECT DISTINCT t.substance_key,
                                  t.substance_key_type,
                                  a.app_type,
                                  a.app_number,
                                  a.center,
                                  a.provenance
                    FROM srscid_application_type_srs t
                         INNER JOIN srscid_product_srs p
                             ON p.product_id = t.product_id
                         INNER JOIN srscid_application_srs a
                             ON a.application_id = p.application_id) app_grp
        GROUP BY app_grp.substance_key,
                 app_grp.substance_key_type,
                 app_grp.center,
                 app_grp.provenance) app,
       (  SELECT s.uuid,
                 COUNT (
                     DISTINCT    p.productndc
                              || p.proprietaryname
                              || p.labelername
                              || i.substanceunii
                              || i.activemoiety_1_unii)
                     AS prodactivecount
            FROM ELIST_PRODUCT_MV           p,
                 ELIST_PROD_ACTIVE_INGRED_MV i,
                 IX_GINAS_SUBSTANCE      s
           WHERE     p.productid = i.productid
                 AND p.is_listed = 'listed'
                 AND i.substanceunii = s.approval_id
        GROUP BY s.uuid) b,
       (  SELECT s.UUID,
                 COUNT (
                     DISTINCT    p.productndc
                              || p.proprietaryname
                              || p.labelername
                              || i.substanceunii)
                     AS prodinactivecount
            FROM ELIST_PRODUCT_MV             p,
                 ELIST_PROD_INACTIVE_INGRED_MV i,
                 IX_GINAS_SUBSTANCE        s
           WHERE     p.productid = i.productid
                 AND p.is_listed = 'listed'
                 AND i.substanceunii = s.approval_id
        GROUP BY s.uuid) b1,
       (  SELECT cd.SUBSTANCE_UUID, COUNT (*) AS clinicalcount
            FROM CT_CLINICAL_TRIAL c, CT_CLINICAL_TRIAL_DRUG cd
           WHERE c.NCTN = cd.NCTN AND cd.SUBSTANCE_UUID IS NOT NULL
        GROUP BY cd.SUBSTANCE_UUID) c,
       SRSCID_ADVERSE_EVENT_COUNT  ae_count
 WHERE     cde.OWNER_UUID = s.UUID
       AND cde.CODE = app.substance_key(+)
       AND cde.CODE_SYSTEM = 'BDNUM'    -- FDA uses BDNUM as the substance_key
       AND cde.OWNER_UUID = c.SUBSTANCE_UUID(+)
       AND cde.CODE = ae_count.substance_key(+)
       AND cde.code_system = ae_count.substance_key_type
       AND s.UUID = b.UUID(+)
       AND s.UUID = b1.UUID(+);


CREATE INDEX SEARCH_COUNT_CODE_INDX ON SRSCID_SEARCH_COUNT_MV (CODE);

CREATE INDEX SEARCH_COUNT_SKT_INDX ON SRSCID_SEARCH_COUNT_MV (SUBSTANCE_KEY_TYPE);

CREATE INDEX SEARCH_COUNT_SUBST_KEY_INDX ON SRSCID_SEARCH_COUNT_MV (SUBSTANCE_KEY);

CREATE INDEX SRSCID_SRCCOUNT_UNII_INDX ON SRSCID_SEARCH_COUNT_MV (UNII);

CREATE INDEX SRSCID_SRCCOUNT_UUID_INDX ON SRSCID_SEARCH_COUNT_MV (UUID);

