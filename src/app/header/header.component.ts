import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  userAuthenticated$ = this.authService.userAuthenticated$;

  constructor(private authService: AuthService) {
  }

  obLogout(): void {
    this.authService.logout();
  }
}
