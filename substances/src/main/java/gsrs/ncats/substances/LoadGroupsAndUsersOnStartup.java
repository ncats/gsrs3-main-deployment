package gsrs.ncats.substances;

import com.fasterxml.jackson.databind.ObjectMapper;
import gsrs.module.substance.SubstanceEntityService;
import gsrs.module.substance.repository.SubstanceRepository;
import gsrs.repository.DBGSRSVersionRepository;
import gsrs.repository.GroupRepository;
import gsrs.repository.UserProfileRepository;
import ix.core.models.DBGSRSVersion;
import ix.core.models.Group;
import ix.core.models.Principal;
import ix.core.models.Role;
import ix.core.models.UserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import javax.persistence.EntityManager;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;

@Profile("!test")
@Component
public class LoadGroupsAndUsersOnStartup implements ApplicationRunner {



//    @Autowired
//    GsrsValidatorFactory validationFactory;
    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private SubstanceRepository substanceRepository;
    
    @Autowired
    private DBGSRSVersionRepository dBGSRSVersionRepository;
    
    @Autowired
    BuildProperties buildProperties;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PlatformTransactionManager platformTransactionManager;

    @Autowired
    private SubstanceEntityService substanceEntityService;
    
    @Value("${spring.application.name}")
    private String entity;
    
    @Value("${spring.jpa.hibernate.ddl-auto:none}")
    private String ddlAutoMode;
    
    private final String CREATE_MODE = "create";
    private final String UPDATE_MODE = "update";

    @Override
    public void run(ApplicationArguments args) throws Exception {
    	TransactionTemplate transactionTemplate = new TransactionTemplate(platformTransactionManager);
    	
    	transactionTemplate.executeWithoutResult(status -> {
    		String lastVersion = dBGSRSVersionRepository.findMaxVersions(entity);
    		String dbGsrsVersion = buildProperties.getVersion();
    		Timestamp timestamp = new Timestamp(System.currentTimeMillis()); 
    		if(ddlAutoMode.equalsIgnoreCase(CREATE_MODE) || 
    				(ddlAutoMode.equalsIgnoreCase(UPDATE_MODE) && 
    						(lastVersion == null || !lastVersion.equalsIgnoreCase(dbGsrsVersion)))) {
    				DBGSRSVersion dBGSRSVersion = new DBGSRSVersion(entity, dbGsrsVersion, timestamp);
    				dBGSRSVersionRepository.saveAndFlush(dBGSRSVersion);    			
    		}            
        });

    	
        if(groupRepository.count() >0){
            return;
        }
        
        transactionTemplate.executeWithoutResult(status -> {
                    groupRepository.save(new Group("protected"));
                    groupRepository.save(new Group("admin"));

                    System.out.println("RUNNING");

                    UserProfile up = new UserProfile();
                    up.user = new Principal("admin", "admin@example.com");
                    up.setPassword("admin");
                    up.active = true;
                    up.deprecated = false;
                    up.setRoles(Arrays.asList(Role.values()));

                    userProfileRepository.saveAndFlush(up);

                    UserProfile up2 = new UserProfile();
                    up2.user = new Principal("user1", "user1@example.com");
                    up2.setPassword("user1");
                    up2.active = true;
                    up2.deprecated = false;
                    up2.setRoles(Arrays.asList(Role.Query));

                    userProfileRepository.saveAndFlush(up2);

                    UserProfile guest = new UserProfile();
                    guest.user = new Principal("GUEST", null);
                    guest.setPassword("GUEST");
                    guest.active = false;
                    guest.deprecated = false;
                    guest.setRoles(Arrays.asList(Role.Query));

                    userProfileRepository.saveAndFlush(guest);

                    Authentication auth = new UsernamePasswordAuthenticationToken(up.user.username, null,
                            up.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).collect(Collectors.toList()));

                    SecurityContextHolder.getContext().setAuthentication(auth);                  
                    
                });

        String pathToLoadFile = System.getProperty("ix.ginas.load.file");
        if (pathToLoadFile != null) {
            try(BufferedReader reader = new BufferedReader(new InputStreamReader(new GZIPInputStream(new FileInputStream(pathToLoadFile))))){
                String line;
                Pattern sep = Pattern.compile("\t");
                ObjectMapper mapper = new ObjectMapper();
                int i=0;
                while( (line = reader.readLine())!=null){
                    String[] cols = sep.split(line);
//                System.out.println(cols[2]);
                    try {
                        transactionTemplate.executeWithoutResult(status -> {
                            try {

                                substanceEntityService.createEntity(mapper.readTree(cols[2]), true).getCreatedEntity();


                            } catch (Throwable t) {
                                t.printStackTrace();
                                status.setRollbackOnly();
                            }
                        });
                    }catch(Throwable t){
                        //catch any rollback exception
                    }


                    i++;
                    if(i %100 ==0){
                        System.out.println("loaded record " + i);
                    }

                }
                System.out.println("done loading file");
            }
        }

    }
}
