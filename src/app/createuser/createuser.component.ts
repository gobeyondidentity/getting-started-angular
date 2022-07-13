import { Component, OnInit } from '@angular/core';
import { Identity } from '../identity';
import { User } from '../user';
import { UserService } from '../user.service';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css'],
})
export class CreateuserComponent implements OnInit {
  constructor(public userService: UserService) {}

  ngOnInit(): void {}

  identity: Identity = { username: '', id: '' };
  enrollTrustedEmail: boolean = false;

  createUser(username: string): void {
    if (!username) {
      return;
    }
    this.userService.createUser(username).subscribe((result) => {
      console.log(
        `created user from server.... ${result.id} ${result.username}`
      );
      this.identity = this.userService.getIdentity();
    });
  }

  createPasskey(): void {
    this.userService.createPasskey().subscribe((result) => {
      console.log(`created passkey link... ${result.passkeyLink}`);
    });
  }

  enrollEmail(): void {
    this.enrollTrustedEmail = true;
  }
}
