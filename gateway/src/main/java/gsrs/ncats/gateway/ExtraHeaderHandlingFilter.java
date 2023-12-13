package gsrs.ncats.gateway;


import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.support.FilterConstants;

import com.netflix.util.Pair;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
/**
 * This filter is responsible for handling response headers that are returned from
 * gateway-routed traffic. Specifically this filter does the following:
 * 
 * <ol>
 * <li>Allows config-file level new headers to be added to all responses (useful for CORS)</li>
 * <li>Allows config-file level re-writing of 301/redirect location responses based on patterns</li>
 * <li>Forces all OPTIONS HTTP requests to return 200. This ensures that CORS is possible.</li>
 * </ol>
 * 
 * This is a POST filter, meaning it happens after a request has been received as its on its
 * way back to the client.
 * 
 * @author tyler
 *
 */
public class ExtraHeaderHandlingFilter extends ZuulFilter {
	private static Logger log = LoggerFactory.getLogger(ExtraHeaderHandlingFilter.class);

	@Autowired
	GSRSGatewayServerConfig serverConfig;

	@Override
	public String filterType() {
		return FilterConstants.POST_TYPE;
	}

	@Override
	public int filterOrder() {
		return 0;
	}

	@Override
	public boolean shouldFilter() {
		return true;
	}

	@Override
	public Object run() {
		RequestContext ctx = RequestContext.getCurrentContext();


		//OPTIONS requests should always come back as 200 for CORS
		//TODO: this could become configurable
		if("OPTIONS".equals(ctx.getRequest().getMethod())) {
			ctx.setResponseStatusCode(200);
		}
		int status=ctx.getResponseStatusCode();

		//***************************
		// This section rewrites 30X redirect locations based on 
		// regex patterns  
		// BEGIN LOCATION REWRITE
		//***************************
		if(status>=300 && status<400) {
			if(serverConfig.shouldRewriteLocations()) {
				List<Pair<String, String>> filteredResponseHeaders = new ArrayList<>();

				// find the current location header, and add all other new zuul
				// headers to a filtered list
				String loc=ctx.getZuulResponseHeaders().stream()
						.filter(p->{
							if(p.first().equals("Location")) {
								return true;
							}else {
								filteredResponseHeaders.add(p);
								return false;
							}
						})
						.map(p->p.second())
						.findFirst()
						.orElse(null);

				//If the header exists and isn't null, do the fix
				if(loc!=null) {
					// set the location header to the new "fixed" header        		
					ctx.getResponse().setHeader("Location", serverConfig.fixLocation(loc));
					// reset the zuul filters to have all supplied filters except
					// the location one that was overwritten above 
					ctx.put("zuulResponseHeaders", filteredResponseHeaders);
				}	
			}
		}
		//***************************
		// END LOCATION REWRITE
		//***************************


		//***************************
		// This section adds extra headers if needed
		// BEGIN EXTRA HEADER ADDITION
		//***************************
		try {
			if (serverConfig.getAddHeaders() != null) {
				// get all headers from both the current response and the zuul response
				// elements. These will be used to check if headers are already set
				Set<String> zheaders = ctx.getZuulResponseHeaders().stream()
						.map(ssp -> ssp.first())
						.collect(Collectors.toSet());
				zheaders.addAll(ctx.getResponse().getHeaderNames());

				// add each new header not already set
				// to avoid duplicates
				serverConfig.fetchNewHeadersToAdd()
							.forEach((k,v) -> {
								if(!zheaders.contains(k)) {
									ctx.getResponse().addHeader(k, v);
								}
							});
			}
		} catch (Exception ex) {
			log.warn(ex.getMessage(), ex);
		}
		//***************************
		// END EXTRA HEADER ADDITION
		//***************************


		return null;
	}

}
