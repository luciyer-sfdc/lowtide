# Lowtide

Tooling for Einstein Analytics Demos. Built by EA Tech PMM.

Author:

Luc Iyer <luciyer@salesforce.com>

Technical Contacts:

Terrence Tse <ttse@salesforce.com>, Rodrigo Mercader <rmercader@salesforce.com>

---

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

---

## Salesforce Org Einstein Analytics Operations

### Folders (Apps)

#### List Folders

`GET` @ `/api/org/folder`


### Datasets

#### List Datasets

`GET` @ `/api/org/dataset`


#### List Datasets inside `folder_id`

`GET` @ `/api/org/dataset/:folder_id`


#### Touch (refresh) all Datasets in org [RETURNS JOB]

`GET` @ `/api/org/dataset/refresh`


### Dataflows & Timeshifting

#### List Dataflows

`GET` @ `/api/org/dataflow`


#### Create/Overwrite/Propagate Timeshifting Dataflow [RETURNS JOB]

`POST` @ `/api/org/dataflow`

```
{
    "dataflow_parameters" : {
        "operation" : "[create|overwrite|dynamic]",
        "name" : "some_dataflow_name",
        "label" : "Some Dataflow Label"
    },
    "dataset_array": [
        { "id": "0Fb5A000000kBbfSAE" },
        { "id": "0Fb5A000000kBbkSAE" }
    ]
}
```


#### List Dataflows inside `folder_id`

`GET` @ `/api/org/dataflow/:folder_id`


#### Get Single Dataflow & DataflowVersion with `dataflow_id`

`GET` @ `/api/org/dataflow/single/:dataflow_id`


### Analytics Templates

#### List Templates

`GET` @ `/api/org/template`


#### Create Template from App [IN PROGRESS]

`POST` @ `/api/org/template`


#### Update Template from App [IN PROGRESS]

`PATCH` @ `/api/org/template`


#### Get Single Template

`GET` @ `/api/org/template/:template_id`


#### Delete Single Template

`DELETE` @ `/api/org/template/:template_id`


## Template Deploy Operations

#### Get Available Templates from `:branch` [beta|master]

`GET` @ `/api/repository/template/:branch`


#### Deploy Templates from `:branch` [beta|master] [RETURNS JOB]

`POST` @ `/api/repository/template/:branch/deploy`

```
{
    "templates" : [
        "CSV_Template",
        "EAPMM_EA_for_CG",
        "EAPMM_EA_for_ERM"
    ]
}
```


## Check Job Status

#### Get status of job with `job_id`

`GET` @ `/api/jobs/:job_id`
