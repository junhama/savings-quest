// Savings Quest - Main Application Script

// State Management
class SavingsQuest {
    constructor() {
        this.state = this.loadState();
        this.init();
    }

    loadState() {
        const saved = localStorage.getItem('savingsQuest_state');
        return saved ? JSON.parse(saved) : {
            currentAmount: 0,
            goalAmount: 100000,
            avatarLevel: 1,
            avatarName: 'ひよこ',
            history: [],
            badges: [],
            streak: 0,
            lastSaveDate: null,
            theme: 'light'
        };
    }

    saveState() {
        localStorage.setItem('savingsQuest_state', JSON.stringify(this.state));
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateStreak();
    }

    setupEventListeners() {
        // Savings form
        document.getElementById('savings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseInt(document.getElementById('amount').value);
            const note = document.getElementById('note').value;
            if (amount > 0) {
                this.addSavings(amount, note);
            }
        });

        // Quick add buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                if (amount === 'custom') {
                    document.getElementById('amount').focus();
                } else {
                    this.addSavings(parseInt(amount), 'クイック追加');
                }
            });
        });

        // Theme toggle
        document.getElementById('btn-theme').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.openModal('settings-modal');
        });

        document.getElementById('btn-save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Close buttons
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.close;
                if (modalId) this.closeModal(modalId);
            });
        });

        // Chart tabs
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderChart(tab.dataset.period);
            });
        });
    }

    addSavings(amount, note = '') {
        const entry = {
            id: Date.now(),
            amount: amount,
            note: note,
            date: new Date().toISOString()
        };

        this.state.currentAmount += amount;
        this.state.history.unshift(entry);
        this.state.lastSaveDate = new Date().toISOString().split('T')[0];

        this.checkBadges();
        this.updateAvatar();
        this.saveState();
        this.render();

        // Reset form
        document.getElementById('savings-form').reset();
    }

    checkBadges() {
        const badges = [];

        // First savings
        if (this.state.history.length >= 1 && !this.state.badges.includes('first')) {
            badges.push('first');
        }

        // 10k
        if (this.state.currentAmount >= 10000 && !this.state.badges.includes('10k')) {
            badges.push('10k');
        }

        // 50k
        if (this.state.currentAmount >= 50000 && !this.state.badges.includes('50k')) {
            badges.push('50k');
        }

        // Goal achieved
        if (this.state.currentAmount >= this.state.goalAmount && !this.state.badges.includes('100k')) {
            badges.push('100k');
        }

        // Streak 3 days
        if (this.state.streak >= 3 && !this.state.badges.includes('streak3')) {
            badges.push('streak3');
        }

        // Streak 7 days
        if (this.state.streak >= 7 && !this.state.badges.includes('streak7')) {
            badges.push('streak7');
        }

        this.state.badges = [...new Set([...this.state.badges, ...badges])];

        // Show notification for new badges
        badges.forEach(badge => {
            this.showNotification(`🏆 バッジ獲得: ${badge}`);
        });
    }

    updateAvatar() {
        const levels = [
            { level: 1, emoji: '🐣', name: 'ひよこ', min: 0 },
            { level: 2, emoji: '🐤', name: 'ひたち', min: 10000 },
            { level: 3, emoji: '🐔', name: 'にわとり', min: 30000 },
            { level: 4, emoji: '🐉', name: 'りゅう', min: 50000 },
            { level: 5, emoji: '💰', name: 'かね持ち', min: 100000 }
        ];

        let newLevel = 1;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (this.state.currentAmount >= levels[i].min) {
                newLevel = levels[i].level;
                break;
            }
        }

        this.state.avatarLevel = newLevel;
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (this.state.lastSaveDate === today) {
            return;
        } else if (this.state.lastSaveDate === yesterday) {
            this.state.streak++;
        } else if (this.state.lastSaveDate !== today) {
            this.state.streak = this.state.history.length > 0 ? 1 : 0;
        }

        this.saveState();
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.saveState();
    }

    saveSettings() {
        const goalInput = document.getElementById('goal-input').value;
        const nameInput = document.getElementById('avatar-name-input').value;

        this.state.goalAmount = parseInt(goalInput) || 100000;
        this.state.avatarName = nameInput || 'ひよこ';

        this.saveState();
        this.render();
        this.closeModal('settings-modal');
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showNotification(message) {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 1000;
            animation: fadeInOut 2s ease forwards;
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
    }

    render() {
        // Update amount display
        document.getElementById('current-amount').textContent = `¥${this.state.currentAmount.toLocaleString()}`;
        document.getElementById('goal-amount').textContent = `¥${this.state.goalAmount.toLocaleString()}`;

        // Update progress ring
        const progress = Math.min(this.state.currentAmount / this.state.goalAmount, 1);
        const circumference = 2 * Math.PI * 45;
        const offset = circumference * (1 - progress);
        document.getElementById('progress-circle').style.strokeDashoffset = offset;

        // Update avatar
        const levels = [
            { level: 1, emoji: '🐣', name: 'ひよこ' },
            { level: 2, emoji: '🐤', name: 'ひたち' },
            { level: 3, emoji: '🐔', name: 'にわとり' },
            { level: 4, emoji: '🐉', name: 'りゅう' },
            { level: 5, emoji: '💰', name: 'かね持ち' }
        ];
        const currentLevel = levels.find(l => l.level === this.state.avatarLevel) || levels[0];
        document.getElementById('avatar').textContent = currentLevel.emoji;
        document.getElementById('avatar').className = `avatar level-${this.state.avatarLevel}`;
        document.getElementById('level-text').textContent = `レベル ${this.state.avatarLevel}`;
        document.getElementById('avatar-name').textContent = this.state.avatarName;

        // Render badges
        document.querySelectorAll('.badge').forEach(badge => {
            const badgeId = badge.dataset.badge;
            if (this.state.badges.includes(badgeId)) {
                badge.classList.remove('locked');
            }
        });

        // Render history
        const historyList = document.getElementById('history-list');
        if (this.state.history.length === 0) {
            historyList.innerHTML = '<li class="empty-item">まだ記録がありません</li>';
        } else {
            historyList.innerHTML = this.state.history.slice(0, 10).map(entry => `
                <li>
                    <div>
                        <strong>¥${entry.amount.toLocaleString()}</strong>
                        <span class="note">${entry.note || ''}</span>
                    </div>
                    <span class="date">${new Date(entry.date).toLocaleDateString('ja-JP')}</span>
                </li>
            `).join('');
        }

        // Render chart
        this.renderChart('week');
    }

    renderChart(period) {
        const canvas = document.getElementById('savings-chart');
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Simple bar chart
        const data = this.getChartData(period);
        const barWidth = (canvas.width - 40) / data.length - 8;
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const chartHeight = canvas.height - 40;

        ctx.fillStyle = '#4CAF50';
        
        data.forEach((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = 20 + i * (barWidth + 8);
            const y = canvas.height - 20 - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Label
            ctx.fillStyle = '#666';
            ctx.font = '10px Noto Sans JP';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, x + barWidth / 2, canvas.height - 5);
            ctx.fillStyle = '#4CAF50';
        });
    }

    getChartData(period) {
        if (this.state.history.length === 0) {
            return Array(7).fill(0).map((_, i) => ({ label: ['日','月','火','水','木','金','土'][i], value: 0 }));
        }

        const days = period === 'week' ? 7 : 30;
        const labels = period === 'week' 
            ? ['日','月','火','水','木','金','土']
            : Array(30).fill(0).map((_, i) => (i + 1).toString());

        const data = labels.map((label, i) => {
            const dayEntries = this.state.history.filter(entry => {
                const entryDate = new Date(entry.date);
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - (period === 'week' ? 6 - i : 29 - i));
                return entryDate.toDateString() === targetDate.toDateString();
            });
            return {
                label,
                value: dayEntries.reduce((sum, e) => sum + e.amount, 0)
            };
        });

        return data;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SavingsQuest();
});
