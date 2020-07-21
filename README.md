## Lowtide

Tooling for Einstein Analytics Demos. Built by EA Tech PMM.

Contacts:

Luc Iyer (luciyer@salesforce.com), Terrence Tse (ttse@salesforce.com), Rodrigo Mercader (rmercader@salesforce.com)

---
### Route Listing (Reference as of 20 July)

```
{
  "all" : "*",
  "auth_required" : "/api/*",

  "auth" : "/api/auth/*",

  "auth_request" : "/api/auth",
  "auth_callback" : "/api/auth/callback",
  "auth_revoke" : "/api/auth/revoke",
  "auth_session" : "/api/auth/session",

  "org" : "/api/org/*",

  "org_templates" : "/api/org/template",
  "org_template_single" : "/api/org/template/:template_id",
  "org_template_download" : "/api/org/template/:template_id/download",
  "org_template_upload" : "/api/org/template/upload",
  "org_datasets" : "/api/org/dataset",
  "org_dataflows" : "/api/org/dataflow",
  "org_dataflow_single" : "/api/org/dataflow/:dataflow_id",
  "org_dataflow_run" : "/api/org/dataflow/run/:dataflow_id",
  "org_dataflow_schedule" : "/api/org/dataflow/schedule/:dataflow_id",

  "repo" : "/api/repository/*",

  "repo_templates" : "/api/repository/template/:branch",
  "repo_template_single" : "/api/repository/template/:branch/:template_name",
  "repo_template_download" : "/api/repository/template/:branch/download/:template_name",
  "repo_template_deploy_status" : "/api/repository/template/deploy/status/:deploy_id"

}
```


### Authentication

#### Username & Password

`POST` `/api/auth`

```
{
	"source": "credentials",
	"credentials" : {
		"username" : "admin@my.salesforce.org",
		"password" : "salesforce1"
	}
}
```

#### Session ID & Server URL

`POST` `/api/auth`

```
{
	"source": "session",
	"credentials" : {
		"session_id" : "my_session_id",
		"server_url" : "https://my-org.salesforce.com"
	}
}
```

#### Oauth2

`GET` `/api/auth`

#### Session Information

`GET` `/api/auth/session`

#### Logout

`GET` `/api/auth/revoke`

---

### Org Templates

#### All Org Templates

`GET` `/api/org/template`

#### Org Template by Id

`GET` `/api/org/template/:template_id`

---

### Repository Templates

#### Template Listing

`GET` `/api/repository/template/:branch`

#### Deploy Templates

`POST` `/api/repository/template/:branch`

```
{
  "templates" : [
    "Template_1",
    "Template_2",
    "Yet_Another_Template"
  ]
}
```

Returns:

```
{
  "done": true,
  "id": "0Af3h000006hYB3CAM",
  "state": "Completed"
}
```

#### Check Deploy Status

`GET` `/api/repository/template/deploy/status/:deploy_id`

---

### Dataflows

#### Org Dataflows

`GET` `/api/org/dataflow`

#### Timeshift Array of Datasets

`POST` `/api/org/dataflow`

```
{
	"dataflow_name" : "app_shifted",
  "dataset_array" : [
    { "id" : "xxx" },
    { "id" : "yyy", "date" : "2020-01-01" },
  ]
}
```

#### Update Dataflow

`PATCH` `/api/org/dataflow/:dataflow_id`

```
{
  "name" : "RenamedDataflow",
  "label" : "Updated Dataflow",
  "definition" : {}
}
```
