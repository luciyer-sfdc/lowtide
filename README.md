## Lowtide

Tooling for Einstein Analytics Demos. Built by EA Tech PMM.

Contacts:

Luc Iyer (luciyer@salesforce.com), Terrence Tse (ttse@salesforce.com), Rodrigo Mercader (rmercader@salesforce.com)

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
