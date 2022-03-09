package gsrs.ncats.gateway;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.validation.constraints.Email;

@Component
@ConfigurationProperties("ix.authentication")
@Data
public class LegacyAuthenticationConfiguration {

    /*

# SSO HTTP proxy authentication settings
ix.authentication.trustheader=true
ix.authentication.usernameheader="OAM_REMOTE_USER"
ix.authentication.useremailheader="AUTHENTICATION_HEADER_NAME_EMAIL"

# set this "false" to only allow authenticated users to see the application
ix.authentication.allownonauthenticated=true

# set this "true" to allow any user that authenticates to be registered
# as a user automatically
ix.authentication.autoregister=true

#Set this to "true" to allow autoregistered users to be active as well
ix.authentication.autoregisteractive=true
     */
    private boolean trustheader=false;
    private boolean autoregister=true;
    private boolean allownonauthenticated=true;
    private boolean autoregisteractive=true;

    private String usernameheader;
    private String useremailheader;
    private String userrolesheader;

    //Used to be 
    //"ix.ginas.debug.showheaders" 
    //   but is now:
    //"ix.authentication.logheaders"
    private boolean logheaders=false;
    @Email
    private String sysadminEmail;

}
