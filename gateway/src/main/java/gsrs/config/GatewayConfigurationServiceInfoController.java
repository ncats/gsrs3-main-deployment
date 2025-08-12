package gsrs.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gsrs.config.ConfigurationPropertiesChecker;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.netflix.zuul.filters.Route;
import org.springframework.cloud.netflix.zuul.filters.RouteLocator;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;

@Data
@RestController
@Slf4j
public class GatewayConfigurationServiceInfoController {

    private ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private RouteLocator routeLocator;

    // IMPORTANT: There is no admin role restriction here; so probably you will only want to use this
    // in a development situation. Or, if web-accessible or production situations, the most you'd want to
    // use the log* functionality only.

    // The reason we don't have an admin role check is because the gateway does not fully
    // import the gsrs-spring-starter module.

    @Value("#{new Boolean('${gsrs.services.config.properties.report.api.enabled:false}')}")
    private boolean propertiesReportApiEnabled;

    @Value("#{new Boolean('${gsrs.services.config.properties.report.log.enabled:false}')}")
    private boolean propertiesReportLogEnabled;

    @Value("#{new Boolean('${gsrs.services.config.gatewayProcessedRouteConfigs.report.api.enabled:false}')}")
    private boolean gatewayProcessedRouteConfigsReportApiEnabled;

    @Value("#{new Boolean('${gsrs.services.config.gatewayProcessedRouteConfigs.report.log.enabled:false}')}")
    private boolean gatewayProcessedRouteConfigsReportLogEnabled;

    @Autowired
    private Environment env;

    @Autowired
    private ConfigurableEnvironment configurableEnvironment;

    // properties api
    @GetMapping(value="/service-info/api/v1/gateway/@configurationProperties", // fmt=text|json
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
    public ResponseEntity<?> configurationProperties(@RequestParam(defaultValue = "json") String fmt) {
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
    @GetMapping(value="/service-info/api/v1/gateway/@logConfigurationProperties", // fmt=text|json
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
    public ResponseEntity<?> logConfigurationProperties(@RequestParam(defaultValue = "json") String fmt) {
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

    // routes api
    @GetMapping(value="/service-info/api/v1/gateway/@processedRouteConfigs", // fmt=text|json
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE })
    public ResponseEntity<?> processedRouteConfigs(@RequestParam(defaultValue = "json") String fmt) {
        LinkedHashMap<String, String> lhm = new LinkedHashMap<>();
        String message = "";
        HttpStatus status = HttpStatus.OK;
        if(fmt.equalsIgnoreCase("text")) {
            MediaType mt = MediaType.valueOf(MediaType.TEXT_PLAIN_VALUE);
            if(!gatewayProcessedRouteConfigsReportApiEnabled) {
                message = "Resource not enabled.";
                status = HttpStatus.FORBIDDEN;
                return ResponseEntity.status(status).contentType(mt).body(message);
            }
            StringBuilder sb = new StringBuilder();
            sb.append("These are the gateway service's processed route configs.\n");
            sb.append("\nRoute|id|path|location\n");
            for (Route route : routeLocator.getRoutes()) {
                sb.append(String.format("%s|%s|%s|%s\n", "Route:", route.getId(), route.getPath(), route.getLocation()));
            }
            return ResponseEntity.status(status).contentType(mt).body(sb.toString());
        } else {
            if(!gatewayProcessedRouteConfigsReportApiEnabled) {
                message = "Resource not enabled.";
                lhm.put("message", message);
                status = HttpStatus.FORBIDDEN;
                return ResponseEntity.status(status).body(lhm);
            }
            try {
                return ResponseEntity.status(200).body(routeLocator.getRoutes());
            } catch (Exception e) {
                message = "There was an exception/error when generating response";
                lhm.put("message", message);
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                return ResponseEntity.status(status).body(lhm);
            }
        }
    }

    // routes log
    @GetMapping(value="/service-info/api/v1/gateway/@logProcessedRouteConfigs",
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE }) // fmt=text|json
    public ResponseEntity<?> logProcessedRouteConfigs(@RequestParam(defaultValue = "json") String fmt) {
        LinkedHashMap<String, String> lhm = new LinkedHashMap<>();
        HttpStatus status = HttpStatus.OK;
        String message = "";
        if(!gatewayProcessedRouteConfigsReportLogEnabled) {
            message = "Resource not enabled.";
            lhm.put("message", message);
            status = HttpStatus.FORBIDDEN;
            return ResponseEntity.status(status).body(lhm);
        }
        if(fmt.equalsIgnoreCase("text")) {
            StringBuilder sb = new StringBuilder();
            sb.append("These are the gateway service's processed route configs.\n");
            sb.append("\nRoute|id|path|location\n");
            for (Route route : routeLocator.getRoutes()) {
                sb.append(String.format("%s|%s|%s|%s\n", "Route:", route.getId(), route.getPath(), route.getLocation()));
            }
            message = "See log for data in text format.";
            log.info(sb.toString());
            lhm.put("message", message);
            return ResponseEntity.status(status).body(lhm);
        } else {
            try {
                String jsonText = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(routeLocator.getRoutes());
                message = "See log for data in JSON format.";
                lhm.put("message", message);
                log.info("These are the gateway service's processed route configs.\n" + jsonText + "\n");
                return ResponseEntity.status(status).body(lhm);
            } catch (JsonProcessingException e) {
                message = "There was an exception/error when generating data in JSON format. See the log.";
                lhm.put("message", message);
                log.error(e.getMessage());
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                return ResponseEntity.status(status).body(lhm);
            }
        }
    }
}
