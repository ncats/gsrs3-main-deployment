package gsrs.ncats.deploymentextras;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gsrs.startertests.pomutilities.PomUtilities;
import org.apache.maven.model.Dependency;
import org.apache.maven.model.Model;
import org.apache.maven.model.Profile;
import org.codehaus.plexus.util.xml.pull.XmlPullParserException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

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
    // See pom-version.properties, there is now an option to set this value there instead of in code.
    boolean turnOffPomParameterCheck = false;
    String starterModuleVersion;
    String substanceModuleVersion;
    String substancesMsVersion;
    String otherMsVersion;
    String otherModuleVersion;
    String frontendConfigVersion;

    String rootDir;
    String propertiesFile;
    String installExtraJarsScriptText;
    boolean doPomCheck = false;
    List<String> skipServices = new ArrayList<String>();

    class ArtifactItem {
        String groupId;
        String artifactId;
        Boolean Checked = false;
    }

    @BeforeEach
    public void setup() {
        doPomCheck = Boolean.parseBoolean(System.getProperty("doPomCheck"));
        String scriptFile = "installExtraJars.sh";
        propertiesFile = "pom-version.properties";
        rootDir = "..";

        Properties properties = null;
        try {
            properties = PomUtilities.readPomVersionProperties(rootDir + "/deployment-extras/" + propertiesFile);
        } catch (IOException e) {
            e.printStackTrace();
        }
        turnOffPomParameterCheck = Boolean.parseBoolean(properties.getProperty("gsrsci.ged.pomversiontest.turnOffPomParameterCheck"));

        if (!doPomCheck && !turnOffPomParameterCheck) {
            return;
        }

        starterModuleVersion = properties.getProperty("gsrsci.ged.pomversiontest.starterModuleVersion");
        substanceModuleVersion = properties.getProperty("gsrsci.ged.pomversiontest.substancesModuleVersion");
        substancesMsVersion = properties.getProperty("gsrsci.ged.pomversiontest.substancesMsVersion");
        otherMsVersion = properties.getProperty("gsrsci.ged.pomversiontest.otherMsVersion");
        otherModuleVersion = properties.getProperty("gsrsci.ged.pomversiontest.otherModuleVersion");
//            frontendConfigVersion = properties.getProperty("gsrsci.ged.pomversiontest.frontendConfigVersion");

        String s = properties.getProperty("gsrsci.ged.pomversiontest.skip");
        if (s != null) {
            skipServices = Arrays.asList(s.split("\\s*,\\s*"));
        }
        if (skipServices.isEmpty()) {
            System.out.println("Skipping the following services: " + skipServices.toString());
        }
        try {
            installExtraJarsScriptText = PomUtilities.readTextFile(rootDir + "/substances/" + scriptFile, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        assertNotNull(starterModuleVersion);
        assertNotNull(substanceModuleVersion);
        assertNotNull(substancesMsVersion);
        assertNotNull(otherMsVersion);
        assertNotNull(otherModuleVersion);
//        assertNotNull(frontendConfigVersion);

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
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.adverse-events.version"), "gsrs.adverse-events.version");
                }
            }

            {

                String ms = "applications";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.application.version"), "gsrs.application.version");
                }
            }

            {
                String ms = "clinical-trials";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.clinical-trials.version"), "gsrs.clinical-trials.version");
                }
            }

            {
                String ms = "deployment-extras";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                }
            }

            {
                String ms = "discovery";
                // if(!skipServices.contains(ms)) {
                if (false) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                }
            }


            {
                String ms = "frontend";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");

                    /*
                    String configJsonPath = rootDir + "/frontend/src/main/resources/static/assets/data/config.json";
                    System.out.println(">> " + configJsonPath);
                    String json = PomUtilities.readTextFile(configJsonPath, StandardCharsets.UTF_8);
                    ObjectMapper objectMapper = new ObjectMapper();
                    JsonNode jsonNode = objectMapper.readTree(json);
                    String configVersion = jsonNode.get("version").asText();
                    assertEquals(frontendConfigVersion, configVersion, "Frontend config version");
                    */
                }
            }

            {
                String ms = "gateway";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                }
            }

            {
                String ms = "impurities";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.impurities.version"), "gsrs.impurities.version");
                }
            }

            {
                String ms = "invitro-pharmacology";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.invitro-pharmacology.version"), "gsrs.invitro-pharmacology.version");
                }
            }

            {
                String ms = "products";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.product.version"), "gsrs.product.version");
                }
            }

            {
                String ms = "ssg4m";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(otherMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");
                    assertEquals(otherModuleVersion, properties.getProperty("gsrs.ssg4.version"), "gsrs.ssg4.version");
                }
            }

            {
                String ms = "substances";
                if (!skipServices.contains(ms)) {
                    Model msModel = PomUtilities.readPomToModel(rootDir + "/" + ms + "/pom.xml");
                    Properties properties = msModel.getProperties();
                    System.out.println("> " + ms);
                    assertEquals(substancesMsVersion, msModel.getVersion(), "version");
                    assertEquals(starterModuleVersion, properties.getProperty("gsrs.starter.version"), "gsrs.starter.version");
                    assertEquals(substanceModuleVersion, properties.getProperty("gsrs.substance.version"), "gsrs.substance.version");

                    boolean featureizeNitrosaminesChecked = false;
                    List<Profile> profiles = msModel.getProfiles();

                    List<Dependency> dependencies = msModel.getDependencies();
                    for (Dependency dependency : dependencies) {
                        if (dependency.getGroupId().equals("gov.fda.gsrs") && dependency.getArtifactId().equals("Featureize-Nitrosamines")) {
                            {
                                System.out.println(">> " + dependency.getGroupId() + "" + dependency.getArtifactId());
                                checkDependencyExtraJarExistsAndFindPathInScript(ms, dependency);
                                featureizeNitrosaminesChecked = true;
                            }
                        }
                    }

                    assertTrue(featureizeNitrosaminesChecked);

                    System.out.println(">> " + "clinical-trials-api");
                    checkFileAsExtraJarExistsAndFindPathInScript("substances", "clinical-trials-api", otherModuleVersion);

                    System.out.println(">> " + "applications-api");
                    checkFileAsExtraJarExistsAndFindPathInScript("substances", "applications-api", otherModuleVersion);

                    System.out.println(">> " + "products-api");
                    checkFileAsExtraJarExistsAndFindPathInScript("substances", "products-api", otherModuleVersion);

                }
            }


        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }


    public void checkFileAsExtraJarExistsAndFindPathInScript(String ms, String artifactId, String version) {
        String jarPath = "extraJars/" + artifactId + "-" + version + ".jar";
        File file = new File(rootDir + "/" + ms + "/" + jarPath);
        assertTrue(file.exists());
        assertTrue(installExtraJarsScriptText.contains(jarPath));
    }


    public void checkDependencyExtraJarExistsAndFindPathInScript(String ms, Dependency dependency) {
        String jarPath = "extraJars/" + PomUtilities.makeJarFilename(dependency);
        File file = new File(rootDir + "/" + ms + "/" + jarPath);
        assertTrue(file.exists());
        assertTrue(installExtraJarsScriptText.contains(jarPath));
    }
}