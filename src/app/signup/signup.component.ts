import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { SignupService } from '../signup.service';
import { User } from '../user';
import { embeddedSdk } from '../embeddedSdk';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private signupService: SignupService
  ) {}

  ngOnInit(): void {}
  user: User = { username: '', credentialBindingLink: '', credentialID: '' };

  signup(username: string): void {
    if (!username) {
      return;
    }
    this.user.username = username;
    this.log(`Submitting user to SignupService ${this.user.username}`);
    this.signupService
      .submitForm({ username: username })
      .subscribe((userRes) => {
        this.user.credentialBindingLink = userRes.credentialBindingLink;
        this.log(
          `Recieved CredentialBindingLink from SignupService ${this.user.credentialBindingLink}`
        );
        let bindingLink: string = this.user.credentialBindingLink || '';
        embeddedSdk
          .bindCredential(bindingLink)
          .then((bindCredentialResponse) => {
            this.log(`Successfully bound credential ${bindCredentialResponse}`);
            this.user.credentialID = bindCredentialResponse.id;
          })
          .catch((reason) => {
            this.log(`failed to bind credential because ${reason}`);
          });
      });
  }

  private log(message: string) {
    this.messageService.add(`SignupComponent: ${message}`);
  }
}
