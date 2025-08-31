import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  
  notifications$ = this.notificationService.notifications$;

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  getNotificationClasses(type: string): string {
    const baseClasses = 'bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden';
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-l-4 border-l-green-500`;
      case 'error':
        return `${baseClasses} border-l-4 border-l-red-500`;
      case 'warning':
        return `${baseClasses} border-l-4 border-l-yellow-500`;
      case 'info':
        return `${baseClasses} border-l-4 border-l-blue-500`;
      default:
        return baseClasses;
    }
  }
}
