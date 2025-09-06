import { isUnauthorizedError } from "./authUtils";

// Global error handler for unauthorized errors
class AuthErrorHandler {
  private static instance: AuthErrorHandler;
  private isHandlingError = false;
  private unauthorizedBannerVisible = false;

  // Singleton pattern
  public static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler();
    }
    return AuthErrorHandler.instance;
  }

  // Handle unauthorized errors
  public handleError(error: unknown): boolean {
    // In development mode, we don't handle unauthorized errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Ignoring unauthorized error');
      return false;
    }

    // Check if the error is an unauthorized error
    if (error instanceof Error && isUnauthorizedError(error)) {
      // Prevent multiple error handling
      if (this.isHandlingError) {
        return true;
      }

      this.isHandlingError = true;
      this.showUnauthorizedBanner();

      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/";
        this.isHandlingError = false;
      }, 2000);

      return true;
    }

    return false;
  }

  // Show unauthorized banner
  private showUnauthorizedBanner() {
    if (this.unauthorizedBannerVisible) {
      return;
    }

    this.unauthorizedBannerVisible = true;

    // Find or create the banner element
    let banner = document.getElementById('unauthorized-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'unauthorized-banner';
      banner.style.position = 'fixed';
      banner.style.bottom = '0';
      banner.style.left = '0';
      banner.style.right = '0';
      banner.style.backgroundColor = 'rgb(239, 68, 68)';
      banner.style.color = 'white';
      banner.style.padding = '1rem';
      banner.style.textAlign = 'center';
      banner.style.zIndex = '9999';
      banner.setAttribute('data-unauthorized-banner', 'true');
      
      const message = document.createElement('div');
      message.textContent = 'Unauthorized: You are logged out. Logging in again...';
      banner.appendChild(message);
      
      document.body.appendChild(banner);
    }
  }

  // Hide unauthorized banner
  public hideUnauthorizedBanner() {
    this.unauthorizedBannerVisible = false;
    const banner = document.getElementById('unauthorized-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Reset error handling state
  public reset() {
    this.isHandlingError = false;
    this.hideUnauthorizedBanner();
  }
}

export const authErrorHandler = AuthErrorHandler.getInstance();

// Function to wrap API calls with error handling
export function withAuthErrorHandling<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  return apiCall().catch((error) => {
    if (authErrorHandler.handleError(error)) {
      // Return a rejected promise to stop the chain
      return Promise.reject(new Error('Authentication error handled'));
    }
    // Re-throw the error if it's not an auth error
    return Promise.reject(error);
  });
}
