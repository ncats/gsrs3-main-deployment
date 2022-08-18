/*This a script to modify the type of the RECORD_ACCESS column in 35 GSRS tables.
The modification is necessary because Hibernate has been creating these columns
with type LONG RAW and this leads to problems when retrieving data.
August 2022*/
alter table IX_GINAS_NAMEORG	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_RELATIONSHIP	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_UNIT	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_MATERIAL	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_PROTEIN	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SUBUNIT	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_CODE	modify RECORD_ACCESS raw(255);
IX_CORE_STRUCTURE	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_MIXTURE	modify RECORD_ACCESS raw(255);
POLYMER_CLASSIFICATION	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_PHYSICALMOD	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_STRUCTURALMOD	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_PARAMETER	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SUGAR	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_AMOUNT	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SITE_LOB	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_NOTE	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_NUCLEICACID	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_PHYSICALPAR	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_PROPERTY	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_NAME	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_DEFINITION	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SUBSTANCEREF	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_POLYMER	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_COMPONENT	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SSG1	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_MODIFICATIONS	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_STRUCDIV	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_OTHERLINKS	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_AGENTMOD	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_LINKAGE	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_SUBSTANCE	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_MOIETY	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_GLYCOSYLATION	modify RECORD_ACCESS raw(255);
alter table IX_GINAS_REFERENCE	modify RECORD_ACCESS raw(255);