package gov.nih.ncats.impurities;

import gov.hhs.gsrs.impurities.EnableImpurities;
import gov.hhs.gsrs.impurities.ImpuritiesDataSourceConfig;
import gsrs.*;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

//TODO: This may be an issue, and we may need to refactor to make less
// explicit reference to FDA-specific systems.
@EnableImpurities

//TODO: eventually remove?
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch

@SpringBootApplication
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
                additionalDatabaseSourceConfigs= {ImpuritiesDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableAsync

public class ImpuritiesApplication {

    public static void main(String[] args) {
        SpringApplication.run(ImpuritiesApplication.class, args);
    }
}

