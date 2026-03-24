// js/services/auth.js
import { auth } from '../config/firebase.js';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { userService } from './userService.js';

const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Current user
    currentUser: null,
    
    // Login with Google
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const existingUser = await userService.getUser(user.uid);
            
            if (!existingUser) {
                // Create new user profile
                await userService.createUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    customDisplayName: null,
                    customAvatar: null,
                    createdAt: new Date().toISOString(),
                    hasSetProfile: false
                });
            }
            
            return { success: true, user };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Logout
    async logout() {
        try {
            await firebaseSignOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Auth state observer
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            if (user) {
                // Get custom profile data
                const userData = await userService.getUser(user.uid);
                callback({ ...user, ...userData });
            } else {
                callback(null);
            }
        });
    }
};
