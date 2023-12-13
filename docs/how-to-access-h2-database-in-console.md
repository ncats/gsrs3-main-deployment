## How To Access an H2 Database in Console

While debugging GSRS locally and using H2, you may wish to view an H2 database.

You should make sure that all your H2 databases in GSRS application.conf files are configured with the key, value pair

`AUTO_SERVER=TRUE`

Ths will allow concurrent access to the H2 database, even if it is in use by GSRS. 
 
```
# The folder ".m2" is the repostiory folder automatically created by Maven in your PC's user profile folder.
# The version numbers will likely be different for you. 
# In the default configuration, the substances service has no username or password. In this case, user and password
# should be blank below.
# In other cases, the defaults typically used by H2 are "sa" for the user and "" (blank) for the password.

Most GSRS services have a writeable folder `./ginas.ix` where data (indexes, h2 databases, etc) are stored. 

These are values you need to enter, assuming your database is called "sprinxight.db" and the username and password are set to blank. 

> cd path/to/gsrs-main-deployment/substances

substances> java -cp ~/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.Shell

URL       jdbc:h2:file:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE
User      (just hit enter)
Password  (just hit enter)

Welcome to H2 Shell 1.4.200 (2019-10-14)
Exit with Ctrl+C
[Enter]   jdbc:h2:~/test
URL       jdbc:h2:file:./ginas.ix/h2/sprinxight;AUTO_SERVER=TRUE
[Enter]   org.h2.Driver
Driver    
[Enter]   
User      
Password  
Connected
Commands are case insensitive; SQL statements end with ';'
help or ?      Display this help
list           Toggle result list / stack trace mode
maxwidth       Set maximum column width (default is 100)
autocommit     Enable or disable autocommit
history        Show the last 20 statements
quit or exit   Close the connection and exit

sql> show tables;
TABLE_NAME                    | TABLE_SCHEMA
IX_CORE_ACL                   | PUBLIC
IX_CORE_ACL_GROUP             | PUBLIC
IX_CORE_ACL_PRINCIPAL         | PUBLIC
IX_CORE_BACKUP                | PUBLIC
IX_CORE_EDIT                  | PUBLIC
...
sql> quit
```
Next, quit the the H2 console by typing `quit`

To view another H2 database for another service do the following. 

```
cd ../other-service
# Get the configurtion details src/main/resources/application.conf 
# and do the similar to the above 
```
## In future, h2 will be upgraded, and we will use H2 version 2.x.x

Use a command like this:
```
substances> java -cp ~/.m2/repository/com/h2database/h2/2.1.214/h2-2.1.214.jar org.h2.tools.Shell
```
## Notes for Windows Terminal

If you're using the Windows CMD terminal, you'll need to make a few ajustments. 

The command would be: 
```
substances> java -cp C:/Users/YOURUSERNAME/.m2/repository/com/h2database/h2/1.4.200/h2-1.4.200.jar org.h2.tools.Shell
```

Also, the path to the database within the JDBC URL must be absolute. For example: 
```
URL       jdbc:h2:file:C:\path\to\gsrs3-main-deployment\substances\ginas.ix\h2\sprinxight;AUTO_SERVER=TRUE
```




