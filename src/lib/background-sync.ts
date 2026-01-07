import { dataSyncService } from './data-synchronization';

/**
 * Background synchronization service for periodic data cleanup
 */
export class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the background synchronization service
   */
  start() {
    if (this.isRunning) {
      console.log('Background sync service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting background synchronization service...');

    // Run initial sync
    this.performSync();

    // Set up periodic sync every 10 minutes
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 10 * 60 * 1000); // 10 minutes

    console.log('Background synchronization service started successfully');
  }

  /**
   * Stop the background synchronization service
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('Background synchronization service stopped');
  }

  /**
   * Perform a single synchronization cycle
   */
  private async performSync() {
    if (!this.isRunning) {
      return;
    }

    try {
      console.log('Running periodic data synchronization...');
      
      const result = await dataSyncService.fixDataIntegrity();
      
      if (result.success) {
        console.log(`Background sync completed. Fixed ${result.fixedRecords} records.`);
        
        if (result.integrityChecks.length > 0) {
          console.log('Remaining integrity issues:', result.integrityChecks);
        }
      } else {
        console.error('Background sync failed:', result.errors);
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  /**
   * Get the current status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();