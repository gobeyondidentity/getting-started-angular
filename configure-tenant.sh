#!/bin/bash

if test -f ".env"; then
    echo "===="
    echo ".env exists. Delete and try again."
    exit
fi

## Select the VDC you created a tenant on
VDC_REGION=us
# VDC_REGION=eu

set -euo pipefail

if [ -z $API_TOKEN ]; then
    echo "API_TOKEN is not set. Add your API Key to the top of this file"
fi

if [ -z $TENANT_ID ]; then
    echo "TENANT_ID is not set. Add your tenant id to the top of this file"
    exit 1
fi

if ! which jq >/dev/null; then
    echo "ERROR: missing dependencies. On macOS, install them with"
        brew install jq
    exit 1
fi

#set -x

# Create a realm in your tenant
if REALM_ID=$( curl -f -X POST https://api-$VDC_REGION.beyondidentity.com/v1/tenants/$TENANT_ID/realms \
    -d '{"realm" : { "display_name" : "Test Realm" }}' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $API_TOKEN" \
    | jq -r '.id' ) ; then
    echo "Created Realm: Test Realm - ${REALM_ID}" 
else
    echo "Failed to create realm"
    exit 1
fi

# Create an authenticator config in the realm
if AUTH_CONFIG_ID=$( curl -f -X POST https://api-$VDC_REGION.beyondidentity.com/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs \
    -d '{ "authenticator_config" : { "config" : { "type" : "embedded", "invoke_url" : "http://localhost:3001", "trusted_origins" : ["http://localhost:3002"] }}}' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $API_TOKEN" \
    | jq -r '.id' ) ; then
    echo "Created Authentication Config - ${AUTH_CONFIG_ID}"
else
    echo "Failed to create authentication config"
    exit 1
fi

# Create an application in the realm
if read APPLICATION_ID APP_CLIENT_ID APP_CLIENT_SECRET < <(echo $( curl -f -X POST https://api-$VDC_REGION.beyondidentity.com/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications \
    -d '{ "application": { "protocol_config": {"type" : "oidc", "allowed_scopes": [], "confidentiality":"confidential", "token_endpoint_auth_method" : "client_secret_basic", "grant_type": ["authorization_code"], "redirect_uris":["http://localhost:3001/auth/callback"], "token_configuration": {"expires_after":86400, "token_signing_algorithm": "RS256", "subject_field":"USERNAME"}}, "authenticator_config" : "'"$AUTH_CONFIG_ID"'", "display_name": "Test Application"}}' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $API_TOKEN" \
    | jq -r '.id, .protocol_config.client_id, .protocol_config.client_secret' )) ; then
    echo "Created Application: Test Application - ${APPLICATION_ID}"
else
    echo "Failed to create application config"
    exit 1
fi

echo "# Generated with ./configure-tenant.sh" > .env
echo "export TENANT_ID=${TENANT_ID}" >> .env
echo "export API_TOKEN=${API_TOKEN}" >> .env
echo "export REALM_ID=${REALM_ID}" >> .env
echo "export AUTH_CONFIG_ID=${AUTH_CONFIG_ID}" >> .env
echo "export APPLICATION_ID=${APPLICATION_ID}" >> .env
echo "export APP_CLIENT_ID=${APP_CLIENT_ID}" >> .env
echo "export APP_CLIENT_SECRET=${APP_CLIENT_SECRET}" >> .env
echo "export VDC_REGION=${VDC_REGION}" >> .env
source .env