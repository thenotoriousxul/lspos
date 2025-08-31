import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { PermissionsService } from '../services/permissions';
import { AuthService } from '../services/auth';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit, OnDestroy {
  @Input() appPermission!: string | string[];
  @Input() appPermissionMode: 'any' | 'all' = 'any';
  
  private subscription?: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    let hasPermission = false;

    if (typeof this.appPermission === 'string') {
      hasPermission = this.permissionsService.can(this.appPermission);
    } else if (Array.isArray(this.appPermission)) {
      if (this.appPermissionMode === 'all') {
        hasPermission = this.permissionsService.canAll(this.appPermission);
      } else {
        hasPermission = this.permissionsService.canAny(this.appPermission);
      }
    }

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
