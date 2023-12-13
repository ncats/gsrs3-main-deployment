package gsrs.ncats.deploymentextras;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Properties;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gsrs.startertests.pomutilities.PomUtilities;
import org.apache.maven.model.Dependency;
import org.apache.maven.model.Model;
import org.apache.maven.model.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GsrsCiGsrsExampleDeploymentPomsVersionTest {

    // Check GSRS versions in all pom.xml, and select extraJars, installExtraJars.sh commands
    // against the values in pom-version.properties. Helpful when making a version change
    // for the whole GSRS project.
    // Test effectively skipped unless CLI param -DdoPomCheck=true
    // Before running set the current version values in ./deployment-extra/pom-version.properties
    // Run from command line:
    // cd gsrs-ci/deployment-extras
    // mvn test -Dtest=gsrs.ncats.deploymentextras.GsrsCiGsrsExampleDeploymentPomsVersionTest -DdoPomCheck=true

    // !!!! Set to true when testing in IDE !!!!
    boolean turnOffPomParameterCheck = false;

    String shortVersion;
    String longVersion;
    String longVersionSnap;

    String rootDir;
    String propertiesFile;
    String installExtraJarsScriptText;
    boolean doPomCheck = false;

    class ArtifactItem {
        String groupId;
        String artifactId;
        Boolean Checked = false;
    }

    @BeforeEach
    public void setup() {
        doPomCheck=Boolean.parseBoolean(System.getProperty("doPomCheck"));
        if(!doPomCheck && !turnOffPomParameterCheck) { return; }
        String scriptFile = "installExtraJars.sh";
        propertiesFile = "pom-version.properties";
        rootDir = "..";
        // System.out.println(System.getProperty("user.dir"));
        try {
            Properties properties = PomUtilities.readPomVersionProperties(rootDir + "/deployment-extras/" + propertiesFile);
            shortVersion = properties.getProperty("project.shortVersion");
            longVersion = properties.getProperty("project.longVersion");
            longVersionSnap = longVersion + "-SNAPSHOT";


            assertNotNull(shortVersion);
            System.out.println("shortVersion: " + shortVersion);
            System.out.println("longVersion: " + longVersion);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testPomCheck() {

        if (!doPomCheck && !turnOffPomParameterCheck) {
            System.out.println("Effectively skipping testPomCheck because -DdoPomCheck is not true.");
            return;
        }

        try {

            {
                String ms = "adverse-events";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.adverse-events.version"), "gsrs.adverse-events.version");
            }

            {
                String ms = "applications";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.application.version"), "gsrs.application.version");
            }

            {
                String ms = "clinical-trials";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.clinical-trials.version"), "gsrs.clinical-trials.version");
            }

            {
                String ms = "deployment-extras";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
            }

            {
                String ms = "frontend";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");

                String configJsonPath = rootDir + "/frontend/src/main/resources/static/assets/data/config.json";
                System.out.println(">> " + configJsonPath);
                String json = PomUtilities.readTextFile(configJsonPath, StandardCharsets.UTF_8);
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(json);
                String configVersion = jsonNode.get("version").asText();
                assertEquals(shortVersion, configVersion, "Frontend config version");
            }

            {
                String ms = "gateway";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
            }

            {
                String ms = "impurities";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.impurities.version"), "gsrs.impurities.version");
            }

            {
                String ms = "products";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.product.version"), "gsrs.product.version");
            }

            {
                String ms = "ssg4m";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersionSnap, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                assertEquals(longVersionSnap, properties.getProperty("gsrs.ssg4.version"), "gsrs.ssg4.version");
            }

            {
                String ms = "substances";
                Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                Properties properties = msModel.getProperties();
                System.out.println("> " + ms);
                assertEquals(longVersion, msModel.getVersion(), "version");
                assertEquals(longVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                assertEquals(longVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void checkDependencyExtraJarExistsAndFindPathInScript(String ms, Dependency dependency) {
        String jarPath = "extraJars/" + PomUtilities.makeJarFilename(dependency);
        File file = new File(rootDir + "/" + ms + "/" + jarPath);
        assertTrue(file.exists());
        assertTrue(installExtraJarsScriptText.contains(jarPath));
    }
}
