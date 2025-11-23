// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        
        this.renderer = new Renderer(this.canvas, this.minimapCanvas);
        this.pathfinder = new Pathfinder(100, 100);
        this.ai = new AIController('medium');
        this.missionManager = new MissionManager();
        
        // Game state
        this.running = false;
        this.paused = false;
        this.gameMode = null; // 'story' or 'battle'
        
        // Game objects
        this.units = [];
        this.buildings = [];
        this.terrainObjects = [];
        this.selectedUnits = [];
        
        // Resources
        this.resources = {
            gold: CONFIG.STARTING_GOLD,
            wood: CONFIG.STARTING_WOOD,
            mana: CONFIG.STARTING_MANA
        };
        
        this.enemyResources = {
            gold: CONFIG.STARTING_GOLD,
            wood: CONFIG.STARTING_WOOD,
            mana: CONFIG.STARTING_MANA
        };
        
        // Map
        this.mapWidth = 60;
        this.mapHeight = 40;
        this.terrain = 'grassland';
        
        // Input
        this.input = {
            mouseX: 0,
            mouseY: 0,
            mouseDown: false,
            dragStart: null,
            keys: {}
        };
        
        // Time
        this.lastTime = 0;
        this.missionTime = 0;
        
        // Settings
        this.edgeScrollEnabled = true;
        
        // Initialize
        this.setupInput();
        this.renderer.resize();
        window.addEventListener('resize', () => this.renderer.resize());
    }
    
    setupInput() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.input.mouseX = e.clientX - rect.left;
        this.input.mouseY = e.clientY - rect.top;
        this.input.mouseDown = true;
        
        if (e.button === 0) { // Left click
            this.input.dragStart = {
                x: this.input.mouseX,
                y: this.input.mouseY
            };
        }
    }
    
    onMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.input.mouseX = e.clientX - rect.left;
        this.input.mouseY = e.clientY - rect.top;
        
        if (e.button === 0) { // Left click
            if (this.input.dragStart) {
                const dx = Math.abs(this.input.mouseX - this.input.dragStart.x);
                const dy = Math.abs(this.input.mouseY - this.input.dragStart.y);
                
                if (dx < 5 && dy < 5) {
                    // Single click
                    this.handleClick(this.input.mouseX, this.input.mouseY);
                } else {
                    // Drag selection
                    this.handleDragSelection();
                }
                
                this.input.dragStart = null;
            }
        } else if (e.button === 2) { // Right click
            this.handleRightClick(this.input.mouseX, this.input.mouseY);
        }
        
        this.input.mouseDown = false;
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.input.mouseX = e.clientX - rect.left;
        this.input.mouseY = e.clientY - rect.top;
        
        // Edge scrolling
        if (this.edgeScrollEnabled) {
            const edgeSize = 50;
            if (this.input.mouseX < edgeSize) {
                this.renderer.moveCamera(-CONFIG.SCROLL_SPEED, 0);
            } else if (this.input.mouseX > this.canvas.width - edgeSize) {
                this.renderer.moveCamera(CONFIG.SCROLL_SPEED, 0);
            }
            
            if (this.input.mouseY < edgeSize) {
                this.renderer.moveCamera(0, -CONFIG.SCROLL_SPEED);
            } else if (this.input.mouseY > this.canvas.height - edgeSize) {
                this.renderer.moveCamera(0, CONFIG.SCROLL_SPEED);
            }
        }
    }
    
    onWheel(e) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        this.renderer.setZoom(this.renderer.camera.zoom * zoomDelta);
    }
    
    onKeyDown(e) {
        this.input.keys[e.key] = true;
        
        // Keyboard shortcuts
        if (e.key === 'Escape') {
            // Cancel building placement mode
            if (this.buildingPlacementMode) {
                this.buildingPlacementMode = null;
                this.canvas.style.cursor = 'default';
                return;
            }
            this.deselectAll();
        }
        
        // Number keys for control groups
        if (e.key >= '1' && e.key <= '9') {
            if (e.ctrlKey) {
                // Create control group
                this.createControlGroup(parseInt(e.key));
            } else {
                // Select control group
                this.selectControlGroup(parseInt(e.key));
            }
        }
    }
    
    onKeyUp(e) {
        this.input.keys[e.key] = false;
    }
    
    handleClick(x, y) {
        const worldX = this.renderer.screenToWorldX(x) / CONFIG.TILE_SIZE;
        const worldY = this.renderer.screenToWorldY(y) / CONFIG.TILE_SIZE;
        
        // Check if clicked on unit
        let clickedUnit = null;
        for (const unit of this.units) {
            if (unit.owner === 'player' && unit.state !== 'dead') {
                const distance = Math.sqrt(
                    Math.pow(unit.x - worldX, 2) + Math.pow(unit.y - worldY, 2)
                );
                if (distance < 1.5) {  // Increased click radius
                    clickedUnit = unit;
                    break;
                }
            }
        }
        
        // Check if clicked on building
        let clickedBuilding = null;
        for (const building of this.buildings) {
            if (building.owner === 'player') {
                const distance = Math.sqrt(
                    Math.pow(building.x - worldX, 2) + Math.pow(building.y - worldY, 2)
                );
                if (distance < building.size + 0.5) {
                    clickedBuilding = building;
                    break;
                }
            }
        }
        
        // Check if clicked on terrain object
        let clickedTerrain = null;
        for (const terrain of this.terrainObjects) {
            const distance = Math.sqrt(
                Math.pow(terrain.x - worldX, 2) + Math.pow(terrain.y - worldY, 2)
            );
            if (distance < terrain.size + 0.5) {
                clickedTerrain = terrain;
                break;
            }
        }
        
        if (!this.input.keys['Shift']) {
            this.deselectAll();
        }
        
        if (clickedUnit) {
            clickedUnit.selected = true;
            if (!this.selectedUnits.includes(clickedUnit)) {
                this.selectedUnits.push(clickedUnit);
            }
            this.updateSelectedUnitUI();
            
            // Play click sound
            if (typeof AudioManager !== 'undefined') {
                AudioManager.playSound('click');
            }
        } else if (clickedBuilding) {
            clickedBuilding.selected = true;
            this.updateBuildingUI(clickedBuilding);
            
            // Play click sound
            if (typeof AudioManager !== 'undefined') {
                AudioManager.playSound('click');
            }
        } else if (clickedTerrain && clickedTerrain.harvestable) {
            // Show terrain info
            this.showTerrainInfo(clickedTerrain);
        }
    }
    
    handleDragSelection() {
        const x1 = Math.min(this.input.dragStart.x, this.input.mouseX);
        const y1 = Math.min(this.input.dragStart.y, this.input.mouseY);
        const x2 = Math.max(this.input.dragStart.x, this.input.mouseX);
        const y2 = Math.max(this.input.dragStart.y, this.input.mouseY);
        
        this.deselectAll();
        
        for (const unit of this.units) {
            if (unit.owner === 'player' && unit.state !== 'dead') {
                const screenX = this.renderer.worldToScreenX(unit.x * CONFIG.TILE_SIZE);
                const screenY = this.renderer.worldToScreenY(unit.y * CONFIG.TILE_SIZE);
                
                if (screenX >= x1 && screenX <= x2 && screenY >= y1 && screenY <= y2) {
                    unit.selected = true;
                    this.selectedUnits.push(unit);
                }
            }
        }
        
        if (this.selectedUnits.length > 0) {
            this.updateSelectedUnitUI();
        }
    }
    
    handleRightClick(x, y) {
        // Building placement mode
        if (this.buildingPlacementMode) {
            const worldX = Math.floor(this.renderer.screenToWorldX(x) / CONFIG.TILE_SIZE);
            const worldY = Math.floor(this.renderer.screenToWorldY(y) / CONFIG.TILE_SIZE);
            
            this.placeBuilding(worldX, worldY, this.buildingPlacementMode);
            return;
        }
        
        if (this.selectedUnits.length === 0) return;
        
        // Convert screen to world coordinates properly
        const worldX = Math.floor(this.renderer.screenToWorldX(x) / CONFIG.TILE_SIZE);
        const worldY = Math.floor(this.renderer.screenToWorldY(y) / CONFIG.TILE_SIZE);
        
        // Check if clicked on enemy
        let targetEnemy = null;
        for (const unit of this.units) {
            if (unit.owner === 'enemy' && unit.state !== 'dead') {
                const distance = Math.sqrt(
                    Math.pow(unit.x - worldX, 2) + Math.pow(unit.y - worldY, 2)
                );
                if (distance < 1) {
                    targetEnemy = unit;
                    break;
                }
            }
        }
        
        // Check if clicked on enemy building
        let targetBuilding = null;
        for (const building of this.buildings) {
            if (building.owner === 'enemy') {
                const distance = Math.sqrt(
                    Math.pow(building.x - worldX, 2) + Math.pow(building.y - worldY, 2)
                );
                if (distance < 2) {
                    targetBuilding = building;
                    break;
                }
            }
        }
        
        // Check if clicked on resource
        let targetResource = null;
        for (const terrain of this.terrainObjects) {
            if (terrain.harvestable && !terrain.depleted) {
                const distance = Math.sqrt(
                    Math.pow(terrain.x - worldX, 2) + Math.pow(terrain.y - worldY, 2)
                );
                if (distance < 2) {
                    targetResource = terrain;
                    break;
                }
            }
        }
        
        // Give orders to selected units
        this.selectedUnits.forEach(unit => {
            if (targetEnemy) {
                unit.attackTarget(targetEnemy);
            } else if (targetBuilding) {
                unit.attackTarget(targetBuilding);
            } else if (targetResource) {
                unit.harvestResource(targetResource);
            } else {
                // Move to location
                unit.moveTo(worldX, worldY);
                // Clear current target so they can auto-attack
                unit.target = null;
            }
        });
    }
    
    deselectAll() {
        this.units.forEach(unit => unit.selected = false);
        this.buildings.forEach(building => building.selected = false);
        this.selectedUnits = [];
        
        document.getElementById('selected-unit-info').classList.add('hidden');
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        
        // Ensure canvas is properly sized when game starts
        this.renderer.resize();
        
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.paused) {
            // Handle keyboard camera movement
            this.handleKeyboardCamera();
            
            this.update(deltaTime);
        }
        
        this.renderer.render(this);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleKeyboardCamera() {
        const speed = CONFIG.SCROLL_SPEED;
        
        if (this.input.keys['ArrowUp'] || this.input.keys['w'] || this.input.keys['W']) {
            this.renderer.moveCamera(0, -speed);
        }
        if (this.input.keys['ArrowDown'] || this.input.keys['s'] || this.input.keys['S']) {
            this.renderer.moveCamera(0, speed);
        }
        if (this.input.keys['ArrowLeft'] || this.input.keys['a'] || this.input.keys['A']) {
            this.renderer.moveCamera(-speed, 0);
        }
        if (this.input.keys['ArrowRight'] || this.input.keys['d'] || this.input.keys['D']) {
            this.renderer.moveCamera(speed, 0);
        }
    }
    
    update(deltaTime) {
        this.missionTime += deltaTime;
        
        // Update units
        this.units.forEach(unit => unit.update(deltaTime));
        
        // Auto-attack for idle player units
        this.units.forEach(unit => {
            if (unit.owner === 'player' && !unit.isMoving && !unit.target && unit.stats.health > 0) {
                const enemy = this.findNearestEnemy(unit);
                if (enemy && this.getDistance(unit, enemy) <= unit.stats.range) {
                    unit.attack(enemy);
                }
            }
        });
        
        // Update buildings (resource generation + tower attacks)
        this.buildings.forEach(building => building.update(deltaTime));
        
        // Remove depleted terrain objects
        this.terrainObjects = this.terrainObjects.filter(obj => 
            !obj.depleted && !obj.destroyed
        );
        
        // Update AI
        this.ai.update(deltaTime);
        
        // Check mission objectives
        this.missionManager.checkObjectives();
        
        // Check defeat condition
        this.checkDefeatCondition();
        
        // Remove dead units
        this.units = this.units.filter(unit => unit.state !== 'dead');
    }
    
    checkDefeatCondition() {
        const playerCastle = this.buildings.find(b => b.owner === 'player' && b.type === 'castle');
        if (!playerCastle || playerCastle.stats.health <= 0) {
            this.missionManager.failMission();
            return;
        }
        
        // Check if player has no units and cannot afford any
        const playerUnits = this.units.filter(u => u.owner === 'player' && u.state !== 'dead');
        if (playerUnits.length === 0) {
            // Check if player can afford cheapest unit
            const cheapestUnit = this.getCheapestUnit();
            if (cheapestUnit) {
                if (this.resources.gold < cheapestUnit.cost.gold || 
                    this.resources.wood < cheapestUnit.cost.wood) {
                    // Game Over - no units and cannot afford new ones
                    this.defeat();
                }
            }
        }
    }
    
    getCheapestUnit() {
        let cheapest = null;
        let minCost = Infinity;
        
        for (const key in UNIT_TYPES) {
            const unitType = UNIT_TYPES[key];
            const totalCost = unitType.cost.gold + unitType.cost.wood;
            if (totalCost < minCost) {
                minCost = totalCost;
                cheapest = unitType;
            }
        }
        
        return cheapest;
    }
    
    addUnit(unit) {
        this.units.push(unit);
    }
    
    addBuilding(building) {
        this.buildings.push(building);
        
        // Update pathfinding obstacles
        for (let i = 0; i < building.size; i++) {
            for (let j = 0; j < building.size; j++) {
                this.pathfinder.addObstacle(
                    Math.floor(building.x) + i,
                    Math.floor(building.y) + j
                );
            }
        }
    }
    
    addTerrainObject(terrainObj) {
        this.terrainObjects.push(terrainObj);
        
        // Add blocking terrain to pathfinding
        if (terrainObj.blocking) {
            for (let i = 0; i < terrainObj.size; i++) {
                for (let j = 0; j < terrainObj.size; j++) {
                    this.pathfinder.addObstacle(
                        Math.floor(terrainObj.x) + i,
                        Math.floor(terrainObj.y) + j
                    );
                }
            }
        }
    }
    
    initMap(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
        this.pathfinder = new Pathfinder(width, height);
        
        // Clear everything
        this.units = [];
        this.buildings = [];
        this.terrainObjects = [];
        this.selectedUnits = [];
    }
    
    findPath(startX, startY, endX, endY) {
        return this.pathfinder.findPath(startX, startY, endX, endY);
    }
    
    getUnitsInRadius(x, y, radius, excludeOwner = null) {
        return this.units.filter(unit => {
            if (excludeOwner && unit.owner === excludeOwner) return false;
            if (unit.state === 'dead') return false;
            
            const distance = Math.sqrt(
                Math.pow(unit.x - x, 2) + Math.pow(unit.y - y, 2)
            );
            return distance <= radius;
        });
    }
    
    createEffect(type, x, y, value = 0, targetX = 0, targetY = 0, resourceType = null) {
        this.renderer.addEffect(type, x, y, value, targetX, targetY, resourceType);
    }
    
    updateSelectedUnitUI() {
        const infoPanel = document.getElementById('selected-unit-info');
        
        if (this.selectedUnits.length === 0) {
            infoPanel.classList.add('hidden');
            return;
        }
        
        infoPanel.classList.remove('hidden');
        
        const unit = this.selectedUnits[0];
        document.getElementById('unit-name').textContent = unit.name;
        
        const healthPercent = (unit.stats.health / unit.stats.maxHealth) * 100;
        document.getElementById('unit-health').style.width = healthPercent + '%';
        
        const manaPercent = (unit.stats.mana / unit.stats.maxMana) * 100;
        document.getElementById('unit-mana').style.width = manaPercent + '%';
        
        // Update abilities
        const abilitiesContainer = document.getElementById('unit-abilities');
        abilitiesContainer.innerHTML = '';
        
        unit.abilities.forEach(abilityId => {
            const ability = ABILITIES[abilityId];
            const btn = document.createElement('button');
            btn.className = 'ability-btn';
            btn.textContent = ability.icon;
            btn.title = ability.name;
            
            if (unit.abilityCooldowns[abilityId] > 0 || unit.stats.mana < ability.manaCost) {
                btn.disabled = true;
            }
            
            btn.onclick = () => this.useAbility(abilityId);
            
            abilitiesContainer.appendChild(btn);
        });
    }
    
    updateResourceDisplay() {
        // Update resource display in UI
        document.getElementById('gold').textContent = Math.floor(this.resources.gold);
        document.getElementById('wood').textContent = Math.floor(this.resources.wood);
        document.getElementById('mana').textContent = Math.floor(this.resources.mana);
    }
    
    updateBuildingUI(building) {
        const productionPanel = document.getElementById('unit-production');
        const buttonsContainer = document.getElementById('unit-buttons');
        
        buttonsContainer.innerHTML = '';
        
        // Show unit production if castle or barracks
        if (building.canProduce && building.canProduce.length > 0) {
            productionPanel.querySelector('h4').textContent = 'Einheiten erstellen';
            
            building.canProduce.forEach(unitType => {
                const unitData = UNIT_TYPES[unitType.toUpperCase()];
                
                const btn = document.createElement('div');
                btn.className = 'unit-btn';
                
                // Create icon HTML based on iconClass
                let iconHTML = '';
                if (unitData.iconClass) {
                    const iconClasses = unitData.iconClass.split(' ');
                    iconHTML = `<i class="${iconClasses.join(' ')}" style="color: ${unitData.color}"></i>`;
                } else {
                    iconHTML = unitData.icon;
                }
                
                btn.innerHTML = `
                    <span class="unit-icon">${iconHTML}</span>
                    <div class="unit-name">${unitData.name}</div>
                    <div class="unit-cost"><i class="gi gi-gold-bar"></i>${unitData.cost.gold}</div>
                `;
                
                btn.onclick = () => this.trainUnit(building, unitType);
                
                buttonsContainer.appendChild(btn);
            });
        }
        
        // Show building options for castle
        if (building.type === 'castle') {
            const buildSection = document.createElement('div');
            buildSection.innerHTML = '<h4 style="margin-top: 20px;">Gebäude errichten</h4>';
            productionPanel.appendChild(buildSection);
            
            const buildableBuildings = ['tower', 'barracks', 'magic_tower', 'gold_mine', 'lumber_mill', 'mana_well'];
            
            buildableBuildings.forEach(buildingType => {
                const buildingData = BUILDING_TYPES[buildingType.toUpperCase()];
                
                const btn = document.createElement('div');
                btn.className = 'unit-btn';
                btn.title = buildingData.description;
                
                // Create icon HTML based on iconClass
                let iconHTML = '';
                if (buildingData.iconClass) {
                    const iconClasses = buildingData.iconClass.split(' ');
                    iconHTML = `<i class="${iconClasses.join(' ')}" style="color: ${buildingData.color}"></i>`;
                } else {
                    iconHTML = buildingData.icon;
                }
                
                btn.innerHTML = `
                    <span class="unit-icon">${iconHTML}</span>
                    <div class="unit-name">${buildingData.name}</div>
                    <div class="unit-cost"><i class="gi gi-gold-bar"></i>${buildingData.cost.gold} <i class="gi gi-oak"></i>${buildingData.cost.wood}</div>
                `;
                
                btn.onclick = () => this.startBuildingPlacement(buildingType);
                
                buttonsContainer.appendChild(btn);
            });
        }
    }
    
    trainUnit(building, unitType) {
        const unitData = UNIT_TYPES[unitType.toUpperCase()];
        
        if (this.resources.gold >= unitData.cost.gold &&
            this.resources.wood >= unitData.cost.wood &&
            this.resources.mana >= unitData.cost.mana) {
            
            this.resources.gold -= unitData.cost.gold;
            this.resources.wood -= unitData.cost.wood;
            this.resources.mana -= unitData.cost.mana;
            
            building.queueProduction(unitType);
            this.updateResourceUI();
            
            // Play build sound
            if (typeof AudioManager !== 'undefined') {
                AudioManager.playSound('build');
            }
        }
    }
    
    updateResourceUI() {
        document.getElementById('gold').textContent = this.resources.gold;
        document.getElementById('wood').textContent = this.resources.wood;
        document.getElementById('mana').textContent = this.resources.mana;
    }
    
    useAbility(abilityId) {
        // Placeholder for ability usage
        console.log('Using ability:', abilityId);
    }
    
    startBuildingPlacement(buildingType) {
        this.buildingPlacementMode = buildingType;
        this.canvas.style.cursor = 'crosshair';
        
        // Show message
        this.showMessage(`Wähle einen Bauplatz für ${BUILDING_TYPES[buildingType.toUpperCase()].name}`);
    }
    
    placeBuilding(x, y, buildingType) {
        const buildingData = BUILDING_TYPES[buildingType.toUpperCase()];
        
        // Check if player can afford it
        if (this.resources.gold < buildingData.cost.gold ||
            this.resources.wood < buildingData.cost.wood ||
            this.resources.mana < buildingData.cost.mana) {
            this.showMessage('Nicht genügend Ressourcen!');
            return false;
        }
        
        // Check if location is valid
        if (!this.isValidBuildLocation(x, y, buildingData.size)) {
            this.showMessage('Ungültiger Bauplatz!');
            return false;
        }
        
        // Check if near required resource (for mines/mills)
        if (buildingData.requiresNearby) {
            if (!this.isNearTerrainType(x, y, buildingData.requiresNearby)) {
                this.showMessage(`Muss in der Nähe von ${buildingData.requiresNearby} gebaut werden!`);
                return false;
            }
        }
        
        // Deduct resources
        this.resources.gold -= buildingData.cost.gold;
        this.resources.wood -= buildingData.cost.wood;
        this.resources.mana -= buildingData.cost.mana;
        this.updateResourceUI();
        
        // Create building
        const building = new Building(buildingType, x, y, 'player');
        this.addBuilding(building);
        
        // Play build sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playSound('build');
        }
        
        this.buildingPlacementMode = null;
        this.canvas.style.cursor = 'default';
        
        return true;
    }
    
    isValidBuildLocation(x, y, size) {
        // Check if location is within map bounds
        if (x < 2 || y < 2 || x + size > this.mapWidth - 2 || y + size > this.mapHeight - 2) {
            return false;
        }
        
        // Check for overlapping buildings
        for (const building of this.buildings) {
            const distance = Math.sqrt(
                Math.pow(building.x - x, 2) + Math.pow(building.y - y, 2)
            );
            if (distance < building.size + size) {
                return false;
            }
        }
        
        // Check for obstacles
        for (const obj of this.terrainObjects) {
            if (obj.blocking) {
                const distance = Math.sqrt(
                    Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
                );
                if (distance < obj.size + size) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    isNearTerrainType(x, y, terrainType) {
        const searchRadius = 5;
        
        for (const obj of this.terrainObjects) {
            if (obj.type.toLowerCase() === terrainType.toLowerCase()) {
                const distance = Math.sqrt(
                    Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2)
                );
                if (distance <= searchRadius) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    showTerrainInfo(terrain) {
        let info = `${terrain.name}\n`;
        if (terrain.harvestable && terrain.resource) {
            info += `Verbleibend: ${terrain.remainingResource}/${terrain.resource.maxAmount}\n`;
            info += `Typ: ${terrain.resource.type}`;
        }
        console.log(info);
        this.showMessage(info);
    }
    
    findNearestEnemy(unit) {
        let nearest = null;
        let minDistance = Infinity;
        
        const enemyOwner = unit.owner === 'player' ? 'enemy' : 'player';
        
        // Check enemy units
        this.units.forEach(enemyUnit => {
            if (enemyUnit.owner === enemyOwner && enemyUnit.state !== 'dead') {
                const distance = this.getDistance(unit, enemyUnit);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = enemyUnit;
                }
            }
        });
        
        // Check enemy buildings
        this.buildings.forEach(building => {
            if (building.owner === enemyOwner && building.stats.health > 0) {
                const distance = this.getDistance(unit, building);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = building;
                }
            }
        });
        
        return nearest;
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    victory() {
        this.paused = true;
        document.getElementById('victory-screen').classList.remove('hidden');
        document.getElementById('victory-message').textContent = 
            this.missionManager.currentMission ? this.missionManager.currentMission.description : 'Mission erfolgreich!';
    }
    
    defeat() {
        this.paused = true;
        document.getElementById('defeat-screen').classList.remove('hidden');
        document.getElementById('defeat-message').textContent = 'Deine Burg wurde zerstört!';
    }
    
    showMessage(message) {
        // Simple message system (can be expanded)
        console.log('GAME MESSAGE:', message);
    }
    
    createControlGroup(groupId) {
        // Store selected units as control group
        if (!this.controlGroups) this.controlGroups = {};
        this.controlGroups[groupId] = [...this.selectedUnits];
    }
    
    selectControlGroup(groupId) {
        if (!this.controlGroups || !this.controlGroups[groupId]) return;
        
        this.deselectAll();
        this.selectedUnits = this.controlGroups[groupId].filter(unit => unit.state !== 'dead');
        this.selectedUnits.forEach(unit => unit.selected = true);
        this.updateSelectedUnitUI();
    }
}

// Global game instance
let game;
