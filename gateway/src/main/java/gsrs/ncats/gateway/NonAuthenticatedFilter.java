package gsrs.ncats.gateway;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.netflix.zuul.filters.support.FilterConstants;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.UncheckedIOException;

/**
 * If the config is set to now allow non authenticated users
 * through this will stop any GSRS route that isn't a log in request.
 *
 */
@Component
public class NonAuthenticatedFilter extends ZuulFilter {

    @Autowired
    private LegacyAuthenticationConfiguration authenticationConfiguration;


    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return FilterConstants.PRE_DECORATION_FILTER_ORDER+1;
    }

    @Override
    public boolean shouldFilter() {
        if(authenticationConfiguration.isAllownonauthenticated()){
            return false;
        }
        RequestContext ctx = RequestContext.getCurrentContext();
        String originalRequestPath = (String)ctx.get(FilterConstants.REQUEST_URI_KEY);
        //allow logins
        if(originalRequestPath.equals("api/v1/whoami") || originalRequestPath.equals("ginas/app/api/v1/whoami")){
            return false;
        }
        return true;
    }

    @Override
    public Object run(){
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();

        //If we are using SSO and trust that it set things correctly
        if(authenticationConfiguration.isTrustheader()){
            String username = request.getHeader(authenticationConfiguration.getUsernameheader());
            if(username !=null){
                return null;
            }
        }

        //

        if(notNullOrBlank(request.getHeader("auth-username")) && notNullOrBlank(request.getHeader("auth-password"))){
            return null;
        }
        if(notNullOrBlank(request.getHeader("auth-token"))){
            return null;
        }
        //if we get here we have a problem
        ctx.unset();
        ctx.setResponseStatusCode(401);
        String email = authenticationConfiguration.getSysadminEmail();
        String message;
        if(email ==null){
            message= "You are not authorized to see this resource. Please contact an administrator to be granted access.";
        }else{
            message = "You are not authorized to see this resource. Please contact " +
                    email
                    + " to be granted access.";
        }
        try {
            ctx.getResponse().setContentType("application/json");
            ctx.getResponse().getWriter().println("{\"status\" : \"401\", \"message\" : \""+message+"\"}");
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return null;
    }
    private static boolean notNullOrBlank(String s){
        return s !=null && !s.trim().isEmpty();
    }
}
