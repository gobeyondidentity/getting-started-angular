import { Injectable } from '@angular/core';
import { User } from './user';
import { Identity } from './identity';
import { embeddedSdk } from './embeddedSdk';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  identity: Identity = {
    username: '',
    id: '',
    credentialID: '',
    passkeyLink: '',
  };

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  createUser(username: string): Observable<Identity> {
    return this.http
      .post<Identity>(
        'http://localhost:3001/users/create',
        { username: username },
        this.httpOptions
      )
      .pipe(
        tap((newUser: Identity) => {
          console.log(`created identity ${newUser.id} ${newUser.username}`);
          this.identity.id = newUser.id;
          this.identity.username = newUser.username;
        })
      );
  }

  createPasskey(): Observable<Identity> {
    return this.http
      .post<Identity>(
        'http://localhost:3001/users/generate-passkey-link',
        this.identity,
        this.httpOptions
      )
      .pipe(
        tap((user: Identity) => {
          console.log(`got passkey link ${user.passkeyLink}`);
          this.identity.passkeyLink = user.passkeyLink;
          let passkeyLink: string = this.identity.passkeyLink || '';
          embeddedSdk
            .bindCredential(passkeyLink)
            .then((passkeyCreationResponse) => {
              console.log(
                `Successfully created passkey ${passkeyCreationResponse}`
              );
              this.identity.credentialID = passkeyCreationResponse.id;
            })
            .catch((reason) => {
              console.log(`failed to create passkey because ${reason}`);
            });
        })
      );
  }

  getIdentity(): Identity {
    return this.identity;
  }
}
