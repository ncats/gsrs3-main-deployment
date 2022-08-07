package gov.nih.ncats.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableAsync;

import gov.hhs.gsrs.application.ApplicationDataSourceConfig;
import gov.hhs.gsrs.application.application.EnableApplication;
import gov.hhs.gsrs.application.applicationall.EnableApplicationAll;
import gov.hhs.gsrs.application.applicationdarrts.EnableDarrtsApplications;
import gov.hhs.gsrs.application.searchcount.EnableSearchCount;
import gsrs.EnableGsrsApi;
import gsrs.EnableGsrsBackup;
import gsrs.EnableGsrsJpaEntities;
import gsrs.EnableGsrsLegacyAuthentication;
import gsrs.EnableGsrsLegacyCache;
import gsrs.EnableGsrsLegacyPayload;
import gsrs.EnableGsrsLegacySequenceSearch;
import gsrs.EnableGsrsLegacyStructureSearch;
import gsrs.EnableGsrsScheduler;


@EnableSearchCount
@EnableApplication
@EnableApplicationAll

//TODO: This may be an issue, and we may need to refactor to make less
// explicit reference to FDA-specific systems.
@EnableDarrtsApplications 

//TODO: eventually remove?
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch

@SpringBootApplication
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
                additionalDatabaseSourceConfigs= {ApplicationDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableAsync

public class ApplicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApplicationApplication.class, args);
    }
}

