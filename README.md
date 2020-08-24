# Lowtide

Tooling for Einstein Analytics Demos. Built by EA Tech PMM.

Author:

Luc Iyer <luciyer@salesforce.com>

Technical Contacts:

Terrence Tse <ttse@salesforce.com>, Rodrigo Mercader <rmercader@salesforce.com>



## Authentication

See https://github.com/luciyer-sfdc/lowtide-auth for boilerplate.

#### Authenticate with Username & Password

`POST` @ `/api/auth`

```
{
	"source": "credentials",
	"credentials" : {
		"username" : "admin@my.salesforce.org",
		"password" : "salesforce1"
	}
}
```


#### Authenticate with Session ID & Server URL

`POST` @ `/api/auth`

```
{
	"source": "session",
	"credentials" : {
		"session_id" : "my_session_id",
		"server_url" : "https://my-org.salesforce.com"
	}
}
```


#### Oauth2 Flow

`GET` @ `/api/auth`


#### Get Session Information

`GET` @ `/api/auth/session`


#### Logout

`GET` @ `/api/auth/revoke`


#### Unauthenticated Requests

Any requests matching `/api/*` without a valid Salesforce session will be denied.



## Salesforce Org Einstein Analytics Operations

### Folders (Apps)

#### List Folders

`GET` @ `/api/org/folder`


### Datasets

#### List Datasets

`GET` @ `/api/org/dataset`


#### List Datasets inside Folder

`GET` @ `/api/org/dataset/:folder_id`


#### Touch (refresh) all Datasets in org `[RETURNS JOBS]`

`GET` @ `/api/org/refresh`


### Dataflows & Timeshifting

#### List Dataflows

`GET` @ `/api/org/dataflow`


#### Create/Overwrite/Propagate Timeshifting Dataflow `[RETURNS JOB]`

`POST` @ `/api/org/dataflow`

Create...

```
{
    "dataflow_parameters" : {
        "operation" : "create",
        "name" : "some_dataflow_name",
        "label" : "Some Dataflow Label"
    },
    "dataset_array": [
        { "id": "0Fb5A000000kBbfSAE" },
        { "id": "0Fb5A000000kBbkSAE" }
    ]
}
```


Overwrite...

```
{
    "dataflow_parameters" : {
        "operation" : "overwrite",
        "id" : "02K5A000000iDu4UAE",
    },
    "dataset_array": [
        { "id": "0Fb5A000000kBbfSAE" },
        { "id": "0Fb5A000000kBbkSAE" }
    ]
}
```


Propagate...

```
{
    "dataflow_parameters": {
        "operation": "dynamic",
        "id": "02K5A000000iDu4UAE"
    }
}
```


#### List Dataflows inside Folder

`GET` @ `/api/org/dataflow/:folder_id`


#### Get Single Dataflow & DataflowVersion

`GET` @ `/api/org/dataflow/single/:dataflow_id`


### Analytics Templates

#### List Templates

`GET` @ `/api/org/template`


#### Create Template from App `[IN PROGRESS]`

`POST` @ `/api/org/template`


#### Update Template from App `[IN PROGRESS]`

`PATCH` @ `/api/org/template`


#### Get Single Template

`GET` @ `/api/org/template/:template_id`


#### Delete Single Template

`DELETE` @ `/api/org/template/:template_id`


## Template Deploy Operations

#### Get Available Templates from branch [beta|master]

`GET` @ `/api/repository/template/:branch`


#### Deploy Templates from branch [beta|master] `[RETURNS JOB]`

`POST` @ `/api/repository/template/:branch/deploy`

```
{
    "templates" : [
        "beta/CSV_Template.zip",
        "beta/EAPMM_EA_for_CG.zip",
        "beta/EAPMM_EA_for_ERM.zip"
    ]
}
```


## Check Job Status

#### Get Status of Job

`GET` @ `/api/jobs/:job_id`


## Template Repo Maintenance

See https://github.com/luciyer-sfdc/lowtide-zip (CLI).
