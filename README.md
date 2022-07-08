# Beyond Identity Demo Application
This demo application is made up of a nodejs backend and angular frontend. 
In this guide we will first construct a tenant, and then connect the Beyond Identity Demo Application to it.

## Pre-requisites

1. Must have nodejs installed. https://nodejs.org/en/download/

2. Must have angular cli installed. `npm install -g @angular/cli` https://angular.io/cli

3. Must have brew installed. `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` https://brew.sh/

4. Must have jq and curl installed `brew install jq curl` 

## Tenant Construction

1. Create a tenant by going to https://console-us.beyondidentity.com/signup

2. Create an API Token for your tenant by going to Applications -> "Beyond Identity Management API" -> "API Tokens. Copy the token and save it

3. Get your tenant id and save it

4. Run the command `TENANT_ID=<your-tenant-id> API_TOKEN=<your-api-token> ./configure-tenant.sh` . This will setup your tenant and generate a .env file. The .env file contains configuration ids that are needed to start the example application. 

## Start backend and frontend

1. Install dependencies with `npm install`

2. Copy the wasm over with `npm run copy:wasm`

3. Source the .env file `source .env`

4. Start the backend server with `node server.js`

5. In another window start the frontend app with `ng serve`

6. Open your browser and go to `http://localhost:4200`