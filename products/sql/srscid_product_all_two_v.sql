CREATE OR REPLACE FORCE VIEW SRSCID_PRODUCT_ALL_TWO_V
(
    PRODUCTID,
    PRODUCTNDC,
    NONPROPRIETARYNAME,
    PRODUCTTYPE,
    STATUS,
    MARKETINGCATEGORYNAME,
    ISLISTED,
    ROUTENAME,
    APPLICATIONNUMBER,
    APPTYPE,
    APPNUMBER,
    COUNTRY,
    COUNTRYWITHOUTCODE,
    LABELERNDC,
    UNITPRESENTATION,
    SOURCE,
    SOURCE_TYPE,
    FROMTABLE,
    PROVENANCE,
    CREATED_BY,
    CREATE_DATE,
    MODIFIED_BY,
    MODIFY_DATE
)
AS
    SELECT DISTINCT
           p.PRODUCTID,
           p.PRODUCTNDC,
           (SELECT LISTAGG (a.nonproprietaryname, '|')
                       WITHIN GROUP (ORDER BY a.nonproprietaryname)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (nonproprietaryname) AS nonproprietaryname
                      FROM elist_product_mv) a
             WHERE a.productid = p.productid)
               AS nonproprietaryname,
           (SELECT DISTINCT
                   REPLACE (
                       LISTAGG (b.producttypename, '|')
                           WITHIN GROUP (ORDER BY (b.producttypename)),
                       'HUMAN PRESCRIPTION DRUG|PLASMA DERIVATIVE',
                       'PLASMA DERIVATIVE')
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (producttypename) AS producttypename
                      FROM elist_product_mv
                     WHERE     NOT UPPER (producttypename) =
                                       'BLANKET NO CHANGES CERTIFICATION OF PRODUCT LISTING'
                           AND NOT UPPER (producttypename) =
                                       'LOT DISTRIBUTION DATA') b
             WHERE b.productid = p.productid)
               AS producttype,
           (SELECT DISTINCT
                   LISTAGG (c.MARKETINGSTATUS, '|')
                       WITHIN GROUP (ORDER BY c.MARKETINGSTATUS)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (MARKETINGSTATUS) AS MARKETINGSTATUS
                      FROM elist_product_mv) c
             WHERE c.productid = p.productid)
               AS status,
           (SELECT DISTINCT
                   LISTAGG (d.marketingcategoryname, '|')
                       WITHIN GROUP (ORDER BY d.marketingcategoryname)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (marketingcategoryname)
                               AS marketingcategoryname
                      FROM elist_product_mv
                     WHERE     NOT (UPPER (marketingcategoryname) =
                                        'BLANKET NO CHANGES CERTIFICATION OF PRODUCT LISTING')
                           AND NOT (UPPER (marketingcategoryname) =
                                        'LOT DISTRIBUTION DATA')) d
             WHERE d.productid = p.productid)
               AS marketingcategoryname,
           (SELECT DISTINCT
                   LISTAGG (e.is_listed, '|')
                       WITHIN GROUP (ORDER BY e.is_listed)
              FROM (SELECT DISTINCT productid, UPPER (is_listed) AS is_listed
                      FROM elist_product_mv) e
             WHERE e.productid = p.productid)
               AS islisted,
           (SELECT DISTINCT
                   LISTAGG (f.routename, '|')
                       WITHIN GROUP (ORDER BY f.routename)
              FROM (SELECT DISTINCT productid, UPPER (routename) AS routename
                      FROM elist_prod_admin_route_mv) f
             WHERE f.productid = p.productid)
               AS routename,
           (SELECT DISTINCT
                   LISTAGG (g.APPLICATIONNUMBER, '|')
                       WITHIN GROUP (ORDER BY g.APPLICATIONNUMBER)
              FROM (SELECT DISTINCT
                           productid,
                           UPPER (APPLICATIONNUMBER) AS APPLICATIONNUMBER
                      FROM elist_product_mv) g
             WHERE g.productid = p.productid)
               AS APPLICATIONNUMBER,
           NULL  AS apptype,
           NULL  AS appnumber,
           e.country,
           SUBSTR (
               e.country,
               0,
               DECODE (INSTR (e.country, '('),
                       0, LENGTH (e.country),
                       INSTR (e.country, '(') - 2))
               countrywithoutcode,
           labelerndc,
           NULL  AS unitpresentation,
           NULL  AS source,
           NULL  AS source_type,
           'SPL' AS fromtable,
           'SPL' AS provenance,
           NULL  AS created_by,
           NULL  AS create_date,
           NULL  AS modified_by,
           NULL  AS modify_date
      FROM elist_product_mv           p,
           elist_establishment        e,
           elist_prod_admin_route_mv  r
     WHERE     p.labelerndc = TO_CHAR (e.ndc_labeler_code(+))
           AND p.productid = r.PRODUCTID(+)
    UNION ALL
    SELECT DISTINCT
           TO_CHAR (p.product_id)                          AS productid,
           (SELECT DISTINCT
                   LISTAGG (a.product_code, '|')
                       WITHIN GROUP (ORDER BY a.product_code)
              FROM (SELECT DISTINCT
                           product_id, UPPER (product_code) AS product_code
                      FROM srscid_product_code) a
             WHERE a.product_id = p.product_id)
               AS productndc,
           nonproprietary_name                             AS nonproprietaryname,
           product_type                                    AS producttype,
           status,
           NULL                                            AS marketingcategoryname,
           NULL                                            AS islisted,
           route_of_administration,
           app_type || app_number                          AS applicationnumber,
           app_type                                        AS apptype,
           app_number                                      AS appnumber,
           p.country_code                                  AS country,
           SUBSTR (
               p.country_code,
               0,
               DECODE (INSTR (p.country_code, '('),
                       0, LENGTH (p.country_code),
                       INSTR (p.country_code, '(') - 2))
               countrywithoutcode,
           NULL                                            AS labelerndc,
           unit_presentation                               AS unitpresentation,
           source,
           source_type,
           'GSRS'                                          AS fromtable,
           DECODE (p.provenance, '', 'GSRS', p.provenance) AS provenance,
           p.created_by,
           p.create_date,
           p.modified_by,
           p.modify_date
      FROM srscid_product p, srscid_product_code c
     WHERE p.product_id = c.product_id(+);

