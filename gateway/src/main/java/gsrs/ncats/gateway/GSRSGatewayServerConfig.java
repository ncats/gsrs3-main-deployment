package gsrs.ncats.gateway;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

/**
 * Contains configuration settings for the gateway, largely used for header
 * handling, authentication, CORS mapping, and adjustments to received
 * responses from the services.
 * 
 * @author tyler
 */
@Component
@ConfigurationProperties("gsrs.gateway.server")
@Data
public class GSRSGatewayServerConfig {

	/**
	 * Extra headers to be added to the gateway routed responses.
	 * Note that this will only add headers if they don't
	 * already exist in the response.
	 */
    private List<String> addHeaders;
    
    /**
     * <p>
	 * Regular expression patterns to parse from the application.yml
	 * file and used to adjust 301 location url patterns. These are 
	 * replacement patterns supplied in the form of:
	 * </p>
	 * <pre>
	 * {regular_expression}: {replacement_text}
	 * </pre>
	 * 
	 * For example, to replace all redirects that go from 
	 * /{context}/api/v1/ to /api/v1/ you could do:
	 * <pre>
	 * [/][a-z|A-Z]+/api/v1/: /api/v1/
	 * </pre> 
	 * 
	 * This is useful for cases where a single tomcat instance
	 * has more than one entity service being used, and those
	 * services have redirect patterns which are attempting to
	 * give their full local path.
	 *  
	 */
    private List<String> redirectPatterns;
    
    /**
     * A lazy-loaded cache list of the real {@link Pattern} to replacement
     * strings to be used for fixing redirections.
     */
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Map<Pattern,String> _replacers;
    
    /**
     * A lazy-loaded cache list of the real header keys
     * and values to add to responses.
     */
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private Map<String,String> _headers;
			

    /**
     * Method to retrieve the set of {@link Pattern} to replacement
     * string pairs used for fixing a location redirect url.
     * @return
     * Map of {@link Pattern} + String pairs
     */
    public Map<Pattern,String> fetchLocationReplacementPatterns(){
    	if(_replacers==null) {
    		_replacers = Optional.ofNullable(redirectPatterns)
    				.orElseGet(()->new ArrayList<>())
        			.stream()
        			.map(s->s.split(": "))        			
        			.collect(Collectors.toMap(s->Pattern.compile(s[0].trim()), s->s[1].trim()));
    	}
    	return _replacers;
    }
    

    /**
     * Method to retrieve the set of header names and header
     * values to add to the response after routing. For more
     * information see {@link #addHeaders}
     * @return
     * Map of header names and header values to add
     */
    public Map<String,String> fetchNewHeadersToAdd(){
    	if(_headers==null) {
    		_headers = Optional.ofNullable(addHeaders)
    				.orElseGet(()->new ArrayList<>())
        			.stream()
        			.map(s->s.split(": "))        			
        			.collect(Collectors.toMap(s->s[0].trim(), s->s[1].trim()));
    	}
    	return _headers;
    }
    
    /**
     * Check if there are any replacement pattern rules to apply
     * for location rewrite. 
     * @return
     *   true if there's at least one pattern rule specified for {@link #redirectPatterns}
     */
    public boolean shouldRewriteLocations() {
    	return !fetchLocationReplacementPatterns().isEmpty();
    }
    /**
     * Method to transform a location URL pattern used for redirect
     * into a more appropriate URL pattern based on supplied {@link Pattern}
     * regular expressions form the configuration file. See {@link #redirectPatterns}
     * for more information.
     * 
     * @param location
     * @return
     *   New string location URL after processing. Will return supplied input
     *   if no replacers are in the configuration
     */
    public String fixLocation(String location) {
    	String[] l=new String[] {location};
    	fetchLocationReplacementPatterns().forEach((k,v)->l[0]= k.matcher(l[0]).replaceAll(v));
    	return l[0];
    }
    

}