/**
 * GP (Green Points) System
 * Savings Quest V2
 */
const GPSystem = {
    // GP rewards
    GP_PER_SAVINGS: 0.01, // 1% of savings amount
    GP_DAILY_LOGIN: 10,
    GP_STREAK_BONUS: 5,
    GP_CHALLENGE_REWARD: { weekly: 500, monthly: 2000 },
    GP_STREAK_THRESHOLDS: [3, 7, 14, 30],
    
    init() {
        this.loadBalance();
    },
    
    loadBalance() {
        const data = Storage.getData();
        this.balance = data.gpBalance || 0;
        this.history = data.gpHistory || [];
    },
    
    saveBalance() {
        const data = Storage.getData();
        data.gpBalance = this.balance;
        data.gpHistory = this.history;
        Storage.saveData(data);
    },
    
    addGP(amount, reason) {
        this.balance += amount;
        this.history.push({
            amount,
            reason,
            date: new Date().toISOString()
        });
        this.saveBalance();
        this.renderBalance();
    },
    
    spendGP(amount, reason) {
        if (this.balance < amount) {
            alert('GPが足りません');
            return false;
        }
        this.balance -= amount;
        this.history.push({
            amount: -amount,
            reason,
            date: new Date().toISOString()
        });
        this.saveBalance();
        this.renderBalance();
        return true;
    },
    
    onSavings(amount) {
        const gp = Math.floor(amount * this.GP_PER_SAVINGS);
        this.addGP(gp, '貯蓄報酬');
    },
    
    onDailyLogin() {
        this.addGP(this.GP_DAILY_LOGIN, 'ログイン報酬');
    },
    
    onStreak(days) {
        if (this.GP_STREAK_THRESHOLDS.includes(days)) {
            const bonus = this.GP_STREAK_BONUS * days;
            this.addGP(bonus, `${days}日連続報酬`);
        }
    },
    
    onChallengeComplete(type) {
        const reward = this.GP_CHALLENGE_REWARD[type];
        this.addGP(reward, 'チャレンジ達成報酬');
    },
    
    renderBalance() {
        const el = document.getElementById('gp-balance');
        if (el) el.textContent = this.balance.toLocaleString();
    },
    
    getBalance() {
        return this.balance;
    }
};