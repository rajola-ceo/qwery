// js/services/coinService.js
import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export const coinService = {
    // Get user coins
    async getUserCoins(userId) {
        try {
            const coinRef = doc(db, 'userCoins', userId);
            const coinSnap = await getDoc(coinRef);
            if (coinSnap.exists()) {
                return coinSnap.data().coins;
            } else {
                // Initialize with 100 coins
                await setDoc(coinRef, { coins: 100, userId, updatedAt: new Date().toISOString() });
                return 100;
            }
        } catch (error) {
            console.error('Error getting coins:', error);
            return 0;
        }
    },
    
    // Add coins
    async addCoins(userId, amount) {
        try {
            const coinRef = doc(db, 'userCoins', userId);
            const coinSnap = await getDoc(coinRef);
            const currentCoins = coinSnap.exists() ? coinSnap.data().coins : 100;
            await setDoc(coinRef, { 
                coins: currentCoins + amount, 
                userId, 
                updatedAt: new Date().toISOString() 
            });
            return { success: true, newBalance: currentCoins + amount };
        } catch (error) {
            console.error('Error adding coins:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Deduct coins
    async deductCoins(userId, amount) {
        try {
            const coinRef = doc(db, 'userCoins', userId);
            const coinSnap = await getDoc(coinRef);
            const currentCoins = coinSnap.exists() ? coinSnap.data().coins : 100;
            
            if (currentCoins >= amount) {
                await setDoc(coinRef, { 
                    coins: currentCoins - amount, 
                    userId, 
                    updatedAt: new Date().toISOString() 
                });
                return { success: true, newBalance: currentCoins - amount };
            } else {
                return { success: false, error: 'Insufficient coins' };
            }
        } catch (error) {
            console.error('Error deducting coins:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Check if can claim daily
    async canClaimDaily(userId) {
        try {
            const claimRef = doc(db, 'dailyClaims', userId);
            const claimSnap = await getDoc(claimRef);
            
            if (!claimSnap.exists()) return true;
            
            const lastClaim = claimSnap.data().lastClaim.toDate();
            const now = new Date();
            const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);
            
            return hoursSinceClaim >= 24;
        } catch (error) {
            console.error('Error checking daily claim:', error);
            return true;
        }
    },
    
    // Claim daily reward
    async claimDaily(userId) {
        try {
            const canClaim = await this.canClaimDaily(userId);
            if (!canClaim) {
                return { success: false, error: 'Already claimed today' };
            }
            
            await this.addCoins(userId, 10);
            
            const claimRef = doc(db, 'dailyClaims', userId);
            await setDoc(claimRef, { 
                userId, 
                lastClaim: new Date(),
                amount: 10
            });
            
            return { success: true, amount: 10 };
        } catch (error) {
            console.error('Error claiming daily:', error);
            return { success: false, error: error.message };
        }
    }
};
