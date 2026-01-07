import { db } from './db';

export interface DataIntegrityCheck {
  type: 'orphaned_user' | 'missing_business' | 'missing_professional';
  description: string;
  affectedRecords: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface DataSyncResult {
  success: boolean;
  fixedRecords: number;
  errors: string[];
  integrityChecks: DataIntegrityCheck[];
}

/**
 * Data synchronization service to ensure data consistency
 * between users, businesses, and professionals
 */
export class DataSynchronizationService {
  
  /**
   * Check for data integrity issues
   */
  async checkDataIntegrity(): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    try {
      // Check for orphaned users (users without associated business or professional)
      const orphanedUsers = await this.findOrphanedUsers();
      if (orphanedUsers.length > 0) {
        checks.push({
          type: 'orphaned_user',
          description: `Found ${orphanedUsers.length} users without associated business or professional records`,
          affectedRecords: orphanedUsers,
          severity: 'high',
        });
      }

      // Check for businesses with missing admin users
      const missingBusinessAdmins = await this.findMissingBusinessAdmins();
      if (missingBusinessAdmins.length > 0) {
        checks.push({
          type: 'missing_business',
          description: `Found ${missingBusinessAdmins.length} businesses with missing admin users`,
          affectedRecords: missingBusinessAdmins,
          severity: 'high',
        });
      }

      // Check for professionals with missing admin users
      const missingProfessionalAdmins = await this.findMissingProfessionalAdmins();
      if (missingProfessionalAdmins.length > 0) {
        checks.push({
          type: 'missing_professional',
          description: `Found ${missingProfessionalAdmins.length} professionals with missing admin users`,
          affectedRecords: missingProfessionalAdmins,
          severity: 'high',
        });
      }

    } catch (error) {
      console.error('Data integrity check failed:', error);
      checks.push({
        type: 'orphaned_user',
        description: `Data integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedRecords: [],
        severity: 'medium',
      });
    }

    return checks;
  }

  /**
   * Fix data integrity issues
   */
  async fixDataIntegrity(): Promise<DataSyncResult> {
    const result: DataSyncResult = {
      success: false,
      fixedRecords: 0,
      errors: [],
      integrityChecks: [],
    };

    try {
      // Run integrity checks first
      result.integrityChecks = await this.checkDataIntegrity();

      // Fix orphaned users
      const orphanedUsersFixed = await this.fixOrphanedUsers();
      result.fixedRecords += orphanedUsersFixed;

      // Fix missing business admins
      const missingBusinessAdminsFixed = await this.fixMissingBusinessAdmins();
      result.fixedRecords += missingBusinessAdminsFixed;

      // Fix missing professional admins
      const missingProfessionalAdminsFixed = await this.fixMissingProfessionalAdmins();
      result.fixedRecords += missingProfessionalAdminsFixed;

      result.success = true;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('Data integrity fix failed:', error);
    }

    return result;
  }

  /**
   * Find users that don't have associated business or professional records
   */
  private async findOrphanedUsers(): Promise<string[]> {
    const orphanedUsers = await db.user.findMany({
      where: {
        AND: [
          {
            business: null,
          },
          {
            professional: null,
          },
          {
            role: {
              in: ['BUSINESS_ADMIN', 'PROFESSIONAL_ADMIN'],
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return orphanedUsers.map(user => `${user.id} (${user.email})`);
  }

  /**
   * Find businesses with missing admin users
   */
  private async findMissingBusinessAdmins(): Promise<string[]> {
    const missingAdminBusinesses = await db.business.findMany({
      where: {
        admin: null,
      },
      select: {
        id: true,
        name: true,
        adminId: true,
      },
    });

    return missingAdminBusinesses.map(business => 
      `${business.id} (${business.name}) - Admin ID: ${business.adminId}`
    );
  }

  /**
   * Find professionals with missing admin users
   */
  private async findMissingProfessionalAdmins(): Promise<string[]> {
    const missingAdminProfessionals = await db.professional.findMany({
      where: {
        admin: null,
      },
      select: {
        id: true,
        name: true,
        adminId: true,
      },
    });

    return missingAdminProfessionals.map(professional => 
      `${professional.id} (${professional.name}) - Admin ID: ${professional.adminId}`
    );
  }

  /**
   * Fix orphaned users by deleting them or updating their role
   */
  private async fixOrphanedUsers(): Promise<number> {
    const orphanedUsers = await db.user.findMany({
      where: {
        AND: [
          {
            business: null,
          },
          {
            professional: null,
          },
          {
            role: {
              in: ['BUSINESS_ADMIN', 'PROFESSIONAL_ADMIN'],
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (orphanedUsers.length === 0) {
      return 0;
    }

    // Delete orphaned users
    await db.user.deleteMany({
      where: {
        id: {
          in: orphanedUsers.map(user => user.id),
        },
      },
    });

    return orphanedUsers.length;
  }

  /**
   * Fix businesses with missing admin users
   */
  private async fixMissingBusinessAdmins(): Promise<number> {
    const missingAdminBusinesses = await db.business.findMany({
      where: {
        admin: null,
      },
      select: {
        id: true,
        adminId: true,
      },
    });

    if (missingAdminBusinesses.length === 0) {
      return 0;
    }

    let fixedCount = 0;

    for (const business of missingAdminBusinesses) {
      try {
        // Try to find the user by adminId
        const user = await db.user.findUnique({
          where: { id: business.adminId },
        });

        if (!user) {
          // If user doesn't exist, delete the business
          await db.business.delete({
            where: { id: business.id },
          });
          fixedCount++;
        }
      } catch (error) {
        console.error(`Failed to fix business ${business.id}:`, error);
      }
    }

    return fixedCount;
  }

  /**
   * Fix professionals with missing admin users
   */
  private async fixMissingProfessionalAdmins(): Promise<number> {
    const missingAdminProfessionals = await db.professional.findMany({
      where: {
        admin: null,
      },
      select: {
        id: true,
        adminId: true,
      },
    });

    if (missingAdminProfessionals.length === 0) {
      return 0;
    }

    let fixedCount = 0;

    for (const professional of missingAdminProfessionals) {
      try {
        // Try to find the user by adminId
        const user = await db.user.findUnique({
          where: { id: professional.adminId },
        });

        if (!user) {
          // If user doesn't exist, delete the professional
          await db.professional.delete({
            where: { id: professional.id },
          });
          fixedCount++;
        }
      } catch (error) {
        console.error(`Failed to fix professional ${professional.id}:`, error);
      }
    }

    return fixedCount;
  }

  /**
   * Get data statistics for monitoring
   */
  async getDataStatistics(): Promise<{
    users: number;
    businesses: number;
    professionals: number;
    orphanedUsers: number;
    missingBusinessAdmins: number;
    missingProfessionalAdmins: number;
  }> {
    const [users, businesses, professionals, orphanedUsers, missingBusinessAdmins, missingProfessionalAdmins] = await Promise.all([
      db.user.count(),
      db.business.count(),
      db.professional.count(),
      this.findOrphanedUsers().then(users => users.length),
      this.findMissingBusinessAdmins().then(businesses => businesses.length),
      this.findMissingProfessionalAdmins().then(professionals => professionals.length),
    ]);

    return {
      users,
      businesses,
      professionals,
      orphanedUsers,
      missingBusinessAdmins,
      missingProfessionalAdmins,
    };
  }

  /**
   * Run periodic data synchronization
   */
  async runPeriodicSync(): Promise<void> {
    try {
      console.log('Starting periodic data synchronization...');
      
      const result = await this.fixDataIntegrity();
      
      if (result.success) {
        console.log(`Data synchronization completed. Fixed ${result.fixedRecords} records.`);
        
        if (result.integrityChecks.length > 0) {
          console.log('Remaining integrity issues:', result.integrityChecks);
        }
      } else {
        console.error('Data synchronization failed:', result.errors);
      }
    } catch (error) {
      console.error('Periodic sync failed:', error);
    }
  }
}

// Export singleton instance
export const dataSyncService = new DataSynchronizationService();