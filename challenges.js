/**
 * Savings Challenge System
 * Savings Quest V2
 */
const ChallengeSystem = {
    CHALLENGES: {
        weekly: {
            name: '週間チャレンジ',
            goal: 10000,
            fee: 100,
            reward: 500,
            period: 7
        },
        monthly: {
            name: '月間チャレンジ',
            goal: 50000,
            fee: 300,
            reward: 2000,
            period: 30
        }
    },
    
    init() {
        this.loadChallenges();
    },
    
    loadChallenges() {
        const data = Storage.getData();
        this.active = data.activeChallenges || [];
        this.completed = data.completedChallenges || [];
    },
    
    saveChallenges() {
        const data = Storage.getData();
        data.activeChallenges = this.active;
        data.completedData = this.completed;
        Storage.saveData(data);
    },
    
    startChallenge(type) {
        const challenge = this.CHALLENGES[type];
        const gpBalance = GPSystem.getBalance();
        
        if (this.active.find(c => c.type === type)) {
            alert('このチャレンジには参加済みです');
            return;
        }
        
        const confirmStart = confirm(
            `${challenge.name}に参加しますか？\n` +
            `目標: ¥${challenge.goal.toLocaleString()}\n` +
            `参加GP: ${challenge.reward}\n` +
            `費用: ${challenge.fee}GP\n\n` +
            `※達成できない場合もGPは返還されません`
        );
        
        if (confirmStart && GPSystem.spendGP(challenge.fee, `${challenge.name}参加費`)) {
            this.active.push({
                type,
                startDate: new Date().toISOString(),
                goal: challenge.goal
            });
            this.saveChallenges();
            alert('🎯 チャレンジ参加しました！');
        }
    },
    
    checkCompletion(totalSavings) {
        const now = new Date();
        
        this.active = this.active.filter(challenge => {
            const challengeData = this.CHALLENGES[challenge.type];
            const startDate = new Date(challenge.startDate);
            const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            
            // Check if period ended
            if (daysPassed >= challengeData.period) {
                if (totalSavings >= challenge.goal) {
                    // Success!
                    GPSystem.onChallengeComplete(challenge.type);
                    this.completed.push({
                        ...challengeData,
                        completedDate: now.toISOString()
                    });
                    alert(`🎉 チャレンジ達成！${challengeData.reward}GP獲得！`);
                }
                return false; // Remove from active
            }
            
            // Check ongoing progress
            if (totalSavings >= challenge.goal) {
                GPSystem.onChallengeComplete(challenge.type);
                this.completed.push({
                    ...challengeData,
                    completedDate: now.toISOString()
                });
                alert(`🎉 チャレンジ達成！${challengeData.reward}GP獲得！`);
                return false;
            }
            
            return true;
        });
        
        this.saveChallenges();
    },
    
    getProgress() {
        return {
            active: this.active,
            completed: this.completed
        };
    }
};