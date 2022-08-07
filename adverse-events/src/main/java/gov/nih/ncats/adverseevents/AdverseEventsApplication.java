package gov.nih.ncats.adverseevents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableAsync;

import gov.hhs.gsrs.adverseevents.AdverseEventDataSourceConfig;
import gov.hhs.gsrs.adverseevents.adverseeventcvm.EnableAdverseEventCvm;
import gov.hhs.gsrs.adverseevents.adverseeventdme.EnableAdverseEventDme;
import gov.hhs.gsrs.adverseevents.adverseeventpt.EnableAdverseEventPt;

import gsrs.EnableGsrsApi;
import gsrs.EnableGsrsBackup;
import gsrs.EnableGsrsJpaEntities;
import gsrs.EnableGsrsLegacyAuthentication;
import gsrs.EnableGsrsLegacyCache;
import gsrs.EnableGsrsLegacyPayload;
import gsrs.EnableGsrsLegacySequenceSearch;
import gsrs.EnableGsrsLegacyStructureSearch;
import gsrs.EnableGsrsScheduler;

@EnableAdverseEventPt
@EnableAdverseEventDme
@EnableAdverseEventCvm

//TODO: eventually remove?
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch

@SpringBootApplication
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
                additionalDatabaseSourceConfigs= {AdverseEventDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableAsync

public class AdverseEventsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdverseEventsApplication.class, args);
    }
}