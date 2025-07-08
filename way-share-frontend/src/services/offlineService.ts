import { store } from '../store/store';
import { removePendingReport, setOnlineStatus } from '../store/slices/sessionSlice';
import { showNotification } from '../store/slices/uiSlice';
import { api } from '../store/api/apiSlice';

class OfflineService {
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start sync if online
    if (navigator.onLine) {
      this.startSync();
    }
  }

  private handleOnline = () => {
    store.dispatch(setOnlineStatus(true));
    store.dispatch(
      showNotification({
        type: 'success',
        message: 'Back online! Syncing pending reports...',
      })
    );
    this.startSync();
  };

  private handleOffline = () => {
    store.dispatch(setOnlineStatus(false));
    store.dispatch(
      showNotification({
        type: 'warning',
        message: 'You are offline. Reports will be saved and submitted when online.',
      })
    );
    this.stopSync();
  };

  private startSync() {
    // Sync immediately
    this.syncPendingReports();

    // Then sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncPendingReports();
    }, 30000);
  }

  private stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncPendingReports() {
    const state = store.getState();
    const pendingReports = state.session.pendingReports;

    if (pendingReports.length === 0 || !navigator.onLine) {
      return;
    }

    for (const report of pendingReports) {
      try {
        // Create form data from stored report
        const formData = new FormData();
        if (report.licensePlate) {
          formData.append('licensePlate', report.licensePlate);
        }
        formData.append('incidentType', report.incidentType);
        if (report.subcategory) {
          formData.append('subcategory', report.subcategory);
        }
        formData.append('location[lat]', report.location.lat.toString());
        formData.append('location[lng]', report.location.lng.toString());
        
        if (report.description) {
          formData.append('description', report.description);
        }
        
        // Note: Media files cannot be persisted across sessions
        // In a production app, you'd need to store media differently

        // Submit the report
        await store.dispatch(
          api.endpoints.submitReport.initiate(formData)
        ).unwrap();

        // Remove from pending if successful
        store.dispatch(removePendingReport(report.id!));
        
        store.dispatch(
          showNotification({
            type: 'success',
            message: `Pending report submitted successfully`,
          })
        );
      } catch (error) {
        console.error('Failed to sync report:', error);
        // Keep in pending queue for next sync
      }
    }
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.stopSync();
  }
}

export const offlineService = new OfflineService();