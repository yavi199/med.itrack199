
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import and export user management functions
import { setUserRole } from './users';
export { setUserRole };
