DROP VIEW SRSCID_PRODUCT_ING_ALL_TWO_V;

CREATE OR REPLACE FORCE VIEW SRSCID_PRODUCT_ING_ALL_TWO_V
(
    ID,
    PRODUCTID,
    BDNUM,
    SUBSTANCE_KEY,
    SUBSTANCE_KEY_TYPE,
    BASISOFSTRENGTH,
    BOS_SUBSTANCE_KEY,
    BOS_SUBSTANCE_KEY_TYPE,
    SUBSTANCENAME,
    SUBSTANCE_APPROVAL_ID,
    SUBSTANCE_UUID,
    INGREDIENTTYPE,
    STRENGTHNUMBER,
    STRENGTHNUMERATORUNIT,
    ACTIVEMOIETY_1_NAME,
    ACTIVEMOIETY_1_UNII,
    DOSAGEFORM,
    FROMTABLE
)
    BEQUEATH DEFINER
AS
    SELECT DISTINCT
              p.productid
           || pa.substanceunii
           || pa.strengthnumber
           || pa.documentid
           || cd.code
           || 'act'
               AS id,
           p.productid,
           cd.code             AS BDNUM,
           cd.code             AS subtance_key,
           cd.code_system      AS subtance_key_type,
           NULL                AS basisofstrength,
           NULL                AS bos_substance_key,
           NULL                AS bos_substance_key_type,
           pa.substancename,
           pa.substanceunii    AS substance_approval_ID,
           s.uuid              AS substance_uuid,
           'Active Ingredient' AS ingredienttype,
           pa.strengthnumber,
           NULL                AS strengthnumeratorunit,
           activemoiety_1_name,
           activemoiety_1_unii,
           (SELECT LISTAGG (a.dosageformname, '|')
                       WITHIN GROUP (ORDER BY a.dosageformname)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (dosageformname) AS dosageformname
                      FROM elist_product_mv) a
             WHERE a.productid = p.productid)
               AS dosageform,
           'SPL'               AS fromtable
      FROM elist_product_mv              p,
           elist_prod_active_ingred_mv   pa,
           ix_ginas_substance  s,
           ix_ginas_code       cd
     WHERE     p.productid = pa.productid
           AND pa.substanceunii = s.approval_id(+)
           AND cd.owner_uuid = s.uuid
           AND cd.code_system = 'BDNUM'
           AND cd.TYPE = 'PRIMARY'
    UNION
    SELECT DISTINCT
              p.productid
           || pa.substanceunii
           || pa.strengthnumber
           || pa.documentid
           || cd.code
           || 'inact'
               AS id,
           p.productid,
           cd.code               AS bdnum,
           cd.code               AS subtance_key,
           cd.code_system        AS subtance_key_type,
           NULL                  AS basisofstrength,
           NULL                  AS bos_substance_key,
           NULL                  AS bos_substance_key_type,
           pa.substancename,
           pa.substanceunii      AS substance_approval_ID,
           s.uuid                AS substance_uuid,
           'Inactive Ingredient' AS ingredienttype,
           pa.strengthnumber,
           NULL                  AS strengthnumeratorunit,
           NULL                  AS activemoiety_1_name,
           NULL                  AS activemoiety_1_unii,
           (SELECT LISTAGG (a.dosageformname, '|')
                       WITHIN GROUP (ORDER BY a.dosageformname)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (dosageformname) AS dosageformname
                      FROM elist_product_mv) a
             WHERE a.productid = p.productid)
               AS dosageform,
           'SPL'                 AS fromtable
      FROM elist_product_mv               p,
           elist_prod_inactive_ingred_mv  pa,
           ix_ginas_substance   s,
           ix_ginas_code        cd
     WHERE     p.productid = pa.productid
           AND pa.substanceunii = s.approval_id(+)
           AND cd.owner_uuid = s.uuid
           AND cd.code_system = 'BDNUM'
           AND cd.TYPE = 'PRIMARY'
    UNION ALL
    SELECT DISTINCT
              c.product_id
           || c.product_component_id
           || i.product_lot_id
           || i.product_ingred_id
               AS id,
           TO_CHAR (c.product_id)   AS productid,
           i.substance_key          AS bdnum,
           i.substance_key          AS subtance_key,
           i.substance_key_type     AS subtance_key_type,
           i.bos_substance_key      AS basisofstrength,
           i.bos_substance_key      AS bos_substance_key,
           i.bos_substance_key_type AS bos_substance_key_type,
           n.name                   AS substancename,
           s.approval_id            AS substance_approval_ID,
           s.uuid                   AS substance_uuid,
           ingredient_type          AS ingredienttype,
           average                  AS strengthnumber,
           i.unit                   AS strengthnumeratorunit,
           NULL                     AS activemoiety_1_name,
           NULL                     AS activemoiety_1_unii,
           (SELECT LISTAGG (b.dosage_form, '|')
                       WITHIN GROUP (ORDER BY b.dosage_form)
              FROM (SELECT DISTINCT
                           product_id, UPPER (dosage_form) AS dosage_form
                      FROM srscid_product_component b) b
             WHERE b.product_id = c.product_id)
               AS dosageform,
           'GSRS'                   AS fromtable
      FROM srscid_product_component      c,
           srscid_product_lot            l,
           srscid_product_ingredient     i,
           ix_ginas_substance  s,
           ix_ginas_name       n,
           ix_ginas_code       cd
     WHERE     c.product_component_id = l.product_component_id(+)
           AND l.product_lot_id = i.product_lot_id(+)
           AND i.substance_key = cd.code(+)
           AND i.substance_key_type = cd.code_system
           AND cd.code_system = 'BDNUM'
           AND cd.OWNER_UUID = s.uuid(+)
           AND n.owner_uuid = s.uuid
           AND n.display_name = 1;

