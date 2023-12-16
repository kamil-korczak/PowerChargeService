# Power Charge Service

## Description
Part of the system to support charging stations. Efficient operation of the charging station structure as well as depends on API security. The charging station has its own type, settings and places where the vehicle can connect to.

## [Project Guidelines](project_content_eng.md)


## Requiremnts
1. Clone project

2. Copy `.env-default` and save it as `.env` and change accordingly the values of environment variables.

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
APP_PORT=8000
LOGGER_LEVEL=debug
ACCESS_SECRET_KEY=ACCESS_SECRET_KEY_CHANGE_IT
REFRESH_SECRET_KEY=REFRESH_SECRET_KEY_CHANGE_IT
```

### Additional configuration

File: [`config.ts`](source/config.ts)

```
{
    ...
    TOKEN: {
        ...
        ACCESS_TOKEN_EXPIRATION: "120s",
        ACCESS_TOKEN_CACHE_IN_SECONDS: 120,
        REFRESH_TOKEN_EXPIRATION: "1d",
        REFRESH_TOKEN_COOKIE_MAX_AGE: 24 * 60 * 60 * 1000,  // 1 day
    },
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 25,
    },
}
```

## Usage
All endpoints have been stored in [the Postman collection](postman/PowerChargeService.postman_collection.json).

All bellow Endpoints comes with pagination and filtering:

- **`GET`** `/charging_stations`:
    - allowed filter by: 
        - `name` *(substring)*, 
        - `device_id`,
        - `ip_address`,
        - `firmware_version`
- **`GET`** charging_station_types
    - allowed filter by:
        - `name` *(substring)*,
        - `current_type`
- **`GET`** connectors
    - allowed filter by:
        - `name` *(substring)*,
        - `priority`

Pagination query params: `page`, `limit`


### Run project
```
docker compose up
```


## Technology
- npm `10.2.4`
- Node.js `21.4.0` with TypeScript `5.3.3`
- express.js `4.18.2`
- All dependencies in [`package.json`](package.json)
