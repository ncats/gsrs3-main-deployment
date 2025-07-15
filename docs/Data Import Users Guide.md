# Data Import in GSRS 3.1

## A User’s Guide

### Document History Version



| Version | Date              | Author |
| ------- | ----------------- | ------ |
| 0.1     | 30 June 2023      | MM     |
| 0.2     | 5 July 2023       | MM     |
| 0.3     | 6 November 2023   | MM     |
| 1.0     | 24 September 2024 | MM     |

Background
==========

GSRS has supported data exchange since at least version 2.0. The ability was limited to files of GSRS JSON that can be exported from one installation of GSRS after a search or while browsing the entire database and imported in their entirety in another installation of GSRS.

Any selection or transformation of the data required custom tools that were used on the exported file before it was loaded into the next installation.



<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_data_exchange.png" 
alt="Data exchange shown as before and after. Before contains a box called 'custom data ETL tools' After shows tools integrated into GSRS" width=85% />
</div>
<div align="center">
  Figure 1: Data Exchange Architecture (high level), before and after the 3.1 release of GSRS
</div>



With GSRS 3.1, the team developed a vision of building data selection and transformation tools _inside_ GSRS itself to reduce the need for custom software and to provide standardization in the handling of data.

The initial vision of the team was fairly broad: support import of a variety of file types:

*   GSRS compressed JSON files \[available in version 3.1\]
*   SD (structure data) files \[available in version 3.1\]
*   Delimited text files \[coming in a future release\]
*   Excel spreadsheets \[coming in a future release\]

Because data import functionality is so powerful – giving a single user the ability to add thousands of records to GSRS in a brief period – we have limited access to import functionality (at least for now) to GSRS administrators.

For the 3.1 release, we concentrated our efforts on 2 points:

*   Support robust facilities for importing gsrs file (with capabilities that were not available earlier) as well as SD files (including comprehensive field mapping selections).
*   Create the architecture that serves as a base for further file types and operations.


### Overview of the import process
<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_process_overview.png" 
alt="Overview of data import process, from start (file selection), through file upload, to initial view, to the staging area, processing and eventually, the GSRS database" width=85% />
</div>
<div align="center">
  Figure 2: Data import process workflow overview
</div>
## How to import an SD file

### Background


SD files are a means of exchanging chemical information. They consist of a molfile (representation of a chemical structure), optionally followed by text/numeric data fields in a sequential format.

More information is available here:

[https://en.wikipedia.org/wiki/Chemical\_table\_file](https://en.wikipedia.org/wiki/Chemical_table_file)

[https://discover.3ds.com/ctfile-documentation-request-form](https://discover.3ds.com/ctfile-documentation-request-form)

### Steps

SD files are very commonly used by chemists and chemically savvy organizations to send information from one place to another. For example, PubChem (https://pubchem.ncbi.nlm.nih.gov/), ChemBL ([https://www.ebi.ac.uk/chembl/](https://www.ebi.ac.uk/chembl/)) provide data in SD file format for download. Organizations within the GSRS community often receive data in SD file format and wish to load into GSRS. Therefore, we prioritized SD file import for GSRS 3.1

#### Make sure you’re logged into GSRS as an administrative user.

Select the Admin Panel from the drop-down menu at the top of the screen, on the right side.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/import_start_with_admin.png" 
alt="How the import process starts: selecting the Admin panel from the user menu" width="35%" height="50%" />
</div>
<div align="center">
  Figure 3: Data import process start
</div>




<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_admin_panel_tabs.png" 
alt="View of GSRS admin panel showing the tabs: Server Status; Service Information; User Management; Data Import; CV Management; Scheduled Jobs; All files; Data Managerment (Legacy)" width=85% />
</div>
<div align="center">
  Figure 4: Admin panel
</div>
#### Select the ‘Data Import’ tab on the Admin Panel.

#### Use the ‘Select File to Import’ button to bring up an open file dialog box:

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_import_initial_dialog.png" 
alt="Import screen with controls to select a file for upload and launch an import" width=85% />
</div>
<div align="center">
  Figure 5: import screen, initial view
</div>




<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_file_selection.png" 
alt="Select a file for upload and launch an import using Firefox" width="65%" height="55%"/>
</div>
<div align="center">
  Figure 6: file selection
</div>






#### Select an SD file.

The system now recognizes that you have selected an SD file and selects the appropriate adapter. (Note: if, for some reason, the system selects an incorrect adapter, you can change the selection of adapter by selecting the appropriate radio button.)

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_adapter_selection.png" 
alt="Confirm the selection of an import adapter (SDF Adapter for SD files)" width=85% />
</div>
<div align="center">
  Figure 7: file adapter confirmation
</div>


#### Click the Upload button.

The system now attempts to guess the appropriate processing action for each field in your file

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_field_mapping_and_data_preview.png" 
alt="Select how fields in the file get mapped to GSRS fields AND view a preview of the data)" width=15% />
</div>
<div align="center">
  Figure 8: field mapping and data preview
</div>






#### Check field mappings

Each field is listed along with the selected action and a hotlink to change the action.

For example, the file field PUBCHEM\_CACTVS\_ROTATABLE\_BOND field is recognized as a GSRS property.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_one_field_close-up.png" 
alt="Close-up view of the mapping of field PUBCHEM_CACTVS_ROTATABLE_BOND to a GSRS property" width=85% />
</div>
<div align="center">
  Figure 9: One field mapping shown in close-up
</div>



The preview panel on the right side of the screen shows how the data would look if the current set of processing instructions were followed.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_data_preview.png" 
alt="Preview of one record before the file is loaded into the staging area" width="75%" height="75%"/>
</div>
<div align="center">
  Figure 10: Data preview
</div>




Clicking on the Settings link brings up a dialog box where you can change the way the field is mapped to GSRS fields:

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_one_field_mapping_dialog.png" 
alt="Dialog for changing how a single file field is mapped to GSRS. In this example, the field PUBCHEM_CACTVS_ROTATABLE_BOND has been marked as a Property.  We could also turn it into a Name, Code, or Note." width=85% />
</div>
<div align="center">
  Figure 11: Changing the mapping of one field
</div>





<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_turn_one_field_into_note.png" 
alt="Dialog modified to show field PUBCHEM_CACTVS_ROTATABLE_BOND slated to become a GSRS Note. This is merely an example of what the software can do." width=85% />
</div>
<div align="center">
  Figure 12: Field mapping changed
</div>



Figure Mapping Dialog after we have changed the processing of this field to 'Create Note Action'

You can click the ‘Ignore Field’ checkbox to have GSRS skip processing of a field.

After making changes to field processing, you can, optionally, click the ‘Reload Preview’ button to reinitialize the preview of the data.

#### Move the file data into the staging area

Once the data look the way you intend them to look, click ‘Use Setting and Continue.’

At this point, GSRS reads each record in your file, applies the mapping actions you selected and creates GSRS substances. These substances are validated, compared to the records already in your GSRS database, stored within a temporary database (the ‘staging area’ as explained below) and indexed for searching.

Depending on the size of your file and the provisioning of your server, this process can take a while.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_loading_progress.png" 
alt="Dialog showing the progress of loading data into the staging area." width=85% />
</div>
<div align="center">
  Figure 13: Data loading progress
</div>



How to import a GSRS file
=========================

A GSRS file is a formatted text file where each line of the file contains a JSON representation of one GSRS record from another GSRS instance, partially compressed by removing newline, carriage return, and space characters. There are two tab characters at the start of each line so the JSON starts at the third column. Also, the file is gzipped. The extension may be .gsrs or .gz. The file format has been used by GSRS for data exchange for several years.

The first few steps for importing a GSRS file are identical to importing an SD file.

#### Make sure you’re logged into GSRS as an administrative user.

Select the Admin Panel from the drop-down menu at the top of the screen, on the right side.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/import_start_with_admin.png" 
alt="How the import process starts: selecting the Admin panel from the user menu" width="35%" height="50%" />
</div>
<div align="center">
  Figure 14: Same as Figure 3
</div>





<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_admin_panel_tabs.png" 
alt="View of GSRS admin panel showing the tabs: Server Status; Service Information; User Management; Data Import; CV Management; Scheduled Jobs; All files; Data Managerment (Legacy)" width=85%" />
</div>
<div align="center">
  Figure 15: same as Figure 4
</div>


#### Select the ‘Data Import’ tab on the Admin Panel.

Use the ‘Select File to Import’ button to bring up an open file dialog box:



The next step is somewhat different.

After you select your data file and click the Upload button, notice that the table of import actions is blank:

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_field_mapping_blank.png" 
alt="Field mapping screen for a .gsrs file. Note that the page is mostly blank because mappings cannot be changed." width=85% />
</div>
<div align="center">
  Figure 16: Field mapping screen for a .gsrs file
</div>



The mapping area is blank because, unlike SD files, GSRS file contain data already assigned to fields in the GSRS data model. (There is no mapping to select.)

You can examine your data in the Preview panel.

#### Move the file data into the staging area

Once you click ‘Use Settings and Continue,’ the data will be loaded into the Staging Area and the process looks like it does for SD files, as described above.

Staging Area
============

The temporary database for just-loaded data is called the ‘Staging Area.’ Data in the Staging Area can be dissected using facets, searched, browsed, changed and then loaded into GSRS and/or deleted.

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_staging_area.png" 
alt="Sample view of the staging area, with one record.  The screen looks a lot like browsing data in GSRS." width=85% />
</div>
<div align="center">
  Figure 17: Browsing data in the staging area
</div>

Description of action items within staging area record view:

**New Data Import** – start importing a new file.

**Data Cleaning Options** – select parts of the data record to be removed before inserting into GSRS.

**Select All on Page**– add records on the page to the set of action-ready records.

**Select All Records** –add all records in the current list to the set of action-ready records.

**Clear Selections** – empty the set of action-ready records.

**Create** – add one record to GSRS.

**Edit** – make changes to one record within the Staging Area.

**Merge** – copy items (such as name or codes) from one record into a match record in GSRS. **Note: this action is not yet available**.

**Reject** – mark a record within the Staging Area as unwanted.

When a new record goes into the Staging Area, we calculate hashes of the structure of chemicals as well as the sequences for proteins and nucleic acids, and use this information to determine potential matches against records within GSRS. This allows you to see duplicates _before_ they are introduced into the database.

Browsing data within the staging area looks a lot like browsing substances in GSRS.

*   You can view individual records by clicking the name at the top of the individual record card. For example, click on ‘(9_R_,10_S_,11_S_,13_S_,16_S_,17_R_)-9-chloro-11,17-dihydroxy-17-(2-hydroxyacetyl)-10,13,16-trimethyl-6,7,8,11,12,14,15,16-octahydrocyclopenta\[a\]phenanthren-3-one’ in blue to bring up a detail page for the record.

Figure One record within the staging area. Except for the 'Staging Area Record' label at the top of the screen, you might think you're looking at a record within the main repository!

*   You can edit (make changes to) records within the staging area, keeping the changed record within the staging area. To access the edit page for a record, either click the Edit button while browsing or click the pencil icon while viewing a single staging area record.
    *   When you are done with the edits, click the ‘Validate and Submit’ button, as you do for edits to substances within GSRS.
    *   Address any errors or warnings.
    *   Click the Submit button.

Facets
------

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_staging_area_facets.png" 
alt="View of facets the staging area, with one record.  As when browsing data in GSRS, you can use facets to segment the data according to various fields." width="30%" height="30%"/>
</div>
<div align="center">
  Figure 18: Facets within the staging area
</div>




You can use facets to zero in on data of interest within the staging area. (There are some facets that are unique to the staging area, such as ‘source’ that contains the name of the file from which each record was taken, as well as standard substance facets, such as those for code systems and molecular weights.)

2 common uses of facets within the Staging Area:

1.  Quickly view all records that have no errors and have no matches. (This may be inserted directly into GSRS.)
2.  Quickly view all records that have exactly 1 match (this may serve as the basis of a data merge, once the option is available.)

Immediately after you load a new file and browse the data in the staging area, GSRS applies a ‘source’ facet so you see just the newest records.

Additional facets that you may find useful in the staging area:

*   Loaded by – the name of the user who loaded the file.
*   Date Loaded – when the file was loaded into the staging area.
*   Validation Type – the high-level result of validation rules applied to the substance when it was loaded into the staging area. Typical values: Error, Warning, Info.
    *   You may want to select all records with an error so that you can determine the specific error and address it.
*   Match Count – the number of records in the permanent repository that match your record in one or more ways.

One possible usage scenario: select facets as follows:

*   Source = recently loaded file
*   Match Count = 0 (no duplicates in the main database)
*   Validation Type != error (exclude records with a data error)

And then move all matching record (as described below) into GSRS.

Moving Data from the Staging Area into GSRS
-------------------------------------------

The endpoint of the data import process is to add records into GSRS.

There are 2 ways to accomplish:

*   Adding individual records by clicking on the ‘Create’ button next to the record.
*   Selecting a set of records (using the ‘Select All Records’ link, for example), then using the ‘Bulk Actions’ button to push the records into GSRS.

You’ll probably want to delete records from the staging area once the data have been pushed into GSRS.

Note that deleting a record from the staging area after it has been pushed into GSRS does not delete the new data from GSRS; the data are _copied_ into GSRS. After the copy, you don’t need the version within the staging area.

Data Cleaning
-------------

Before pushing new records to GSRS, you can elect to have a few clean-ups performed on the data:

<div align="center">
<img src="https://github.com/ncats/gsrs3-main-deployment/blob/main/docs/images/Import_data_scrubbing.png" 
alt="Data scrubbing options for data moving from the staging area into GSRS." width=85% />
</div>
<div align="center">
  Figure 19: Data scrubbing options
</div>



*   Removing codes by system allows you to select one or more code systems to remove from the input records. (You can also select code systems to _keep_ and force the other codes to be deleted.)
*   You can remove Approval IDs from the input data and/or copy the value of the approval ID to a code with a code system of your choice.
    *   If such a code already exists, the copy step will be skipped.
    *   This option only applies to data imported from a .gsrs file; data from SD files will not have approval IDs.
*   You can remove UUIDs from imported data so the UUID of imported records will be different from the source data.
    *   This option only applies to data imported from a .gsrs file.
    *   You can also copy the value of the top-level record UUID into a code with a designated code system. (If such a code already exists, the copy step will be skipped.)
*   You can clear out the value of all standardized names in the input data so that standardized names can be regenerated automatically from the main name.
*   You can elect to clear out audit information (the name of the user who created the record and the user who last edited the record, as well as the date of creation and date of last editing) when importing.