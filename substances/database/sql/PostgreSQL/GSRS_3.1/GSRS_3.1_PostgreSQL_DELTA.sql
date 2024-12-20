create sequence db_gsrs_version_seq start 1 increment 1;
create table ix_batch_processingjob (id varchar(40) not null, category varchar(255), completed_record_count int4 not null, data text, finish_date timestamp, job_status varchar(255), results text, start_date timestamp, status_message varchar(255), total_records int4 not null, primary key (id));
create table ix_core_db_gsrs_version (id int8 not null, entity varchar(255) not null, hash varchar(255), modified timestamp, version_info varchar(255) not null, primary key (id));
create table ix_core_key_user_list (id int8 not null, entity_key varchar(255), kind varchar(255), list_name varchar(255) not null, user_id int8, primary key (id));
create table ix_core_user_saved_list (id int8 not null, kind varchar(255), list text, name varchar(255) not null, user_id int8, primary key (id));
create table ix_import_data (instance_id varchar(40) not null, data text, entity_class_name varchar(255), record_id varchar(40), save_date timestamp, version int4 not null, primary key (instance_id));
create table ix_import_mapping (mapping_id varchar(40) not null, data_location varchar(255), entity_class varchar(255), instance_id varchar(40), mapping_key varchar(255), qualifier varchar(255), record_id varchar(40), mapping_value varchar(512), instanceId varchar(40), primary key (mapping_id));
create table ix_import_metadata (record_id varchar(40) not null, data_format varchar(255), entity_class_name varchar(255), import_adapter varchar(255), import_status int4, import_type int4, instance_id varchar(40), process_status int4, reason varchar(255), record_access bytea, source_name varchar(255), validation_status int4, version int4 not null, version_creation_date timestamp, version_status int4, imported_by_id int8, primary key (record_id));
create table ix_import_raw (record_id varchar(40) not null, raw_data bytea, record_format varchar(255), primary key (record_id));
create table ix_import_validation (validation_id varchar(40) not null, validation_date timestamp, validation_json text, validation_message varchar(2048), validation_type int4, entity_class_name varchar(255), instance_id varchar(40), version int4 not null, instanceId varchar(40), primary key (validation_id));
alter table ix_core_key_user_list add constraint fk7q0vtv7ajevho6v75n57jy0dj foreign key (user_id) references ix_core_principal;
alter table ix_core_key_user_list add constraint ukbomijjxdp2cmjttgrnqtoucvo unique (entity_key, list_name, user_id, kind);
alter table ix_core_user_saved_list add constraint fkhd1bc5m9wxca27lxoexqjfwei foreign key (user_id) references ix_core_principal;
alter table ix_core_user_saved_list add constraint uknftwibs7mebodwpavq6ub0lqh unique (name, user_id, kind);
alter table ix_import_metadata add constraint UK_b3wth3q98eiauf3rngwjybxve unique (instance_id);
alter table ix_import_metadata add constraint fkn75dm5x09m6wvk7uq5q74do9c foreign key (imported_by_id) references ix_core_principal;
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
