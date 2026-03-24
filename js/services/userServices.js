// js/services/userService.js
import { db } from '../config/firebase.js';
import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export const userService = {
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
    },
    
    // Create user
    async createUser(userData) {
        try {
            await setDoc(doc(db, 'users', userData.uid), userData);
            return { success: true };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Update user profile
    async updateUserProfile(uid, profileData) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...profileData,
                updatedAt: new Date().toISOString(),
                hasSetProfile: true
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all users (for contacts list)
    async getAllUsers() {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            const users = [];
            querySnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }
};
