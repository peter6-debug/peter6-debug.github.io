/**
 * DOM操作工具类 - 修复加载状态和提示问题
 */
const DOM = {
    // 更新玩家列表
    updatePlayerList() {
        const playerListEl = document.getElementById('playerList');
        if (!playerListEl) return;
        
        playerListEl.innerHTML = '';
        const targetSelect = document.getElementById('targetPlayerSelect');
        if (targetSelect) targetSelect.innerHTML = '<option value="">选择目标玩家</option>';
        
        Game.players.forEach(player => {
            if (!player.isAlive) return;
            
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${player.isSelf ? 'self-player' : ''} ${player.isTurn ? 'current-turn' : ''}`;
            playerCard.dataset.playerId = player.id;
            
            playerCard.innerHTML = `
                <div class="player-header">
                    <h3>${player.name}${player.isSelf ? '（我）' : ''}</h3>
                    <span class="player-status ${player.isTurn ? 'active' : ''}">${player.isTurn ? '当前回合' : ''}</span>
                </div>
                <div class="player-hero">
                    <p class="hero-name">${player.hero.name}</p>
                    <p class="hero-title">${player.hero.title}</p>
                </div>
                <div class="player-stats">
                    <div class="hp-bar">
                        <span class="hp-label">体力：${player.currentHp}/${player.maxHp}</span>
                        <div class="hp-progress" style="width: ${(player.currentHp / player.maxHp) * 100}%"></div>
                    </div>
                    <p class="hand-card-count">手牌：${player.handCards.length}张</p>
                </div>
                <div class="player-equipment">
                    <p>装备：${this.formatEquipment(player.equipments)}</p>
                    <p>宝物：${player.treasures.length > 0 ? player.treasures.map(t => t.name).join('、') : '无'}</p>
                </div>
            `;
            
            playerListEl.appendChild(playerCard);
            
            if (targetSelect && !player.isSelf) {
                const option = document.createElement('option');
                option.value = player.id;
                option.textContent = `${player.name}（${player.hero.name}）`;
                targetSelect.appendChild(option);
            }
        });
        
        Game.addLog('玩家列表已更新');
    },

    // 格式化装备
    formatEquipment(equipments) {
        const equipmentParts = [];
        if (equipments.weapon) equipmentParts.push(`武器：${equipments.weapon.name}`);
        if (equipments.armor) equipmentParts.push(`防具：${equipments.armor.name}`);
        if (equipments.plusHorse) equipmentParts.push(`+1马：${equipments.plusHorse.name}`);
        if (equipments.minusHorse) equipmentParts.push(`-1马：${equipments.minusHorse.name}`);
        return equipmentParts.length > 0 ? equipmentParts.join('，') : '无';
    },

    // 更新手牌
    updateHandCards(player = Game.getSelfPlayer()) {
        if (!player || !player.isSelf) return;
        
        const handCardsList = document.getElementById('handCardsList');
        if (!handCardsList) return;
        
        handCardsList.innerHTML = '';
        
        player.handCards.forEach(card => {
            const cardItem = document.createElement('div');
            cardItem.className = `card-item ${card.type}`;
            cardItem.dataset.cardId = card.id;
            
            cardItem.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-suit">${card.suit || '无花色'}</div>
                <div class="card-desc">${card.desc || '无描述'}</div>
            `;
            
            handCardsList.appendChild(cardItem);
        });
        
        const handCardCount = document.getElementById('handCardCount');
        if (handCardCount) {
            handCardCount.textContent = `手牌数量：${player.handCards.length}`;
        }
        
        Game.addLog(`手牌已更新，当前手牌数：${player.handCards.length}`);
    },

    // 更新回合
    updatePlayerTurn(player) {
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('current-turn');
        });
        
        const currentPlayerCard = document.querySelector(`.player-card[data-player-id="${player.id}"]`);
        if (currentPlayerCard) {
            currentPlayerCard.classList.add('current-turn');
        }
        
        const turnIndicator = document.getElementById('turnIndicator');
        if (turnIndicator) {
            turnIndicator.textContent = `当前回合：${player.name}（${player.hero.name}）`;
        }
        
        const drawCardBtn = document.getElementById('drawCardBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');
        
        if (player.isSelf) {
            drawCardBtn.disabled = player.hasDrawn;
            endTurnBtn.disabled = false;
        } else {
            drawCardBtn.disabled = true;
            endTurnBtn.disabled = true;
            
            // AI自动出牌
            setTimeout(() => {
                if (Game.aiPlayTurn) {
                    Game.aiPlayTurn(player);
                }
            }, 1500);
        }
    },

    // 添加游戏日志
    addGameLog(logContent) {
        const gameLog = document.getElementById('gameLog');
        if (!gameLog) return;
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.textContent = logContent;
        
        gameLog.appendChild(logItem);
        gameLog.scrollTop = gameLog.scrollHeight;
    },

    // 清空日志
    clearGameLog() {
        const gameLog = document.getElementById('gameLog');
        if (gameLog) gameLog.innerHTML = '';
        Game.logs = [];
        Game.addLog('游戏日志已清空');
    },

    // 显示游戏结果
    showGameResult(winner) {
        let resultModal = document.getElementById('gameResultModal');
        if (!resultModal) {
            resultModal = document.createElement('div');
            resultModal.id = 'gameResultModal';
            resultModal.className = 'modal';
            
            resultModal.innerHTML = `
                <div class="modal-content">
                    <h2 id="resultTitle">游戏结束</h2>
                    <p id="resultMessage"></p>
                    <div class="modal-buttons">
                        <button id="restartBtn">重新开始</button>
                        <button id="backToModeBtn">返回模式选择</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(resultModal);
            
            document.getElementById('restartBtn').addEventListener('click', () => {
                resultModal.style.display = 'none';
                Game.restart();
            });
            
            document.getElementById('backToModeBtn').addEventListener('click', () => {
                resultModal.style.display = 'none';
                if (Game.state.mode === 'practice') {
                    PracticeMode.reset();
                } else {
                    OnlineMode.reset();
                }
            });
        }
        
        const resultMessage = document.getElementById('resultMessage');
        if (winner) {
            resultMessage.textContent = `${winner.name}（${winner.hero.name}）获得胜利！`;
        } else {
            resultMessage.textContent = '所有玩家均已阵亡，游戏结束！';
        }
        
        resultModal.style.display = 'block';
        
        document.getElementById('drawCardBtn').disabled = true;
        document.getElementById('endTurnBtn').disabled = true;
        
        Game.addLog(`游戏结果：${winner ? winner.name + '获胜' : '无胜利者'}`);
    },

    // 显示加载（修复一直显示的问题）
    showLoading(message = '加载中...') {
        // 先移除旧的加载层
        this.hideLoading();
        
        let loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
        
        loadingOverlay.innerHTML = `
            <div class="loading-content" style="background: white; padding: 20px; border-radius: 8px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p id="loadingMessage" style="margin-top: 20px;">${message}</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        
        document.body.appendChild(loadingOverlay);
    },

    // 隐藏加载（核心修复）
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove(); // 彻底移除，不是隐藏
        }
        
        // 清除所有定时器
        if (window.loadingTimer) {
            clearTimeout(window.loadingTimer);
        }
        
        console.log('加载状态已隐藏');
    },

    // 显示提示
    showToast(message, type = 'info', duration = 3000) {
        // 先移除旧的提示
        const oldToast = document.getElementById('toastNotification');
        if (oldToast) oldToast.remove();
        
        const toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.color = 'white';
        toast.style.zIndex = '9998';
        
        // 设置提示类型样式
        if (type === 'success') toast.style.backgroundColor = '#2ecc71';
        else if (type === 'error') toast.style.backgroundColor = '#e74c3c';
        else if (type === 'warning') toast.style.backgroundColor = '#f39c12';
        else toast.style.backgroundColor = '#3498db';
        
        document.body.appendChild(toast);
        
        toast.style.display = 'block';
        
        if (duration > 0) {
            window.loadingTimer = setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, duration);
        }
        
        toast.addEventListener('click', () => {
            toast.remove();
        });
    },

    // 切换页面
    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
        }
        
        Game.addLog(`切换到页面：${pageId}`);
    },

    // 初始化事件
    initEvents() {
        // 练习模式按钮
        const practiceModeBtn = document.getElementById('practiceModeBtn');
        if (practiceModeBtn) {
            practiceModeBtn.addEventListener('click', () => {
                PracticeMode.init();
            });
        }
        
        // 创建房间按钮 - 彻底修复
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                // 立即显示加载
                this.showLoading('创建房间中...');
                
                // 延迟执行，避免UI阻塞
                window.loadingTimer = setTimeout(() => {
                    try {
                        const roomId = randomUtil.generateRoomId();
                        // 直接初始化，不重复调用
                        OnlineMode.init(roomId, true);
                        this.hideLoading(); // 立即隐藏加载
                        this.showToast(`房间创建成功，ID：${roomId}`, 'success');
                    } catch (e) {
                        console.error('创建房间失败：', e);
                        this.hideLoading();
                        this.showToast('创建房间失败', 'error');
                    }
                }, 800);
            });
        }
        
        // 加入房间按钮
        const joinRoomBtn = document.getElementById('joinRoomBtn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                const roomIdInput = document.getElementById('roomIdInput');
                const roomId = roomIdInput.value.trim();
                
                if (!roomId) {
                    this.showToast('请输入房间ID！', 'error');
                    return;
                }
                
                if (!Room.checkRoomExists(roomId)) {
                    this.showToast('房间不存在！', 'error');
                    return;
                }
                
                this.showLoading('加入房间中...');
                
                window.loadingTimer = setTimeout(() => {
                    try {
                        OnlineMode.init(roomId, false);
                        this.hideLoading();
                        roomIdInput.value = '';
                    } catch (e) {
                        console.error('加入房间失败：', e);
                        this.hideLoading();
                        this.showToast('加入房间失败', 'error');
                    }
                }, 800);
            });
        }
        
        // 返回按钮
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (Game.state.isStarted) {
                    if (confirm('游戏正在进行中，确定要返回吗？')) {
                        Game.end();
                        if (Game.state.mode === 'practice') {
                            PracticeMode.reset();
                        } else {
                            OnlineMode.reset();
                        }
                    }
                } else {
                    this.switchPage('modePage');
                }
            });
        }
        
        Game.addLog('DOM事件初始化完成');
    }
};

// 页面加载完成初始化
window.addEventListener('DOMContentLoaded', () => {
    DOM.initEvents();
    Game.addLog('DOM工具类初始化完成');
    
    // 初始隐藏所有加载状态
    DOM.hideLoading();
});

window.DOM = DOM;
