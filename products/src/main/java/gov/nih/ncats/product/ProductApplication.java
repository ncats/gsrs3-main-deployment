package gov.nih.ncats.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

import gov.hhs.gsrs.products.product.EnableProduct;
import gov.hhs.gsrs.products.productall.EnableProductAll;
import gov.hhs.gsrs.products.productelist.EnableProductElist;
import gov.hhs.gsrs.products.ProductDataSourceConfig;
import gsrs.*;

//TODO: This may be an issue, and we may need to refactor to make less
// explicit reference to FDA-specific systems.
@EnableProduct
@EnableProductAll
@EnableProductElist

//TODO: eventually remove?
@EnableGsrsLegacySequenceSearch
@EnableGsrsLegacyStructureSearch

@SpringBootApplication
@EntityScan(basePackages ={"ix","gsrs", "gov.nih.ncats", "gov.hhs.gsrs"} )
@EnableGsrsApi(indexValueMakerDetector = EnableGsrsApi.IndexValueMakerDetector.CONF,
                additionalDatabaseSourceConfigs= {ProductDataSourceConfig.class}
)
@EnableGsrsJpaEntities
@EnableGsrsLegacyAuthentication
@EnableGsrsLegacyCache
@EnableGsrsLegacyPayload
@EnableGsrsScheduler
@EnableGsrsBackup
@EnableAsync

public class ProductApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductApplication.class, args);
    }
}

