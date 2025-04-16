package gsrs.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;

@Data
@RestController
@Slf4j
public class NoEntityConfigurationServiceInfoController {

    // Currently, this is used in the Discovery, Frontend services and included in the deployments.
    // Gateway has a similar one file but is customized.

    // IMPORTANT: There is no admin role restriction here; so probably you will only want to use this
    // in a development situation. Or, if web-accessible or production situations, the most you'd want to
    // use the log* functionality only.

    // The reason we don't have an admin role check is because the gateway does not fully
    // import the gsrs-spring-starter module.

    private ObjectMapper mapper = new ObjectMapper();

    @Value("#{new Boolean('${gsrs.services.config.properties.report.api.enabled:false}')}")
    private boolean propertiesReportApiEnabled;

    @Value("#{new Boolean('${gsrs.services.config.properties.report.log.enabled:false}')}")
    private boolean propertiesReportLogEnabled;

    @Autowired
    private Environment env;

    @Autowired
    private ConfigurableEnvironment configurableEnvironment;

    // properties api
    @GetMapping(value="/service-info/api/v1/{context}/@configurationProperties", // fmt=text|json
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
    public ResponseEntity<?> configurationProperties(
        @PathVariable(name = "context", required = true) String context,
        @RequestParam(defaultValue = "json") String fmt
    ) {
        LinkedHashMap<String, String> lhm = new LinkedHashMap<>();
        String message = "";
        HttpStatus status = HttpStatus.OK;
        if(fmt.equalsIgnoreCase("text")) {
            MediaType mt = MediaType.valueOf(MediaType.TEXT_PLAIN_VALUE);
            if(!propertiesReportApiEnabled) {
                message = "Resource not enabled.";
                status = HttpStatus.FORBIDDEN;
                return ResponseEntity.status(status).contentType(mt).body(message);
            }
            ConfigurationPropertiesChecker c = new ConfigurationPropertiesChecker();
            c.setEnabled(propertiesReportApiEnabled);
            StringBuilder sb = new StringBuilder();
            sb.append(c.getActivePropertiesAsTextBlock(configurableEnvironment));
            return ResponseEntity.status(status).contentType(mt).body(sb.toString());
        } else {
            if(!propertiesReportApiEnabled) {
                message = "Resource not enabled.";
                lhm.put("message", message);
                status = HttpStatus.FORBIDDEN;
                return ResponseEntity.status(status).body(lhm);
            }
            ConfigurationPropertiesChecker c = new ConfigurationPropertiesChecker();
            c.setEnabled(propertiesReportApiEnabled);
            StringBuilder sb = new StringBuilder();
            sb.append(c.getActivePropertiesAsJson(configurableEnvironment));
            return ResponseEntity.status(status).body(sb.toString());
        }
    }

    // properties log
    @GetMapping(value="/service-info/api/v1/{context}/@logConfigurationProperties", // fmt=text|json
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
    public ResponseEntity<?> logConfigurationProperties(
        @PathVariable(name = "context", required = true) String context,
        @RequestParam(defaultValue = "json") String fmt
    ) {
        LinkedHashMap<String, String> lhm = new LinkedHashMap<>();
        String message = "";
        HttpStatus status = HttpStatus.OK;
        if(fmt.equalsIgnoreCase("text")) {
            MediaType mt = MediaType.valueOf(MediaType.TEXT_PLAIN_VALUE);
            if(!propertiesReportLogEnabled) {
                message = "Resource not enabled.";
                status = HttpStatus.FORBIDDEN;
                return ResponseEntity.status(status).contentType(mt).body(message);
            }
            message = "Check log for output.";
            ConfigurationPropertiesChecker c = new ConfigurationPropertiesChecker();
            c.setEnabled(propertiesReportLogEnabled);
            StringBuilder sb = new StringBuilder();
            sb.append("Dumping properties at text to log: \n");
            sb.append(c.getActivePropertiesAsTextBlock(configurableEnvironment));
            sb.append("\n");
            log.info(sb.toString());
            return ResponseEntity.status(status).contentType(mt).body(message);
        } else {
            if(!propertiesReportLogEnabled) {
                message = "Resource not enabled.";
                status = HttpStatus.FORBIDDEN;
                lhm.put("message", message);
                return ResponseEntity.status(status).body(lhm);
            }
            message = "Check log for output.";
            lhm.put("message", message);
            ConfigurationPropertiesChecker c = new ConfigurationPropertiesChecker();
            c.setEnabled(propertiesReportLogEnabled);
            StringBuilder sb = new StringBuilder();
            sb.append("Dumping properties at JSON to log: \n");
            sb.append(c.getActivePropertiesAsJson(configurableEnvironment));
            sb.append("\n");
            log.info(sb.toString());
            return ResponseEntity.status(status).body(lhm);
        }
    }
}
