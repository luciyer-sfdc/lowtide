## Lowtide

---

### Routes

```
{
  "all" : "*",
  "auth" : {
    "required" : "/api/*",
    "request" : "/api/auth",
    "callback" : "/api/auth/callback",
    "revoke" : "/api/auth/revoke",
    "session" : "/api/auth/session"
  },
  "org" : {
    "base" : "/api/org/template",
    "single" : "/api/org/template/:template_id",
    "download" : "/api/org/template/:template_id/download"
  },
  "repository" : {
    "base" : "/api/repo/template",
    "single" : "/api/repo/template/:template_name",
    "download" : "/api/org/template/:template_name/download",
    "deploy" : "/api/repo/template/deploy",
    "deploy_status" : "/api/repo/template/deploy/:deploy_id"
  },
  "dataflow" : {
    "base" : "/api/dataflow",
    "single" : "/api/dataflow/:dataflow_id",
    "schedule" : "/api/dataflow/:dataflow_id/schedule",
    "run" : "/api/dataflow/:dataflow_id/run"
  },
  "upload" : {}
}
```

---

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
	"source": "credentials",
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

`GET` `/api/repo/template`

#### Deploy Templates

`POST` `/api/repo/template/deploy`

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

`GET` `/api/repo/template/deploy/:deploy_id`


---

### Dataflows

#### Org Dataflows

`GET` `/api/dataflow`

#### Timeshift Array of Datasets

`POST` `/api/dataflow`

```
{
  "dataset_array" : [
    { "id" : "xxx" },
    { "id" : "yyy", "date" : "2020-01-01" },
  ]
}
```

#### Update Dataflow

`PATCH` `/api/dataflow/:dataflow_id`

```
{
  "name" : "RenamedDataflow",
  "label" : "Updated Dataflow",
  "definition" : {}
}
```
