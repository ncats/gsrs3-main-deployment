package gsrs.ncats.substances;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

import gsrs.EnableGsrsApi;
import gsrs.EnableGsrsBackup;
import gsrs.EnableGsrsJpaEntities;
import gsrs.EnableGsrsLegacyAuthentication;
import gsrs.EnableGsrsLegacyCache;
import gsrs.EnableGsrsLegacyPayload;
import gsrs.EnableGsrsLegacySequenceSearch;
import gsrs.EnableGsrsLegacyStructureSearch;
import gsrs.EnableGsrsScheduler;
import gsrs.cv.EnableControlledVocabulary;

@SpringBootApplication
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats"} )
//@EnableJpaRepositories(basePackages ={"ix","gsrs", "gov.nih.ncats"} )
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableControlledVocabulary
@EnableAsync
public class SubstancesApplication {

    public static void main(String[] args) {

//        System.out.println("PROPERTY VALUE = "+ System.getProperty("EUREKA_SERVER"));
        SpringApplication.run(SubstancesApplication.class, args);
    }

}
