import { Component, OnInit } from '@angular/core';
import { embeddedSdk } from '../embeddedSdk';
import { Credential } from '@beyondidentity/bi-sdk-js';
import { HttpClient } from '@angular/common/http';
import { CredentialRedirect } from '../credentialredirect';
import { IDToken } from '../idtoken';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  constructor(private http: HttpClient) {}

  credentials: Credential[] = [];
  idToken: String = '';
  selectedCredential?: Credential;
  ngOnInit(): void {
    embeddedSdk.getCredentials().then((credentials) => {
      this.credentials = credentials;
    });
  }

  onSelect(credential: Credential): void {
    this.selectedCredential = credential;

    this.http.get<any>('http://localhost:3001/auth').subscribe((authRes) => {
      this.http
        .get<CredentialRedirect>(
          authRes.authURL,
          // 'https://auth-us.beyondidentity.com/v1/tenants/000144d6b6299bce/realms/8f98ea17bd48e2ce/applications/0be1e2e7-414b-4d0f-b6fa-7b387aa017ae/authorize',
          {
            observe: 'response',
            params: {
              response_type: 'code',
              redirect_uri: 'http://localhost:3001/auth/callback',
              scope: 'openid',
              client_id: authRes.clientID,
            },
          }
        )
        .subscribe((credentialRedirect) => {
          let authLink: string =
            credentialRedirect.body?.authInvocationLink || '';
          let authenticateUrl = 'http://localhost:3002' + authLink;
          embeddedSdk
            .authenticate(authenticateUrl, () => {
              return this.selectedCredential.id;
            })
            .then((res) => {
              this.http
                .get<IDToken>(res.redirectURL)
                .subscribe((tokenResponse) => {
                  console.log(`got id token ${tokenResponse.idToken}`);
                  this.idToken = JSON.stringify(
                    jwt_decode(tokenResponse.idToken),
                    undefined,
                    2
                  );
                });
            })
            .catch((reason) => {
              console.log(`failed to auth because ${reason}`);
            });
        });
    });
  }
}
