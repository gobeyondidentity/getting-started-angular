import { Component, OnInit } from '@angular/core';
import { embeddedSdk } from '../embeddedSdk';
import { Passkey } from '@beyondidentity/bi-sdk-js';
import { HttpClient } from '@angular/common/http';
import { PasskeyRedirect } from '../passkeyredirect';
import { IDToken } from '../idtoken';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  constructor(private http: HttpClient) {}

  passkeys: Passkey[] = [];
  idToken: String = '';
  selectedPasskey?: Passkey;
  ngOnInit(): void {
    embeddedSdk.getPasskeys().then((passkeys) => {
      this.passkeys = passkeys;
    });
  }

  onSelect(passkey: Passkey): void {
    this.selectedPasskey = passkey;

    this.http.get<any>('http://localhost:8082/auth').subscribe((authRes) => {
      this.http
        .get<PasskeyRedirect>(
          authRes.authURL,
          // 'https://auth-us.beyondidentity.com/v1/tenants/000144d6b6299bce/realms/8f98ea17bd48e2ce/applications/0be1e2e7-414b-4d0f-b6fa-7b387aa017ae/authorize',
          {
            observe: 'response',
            params: {
              response_type: 'code',
              redirect_uri: 'http://localhost:8082/auth/callback',
              scope: 'openid',
              client_id: authRes.clientID,
            },
          }
        )
        .subscribe((passkeyRedirect) => {
          let authLink: string =
            passkeyRedirect.body?.authInvocationLink || '';
          let authenticateUrl = 'http://localhost:8083' + authLink;
          if (this.selectedPasskey === undefined) {
            throw new Error("No passkey selected");
          }
          embeddedSdk
            .authenticate(authenticateUrl, this.selectedPasskey.id)
            .then((res) => {
              this.http
                .get<IDToken>(res.redirectUrl)
                .subscribe((tokenResponse) => {
                  this.idToken = JSON.stringify(
                    jwt_decode(tokenResponse.idToken),
                    undefined,
                    2
                  );
                });
            })
            .catch((reason) => {
              console.error(`failed to auth because ${reason}`);
            });
        });
    });
  }
}
