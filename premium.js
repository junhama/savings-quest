/**
 * Premium VIP Membership System
 * Savings Quest V2
 */
const PremiumSystem = {
    PRICE: 490,
    PRICE_DISPLAY: '¥490',
    
    init() {
        this.loadStatus();
        this.renderUI();
        this.bindEvents();
    },
    
    loadStatus() {
        const data = Storage.getData();
        this.isPremium = data.isPremium || false;
        this.premiumSince = data.premiumSince || null;
    },
    
    bindEvents() {
        document.getElementById('btn-premium')?.addEventListener('click', () => this.showJoinModal());
        document.getElementById('btn-join-premium')?.addEventListener('click', () => this.joinPremium());
    },
    
    renderUI() {
        const data = Storage.getData();
        const btn = document.getElementById('btn-premium');
        if (btn) {
            if (data.isPremium) {
                btn.innerHTML = '⭐ VIP会員';
                btn.classList.add('premium-active');
            } else {
                btn.innerHTML = '⭐ VIP会員になる';
            }
        }
    },
    
    showJoinModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) modal.classList.remove('hidden');
    },
    
    joinPremium() {
        // Mock payment - in real app, integrate Stripe
        const confirmJoin = confirm(`月額${this.PRICE_DISPLAY}でVIP会員になりますか？\n\n含まれる機能：\n• 限定アバター\n• 広告完全除去\n• カスタムテーマ`);
        
        if (confirmJoin) {
            const data = Storage.getData();
            data.isPremium = true;
            data.premiumSince = new Date().toISOString();
            Storage.saveData(data);
            
            // Show success
            alert('🎉 VIP会員になりました！');
            this.renderUI();
            this.closeModal();
            
            // Remove ads
            document.querySelector('.ad-banner')?.remove();
        }
    },
    
    closeModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) modal.classList.add('hidden');
    },
    
    isActive() {
        return this.isPremium;
    }
};