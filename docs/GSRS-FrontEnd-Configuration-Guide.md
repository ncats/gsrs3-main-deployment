# GSRS Front-end configuration Guide

The GSRS front-end has dozens of settings and values to customize several aspects of the application to suit a multitude of individual and organizational needs. 

We have provided a spreadsheet with each Field name, description, data model, and an example to help explain each one.

 [View the Configuration Details Guide](https://github.com/ncats/gsrs-ci/blob/gsrs-example-deployment/docs/GSRS%20Frontend%20Configuration%20Details.xlsx).

### Editing the front-end configuration file

The front-end json configuration file `config.json` can be found in the `src\app\fda\config` folder of the Frontend repository: `https://github.com/ncats/GSRSFrontend/tree/development_3.0` by default.

In the frontend.war file the config.json will be found here:
`WEB-INF/classes/static/assets/data/config.json`.

Changes to configuration settings do not a full rebuild to be applied, but restarting any instance is advised.
