
# Common GSRS repositories and branches

People just wanting to install and run GSRS should use the [gsrs3-main-deployment](https://github.com/ncats/gsrs3-main-deployment).  When you run the services in the deployment, the Maven program will automatically download dependencies from Maven Central.   

Those wanting to tinker with the code should clone or pull code from Github.

If you want code that corresponds to a specific version, use a TAG to accomplish that. For example, clone the default branch but then do:

```
# In this case the default branch is master
git clone --branch master https://github.com/ncats/gsrs-spring-starter
cd gsrs-spring-starter
git fetch --tags
git checkout GSRSv3.2.0PUB
# And then, make a feature branch
git checkout -b my_feature 
```

If you want the latest code that developers are using to make the upcoming version, then the current procedure is to pull/clone from the default branch. 

This table provides a list of repositories and their banch defaults.

| Repository | Default branch | Read access | Layer | Type |
|---|---|---|---|---|
| [GSRSFrontend](https://github.com/ncats/GSRSFrontend) | `development_3.0` | public | frontend | Angular |
| [gsrs3-main-deployment](https://github.com/ncats/gsrs3-main-deployment) | `main` | public | backend | deployment |
| [gsrs-ci](https://github.com/ncats/gsrs-ci) | `fda` | internal | backend | deployment |
| [gsrs-spring-starter](https://github.com/ncats/gsrs-spring-starter) | `master` | public | backend | starter module |
| [gsrs-spring-module-substances](https://github.com/ncats/gsrs-spring-module-substances) | `master` | public | backend | starter module |
| [gsrs-spring-module-adverse-events](https://github.com/ncats/gsrs-spring-module-adverse-events) | `starter` | public | backend | starter module |
| [gsrs-spring-module-drug-applications](https://github.com/ncats/gsrs-spring-module-drug-applications) | `starter` | public | backend | starter module |
| [gsrs-spring-module-clinical-trials](https://github.com/ncats/gsrs-spring-module-clinical-trials) | `master` | public | backend | starter module |
| [gsrs-spring-module-impurities](https://github.com/ncats/gsrs-spring-module-impurities) | `starter` | public | backend | starter module |
| [gsrs-spring-module-invitro-pharmacology](https://github.com/ncats/gsrs-spring-module-invitro-pharmacology) | `master` | public | backend | starter module |
| [gsrs-spring-module-drug-products](https://github.com/ncats/gsrs-spring-module-drug-products) | `starter` | public | backend | starter module |
| [gsrs-spring-module-ssg4](https://github.com/ncats/gsrs-spring-module-ssg4) | `master` | public | backend | starter module |
| [molwitch](https://github.com/ncats/molwitch) | `master` | public | backend | other |
| [molwitch-cdk](https://github.com/ncats/molwitch-cdk) | `master` | public | backend | other |
| [ncats-common](https://github.com/ncats/ncats-common) | `master` | public | backend | other |
| [gsrs-services-common](https://github.com/ncats/gsrs-services-common) | `master` | public | backend | other |
