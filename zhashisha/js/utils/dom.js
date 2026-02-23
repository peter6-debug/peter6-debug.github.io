/**
 * DOM操作工具类
 * 封装所有游戏UI更新逻辑，包括玩家列表、手牌、游戏日志、回合状态等
 * 无动画/音效，仅实现基础DOM操作和状态更新
 */
const DOM = {
    /**
     * 更新玩家列表UI
     * 渲染所有玩家的状态（血量、武将、存活状态等）
     */
    updatePlayerList() {
        const playerListEl = document.getElementById('playerList');
        if (!playerListEl) return;
        
        // 清空列表
        playerListEl.innerHTML = '';
        
        // 更新目标玩家选择框
        const targetSelect = document.getElementById('targetPlayerSelect');
        if (targetSelect) {
            targetSelect.innerHTML = '<option value="">选择目标玩家</option>';
        }
        
        // 遍历所有玩家
        Game.players.forEach(player => {
            if (!player.isAlive) return;
            
            // 创建玩家卡片
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${player.isSelf ? 'self-player' : ''} ${player.isTurn ? 'current-turn' : ''}`;
            playerCard.dataset.playerId = player.id;
            
            // 构建玩家卡片内容
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
            
            // 添加到玩家列表
            playerListEl.appendChild(playerCard);
            
            // 更新目标选择框（排除自己）
            if (targetSelect && !player.isSelf) {
                const option = document.createElement('option');
                option.value = player.id;
                option.textContent = `${player.name}（${player.hero.name}）`;
                targetSelect.appendChild(option);
            }
        });
        
        // 记录日志
        Game.addLog('玩家列表已更新');
    },

    /**
     * 格式化装备信息显示
     * @param {Object} equipments - 玩家装备对象
     * @returns {string} 格式化的装备字符串
     */
    formatEquipment(equipments) {
        const equipmentParts = [];
        
        if (equipments.weapon) equipmentParts.push(`武器：${equipments.weapon.name}`);
        if (equipments.armor) equipmentParts.push(`防具：${equipments.armor.name}`);
        if (equipments.plusHorse) equipmentParts.push(`+1马：${equipments.plusHorse.name}`);
        if (equipments.minusHorse) equipmentParts.push(`-1马：${equipments.minusHorse.name}`);
        
        return equipmentParts.length > 0 ? equipmentParts.join('，') : '无';
    },

    /**
     * 更新手牌UI
     * @param {Player} player - 要更新手牌的玩家（默认本地玩家）
     */
    updateHandCards(player = Game.getSelfPlayer()) {
        if (!player || !player.isSelf) return;
        
        const handCardsList = document.getElementById('handCardsList');
        if (!handCardsList) return;
        
        // 清空手牌列表
        handCardsList.innerHTML = '';
        
        // 渲染手牌
        player.handCards.forEach(card => {
            const cardItem = document.createElement('div');
            cardItem.className = `card-item ${card.type}`;
            cardItem.dataset.cardId = card.id;
            
            // 构建卡牌内容
            cardItem.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-suit">${card.suit || '无花色'}</div>
                <div class="card-desc">${card.desc || '无描述'}</div>
            `;
            
            // 添加到手牌列表
            handCardsList.appendChild(cardItem);
        });
        
        // 更新手牌数量显示
        const handCardCount = document.getElementById('handCardCount');
        if (handCardCount) {
            handCardCount.textContent = `手牌数量：${player.handCards.length}`;
        }
        
        // 记录日志
        Game.addLog(`手牌已更新，当前手牌数：${player.handCards.length}`);
    },

    /**
     * 更新当前回合玩家UI
     * @param {Player} player - 当前回合玩家
     */
    updatePlayerTurn(player) {
        // 移除所有玩家的当前回合样式
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('current-turn');
        });
        
        // 为当前回合玩家添加样式
        const currentPlayerCard = document.querySelector(`.player-card[data-player-id="${player.id}"]`);
        if (currentPlayerCard) {
            currentPlayerCard.classList.add('current-turn');
        }
        
        // 更新回合提示
        const turnIndicator = document.getElementById('turnIndicator');
        if (turnIndicator) {
            turnIndicator.textContent = `当前回合：${player.name}（${player.hero.name}）`;
        }
        
        // 启用/禁用操作按钮
        const drawCardBtn = document.getElementById('drawCardBtn');
        const endTurnBtn = document.getElementById('endTurnBtn');
        
        if (player.isSelf) {
            // 本地玩家回合，启用按钮
            drawCardBtn.disabled = player.hasDrawn;
            endTurnBtn.disabled = false;
        } else {
            // AI/其他玩家回合，禁用按钮
            drawCardBtn.disabled = true;
            endTurnBtn.disabled = true;
        }
        
        // 记录日志
        Game.addLog(`回合切换至：${player.name}`);
    },

    /**
     * 添加游戏日志到UI
     * @param {string} logContent - 日志内容
     */
    addGameLog(logContent) {
        const gameLog = document.getElementById('gameLog');
        if (!gameLog) return;
        
        // 创建日志项
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.textContent = logContent;
        
        // 添加到日志容器
        gameLog.appendChild(logItem);
        
        // 自动滚动到底部
        gameLog.scrollTop = gameLog.scrollHeight;
    },

    /**
     * 清空游戏日志
     */
    clearGameLog() {
        const gameLog = document.getElementById('gameLog');
        if (gameLog) {
            gameLog.innerHTML = '';
        }
        Game.logs = [];
        Game.addLog('游戏日志已清空');
    },

    /**
     * 显示游戏结果
     * @param {Player} winner - 获胜玩家
     */
    showGameResult(winner) {
        // 创建结果弹窗（如果不存在）
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
            
            // 绑定重新开始按钮事件
            document.getElementById('restartBtn').addEventListener('click', () => {
                resultModal.style.display = 'none';
                Game.restart();
            });
            
            // 绑定返回模式选择按钮事件
            document.getElementById('backToModeBtn').addEventListener('click', () => {
                resultModal.style.display = 'none';
                // 根据当前模式重置
                if (Game.state.mode === 'practice') {
                    PracticeMode.reset();
                } else {
                    OnlineMode.reset();
                }
            });
        }
        
        // 更新结果信息
        const resultMessage = document.getElementById('resultMessage');
        if (winner) {
            resultMessage.textContent = `${winner.name}（${winner.hero.name}）获得胜利！`;
        } else {
            resultMessage.textContent = '所有玩家均已阵亡，游戏结束！';
        }
        
        // 显示弹窗
        resultModal.style.display = 'block';
        
        // 禁用游戏操作按钮
        document.getElementById('drawCardBtn').disabled = true;
        document.getElementById('endTurnBtn').disabled = true;
        
        // 记录日志
        Game.addLog(`游戏结果：${winner ? winner.name + '获胜' : '无胜利者'}`);
    },

    /**
     * 显示加载提示
     * @param {string} message - 加载提示信息
     */
    showLoading(message = '加载中...') {
        // 创建加载层（如果不存在）
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
        
        // 显示加载层
        loadingOverlay.style.display = 'flex';
    },

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    },

    /**
     * 显示提示框
     * @param {string} message - 提示信息
     * @param {string} type - 提示类型：success/error/info/warning
     * @param {number} duration - 自动关闭时长（毫秒），0为不自动关闭
     */
    showToast(message, type = 'info', duration = 3000) {
        // 创建提示框（如果不存在）
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // 设置提示类型和内容
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 显示提示框
        toast.style.display = 'block';
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                toast.style.display = 'none';
            }, duration);
        }
        
        // 点击关闭
        toast.addEventListener('click', () => {
            toast.style.display = 'none';
        });
    },

    /**
     * 切换页面显示
     * @param {string} pageId - 要显示的页面ID
     */
    switchPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 记录日志
        Game.addLog(`切换到页面：${pageId}`);
    },

    /**
     * 初始化所有DOM事件
     * 绑定模式选择、房间创建/加入等基础事件
     */
    initEvents() {
        // 练习模式按钮
        const practiceModeBtn = document.getElementById('practiceModeBtn');
        if (practiceModeBtn) {
            practiceModeBtn.addEventListener('click', () => {
                PracticeMode.init();
            });
        }
        
        // 创建房间按钮
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                const roomId = randomUtil.generateRoomId();
                OnlineMode.init(roomId, true);
                this.showToast(`房间创建成功，ID：${roomId}`, 'success');
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
                
                OnlineMode.init(roomId, false);
                roomIdInput.value = '';
            });
        }
        
        // 绑定返回按钮事件
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // 根据当前状态返回
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
        
        // 记录日志
        Game.addLog('DOM事件初始化完成');
    }
};

// 页面加载完成后初始化DOM事件
window.addEventListener('DOMContentLoaded', () => {
    DOM.initEvents();
    Game.addLog('DOM工具类初始化完成');
});

// 全局暴露DOM工具类
window.DOM = DOM;
