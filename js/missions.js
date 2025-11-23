// Mission Definitions
const MISSIONS = {
    story: [
        {
            id: 1,
            title: "Die Entführung",
            description: "Die Prinzessin wurde von dunklen Kreaturen entführt. Finde sie und bringe sie sicher zurück!",
            objective: "Rette die Prinzessin",
            unlocked: true,
            map: {
                width: 60,
                height: 40,
                terrain: 'forest'
            },
            player: {
                startPosition: { x: 5, y: 20 },
                startUnits: [
                    { type: 'knight', x: 5, y: 20 },
                    { type: 'knight', x: 6, y: 20 },
                    { type: 'archer', x: 5, y: 21 },
                    { type: 'archer', x: 6, y: 21 }
                ],
                startResources: { gold: 500, wood: 300, mana: 200 }
            },
            enemy: {
                startPosition: { x: 55, y: 20 },
                startUnits: [
                    { type: 'knight', x: 55, y: 20 },
                    { type: 'archer', x: 54, y: 20 },
                    { type: 'archer', x: 55, y: 21 }
                ],
                difficulty: 'easy',
                startResources: { gold: 300, wood: 200, mana: 100 }
            },
            objectives: [
                {
                    type: 'rescue',
                    target: 'princess',
                    position: { x: 55, y: 20 }
                }
            ],
            events: [
                {
                    trigger: 'time',
                    time: 30000, // 30 seconds
                    action: 'spawn_enemies',
                    params: {
                        units: [
                            { type: 'knight', x: 50, y: 15 },
                            { type: 'knight', x: 50, y: 25 }
                        ]
                    }
                }
            ]
        },
        {
            id: 2,
            title: "Der dunkle Wald",
            description: "Kämpfe dich durch den verfluchten Wald und vernichte das Übel an seiner Wurzel.",
            objective: "Zerstöre die feindliche Basis",
            unlocked: false,
            map: {
                width: 70,
                height: 50,
                terrain: 'dark_forest'
            },
            player: {
                startPosition: { x: 10, y: 25 },
                startUnits: [
                    { type: 'knight', x: 10, y: 25 },
                    { type: 'wizard', x: 11, y: 25 },
                    { type: 'elf', x: 10, y: 26 }
                ],
                startResources: { gold: 600, wood: 400, mana: 300 }
            },
            enemy: {
                startPosition: { x: 60, y: 25 },
                startUnits: [
                    { type: 'knight', x: 60, y: 25 },
                    { type: 'knight', x: 61, y: 25 },
                    { type: 'wizard', x: 60, y: 26 },
                    { type: 'archer', x: 61, y: 26 }
                ],
                difficulty: 'medium',
                startResources: { gold: 500, wood: 300, mana: 200 }
            },
            objectives: [
                {
                    type: 'destroy',
                    target: 'castle'
                }
            ]
        },
        {
            id: 3,
            title: "Die letzte Schlacht",
            description: "Das Böse hat sich in den Bergen verschanzt. Dies ist die finale Schlacht!",
            objective: "Besiege alle Feinde",
            unlocked: false,
            map: {
                width: 80,
                height: 60,
                terrain: 'mountains'
            },
            player: {
                startPosition: { x: 10, y: 30 },
                startUnits: [
                    { type: 'knight', x: 10, y: 30 },
                    { type: 'knight', x: 11, y: 30 },
                    { type: 'wizard', x: 10, y: 31 },
                    { type: 'archer', x: 11, y: 31 },
                    { type: 'elf', x: 12, y: 30 },
                    { type: 'dwarf', x: 12, y: 31 }
                ],
                startResources: { gold: 800, wood: 600, mana: 400 }
            },
            enemy: {
                startPosition: { x: 70, y: 30 },
                startUnits: [
                    { type: 'knight', x: 70, y: 30 },
                    { type: 'knight', x: 71, y: 30 },
                    { type: 'knight', x: 72, y: 30 },
                    { type: 'wizard', x: 70, y: 31 },
                    { type: 'wizard', x: 71, y: 31 },
                    { type: 'archer', x: 72, y: 31 }
                ],
                difficulty: 'hard',
                startResources: { gold: 1000, wood: 800, mana: 500 }
            },
            objectives: [
                {
                    type: 'eliminate',
                    target: 'all_enemies'
                }
            ]
        }
    ],
    
    battle: [
        {
            id: 'skirmish',
            title: "Scharmützel",
            description: "Schnelle Schlacht auf kleiner Karte",
            map: {
                width: 50,
                height: 40,
                terrain: 'grassland'
            },
            difficulty: 'easy'
        },
        {
            id: 'conquest',
            title: "Eroberung",
            description: "Große Schlacht auf weitläufigem Terrain",
            map: {
                width: 80,
                height: 60,
                terrain: 'mixed'
            },
            difficulty: 'medium'
        },
        {
            id: 'survival',
            title: "Überleben",
            description: "Halte endlosen Angriffswellen stand",
            map: {
                width: 60,
                height: 60,
                terrain: 'fortress'
            },
            difficulty: 'hard'
        }
    ]
};

// Mission Manager
class MissionManager {
    constructor() {
        this.currentMission = null;
        this.missionType = null; // 'story' or 'battle'
        this.completedMissions = [];
    }
    
    loadMission(missionId, type = 'story') {
        this.missionType = type;
        
        if (type === 'story') {
            this.currentMission = MISSIONS.story.find(m => m.id === missionId);
        } else {
            // Battle mode - create mission from template
            const template = MISSIONS.battle.find(m => m.id === missionId);
            if (template) {
                this.currentMission = this.createBattleMission(template);
            } else {
                this.currentMission = null;
            }
        }
        
        if (!this.currentMission) {
            console.error('Mission not found:', missionId);
            return false;
        }
        
        return true;
    }
    
    createBattleMission(template) {
        // Create a full mission from battle template
        const mission = {
            id: template.id,
            title: template.title,
            description: template.description,
            objective: 'Besiege alle Feinde und zerstöre die feindliche Burg',
            map: template.map,
            player: {
                startPosition: { x: 10, y: Math.floor(template.map.height / 2) },
                startUnits: [
                    { type: 'knight', x: 10, y: Math.floor(template.map.height / 2) },
                    { type: 'knight', x: 11, y: Math.floor(template.map.height / 2) },
                    { type: 'archer', x: 10, y: Math.floor(template.map.height / 2) + 1 },
                    { type: 'archer', x: 11, y: Math.floor(template.map.height / 2) + 1 }
                ],
                startResources: { gold: 800, wood: 500, mana: 300 }
            },
            enemy: {
                startPosition: { x: template.map.width - 10, y: Math.floor(template.map.height / 2) },
                startUnits: this.generateEnemyUnits(template.difficulty, template.map),
                difficulty: template.difficulty,
                startResources: this.getEnemyResources(template.difficulty)
            },
            objectives: [
                {
                    type: 'eliminate',
                    target: 'all_enemies'
                },
                {
                    type: 'destroy',
                    target: 'castle'
                }
            ]
        };
        
        return mission;
    }
    
    generateEnemyUnits(difficulty, map) {
        const centerY = Math.floor(map.height / 2);
        const x = map.width - 10;
        
        const units = [];
        
        switch(difficulty) {
            case 'easy':
                units.push(
                    { type: 'knight', x: x, y: centerY },
                    { type: 'archer', x: x + 1, y: centerY }
                );
                break;
            case 'medium':
                units.push(
                    { type: 'knight', x: x, y: centerY },
                    { type: 'knight', x: x + 1, y: centerY },
                    { type: 'wizard', x: x, y: centerY + 1 },
                    { type: 'archer', x: x + 1, y: centerY + 1 }
                );
                break;
            case 'hard':
                units.push(
                    { type: 'knight', x: x, y: centerY },
                    { type: 'knight', x: x + 1, y: centerY },
                    { type: 'knight', x: x + 2, y: centerY },
                    { type: 'wizard', x: x, y: centerY + 1 },
                    { type: 'wizard', x: x + 1, y: centerY + 1 },
                    { type: 'archer', x: x + 2, y: centerY + 1 },
                    { type: 'dwarf', x: x, y: centerY - 1 },
                    { type: 'elf', x: x + 1, y: centerY - 1 }
                );
                break;
        }
        
        return units;
    }
    
    getEnemyResources(difficulty) {
        switch(difficulty) {
            case 'easy':
                return { gold: 400, wood: 200, mana: 150 };
            case 'medium':
                return { gold: 800, wood: 500, mana: 300 };
            case 'hard':
                return { gold: 1200, wood: 800, mana: 500 };
            default:
                return { gold: 500, wood: 300, mana: 200 };
        }
    }
    
    generateTerrain(mapData) {
        const width = mapData.width;
        const height = mapData.height;
        const terrain = mapData.terrain;
        
        // Generate realistic terrain features
        // Rivers first, so forests/mountains can avoid water
        this.generateRivers(width, height, 1, 2); // 1-2 Flüsse
        this.generateForests(width, height, 4, 8); // 4-8 Wälder
        this.generateMountains(width, height, 3, 6); // 3-6 Bergketten
        this.generateResourceClusters(width, height);
    }
    
    generateForests(width, height, minCount, maxCount) {
        const forestCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
        
        for (let i = 0; i < forestCount; i++) {
            const centerX = Math.floor(Math.random() * (width - 20)) + 10;
            const centerY = Math.floor(Math.random() * (height - 20)) + 10;
            const forestSize = Math.floor(Math.random() * 5) + 3; // 3-7 Bäume pro Wald
            
            // Create forest cluster
            for (let j = 0; j < forestSize; j++) {
                const offsetX = Math.floor(Math.random() * 6) - 3;
                const offsetY = Math.floor(Math.random() * 6) - 3;
                const x = centerX + offsetX;
                const y = centerY + offsetY;
                
                if (this.isSpotFree(x, y, 2) && !this.isWater(x, y)) {
                    const tree = new TerrainObject('forest', x, y);
                    game.addTerrainObject(tree);
                }
            }
        }
    }
    
    generateMountains(width, height, minCount, maxCount) {
        const mountainCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
        
        for (let i = 0; i < mountainCount; i++) {
            const centerX = Math.floor(Math.random() * (width - 20)) + 10;
            const centerY = Math.floor(Math.random() * (height - 20)) + 10;
            const chainLength = Math.floor(Math.random() * 4) + 3; // 3-6 Berge pro Kette
            
            // Create mountain chain
            let currentX = centerX;
            let currentY = centerY;
            
            for (let j = 0; j < chainLength; j++) {
                if (this.isSpotFree(currentX, currentY, 2) && !this.isWater(currentX, currentY)) {
                    const mountain = new TerrainObject('mountain', currentX, currentY);
                    game.addTerrainObject(mountain);
                }
                
                // Random direction for next mountain
                const direction = Math.floor(Math.random() * 4);
                switch(direction) {
                    case 0: currentX += 1; break;
                    case 1: currentX -= 1; break;
                    case 2: currentY += 1; break;
                    case 3: currentY -= 1; break;
                }
                
                // Keep in bounds
                currentX = Math.max(10, Math.min(width - 10, currentX));
                currentY = Math.max(10, Math.min(height - 10, currentY));
            }
        }
    }
    
    generateRivers(width, height, minCount, maxCount) {
        const riverCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
        
        for (let i = 0; i < riverCount; i++) {
            // River starts from random edge
            const startSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let currentX, currentY;
            let targetX, targetY;
            
            switch(startSide) {
                case 0: // From top
                    currentX = Math.floor(Math.random() * (width - 30)) + 15;
                    currentY = 2;
                    targetX = Math.floor(Math.random() * (width - 30)) + 15;
                    targetY = height - 2;
                    break;
                case 1: // From right
                    currentX = width - 2;
                    currentY = Math.floor(Math.random() * (height - 30)) + 15;
                    targetX = 2;
                    targetY = Math.floor(Math.random() * (height - 30)) + 15;
                    break;
                case 2: // From bottom
                    currentX = Math.floor(Math.random() * (width - 30)) + 15;
                    currentY = height - 2;
                    targetX = Math.floor(Math.random() * (width - 30)) + 15;
                    targetY = 2;
                    break;
                case 3: // From left
                    currentX = 2;
                    currentY = Math.floor(Math.random() * (height - 30)) + 15;
                    targetX = width - 2;
                    targetY = Math.floor(Math.random() * (height - 30)) + 15;
                    break;
            }
            
            const riverTiles = [];
            const riverWidth = 2 + Math.floor(Math.random() * 2); // 2-3 tiles wide
            const maxSteps = Math.max(width, height) * 2;
            
            // Generate river path towards target
            for (let step = 0; step < maxSteps; step++) {
                // Calculate direction towards target with some randomness
                const dx = targetX - currentX;
                const dy = targetY - currentY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 3) break; // Reached target
                
                // Add current position and neighbors for river width
                for (let wx = -Math.floor(riverWidth/2); wx <= Math.floor(riverWidth/2); wx++) {
                    for (let wy = -Math.floor(riverWidth/2); wy <= Math.floor(riverWidth/2); wy++) {
                        const rx = Math.floor(currentX + wx);
                        const ry = Math.floor(currentY + wy);
                        
                        if (rx >= 2 && rx < width - 2 && ry >= 2 && ry < height - 2) {
                            if (!riverTiles.some(t => t.x === rx && t.y === ry)) {
                                const water = new TerrainObject('water', rx, ry);
                                game.addTerrainObject(water);
                                riverTiles.push({x: rx, y: ry});
                            }
                        }
                    }
                }
                
                // Move towards target with some meandering
                const rand = Math.random();
                if (rand < 0.6) {
                    // Move towards target
                    if (Math.abs(dx) > Math.abs(dy)) {
                        currentX += dx > 0 ? 1 : -1;
                    } else {
                        currentY += dy > 0 ? 1 : -1;
                    }
                } else if (rand < 0.8) {
                    // Meander perpendicular
                    if (Math.abs(dx) > Math.abs(dy)) {
                        currentY += Math.random() > 0.5 ? 1 : -1;
                    } else {
                        currentX += Math.random() > 0.5 ? 1 : -1;
                    }
                } else {
                    // Continue in same direction (for straight sections)
                    if (step > 0 && riverTiles.length > riverWidth) {
                        const lastTile = riverTiles[riverTiles.length - riverWidth - 1];
                        const lastDx = currentX - lastTile.x;
                        const lastDy = currentY - lastTile.y;
                        if (lastDx !== 0 || lastDy !== 0) {
                            currentX += Math.sign(lastDx);
                            currentY += Math.sign(lastDy);
                        }
                    }
                }
                
                // Keep in bounds
                currentX = Math.max(2, Math.min(width - 3, currentX));
                currentY = Math.max(2, Math.min(height - 3, currentY));
            }
            
            // Add bridges across the river
            if (riverTiles.length > 10) {
                const numBridges = Math.random() > 0.6 ? 2 : 1;
                for (let b = 0; b < numBridges; b++) {
                    const bridgeIndex = Math.floor(riverTiles.length * (0.25 + b * 0.5));
                    const bridgePos = riverTiles[bridgeIndex];
                    if (bridgePos) {
                        // Remove water tiles and place bridge
                        for (let bw = -1; bw <= 1; bw++) {
                            for (let bh = -1; bh <= 1; bh++) {
                                const bx = bridgePos.x + bw;
                                const by = bridgePos.y + bh;
                                // Remove any water at bridge position
                                game.terrainObjects = game.terrainObjects.filter(
                                    obj => !(obj.type === 'water' && obj.x === bx && obj.y === by)
                                );
                                const bridge = new TerrainObject('bridge', bx, by);
                                game.addTerrainObject(bridge);
                            }
                        }
                    }
                }
            }
        }
    }
    
    generateResourceClusters(width, height) {
        // Generate gold deposits in clusters
        const goldClusters = 3;
        for (let i = 0; i < goldClusters; i++) {
            const centerX = Math.floor(Math.random() * (width - 20)) + 10;
            const centerY = Math.floor(Math.random() * (height - 20)) + 10;
            
            for (let j = 0; j < 2; j++) {
                const offsetX = Math.floor(Math.random() * 4) - 2;
                const offsetY = Math.floor(Math.random() * 4) - 2;
                const x = centerX + offsetX;
                const y = centerY + offsetY;
                
                if (this.isSpotFree(x, y, 3)) {
                    const goldDeposit = new TerrainObject('gold_deposit', x, y);
                    game.addTerrainObject(goldDeposit);
                }
            }
        }
        
        // Generate mana crystals
        const manaClusters = 2;
        for (let i = 0; i < manaClusters; i++) {
            const centerX = Math.floor(Math.random() * (width - 20)) + 10;
            const centerY = Math.floor(Math.random() * (height - 20)) + 10;
            
            for (let j = 0; j < 2; j++) {
                const offsetX = Math.floor(Math.random() * 4) - 2;
                const offsetY = Math.floor(Math.random() * 4) - 2;
                const x = centerX + offsetX;
                const y = centerY + offsetY;
                
                if (this.isSpotFree(x, y, 3)) {
                    const manaCrystal = new TerrainObject('mana_crystal', x, y);
                    game.addTerrainObject(manaCrystal);
                }
            }
        }
    }
    
    isWater(x, y) {
        // Check if position has water
        return game.terrainObjects.some(
            obj => obj.type === 'water' && 
                   Math.abs(obj.x - x) < 1 && 
                   Math.abs(obj.y - y) < 1
        );
    }
    
    isSpotFree(x, y, radius) {
        // Check if near player or enemy start positions
        const playerPos = this.currentMission.player.startPosition;
        const enemyPos = this.currentMission.enemy.startPosition;
        
        const distToPlayer = Math.sqrt(
            Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2)
        );
        const distToEnemy = Math.sqrt(
            Math.pow(x - enemyPos.x, 2) + Math.pow(y - enemyPos.y, 2)
        );
        
        if (distToPlayer < 10 || distToEnemy < 10) {
            return false;
        }
        
        // Check if overlapping with existing terrain objects
        for (const obj of game.terrainObjects) {
            const distance = Math.sqrt(
                Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
            );
            if (distance < radius) {
                return false;
            }
        }
        
        return true;
    }
    
    setupMission() {
        if (!this.currentMission) return;
        
        // Setup map
        game.initMap(this.currentMission.map.width, this.currentMission.map.height);
        
        // Generate terrain objects
        this.generateTerrain(this.currentMission.map);
        
        // Clear water from castle positions before placing buildings
        const playerPos = this.currentMission.player.startPosition;
        const enemyPos = this.currentMission.enemy.startPosition;
        
        // Clear 8x8 area around each castle position
        for (let dx = -4; dx <= 4; dx++) {
            for (let dy = -4; dy <= 4; dy++) {
                const px = playerPos.x + dx;
                const py = playerPos.y + dy;
                const ex = enemyPos.x + dx;
                const ey = enemyPos.y + dy;
                
                game.terrainObjects = game.terrainObjects.filter(
                    obj => !(obj.type === 'water' && 
                            ((obj.x === px && obj.y === py) || 
                             (obj.x === ex && obj.y === ey)))
                );
            }
        }
        
        // Setup player
        const playerData = this.currentMission.player;
        game.resources = { ...playerData.startResources };
        
        // Create player castle
        const playerCastle = new Building('castle', playerData.startPosition.x, playerData.startPosition.y, 'player');
        game.addBuilding(playerCastle);
        
        // Center camera on player castle
        game.renderer.camera.x = playerData.startPosition.x * CONFIG.TILE_SIZE - game.canvas.width / (2 * game.renderer.camera.zoom);
        game.renderer.camera.y = playerData.startPosition.y * CONFIG.TILE_SIZE - game.canvas.height / (2 * game.renderer.camera.zoom);
        
        // Create player units
        playerData.startUnits.forEach(unitData => {
            const unit = new Unit(unitData.type, unitData.x, unitData.y, 'player');
            game.addUnit(unit);
        });
        
        // Setup enemy
        const enemyData = this.currentMission.enemy;
        game.enemyResources = { ...enemyData.startResources };
        
        // Create enemy castle
        const enemyCastle = new Building('castle', enemyData.startPosition.x, enemyData.startPosition.y, 'enemy');
        game.addBuilding(enemyCastle);
        
        // Create enemy units
        enemyData.startUnits.forEach(unitData => {
            const unit = new Unit(unitData.type, unitData.x, unitData.y, 'enemy');
            game.addUnit(unit);
        });
        
        // Setup AI
        game.ai.difficulty = enemyData.difficulty || 'medium';
        
        // Setup events
        if (this.currentMission.events) {
            this.setupEvents();
        }
    }
    
    setupEvents() {
        this.currentMission.events.forEach(event => {
            if (event.trigger === 'time') {
                setTimeout(() => {
                    this.triggerEvent(event);
                }, event.time);
            }
        });
    }
    
    triggerEvent(event) {
        switch (event.action) {
            case 'spawn_enemies':
                event.params.units.forEach(unitData => {
                    const unit = new Unit(unitData.type, unitData.x, unitData.y, 'enemy');
                    game.addUnit(unit);
                });
                game.showMessage('Feindliche Verstärkung ist eingetroffen!');
                break;
        }
    }
    
    checkObjectives() {
        if (!this.currentMission || !this.currentMission.objectives) return;
        
        let allCompleted = true;
        
        for (const objective of this.currentMission.objectives) {
            if (!this.isObjectiveCompleted(objective)) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            this.completeMission();
        }
    }
    
    isObjectiveCompleted(objective) {
        switch (objective.type) {
            case 'eliminate':
                const enemyUnits = game.units.filter(u => u.owner === 'enemy' && u.state !== 'dead');
                return enemyUnits.length === 0;
                
            case 'destroy':
                const enemyBuildings = game.buildings.filter(b => b.owner === 'enemy');
                return enemyBuildings.length === 0;
                
            case 'rescue':
                // Check if princess is near player castle
                const princess = game.units.find(u => u.type === 'princess' && u.owner === 'player');
                const playerCastle = game.buildings.find(b => b.owner === 'player' && b.type === 'castle');
                if (princess && playerCastle) {
                    const distance = princess.getDistanceTo(playerCastle);
                    return distance < 5;
                }
                return false;
                
            case 'survive':
                // Check if time limit reached
                return game.missionTime >= objective.time;
        }
        
        return false;
    }
    
    completeMission() {
        this.completedMissions.push(this.currentMission.id);
        
        // Unlock next mission
        if (this.missionType === 'story') {
            const nextMission = MISSIONS.story.find(m => m.id === this.currentMission.id + 1);
            if (nextMission) {
                nextMission.unlocked = true;
            }
        }
        
        game.victory();
    }
    
    failMission() {
        game.defeat();
    }
    
    getAvailableMissions(type = 'story') {
        if (type === 'story') {
            return MISSIONS.story.filter(m => m.unlocked);
        }
        return MISSIONS.battle;
    }
}
