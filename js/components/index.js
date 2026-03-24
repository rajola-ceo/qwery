// js/components/index.js - Complete component library
import { 
    createElement, 
    fadeIn, 
    slideDown, 
    onClickOutside,
    formatTime,
    formatDate,
    formatNumber,
    escapeHtml,
    debounce,
    storage
} from '../lib/index.js';

// ===================== BASE COMPONENT =====================

export class Component {
    constructor(props = {}) {
        this.props = props;
        this.element = null;
        this.state = {};
        this.children = [];
        this.eventHandlers = [];
    }
    
    async mount(container) {
        await this.beforeMount();
        this.element = this.render();
        if (container) container.appendChild(this.element);
        await this.mounted();
        this.bindEvents();
        return this.element;
    }
    
    update(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.renderToElement();
        this.updated(oldState);
        this.bindEvents();
    }
    
    renderToElement() {
        if (this.element) {
            const newElement = this.render();
            this.element.replaceWith(newElement);
            this.element = newElement;
        }
    }
    
    beforeMount() {}
    mounted() {}
    updated(oldState) {}
    bindEvents() {}
    
    destroy() {
        this.eventHandlers.forEach(cleanup => cleanup());
        if (this.element) this.element.remove();
    }
}

// ===================== TOAST COMPONENT =====================

export class Toast {
    constructor() {
        this.container = null;
    }
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = createElement('div', ['toast-container'], { id: 'toastContainer' });
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = createElement('div', ['toast', type], {}, [
            createElement('i', [], { class: `fas ${icons[type] || icons.info}` }),
            message
        ]);
        
        this.container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// ===================== LOADER COMPONENT =====================

export class Loader {
    constructor() {
        this.element = null;
        this.overlay = null;
    }
    
    create() {
        this.overlay = createElement('div', ['loader-overlay'], {}, [
            createElement('div', ['loader-spinner'], {}, [
                createElement('div', ['spinner']),
                createElement('p', [], {}, ['Loading...'])
            ])
        ]);
        return this.overlay;
    }
    
    show() {
        if (!this.element) {
            this.element = this.create();
            document.body.appendChild(this.element);
        }
        this.element.style.display = 'flex';
    }
    
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }
}

// ===================== MODAL COMPONENT =====================

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            onConfirm: null,
            onCancel: null,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showCancel: true,
            ...options
        };
        this.element = null;
    }
    
    create() {
        const modal = createElement('div', ['modal'], {}, [
            createElement('div', ['modal-content'], {}, [
                createElement('div', ['modal-header'], {}, [
                    createElement('h3', [], {}, [this.options.title]),
                    createElement('span', ['close'], { onclick: () => this.close() }, ['×'])
                ]),
                createElement('div', ['modal-body'], {}, [
                    typeof this.options.content === 'string' 
                        ? document.createTextNode(this.options.content)
                        : this.options.content
                ]),
                createElement('div', ['modal-footer'], {}, [
                    this.options.showCancel ? createElement('button', ['btn', 'btn-secondary'], { onclick: () => this.cancel() }, [this.options.cancelText]) : null,
                    createElement('button', ['btn', 'btn-primary'], { onclick: () => this.confirm() }, [this.options.confirmText])
                ].filter(Boolean))
            ])
        ]);
        return modal;
    }
    
    show() {
        this.element = this.create();
        document.body.appendChild(this.element);
        setTimeout(() => this.element.classList.add('show'), 10);
    }
    
    close() {
        if (this.element) {
            this.element.classList.remove('show');
            setTimeout(() => this.element.remove(), 300);
        }
    }
    
    confirm() {
        if (this.options.onConfirm) this.options.onConfirm();
        this.close();
    }
    
    cancel() {
        if (this.options.onCancel) this.options.onCancel();
        this.close();
    }
}

// ===================== LEAGUE CARD COMPONENT =====================

export class LeagueCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            league: props.league,
            currentUser: props.currentUser
        };
    }
    
    render() {
        const league = this.state.league;
        const currentUser = this.state.currentUser;
        
        const teamCount = league.teams?.length || 0;
        const maxTeams = league.maxTeams || 16;
        const isFull = teamCount >= maxTeams;
        const isOwner = currentUser && league.ownerId === currentUser.uid;
        const hasJoined = league.teams?.some(t => t.ownerId === currentUser?.uid);
        
        const statusText = league.status === 'live' ? 'LIVE' : 
                          league.status === 'registration' ? 'REGISTRATION OPEN' : 
                          league.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED';
        
        const card = createElement('div', ['league-card'], { 'data-league-id': league.id });
        
        card.innerHTML = `
            <div class="league-header">
                <span class="league-status status-${league.status}">${statusText}</span>
                <div class="league-icon"><i class="fas fa-futbol"></i></div>
                <h3>${escapeHtml(league.name)}</h3>
                <div class="league-game">${league.gameType || 'eFootball'}</div>
                ${isOwner ? '<div class="owner-badge"><i class="fas fa-crown"></i> Your League</div>' : ''}
                ${hasJoined ? '<div class="joined-badge"><i class="fas fa-check-circle"></i> Joined</div>' : ''}
            </div>
            <div class="league-body">
                <div class="league-stats">
                    <div class="stat">
                        <div class="stat-value ${isFull ? 'full' : ''}">${teamCount}/${maxTeams}</div>
                        <div class="stat-label">Teams</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(league.prizePool || 0)}</div>
                        <div class="stat-label">Prize Pool</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatNumber(league.entryFee || 0)}</div>
                        <div class="stat-label">Entry Fee</div>
                    </div>
                </div>
                <div class="league-owner">
                    <i class="fas fa-user"></i> Created by: <strong>${escapeHtml(league.ownerName || 'Unknown')}</strong>
                </div>
            </div>
            <div class="league-footer">
                ${!isOwner && !hasJoined ? `
                    <button class="join-btn" data-league-id="${league.id}" ${isFull ? 'disabled' : ''}>
                        <i class="fas fa-sign-in-alt"></i> ${isFull ? 'League Full' : 'Join League'}
                    </button>
                ` : hasJoined ? `
                    <button class="joined-btn" disabled><i class="fas fa-check-circle"></i> Joined</button>
                ` : ''}
                <button class="details-btn" data-league-id="${league.id}">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        `;
        
        return card;
    }
    
    bindEvents() {
        const joinBtn = this.element.querySelector('.join-btn');
        const detailsBtn = this.element.querySelector('.details-btn');
        
        if (joinBtn) {
            joinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.props.onJoin) this.props.onJoin(this.state.league.id);
            });
        }
        
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.props.onView) this.props.onView(this.state.league.id);
            });
        }
        
        this.element.addEventListener('click', () => {
            if (this.props.onClick) this.props.onClick(this.state.league.id);
        });
    }
}

// ===================== TEAM CARD COMPONENT =====================

export class TeamCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            team: props.team
        };
    }
    
    render() {
        const team = this.state.team;
        const stats = team.stats || { wins: 0, matchesPlayed: 0 };
        
        const card = createElement('div', ['team-card'], { 'data-team-id': team.id });
        
        card.innerHTML = `
            <div class="team-logo">
                ${team.logo ? `<img src="${team.logo}" alt="${escapeHtml(team.name)}">` : '<i class="fas fa-shield-alt"></i>'}
            </div>
            <div class="team-info">
                <div class="team-name">${escapeHtml(team.name)}</div>
                <div class="team-stats">
                    <span><i class="fas fa-trophy"></i> ${stats.wins || 0} Wins</span>
                    <span><i class="fas fa-futbol"></i> ${stats.matchesPlayed || 0} Matches</span>
                </div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        
        return card;
    }
    
    bindEvents() {
        this.element.addEventListener('click', () => {
            if (this.props.onClick) this.props.onClick(this.state.team.id);
        });
    }
}

// ===================== USER CARD COMPONENT =====================

export class UserCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.user,
            currentUser: props.currentUser
        };
    }
    
    render() {
        const user = this.state.user;
        const isCurrentUser = this.state.currentUser && user.uid === this.state.currentUser.uid;
        const displayName = user.customDisplayName || user.displayName || user.username || 'Player';
        const avatarUrl = user.customAvatar || user.photoURL;
        
        const card = createElement('div', ['user-card'], { 'data-user-id': user.uid });
        
        card.innerHTML = `
            <div class="user-avatar">
                <img src="${avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`}" alt="${escapeHtml(displayName)}">
            </div>
            <div class="user-info">
                <div class="user-name">${escapeHtml(displayName)}</div>
                <div class="user-stats">
                    <span><i class="fas fa-trophy"></i> ${user.leaguesWon || 0}</span>
                    <span><i class="fas fa-futbol"></i> ${user.matchesPlayed || 0}</span>
                </div>
            </div>
            ${!isCurrentUser ? `
                <button class="challenge-btn" data-user-id="${user.uid}">
                    <i class="fas fa-handshake"></i> Challenge
                </button>
            ` : '<span class="you-badge">You</span>'}
        `;
        
        return card;
    }
    
    bindEvents() {
        const challengeBtn = this.element.querySelector('.challenge-btn');
        
        if (challengeBtn) {
            challengeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.props.onChallenge) this.props.onChallenge(this.state.user.uid);
            });
        }
        
        this.element.addEventListener('click', () => {
            if (this.props.onClick) this.props.onClick(this.state.user.uid);
        });
    }
}

// ===================== MATCH CARD COMPONENT =====================

export class MatchCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            match: props.match,
            homeTeam: props.homeTeam,
            awayTeam: props.awayTeam
        };
    }
    
    render() {
        const match = this.state.match;
        const homeTeam = this.state.homeTeam;
        const awayTeam = this.state.awayTeam;
        
        const card = createElement('div', ['match-card'], { 'data-match-id': match.id });
        
        card.innerHTML = `
            <div class="match-info">
                <div class="match-teams">
                    <div class="team">
                        <div class="team-logo-small">${homeTeam?.logo ? `<img src="${homeTeam.logo}">` : '<i class="fas fa-shield-alt"></i>'}</div>
                        <strong>${escapeHtml(homeTeam?.name || 'TBD')}</strong>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <div class="team-logo-small">${awayTeam?.logo ? `<img src="${awayTeam.logo}">` : '<i class="fas fa-shield-alt"></i>'}</div>
                        <strong>${escapeHtml(awayTeam?.name || 'TBD')}</strong>
                    </div>
                </div>
                <div class="match-result">
                    ${match.result ? `${match.homeScore} - ${match.awayScore}` : 'Not Played'}
                </div>
                ${match.screenshot ? `
                    <button class="screenshot-btn" data-url="${match.screenshot}">
                        <i class="fas fa-image"></i> View Screenshot
                    </button>
                ` : ''}
                ${this.props.onEdit ? `
                    <button class="edit-result-btn" data-match-id="${match.id}">
                        <i class="fas fa-edit"></i> ${match.result ? 'Edit Result' : 'Enter Result'}
                    </button>
                ` : ''}
            </div>
        `;
        
        return card;
    }
    
    bindEvents() {
        const screenshotBtn = this.element.querySelector('.screenshot-btn');
        const editBtn = this.element.querySelector('.edit-result-btn');
        
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => {
                if (this.props.onViewScreenshot) {
                    this.props.onViewScreenshot(screenshotBtn.dataset.url);
                }
            });
        }
        
        if (editBtn && this.props.onEdit) {
            editBtn.addEventListener('click', () => {
                this.props.onEdit(this.state.match);
            });
        }
    }
}

// ===================== NOTIFICATION BELL =====================

export class NotificationBell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            notifications: []
        };
        this.interval = null;
    }
    
    render() {
        const container = createElement('div', ['notification-container'], {});
        
        container.innerHTML = `
            <div class="notification-bell" id="notificationBell">
                <i class="bx bx-bell"></i>
                <span class="notification-count" id="notificationCount" style="display: ${this.state.count > 0 ? 'flex' : 'none'}">${this.state.count}</span>
            </div>
            <div class="notification-popup" id="notificationPopup">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button id="markAllRead">Mark all read</button>
                </div>
                <div class="notification-list" id="notificationList">
                    ${this.renderNotifications()}
                </div>
            </div>
        `;
        
        return container;
    }
    
    renderNotifications() {
        if (this.state.notifications.length === 0) {
            return '<div class="empty-state">No notifications</div>';
        }
        
        return this.state.notifications.slice(0, 10).map(notif => `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                <div class="notification-icon">${notif.icon || '🔔'}</div>
                <div class="notification-content">
                    <div class="notification-title">${escapeHtml(notif.title)}</div>
                    <div class="notification-message">${escapeHtml(notif.message)}</div>
                    <div class="notification-time">${formatTime(notif.createdAt)}</div>
                </div>
                ${!notif.read ? '<span class="notification-badge"></span>' : ''}
            </div>
        `).join('');
    }
    
    bindEvents() {
        const bell = this.element.querySelector('#notificationBell');
        const popup = this.element.querySelector('#notificationPopup');
        const markAllRead = this.element.querySelector('#markAllRead');
        
        if (bell && popup) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                popup.classList.toggle('active');
                if (this.props.onOpen) this.props.onOpen();
            });
            
            onClickOutside(popup, () => {
                popup.classList.remove('active');
            });
        }
        
        if (markAllRead && this.props.onMarkAllRead) {
            markAllRead.addEventListener('click', () => {
                this.props.onMarkAllRead();
            });
        }
        
        const items = this.element.querySelectorAll('.notification-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                if (this.props.onRead) this.props.onRead(id);
            });
        });
    }
    
    updateNotifications(notifications) {
        const unreadCount = notifications.filter(n => !n.read).length;
        this.state.notifications = notifications;
        this.state.count = unreadCount;
        this.renderToElement();
    }
}

// ===================== EXPORT ALL COMPONENTS =====================

export const toast = new Toast();
export const loader = new Loader();

export default {
    Component,
    Toast,
    Loader,
    Modal,
    LeagueCard,
    TeamCard,
    UserCard,
    MatchCard,
    NotificationBell,
    toast,
    loader
};
