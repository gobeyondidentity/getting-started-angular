import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  // On submitForm make request to backend
  submitForm(user: User): Observable<User> {
    return this.http
      .post<User>('http://localhost:8082/users/signup', user, this.httpOptions)
      .pipe(
        tap((newUser: User) =>
          this.log('Received signup response from backend')
        )
      );
  }

  private log(message: string) {
    this.messageService.add(`SignupService: ${message}`);
  }
}
