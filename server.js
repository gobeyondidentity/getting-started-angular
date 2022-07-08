const express = require('express')
const axios = require('axios')
const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();
const app = express()
const port = 3000
app.use(cors())
app.use(express.json())

// Beyond Identity Config
const apiKey = process.env.API_TOKEN || '';
const tenantID = process.env.TENANT_ID || '';
const realmID = process.env.REALM_ID || '';
const applicationID = process.env.APPLICATION_ID || '';
const applicationClientID = process.env.APP_CLIENT_ID || '';
const applicationClientSecret = process.env.APP_CLIENT_SECRET || '';
const authenticatorConfigID = process.env.AUTH_CONFIG_ID || '';
const authorizationHeaderSecret = Buffer.from(applicationClientID+':'+applicationClientSecret, 'utf8').toString('base64')


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/users/signup', (req, res) => {
    // Create Identity
    axios.post('https://api-us.beyondidentity.com/v1/tenants/'+tenantID+'/realms/'+realmID+'/identities', 
    {
        identity: {
            display_name: req.body.username,
            traits: {
                version: 'traits_v0',
                username: req.body.username
            }
        }
    },{
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    .then(createIdentityResponse => {
        // Create credential binding job
        axios.post('https://api-us.beyondidentity.com/v1/tenants/'+tenantID+'/realms/'+realmID+'/identities/'+createIdentityResponse.data.id+'/credential-binding-jobs', {
            job: {
                authenticator_config_id: authenticatorConfigID,
                delivery_method: 'RETURN'
            }
        },{
            headers: { 'Authorization': `Bearer ${apiKey}` }
        })
        .then(credentialBindingJobResponse => {
            // Return Credential Binding Link back to frontend
            res.json({ 
                username: req.body.username, 
                credentialBindingLink: credentialBindingJobResponse.data.credential_binding_link
            })
        })
    })
    .catch(error => {
        console.error(error.response.data);
    });
})

app.get('/bi-authenticate', (req, res) => {
    // Handle redirect from Beyond Identity Auth Server
    res.json({
        authInvocationLink: req.url
    })
})

app.get('/auth', (req, res) => {
    res.json({
        authURL: 'https://auth-us.beyondidentity.com/v1/tenants/'+tenantID+'/realms/'+realmID+'/applications/'+applicationID+'/authorize',
        clientID: applicationClientID
    })
})

app.get('/auth/callback', (req, res) => {
    // Create authorization

    const params = new URLSearchParams()
    params.append('client_id', applicationClientID)
    params.append('grant_type', 'authorization_code')
    params.append('code', req.query.code)
    params.append('redirect_uri', 'http://localhost:3000/auth/callback')

    axios.post('https://auth-us.beyondidentity.com/v1/tenants/'+tenantID+'/realms/'+realmID+'/applications/'+applicationID+'/token',
    params ,{
            headers: { 
                'Authorization': `Basic ${authorizationHeaderSecret}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
    }).then(response => {
        res.json({idToken: response.data.id_token})
    }).catch(reason => {
        console.log(`failed /token response because ${reason}`)
    })
})

app.listen(port, () => {
  if ('API_TOKEN' in process.env) {
    console.log("environment variable API_TOKEN is set")
  } else {
    console.log("environment variable API_TOKEN is not set")
    process.exit(1)
  }

  if ('TENANT_ID' in process.env) {
    console.log("environment variable TENANT_ID is set: ", process.env.TENANT_ID)
  } else {
    console.log("environment variable TENANT_ID is not set")
    process.exit(1)
  }

  if ('REALM_ID' in process.env) {
    console.log("environment variable REALM_ID is set: ", process.env.REALM_ID)
  } else {
    console.log("environment variable REALM_ID is not set")
    process.exit(1)
  }

  if ('AUTH_CONFIG_ID' in process.env) {
    console.log("environment variable AUTH_CONFIG_ID is set: ", process.env.AUTH_CONFIG_ID)
  } else {
    console.log("environment variable AUTH_CONFIG_ID is not set")
    process.exit(1)
  }

  if ('APPLICATION_ID' in process.env) {
    console.log("environment variable APPLICATION_ID is set: ", process.env.APPLICATION_ID)
  } else {
    console.log("environment variable APPLICATION_ID is not set")
    process.exit(1)
  }

  if ('APP_CLIENT_ID' in process.env) {
    console.log("environment variable APP_CLIENT_ID is set: ", process.env.APP_CLIENT_ID)
  } else {
    console.log("environment variable APP_CLIENT_ID is not set")
    process.exit(1)
  }

  if ('APP_CLIENT_SECRET' in process.env) {
    console.log("environment variable APP_CLIENT_SECRET is set")
  } else {
    console.log("environment variable APP_CLIENT_SECRET is not set")
    process.exit(1)
  }
  console.log(`Example app listening on port ${port}`)
})
