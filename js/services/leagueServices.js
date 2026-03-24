// js/services/leagueService.js
import { db } from '../config/firebase.js';
import { 
    collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, 
    doc, query, where, orderBy, limit, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export const leagueService = {
    // Create league
    async createLeague(leagueData) {
        try {
            const leaguesRef = collection(db, 'leagues');
            const newLeague = {
                ...leagueData,
                createdAt: Timestamp.now(),
                status: 'registration',
                teams: [],
                matches: [],
                pendingRequests: []
            };
            const docRef = await addDoc(leaguesRef, newLeague);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating league:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all leagues (for everyone)
    async getAllLeagues() {
        try {
            const leaguesRef = collection(db, 'leagues');
            const q = query(leaguesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const leagues = [];
            querySnapshot.forEach(doc => {
                leagues.push({ id: doc.id, ...doc.data() });
            });
            return leagues;
        } catch (error) {
            console.error('Error getting leagues:', error);
            return [];
        }
    },
    
    // Get league by ID
    async getLeague(leagueId) {
        try {
            const leagueRef = doc(db, 'leagues', leagueId);
            const leagueSnap = await getDoc(leagueRef);
            return leagueSnap.exists() ? { id: leagueSnap.id, ...leagueSnap.data() } : null;
        } catch (error) {
            console.error('Error getting league:', error);
            return null;
        }
    },
    
    // Update league
    async updateLeague(leagueId, data) {
        try {
            const leagueRef = doc(db, 'leagues', leagueId);
            await updateDoc(leagueRef, data);
            return { success: true };
        } catch (error) {
            console.error('Error updating league:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Join league (auto-join)
    async joinLeague(leagueId, userId, userDisplayName) {
        try {
            const league = await this.getLeague(leagueId);
            if (!league) return { success: false, error: 'League not found' };
            
            // Check if already joined
            if (league.teams?.some(t => t.ownerId === userId)) {
                return { success: false, error: 'Already joined' };
            }
            
            // Check if league is full
            if (league.teams?.length >= league.maxTeams) {
                return { success: false, error: 'League is full' };
            }
            
            // Add team
            const newTeam = {
                id: 'team_' + Date.now(),
                name: `${userDisplayName}'s Team`,
                ownerId: userId,
                ownerName: userDisplayName,
                joinedAt: new Date().toISOString()
            };
            
            const updatedTeams = [...(league.teams || []), newTeam];
            await this.updateLeague(leagueId, { teams: updatedTeams });
            
            return { success: true };
        } catch (error) {
            console.error('Error joining league:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get user's leagues
    async getUserLeagues(userId) {
        try {
            const leaguesRef = collection(db, 'leagues');
            const q = query(leaguesRef, where('teams', 'array-contains', { ownerId: userId }));
            const querySnapshot = await getDocs(q);
            const leagues = [];
            querySnapshot.forEach(doc => {
                leagues.push({ id: doc.id, ...doc.data() });
            });
            return leagues;
        } catch (error) {
            console.error('Error getting user leagues:', error);
            return [];
        }
    }
};
