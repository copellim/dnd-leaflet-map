import { ErrorHandler, inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private snackBar = inject(MatSnackBar);

  handleError(error: any): void {
    console.error('An error occurred:', error);
    if (error?.code === 'auth/wrong-password') {
      this.snackBar.open('Errore: password errata', 'Close', {
        duration: 5000,
      });
      return;
    }
    this.snackBar.open('Errore: ' + error.message, 'Close', {
      duration: 5000,
    });
  }
}
