# HNG Backend API Integration (Stage 1)

Profile Intelligence Service built with Node.js, Express, and MongoDB.

## Live Base URL

Set this after deployment:

```
https://yourapp.domain.app
```

## Features

- Integrates Genderize, Agify, and Nationalize APIs
- Stores enriched profiles in MongoDB
- Uses UUID v7 for all profile IDs
- Enforces idempotency by name (case-insensitive)
- Supports profile listing with optional case-insensitive filters
- Returns consistent JSON error responses
- Adds CORS header `Access-Control-Allow-Origin: *`

## Endpoints

### 1. Create Profile

`POST /api/profiles`

Request body:

```json
{ "name": "ella" }
```

Success (201):

```json
{
  "status": "success",
  "data": {
    "id": "01963ef7-f2f0-7f5f-8e27-13d5e1a4cf40",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

If profile already exists (200):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile...": true }
}
```

### 2. Get Single Profile

`GET /api/profiles/:id`

Success (200): returns full stored profile.

### 3. Get All Profiles

`GET /api/profiles`

Optional query params (case-insensitive):

- `gender`
- `country_id`
- `age_group`

Example:

`GET /api/profiles?gender=male&country_id=NG`

Success (200):

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    }
  ]
}
```

### 4. Delete Profile

`DELETE /api/profiles/:id`

Success: `204 No Content`

## Error Format

All errors use:

```json
{ "status": "error", "message": "<error message>" }
```

Status codes:

- `400` Missing or empty name
- `422` Invalid type
- `404` Profile not found
- `502` Upstream invalid response or upstream failure
- `500` Internal server error

External API validation errors:

- `Genderize returned an invalid response`
- `Agify returned an invalid response`
- `Nationalize returned an invalid response`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hng-stage1
```

3. Start server:

```bash
npm start
```

or

```bash
npm run dev
```

## Submission Checklist

- Public GitHub repository with this README
- Public API base URL (Vercel, Railway, Heroku, AWS, PXXL, etc.)
- Endpoints live and reachable during grading
