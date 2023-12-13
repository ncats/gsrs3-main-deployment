create sequence db_gsrs_version_seq start with 1 increment by  1;

create table ix_batch_processingjob (id varchar2(40 char) not null, category varchar2(255 char), completed_record_count number(10,0) not null, data clob, finish_date timestamp, job_status varchar2(255 char), results clob, start_date timestamp, status_message varchar2(255 char), total_records number(10,0) not null, primary key (id));
create table ix_core_db_gsrs_version (id number(19,0) not null, entity varchar2(255 char) not null, hash varchar2(255 char), modified timestamp, version_info varchar2(255 char) not null, primary key (id));
create table ix_core_key_user_list (id number(19,0) not null, entity_key varchar2(255 char), kind varchar2(255 char), list_name varchar2(255 char) not null, user_id number(19,0), primary key (id));
create table ix_core_user_saved_list (id number(19,0) not null, kind varchar2(255 char), list clob, name varchar2(255 char) not null, user_id number(19,0), primary key (id));
create table ix_import_data (instance_id varchar2(40 char) not null, data clob, entity_class_name varchar2(255 char), record_id varchar2(40 char), save_date timestamp, version number(10,0) not null, primary key (instance_id));
create table ix_import_mapping (mapping_id varchar2(40 char) not null, data_location varchar2(255 char), entity_class varchar2(255 char), instance_id varchar2(40 char), mapping_key varchar2(255 char), qualifier varchar2(255 char), record_id varchar2(40 char), mapping_value varchar2(512 char), instanceId varchar2(40 char), primary key (mapping_id));
create table ix_import_metadata (record_id varchar2(40 char) not null, data_format varchar2(255 char), entity_class_name varchar2(255 char), import_adapter varchar2(255 char), import_status number(10,0), import_type number(10,0), instance_id varchar2(40 char), process_status number(10,0), reason varchar2(255 char), record_access raw(255), source_name varchar2(255 char), validation_status number(10,0), version number(10,0) not null, version_creation_date timestamp, version_status number(10,0), primary key (record_id));
create table ix_import_raw (record_id varchar2(40 char) not null, raw_data blob, record_format varchar2(255 char), primary key (record_id));
create table ix_import_validation (validation_id varchar2(40 char) not null, validation_date timestamp, validation_json clob, validation_message varchar2(2048 char), validation_type number(10,0), entity_class_name varchar2(255 char), instance_id varchar2(40 char), version number(10,0) not null, instanceId varchar2(40 char), primary key (validation_id));

alter table ix_core_key_user_list add constraint fk7q0vtv7ajevho6v75n57jy0dj foreign key (user_id) references ix_core_principal;
alter table ix_core_key_user_list add constraint ukbomijjxdp2cmjttgrnqtoucvo unique (entity_key, list_name, user_id, kind);
alter table ix_core_user_saved_list add constraint fkhd1bc5m9wxca27lxoexqjfwei foreign key (user_id) references ix_core_principal;
alter table ix_core_user_saved_list add constraint uknftwibs7mebodwpavq6ub0lqh unique (name, user_id, kind);
alter table ix_import_metadata add constraint UK_b3wth3q98eiauf3rngwjybxve unique (instance_id);

create index idx_ix_import_data_entity_class_name on ix_import_data (entity_class_name);
create index idx_ix_import_data_record_id on ix_import_data (record_id);
create index idx_ix_import_data_version on ix_import_data (version);
create index idx_ix_import_mapping_instance_id on ix_import_mapping (instance_id);
create index idx_ix_import_mapping_key on ix_import_mapping (mapping_key);
create index idx_ix_import_mapping_value on ix_import_mapping (mapping_value);
create index idx_ix_import_metadata_entity_class_name on ix_import_metadata (entity_class_name);
create index idx_ix_import_validation_entity_class_name on ix_import_validation (entity_class_name);
create index idx_ix_import_validation_instance_id on ix_import_validation (instance_id);
create index idx_ix_import_validation_version on ix_import_validation (version);

alter table ix_ginas_vocabulary_term rename column value to term_value;


