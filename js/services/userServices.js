// js/services/userService.js
import { db, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from '../config/firebase.js';

class UserService {
    // Get user by ID
    async getUser(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            return userSnap.exists() ? userSnap.data() : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
    
    // Create new user
    async createUser(userData) {
        try {
            const userRef = doc(db, 'users', userData.uid);
            await setDoc(userRef, userData);
            return { success: true };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update user
    async updateUser(uid, data) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...data,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update profile settings
    async updateProfile(uid, profileData) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                customDisplayName: profileData.customDisplayName,
                customAvatar: profileData.customAvatar,
                hasSetProfile: true,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get all users (for contacts list)
    async getAllUsers() {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            const users = [];
            querySnapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }
    
    // Search users by name
    async searchUsers(searchTerm) {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            const users = [];
            querySnapshot.forEach(doc => {
                const user = { uid: doc.id, ...doc.data() };
                const displayName = user.customDisplayName || user.displayName;
                if (displayName?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    users.push(user);
                }
            });
            return users;
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }
}

export const userService = new UserService();
