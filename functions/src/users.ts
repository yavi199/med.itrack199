
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

export const setUserRole = onCall(async (request) => {
  // Check if the user is authenticated and is an administrator
  if (!request.auth || !request.auth.token.admin) {
    logger.warn("setUserRole called by non-admin user", { uid: request.auth?.uid });
    throw new Error("You must be an administrator to perform this action.");
  }

  const { email, role, service, area } = request.data;

  if (!email || !role) {
    logger.error("setUserRole called without email or role", { data: request.data });
    throw new Error("The function must be called with 'email' and 'role' arguments.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    const currentClaims = user.customClaims || {};
    const newClaims = { ...currentClaims, admin: role === 'administrador', role: role };
    await admin.auth().setCustomUserClaims(user.uid, newClaims);

    // Create or update user profile in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      role: role,
      servicioAsignado: service,
      areaGeneral: area,
      uid: user.uid,
      activo: true,
      nombre: user.displayName || email.split('@')[0],
    }, { merge: true });

    logger.info(`Successfully set role for ${email} to ${role}`, { adminUid: request.auth.uid });
    return { message: `Success! ${email} has been made a ${role}.` };
  } catch (error) {
    logger.error("Error setting user role:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred.");
  }
});
