/**
 * 主逻辑模块 - 诈尸杀小学生版
 * 负责UI交互、游戏流程控制、模式切换等核心交互逻辑
 */

// 全局变量
let gameInstance = null; // 游戏核心实例
let onlineGame = null; // 联机游戏实例
let selectedCharacterId = 0; // 选中的武将ID
let selectedCardId = null; // 选中的手牌ID
let selectedTargetId = null; // 选中的目标ID

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化卡牌说明
    renderCardInfoModal();

    // 模式选择按钮
    document.getElementById('offline-mode-btn').addEventListener('click', () => {
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById('offline-panel').classList.remove('hidden');
    });

    document.getElementById('online-mode-btn').addEventListener('click', () => {
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById('online-panel').classList.remove('hidden');
        // 初始化联机模块
        if (!onlineGame) {
            onlineGame = initOnlineModule(gameInstance);
        }
    });

    // 开始人机对战
    document.getElementById('start-offline-game-btn').addEventListener('click', startOfflineGame);

    // 创建房间
    document.getElementById('create-room-btn').addEventListener('click', createRoom);

    // 加入房间
    document.getElementById('join-room-btn').addEventListener('click', joinRoom);

    // 返回菜单按钮
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        // 重置游戏状态
        if (gameInstance) {
            gameInstance.resetGame();
        }
        if (onlineGame) {
            onlineGame.disconnect();
        }
        
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById('mode-selection-panel').classList.remove('hidden');
    });

    // 游戏控制按钮
    document.getElementById('draw-card-btn').addEventListener('click', () => {
        if (gameInstance) {
            gameInstance.drawCard(gameInstance.currentPlayerId, 1);
        }
    });

    document.getElementById('use-card-btn').addEventListener('click', showTargetSelection);

    document.getElementById('end-turn-btn').addEventListener('click', () => {
        if (gameInstance) {
            gameInstance.endTurn();
        }
    });

    // 确认武将选择
    document.getElementById('confirm-character-btn').addEventListener('click', confirmCharacterSelection);

    // 确认目标选择
    document.getElementById('confirm-target-btn').addEventListener('click', confirmTargetSelection);
});

/**
 * 开始人机对战
 */
function startOfflineGame() {
    const playerName = document.getElementById('ai-player-name').value || '小学生';
    const aiCount = parseInt(document.getElementById('ai-count').value) || 1;

    // 显示武将选择界面
    renderCharacterSelection();
    document.getElementById('character-select-modal').classList.remove('hidden');

    // 确认选择武将后开始游戏
    window.confirmCharacterCallback = () => {
        // 创建游戏实例
        gameInstance = new Game();
        
        // 初始化游戏（玩家+AI）
        gameInstance.initGame({
            playerName: playerName,
            aiCount: aiCount,
            selectedCharacterId: selectedCharacterId
        });

        // 显示游戏面板
        document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById('game-panel').classList.remove('hidden');

        // 开始游戏
        gameInstance.startGame();
    };
}

/**
 * 创建联机房间
 */
function createRoom() {
    const playerName = document.getElementById('player-name').value || '小学生';
    
    // 初始化联机模块
    if (!onlineGame) {
        onlineGame = initOnlineModule(gameInstance);
    }
    
    // 初始化玩家
    onlineGame.init(playerName);
    
    // 创建房间
    const roomId = onlineGame.createRoom();
    
    // 显示房间信息
    document.getElementById('room-info').classList.remove('hidden');
    document.getElementById('current-room-id').textContent = roomId;
    
    // 显示武将选择界面
    renderCharacterSelection();
    document.getElementById('character-select-modal').classList.remove('hidden');

    // 确认武将选择
    window.confirmCharacterCallback = () => {
        const character = getCharacterById(selectedCharacterId);
        onlineGame.selectCharacter(character);
        
        // 显示开始游戏按钮
        document.getElementById('start-online-game-btn').addEventListener('click', () => {
            onlineGame.startGame();
            
            // 创建游戏实例
            gameInstance = new Game();
            gameInstance.initOnlineGame(onlineGame.players, onlineGame.localPlayerId);
            
            // 显示游戏面板
            document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
            document.getElementById('game-panel').classList.remove('hidden');
        });
    };
}

/**
 * 加入联机房间
 */
function joinRoom() {
    const playerName = document.getElementById('player-name').value || '小学生';
    const roomId = document.getElementById('room-id').value;

    if (!roomId) {
        alert('请输入房间号');
        return;
    }

    // 初始化联机模块
    if (!onlineGame) {
        onlineGame = initOnlineModule(gameInstance);
    }
    
    // 初始化玩家
    onlineGame.init(playerName);
    
    // 加入房间
    onlineGame.joinRoom(roomId);

    // 监听加入成功
    onlineGame.peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'join_room_response' && data.data.success) {
                // 显示武将选择界面
                renderCharacterSelection();
                document.getElementById('character-select-modal').classList.remove('hidden');

                // 确认武将选择
                window.confirmCharacterCallback = () => {
                    const character = getCharacterById(selectedCharacterId);
                    onlineGame.selectCharacter(character);
                    
                    // 等待房主开始游戏
                    addGameLog('⏳ 等待房主开始游戏...');
                };
            }
        });
    });
}

/**
 * 确认武将选择
 */
function confirmCharacterSelection() {
    document.getElementById('character-select-modal').classList.add('hidden');
    
    if (window.confirmCharacterCallback) {
        window.confirmCharacterCallback();
        window.confirmCharacterCallback = null;
    }
}

/**
 * 显示目标选择界面
 */
function showTargetSelection() {
    if (!gameInstance || !selectedCardId) {
        addGameLog('⚠️ 请先选择要出的牌');
        return;
    }

    const currentPlayer = gameInstance.gameState.players.find(p => p.id === gameInstance.currentPlayerId);
    if (!currentPlayer) return;

    // 获取选中的牌
    const selectedCard = currentPlayer.handCards.find(c => c.uniqueId === selectedCardId);
    if (!selectedCard) {
        addGameLog('⚠️ 选中的牌不存在');
        return;
    }

    // 生成目标列表
    const targetList = document.getElementById('target-list');
    targetList.innerHTML = '';

    // 获取可选择的目标
    const availableTargets = gameInstance.getAvailableTargets(selectedCard);
    
    if (availableTargets.length === 0) {
        // 无目标牌（如调开老师、意外奖励等）
        useSelectedCard(null);
        return;
    }

    // 创建目标选项
    availableTargets.forEach(target => {
        const targetItem = document.createElement('div');
        targetItem.className = 'target-item';
        targetItem.dataset.targetId = target.id;
        targetItem.innerHTML = `
            <strong>${target.name}</strong>
            <p>学习币: ${target.health}</p>
            <p>武将: ${target.character?.name || '未选择'}</p>
        `;

        // 点击选择目标
        targetItem.addEventListener('click', function() {
            document.querySelectorAll('.target-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedTargetId = this.dataset.targetId;
        });

        targetList.appendChild(targetItem);
    });

    // 显示目标选择模态框
    document.getElementById('target-select-modal').classList.remove('hidden');
}

/**
 * 确认目标选择并出牌
 */
function confirmTargetSelection() {
    document.getElementById('target-select-modal').classList.add('hidden');
    
    if (selectedTargetId) {
        useSelectedCard(selectedTargetId);
        selectedTargetId = null;
    }
}

/**
 * 使用选中的牌
 * @param {string} targetId 目标玩家ID
 */
function useSelectedCard(targetId) {
    if (!gameInstance || !selectedCardId) return;

    const result = gameInstance.useCard(selectedCardId, targetId);
    
    if (result.error) {
        addGameLog(`❌ ${result.error}`);
    } else {
        // 重置选中的牌
        selectedCardId = null;
        // 更新UI
        gameInstance.updateGameUI();
    }
}

/**
 * 更新联机玩家列表UI
 * @param {object} players 玩家列表
 */
function updateOnlinePlayerList(players) {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;

    playersList.innerHTML = '';

    Object.values(players).forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${player.isLocal ? 'current' : ''} ${player.health <= 0 ? 'dead' : ''}`;
        playerCard.innerHTML = `
            <h4>${player.name} ${player.isHost ? '(房主)' : ''}</h4>
            <p class="health">❤️ 学习币: ${player.health}</p>
            <p class="character">🎭 武将: ${player.character?.name || '未选择'}</p>
        `;
        playersList.appendChild(playerCard);
    });
}

/**
 * 初始化手牌点击事件
 */
function initHandCardsClick() {
    const handCards = document.querySelectorAll('#hand-cards-container .card');
    
    handCards.forEach(card => {
        card.addEventListener('click', function() {
            // 取消其他牌的选中状态
            document.querySelectorAll('#hand-cards-container .card').forEach(c => {
                c.classList.remove('selected');
            });
            // 选中当前牌
            this.classList.add('selected');
            selectedCardId = this.dataset.cardId;
        });
    });
}

// 暴露全局函数
window.initHandCardsClick = initHandCardsClick;
window.updateOnlinePlayerList = updateOnlinePlayerList;
window.addGameLog = addGameLog;
window.selectedCharacterId = selectedCharacterId;
