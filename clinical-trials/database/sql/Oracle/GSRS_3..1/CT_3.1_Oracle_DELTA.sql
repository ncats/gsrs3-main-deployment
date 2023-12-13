/* If you have an existing Oracle Clinical Trials schema and you wish to update it manually for version 3.1, then make the following changes. */

/* ==== CHANGE #1 ==== */

/* EU First create backup of table */
create table ctrial_eu_temp as select * from ctrial_eu;

/* EU Then make clobs */
alter table ctrial_eu add (title_new CLOB);
update ctrial_eu ct set ct.title_new=to_clob(ct.title);
alter table ctrial_eu drop column title;
alter table ctrial_eu rename column title_new to title;

/* US First create backup of table */
create table ctrial_us_temp as select * from ctrial_us;

/* US Then make clobs */
alter table ctrial_us add (title_new CLOB);
update ctrial_us ct set ct.title_new=to_clob(ct.title);
alter table ctrial_us drop column title;
alter table ctrial_us rename column title_new to title;
alter table ctrial_us add (acronym_new CLOB);
update ctrial_us ct set ct.acronym_new=to_clob(ct.acronym);
alter table ctrial_us drop column acronym;
alter table ctrial_us rename column acronym_new to acronym;
alter table ctrial_us add (conditions_new CLOB);
update ctrial_us ct set ct.conditions_new=to_clob(ct.conditions);
alter table ctrial_us drop column conditions;
alter table ctrial_us rename column conditions_new to conditions;
alter table ctrial_us add (enrollment_new CLOB);
update ctrial_us ct set ct.enrollment_new=to_clob(ct.enrollment);
alter table ctrial_us drop column enrollment;
alter table ctrial_us rename column enrollment_new to enrollment;
alter table ctrial_us add (funded_bys_new CLOB);
update ctrial_us ct set ct.funded_bys_new=to_clob(ct.funded_bys);
alter table ctrial_us drop column funded_bys;
alter table ctrial_us rename column funded_bys_new to funded_bys;
alter table ctrial_us add (intervention_new CLOB);
update ctrial_us ct set ct.intervention_new=to_clob(ct.intervention);
alter table ctrial_us drop column intervention;
alter table ctrial_us rename column intervention_new to intervention;
alter table ctrial_us add (locations_new CLOB);
update ctrial_us ct set ct.locations_new=to_clob(ct.locations);
alter table ctrial_us drop column locations;
alter table ctrial_us rename column locations_new to locations;
alter table ctrial_us add (other_ids_new CLOB);
update ctrial_us ct set ct.other_ids_new=to_clob(ct.other_ids);
alter table ctrial_us drop column other_ids;
alter table ctrial_us rename column other_ids_new to other_ids;
alter table ctrial_us add (outcome_measures_new CLOB);
update ctrial_us ct set ct.outcome_measures_new=to_clob(ct.outcome_measures);
alter table ctrial_us drop column outcome_measures;
alter table ctrial_us rename column outcome_measures_new to outcome_measures;
alter table ctrial_us add (phases_new CLOB);
update ctrial_us ct set ct.phases_new=to_clob(ct.phases);
alter table ctrial_us drop column phases;
alter table ctrial_us rename column phases_new to phases;
alter table ctrial_us add (recruitment_new CLOB);
update ctrial_us ct set ct.recruitment_new=to_clob(ct.recruitment);
alter table ctrial_us drop column recruitment;
alter table ctrial_us rename column recruitment_new to recruitment;
alter table ctrial_us add (results_first_received_new CLOB);
update ctrial_us ct set ct.results_first_received_new=to_clob(ct.results_first_received);
alter table ctrial_us drop column results_first_received;
alter table ctrial_us rename column results_first_received_new to results_first_received;
alter table ctrial_us add (sponsor_new CLOB);
update ctrial_us ct set ct.sponsor_new=to_clob(ct.sponsor);
alter table ctrial_us drop column sponsor;
alter table ctrial_us rename column sponsor_new to sponsor;
alter table ctrial_us add (study_designs_new CLOB);
update ctrial_us ct set ct.study_designs_new=to_clob(ct.study_designs);
alter table ctrial_us drop column study_designs;
alter table ctrial_us rename column study_designs_new to study_designs;
alter table ctrial_us add (study_results_new CLOB);
update ctrial_us ct set ct.study_results_new=to_clob(ct.study_results);
alter table ctrial_us drop column study_results;
alter table ctrial_us rename column study_results_new to study_results;
alter table ctrial_us add (study_types_new CLOB);
update ctrial_us ct set ct.study_types_new=to_clob(ct.study_types);
alter table ctrial_us drop column study_types;
alter table ctrial_us rename column study_types_new to study_types;

/* ==== CHANGE #2 ==== */

CREATE TABLE "SRSCID"."CTRIAL_US_OUTCOME_RESULT"
   (	"ID" NUMBER(19,0),
	"NARRATIVE" CLOB,
	"OUTCOME" CLOB,
	"RESULT" CLOB,
	"TRIAL_NUMBER" VARCHAR2(255 CHAR)
   ) SEGMENT CREATION IMMEDIATE
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID"
 LOB ("NARRATIVE") STORE AS SECUREFILE (
  TABLESPACE "SRSCID" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT))
 LOB ("OUTCOME") STORE AS SECUREFILE (
  TABLESPACE "SRSCID" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT))
 LOB ("RESULT") STORE AS SECUREFILE (
  TABLESPACE "SRSCID" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) ;

CREATE UNIQUE INDEX "SRSCID"."SYS_C0018897" ON "SRSCID"."CTRIAL_US_OUTCOME_RESULT" ("ID")
  PCTFREE 10 INITRANS 2 MAXTRANS 255
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID" ;

ALTER TABLE "SRSCID"."CTRIAL_US_OUTCOME_RESULT" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "SRSCID"."CTRIAL_US_OUTCOME_RESULT" ADD PRIMARY KEY ("ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID"  ENABLE;

ALTER TABLE "SRSCID"."CTRIAL_US_OUTCOME_RESULT" ADD CONSTRAINT "FK5OV22VRUGNRVOLDRT15V7BVRR" FOREIGN KEY ("TRIAL_NUMBER")
	  REFERENCES "SRSCID"."CTRIAL_US" ("TRIAL_NUMBER") ENABLE;
	 
CREATE TABLE "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE"
   (	"ID" NUMBER(19,0),
	"SUBSTANCE_ROLE" VARCHAR2(500 CHAR),
	"SUBSTANCE_ID" NUMBER(19,0)
   ) SEGMENT CREATION IMMEDIATE
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID" ;

 CREATE UNIQUE INDEX "SRSCID"."SYS_C0018900" ON "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE" ("ID")
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID" ;

ALTER TABLE "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE" MODIFY ("SUBSTANCE_ID" NOT NULL ENABLE);
  ALTER TABLE "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE" ADD PRIMARY KEY ("ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "SRSCID"  ENABLE;

ALTER TABLE "SRSCID"."CTRIAL_US_SUBSTANCE_ROLE" ADD CONSTRAINT "FK9YODRJG9OP6CFAMP8H27BE19R" FOREIGN KEY ("SUBSTANCE_ID")
	  REFERENCES "SRSCID"."CTRIAL_US_DRUG" ("ID") ENABLE;

/* Change 3 */

CREATE SEQUENCE  "SRSCID"."CTRIALUS_SR_SQ_ID"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 21 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;
CREATE SEQUENCE  "SRSCID"."CTRIALUS_ORN_SQ_ID"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 21 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;


