# API endpoints for interacting with users

**GET /users/:id**

### Response Codes
**200** `-` Successful<br>
**406** `-` Invalid Id<br>
**410** `-` User Non existent<br>
**412** `-` Invalid User Id<br>
**500** `-` Internal Server Error

### Response Body
```json
{
    "id": "someOid"
}
```

**POST /users/**

### Request headers

```
Authorization: Basic <secret>
```

### Response Codes

**201** `-` Created<br>
**401** `-` Unauthorized<br>
**500** `-` Internal Server Error<br>

### Response Body

```json
{
    "id": "someOid"
}
```

**DELETE /users/:id**

### Response Codes
**204** `-` Deleted<br>
**401** `-` Unauthorized<br>
**406** `-` Invalid Id<br>
**500** `-` Internal Server Error<br>
