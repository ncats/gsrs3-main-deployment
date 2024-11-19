# How indexing and searching work

Date at last edit: 2024-10-09

Version at last edit: GSRSv3.1.1

### What are indexes?

Indexes are data constructs that allow rapid access of data.

GSRS uses two main types of indexes. 1) "Lucene" inverted indexes and 2) databases indexes. The first type of index is the most pertinent in this document because GSRS end-users are likely to interact with them directly when crafting their own REST API calls.  The second type, database indexes, come into play on the GSRS backend in SQL queries targeting the relational database. 

Each entity in GSRS consists of Java "models" defined in a hierarchical way. The models define a field structure but also have annotations that define how related data should be linked and how different fields should be indexed. Spring Boot uses the "Java Persistence API" and the "Hibernate" Java package to manage incoming data and store it in the database.

Simultaneously, GSRS uses JPA to handle persistence events.  When an entity is created or updated, GSRS triggers the TextIndexer.java class which generates Lucene "Documents" made up of fields. TextIndexer writes Field key-values to disk in a way that optimizes searching. The index is organized to facilitate searches on complete terms, and on words, or term segments.

The database indexes are likely to point to a single row in an entity.  We can search efficiently on a full ID or a full name; or on the beginning of a name or ID. It also tends to work best on shorter strings.  If we try to search on text in the middle or end of a field, the database has to search on every row in a data table.

In contrast, Lucene inverted indexes break up textual data into segments and allow us to do full-text searches.  This way of indexing is often compared to an index at the back of a book.  Words or phrases are listed in alphabetical order and next to the text fragment you see a page number.  So, we can quickly flip back to the page where the topic is discussed.

The way Lucene breakups up text into segments overcomes the limitations of common database indexing strategies so we can search on words that might occur anywhere in long or short text strings.

Learn more about Lucene here:

https://lucene.apache.org/core/5_0_0/    

In GSRS, the Lucene-based libraries read and write indexes to/from disk.  TextIndexer.java in the GSRS starter does most of the heavy lifting. By default, it creates and index for each service in the `${ix.home]/ginas.ix` folder of the service.

Each entity may be seen as a "Document" having many fields, with each field having a value. For example, a Substance has fields such as the id (UUID), names and codes.  In fact, the Substance model is the parent entity, and `names` would be a list of Name entities.  

### Lucene indexes

GSRS uses Lucene to index full names to a Document ID (Substances ID) 

When you make a query on an entity like substances, Lucene returns the best **hits** – those matches that have the most terms/letters in common. 
 
An exact search on "Acetylsalicylic Acid" returns ID2 as the best hit, as does an exact search on ASPIRIN. 

```
(Index)
Full name --> Substance ID
HYDROCHLORIC ACID --> ID1
ASPIRIN --> ID2
ACETYLSALICYLIC ACID --> ID2
ASPARA --> ID3
POTASSIUM MAGNESIUM ASPARTATE  --> ID3
```

Lucene also parses data to indexes so that partial matches can be made. For example, it splits names on spaces; and relates name fragments to substance ID(s). 

A contains search on ACID would return IDs 1 and 2 as the best hits.

```
(Index)
Name Fragment --> Substance IDs
HYDROCHLORIC --> ID1
ACID --> ID1, ID2
ASPIRIN --> ID2
ACETYLSALICYLIC --> ID2
POTASSIUM --> ID3 
MAGNESIUM --> ID3
ASPARTATE  --> ID3
```  

### Examples, basic searching via the API 

For our searches, we start with a query value and optionally specify a field where this value is to be found.  Here, we want to search on a substance name or a substance code. The backend will produce a list of the best hits and their substance IDs and thereby produce a list of JSON substance entity representations.

Below, you will notice the search fields in the query look like this for example: `root_names_name`.  The `root` refers to the top level or parent object, in this case the substance.  A substance has a list of name objects, and each name object in the list has a name text value.

$${\color{red}Note}$$: In in the examples, you may need to replace ^ with the URL encoded %5E to avoid errors. 

**Examples**

Return all substances having a name that begins and ends with ASPIRIN

```
# ^ signifies begining, $ end
https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_names_name:"^ASPIRIN$" 
```

Return all substances having a name that contains the term/word ASPIRIN

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_names_name:ASPIRIN
```

Return all substances having a name that has a word starting with POTASS or having the word ASPARTATE

```
# With quotes, implies searching on both fragments/terms
https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_names_name:"POTASS* ASPARTATE"

# Without quotes, implies either term
https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_names_name:POTASS* ASPARTATE
```

The "Paged Responses" to these API searches come back as a JSON Document.  A list of substances is found in the JSON `content` field. The `total` field indicates how many substances were found. The count, skip, and top fields can help you navigate through the results with repeat queries. The `etag` field can be helpful for structuring other API calls such as exports.


### Searching on sub-entities in API


We could also search directly on names or codes like this: 

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/names/search?q=root_name:"^ASPIRIN$"
```

In this case, `root` no longer signifies the substance as parent, but rather the list of Name objects.  Querying on the root_name field will return rows of name entities in the JSON `content` field.  The `content[x].uuid` field is the name ID (in this case a name UUID) for the given Name entity instance.

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/codes/search?q=root_name:"^ASPIRIN$"
```

We can view the Name entity instance itself like this.  This API endpoint gets the name from the **database** (or perhaps backup table). 

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/names/069c37f0-4a19-4c8f-ad34-196556bb5037?view=full
```

If we wanted to search inside the **index** on this name by its UUID, we could do this:

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/names/search?q=root_uuid:"^069c37f0-4a19-4c8f-ad34-196556bb5037$"
```

Here is an example of search on **substances** having a specific exact code and multiple combined criteria combined with AND.

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_codes_codeSystem:"^FDA UNII$" AND root_codes_type:"^PRIMARY$" AND root_codes_code:"^55TUI7Q42I$"
```

Here is an example of search on **codes** having a specific code and multiple combined criteria combined with AND

```
https://gsrs.ncats.nih.gov/ginas/app/api/v1/codes/search?q=root_codeSystem:"^FDA UNII$" AND root_ type:"^PRIMARY$" AND root_code:"^55TUI7Q42I$"
```

### Sorting search results 

we can sort search results by adding an order modifier as a query parameter. For example, `&order=$root_lastEdited` sorts in descending order while `&order=^root_lastEdited` sorts in ascending order. 

### Facets

Another way Lucene interacts with indexed data is through facets. Facets are a way of categorizing data and creating buckets of values contained in fields. For example, the GSRS substance service has several substances sub-classes, such as Chemicals, Proteins, Concepts, Polymers, among others. With a facet, someone doing a search can narrow down their query to specific substance types.  You can use facets and a search query at the same time. 
  
Here, we search on substances having a name containing ALFA; and faceted ATC Level 4 of the category "Enzymes"; and Protein Type of the category value ENZYME.

```

REST API: 

https://gsrs.ncats.nih.gov/api/v1/substances/search?q="ALFA"&facet=ATC Level 4/Enzymes&facet=Protein Type/ENZYME
```

### General searches and result promotion on configured fields 

If you don’t specify a field in your search, GSRS will promote results having exact matches in certain configured fields such as names, codes, standard names, and structures.  To see how your system is configured, look for the configured value of `ix.core.exactsearchfields`. 

In a REST API query URL, this boolean parameter value also plays a role: `promoteSpecialMatches`.

### Searching with the GSRS Frontend UI

The GSRS Frontend UI adds a lot of facility to help you implement searches. There is a search bar at the top right of the screen where you can enter search terms for substances.  Frontend URLs look different than the REST API urls.  Here are some examples of Frontend URLs:  

```
https://gsrs.ncats.nih.gov/ginas/app/beta/browse-substance?search="ASPIRIN"


https://gsrs.ncats.nih.gov/ginas/app/beta/browse-substance?search="ALFA"&facets=ATC Level 4*Enzymes.true,Protein Type*ENZYME.true
```

You can use the Developer tab in your browser to see how such searches are then transformed into REST API calls. 

The Frontend also has a "Search" menu showing the "Advanced Search" option. Advanced search is a good way to learn how to craft more complex searches as the constructed search is output onto the screen as you edit.  When you hit submit, the frontend will redirect to the frontend search URL (as opposed to the API url). 

### More types of searches

Bulk search allows users to search on multiple substance names or codes at once. The user provides a list of terms to search on; the the response provides a report on matches and non-matches, as well as the `content` results.  

As a chemoinformatics resource, GSRS provides ways of searching chemical structures and sequences. The Frontend has a sophisticated facility for structure searching that allows one to draw chemical structures and search for those fully or partially in the GSRS indexed data. In addition, one can search on sequences in proteins and nucleic acids.

### Search architecture

All types of GSRS API-based searches use a similar flow and response.  The user provides some inputs; and then paged responses are returned.  The process is asynchronous.  When the user provides inputs and submits the search, a subsequent search task is launched.  An initial paged response is returned but the server process continues, and the server collects more results until complete.

The paged response is rich in meta data such as:

- An "etag" id that can be used to get meta information about the search such as completion status. 
- JSON fields describing the types of exports that are available to the user performing a search
- A list of facets that can be used by the frontend to slice data views  

### Response "view" parameter 

When performing a search via the API, there are query parameter options that tell the server to provide more or less detail. 

```
full -- provides more complete information, for example all names and codes are listed.
compact – this is usually the default, it’s more of a summary format 
internal -- essentially equivlalent to 'full'
jsondiff -- ??? (verify) 
key – provides the class names and the ids of the entities matching the search 
``` 

### GSRS backend code and indexing

**1) Models** 

By default, GSRS will index all "public" fields in the model, and GSRS will use the Java property name as the default index field name.  


 You can also use the `@Indexable` annotation to fine-tune behaviors. As an example consider this: 

```
   @Indexable(suggest = true, facet = true, name = "Substance Class")
   @Column(name = "class")
   public SubstanceClass substanceClass;

```

Here, `@Column` name specifies the field name in the database. You would use this in an SQL query.  The `@Indexable` name specifies the name to be used as a field in the facet. The Java model property substanceClass would be used in the search on indexed Records.  Finally, the `suggest` refers to a special GSRS Lucene index used for a type-ahead API.    

```
# Facet search: 

https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?facet=Substance Class/chemical


# Search on indexed records:

https://gsrs.ncats.nih.gov/ginas/app/api/v1/substances/search?q=root_substanceClass:"^chemical$"
```

**2) Index value makers (IVMs)**

GSRS will also run any IVM classes that are specified in the configuration.  Index value makers handle more custom indexing and faceting tasks on a case-by-case basis.   Programmers elaborate each IVM in starter modules for each microservice. Configurations are usually specified in a module configuration file that is included in the microservice’s application.conf file.   See other documentation specifically on IVMs for more detail. 

The are several core class libraries that are critical to Lucene indexing. Some examples are:  TextIndexer.java, TextIndexerFactory.java. Both files are found in the GSRS starter module. 

### Other related documentation: 

Look for these titles in the docs folder: 

- Bulk Indexing
- How to bulk search with curl 
- How to write and index value maker


### Notes: 

Encoded character values may appear in search queries. Your browser may translate this automatically.  
In case it does not, you may need to explicitly translate these characters within your queries.  
You can use a URL-encoding function within a scripting language; use a web site that does URL-encodings or manually encode the characters yourself.

```
: -->  %3A
^ -->  %5E
" -->  %22
<space> --> %20 
```
