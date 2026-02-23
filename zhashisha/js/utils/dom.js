/**
 * DOM操作工具类 - 修复重复提示和事件绑定问题
 */
const DOM = {
    prefix: 'zhashisha_',
    
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

    formatEquipment(equipments) {
        const equipmentParts = [];
        if (equipments.weapon) equipmentParts.push(`武器：${equipments.weapon.name}`);
        if (equipments.armor) equipmentParts.push(`防具：${equipments.armor.name}`);
        if (equipments.plusHorse) equipmentParts.push(`+1马：${equipments.plusHorse.name}`);
        if (equipments.minusHorse) equipmentParts.push(`-1马：${equipments.minusHorse.name}`);
        return equipmentParts.length > 0 ? equipmentParts.join('，') : '无';
    },

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
            
            // 修复：AI自动出牌逻辑
            setTimeout(() => {
                Game.aiPlayTurn(player);
            }, 1500);
        }
    },

    addGameLog(logContent) {
        const gameLog = document.getElementById('gameLog');
        if (!gameLog) return;
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.textContent = logContent;
        
        gameLog.appendChild(logItem);
        gameLog.scrollTop = gameLog.scrollHeight;
    },

    clearGameLog() {
        const gameLog = document.getElementById('gameLog');
        if (gameLog) gameLog.innerHTML = '';
        Game.logs = [];
        Game.addLog('游戏日志已清空');
    },

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

    showLoading(message = '加载中...') {
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.className = 'loading-overlay';
            
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p id="loadingMessage">${message}</p>
                </div>
            `;
            
            document.body.appendChild(loadingOverlay);
        } else {
            document.getElementById('loadingMessage').textContent = message;
        }
        
        loadingOverlay.style.display = 'flex';
    },

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    },

    // 修复：防止重复显示提示
    showToast(message, type = 'info', duration = 3000) {
        // 先移除旧的提示框
        const oldToast = document.getElementById('toastNotification');
        if (oldToast) oldToast.remove();
        
        const toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        toast.style.display = 'block';
        
        if (duration > 0) {
            setTimeout(() => {
                toast.style.display = 'none';
                setTimeout(() => toast.remove(), 500);
            }, duration);
        }
        
        toast.addEventListener('click', () => {
            toast.style.display = 'none';
            setTimeout(() => toast.remove(), 500);
        });
    },

    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        Game.addLog(`切换到页面：${pageId}`);
    },

    initEvents() {
        // 练习模式按钮
        const practiceModeBtn = document.getElementById('practiceModeBtn');
        if (practiceModeBtn) {
            practiceModeBtn.addEventListener('click', () => {
                PracticeMode.init();
            });
        }
        
        // 创建房间按钮 - 修复重复提示问题
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                this.showLoading('创建房间中...');
                
                setTimeout(() => {
                    const roomId = randomUtil.generateRoomId();
                    // 直接初始化联机模式，避免重复调用
                    OnlineMode.init(roomId, true);
                    this.hideLoading();
                    this.showToast(`房间创建成功，ID：${roomId}`, 'success');
                }, 500);
            });
        }
        
        // 加入房间按钮 - 修复空白页面问题
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
                
                setTimeout(() => {
                    OnlineMode.init(roomId, false);
                    this.hideLoading();
                    roomIdInput.value = '';
                }, 500);
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

window.addEventListener('DOMContentLoaded', () => {
    DOM.initEvents();
    Game.addLog('DOM工具类初始化完成');
});

window.DOM = DOM;
