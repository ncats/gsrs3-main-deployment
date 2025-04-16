package gsrs.ncats.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class SimpleHealthController {

    @GetMapping("gateway/actuator/health")
    public Status health(){
        return Status.INSTANCE;
    }

    public static class Status{
        public static Status INSTANCE = new Status();

        public String status= "UP";
    }


}
