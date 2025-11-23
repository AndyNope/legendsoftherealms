// Renderer Class
class Renderer {
    constructor(canvas, minimapCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // Settings
        this.showGrid = false;
        
        // Terrain colors
        this.terrainColors = {
            water: '#2a5c8f',
            deepWater: '#1a4c7f',
            grass: '#5a9e5a',
            darkGrass: '#4a8e4a',
            dirt: '#8b7355',
            stone: '#787878',
            snow: '#e8e8e8',
            sand: '#d4c4a0',
            forest: '#2d5a2d',
            mountain: '#6a6a6a'
        };
        
        // Terrain map for tile-based rendering
        this.terrainMap = null;
        
        // Texture cache
        this.textures = {};
        this.texturesLoaded = false;
        
        // Effects
        this.effects = []
    }
    
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    createTextures() {
        if (this.texturesLoaded) return;
        
        const tileSize = 64; // Base texture size
        
        // Create grass texture
        this.textures.grass = this.createGrassTexture(tileSize);
        this.textures.darkGrass = this.createGrassTexture(tileSize, true);
        this.textures.water = this.createWaterTexture(tileSize);
        this.textures.sand = this.createSandTexture(tileSize);
        this.textures.dirt = this.createDirtTexture(tileSize);
        this.textures.stone = this.createStoneTexture(tileSize);
        this.textures.snow = this.createSnowTexture(tileSize);
        this.textures.forest = this.createForestTexture(tileSize);
        this.textures.mountain = this.createMountainTexture(tileSize);
        this.textures.bridge = this.createBridgeTexture(tileSize);
        
        this.texturesLoaded = true;
    }
    
    createGrassTexture(size, dark = false) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base color - single solid dark green
        ctx.fillStyle = '#3a6c1c';
        ctx.fillRect(0, 0, size, size);
        
        // Add subtle texture variation (non-random pattern)
        ctx.fillStyle = 'rgba(50, 90, 30, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 7) % size;
            const y = (i * 11) % size;
            ctx.fillRect(x, y, 2, 2);
        }
        
        return canvas;
    }
    
    createWaterTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base water color
        ctx.fillStyle = '#2a5c8f';
        ctx.fillRect(0, 0, size, size);
        
        // Add subtle wave pattern
        ctx.strokeStyle = 'rgba(42, 92, 143, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * size / 4);
            for (let x = 0; x < size; x += 8) {
                const y = i * size / 4 + Math.sin(x / 5) * 2;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        return canvas;
    }
    
    createSandTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#d4c4a0';
        ctx.fillRect(0, 0, size, size);
        
        // Add sand grains
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.2})`;
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.beginPath();
            ctx.arc(x, y, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return canvas;
    }
    
    createDirtTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(0, 0, size, size);
        
        // Add dirt patches
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(70, 50, 30, ${Math.random() * 0.3})`;
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.fillRect(x, y, 2, 2);
        }
        
        return canvas;
    }
    
    createStoneTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#787878';
        ctx.fillRect(0, 0, size, size);
        
        // Add cracks
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * size, Math.random() * size);
            ctx.lineTo(Math.random() * size, Math.random() * size);
            ctx.stroke();
        }
        
        return canvas;
    }
    
    createSnowTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(0, 0, size, size);
        
        // Add sparkles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.fillRect(x, y, 1, 1);
        }
        
        return canvas;
    }
    
    createForestTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2d5a2d';
        ctx.fillRect(0, 0, size, size);
        
        // Add darker patches
        for (let i = 0; i < 25; i++) {
            ctx.fillStyle = 'rgba(20, 40, 20, 0.4)';
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.fillRect(x, y, 2, 2);
        }
        
        return canvas;
    }
    
    createMountainTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(0, 0, size, size);
        
        // Add rocky texture
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(50, 50, 50, ${Math.random() * 0.4})`;
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.fillRect(x, y, 3, 3);
        }
        
        return canvas;
    }
    
    createBridgeTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(0, 0, size, size);
        
        // Add wooden planks
        ctx.fillStyle = 'rgba(101, 67, 33, 0.5)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(0, i * size / 6, size, 2);
        }
        
        return canvas;
    }
    
    render(game) {
        this.clear();
        
        // Draw terrain
        this.drawTerrain(game);
        
        // Draw terrain objects (resources & obstacles)
        game.terrainObjects.forEach(obj => {
            this.drawTerrainObject(obj);
        });
        
        // Draw buildings
        game.buildings.forEach(building => {
            if (building.stats.health > 0) {
                this.drawBuilding(building);
            }
        });
        
        // Draw units
        game.units.forEach(unit => {
            if (unit.state !== 'dead') {
                this.drawUnit(unit);
            }
        });
        
        // Draw building placement preview
        if (game.buildingPlacementMode) {
            this.drawBuildingPreview(game);
        }
        
        // Draw selection boxes
        this.drawSelections(game);
        
        // Draw effects
        this.drawEffects();
        
        // Draw minimap
        this.drawMinimap(game);
    }
    
    clear() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTerrain(game) {
        // Create textures on first render
        if (!this.texturesLoaded) {
            this.createTextures();
        }
        
        // Initialize terrain map if needed
        if (!this.terrainMap || !this.terrainMap.length || this.terrainMap.length !== game.mapHeight) {
            this.generateTerrainMap(game);
        }
        
        const startX = Math.floor(this.camera.x / CONFIG.TILE_SIZE);
        const startY = Math.floor(this.camera.y / CONFIG.TILE_SIZE);
        const endX = Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / CONFIG.TILE_SIZE);
        const endY = Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / CONFIG.TILE_SIZE);
        
        // Draw terrain tiles
        for (let y = Math.max(0, startY - 1); y < Math.min(game.mapHeight, endY + 1); y++) {
            for (let x = Math.max(0, startX - 1); x < Math.min(game.mapWidth, endX + 1); x++) {
                if (this.terrainMap[y] && this.terrainMap[y][x]) {
                    const tile = this.terrainMap[y][x];
                    const screenX = this.worldToScreenX(x * CONFIG.TILE_SIZE);
                    const screenY = this.worldToScreenY(y * CONFIG.TILE_SIZE);
                    const tileSize = CONFIG.TILE_SIZE * this.camera.zoom;
                
                    // Get texture for tile type
                    const texture = this.getTextureForTile(tile);
                    
                    if (texture) {
                        // Draw textured tile
                        this.ctx.drawImage(texture, 
                            screenX - tileSize/2, screenY - tileSize/2, 
                            tileSize, tileSize);
                        
                        // Draw elevation shading (subtle)
                        if (tile.elevation > 0) {
                            this.ctx.fillStyle = `rgba(255, 255, 255, ${tile.elevation * 0.1})`;
                            this.ctx.fillRect(screenX - tileSize/2, screenY - tileSize/2, tileSize, tileSize);
                        } else if (tile.elevation < 0) {
                            this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(tile.elevation) * 0.1})`;
                            this.ctx.fillRect(screenX - tileSize/2, screenY - tileSize/2, tileSize, tileSize);
                        }
                    }
                }
            }
        }
        
        // Draw grid lines (if enabled)
        if (this.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let x = Math.max(0, startX); x <= Math.min(game.mapWidth, endX); x++) {
                const screenX = this.worldToScreenX(x * CONFIG.TILE_SIZE);
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, 0);
                this.ctx.lineTo(screenX, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = Math.max(0, startY); y <= Math.min(game.mapHeight, endY); y++) {
                const screenY = this.worldToScreenY(y * CONFIG.TILE_SIZE);
                this.ctx.beginPath();
                this.ctx.moveTo(0, screenY);
                this.ctx.lineTo(this.canvas.width, screenY);
                this.ctx.stroke();
            }
        }
    }
    
    generateTerrainMap(game) {
        this.terrainMap = [];
        
        // Initialize all tiles with grass
        for (let y = 0; y < game.mapHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < game.mapWidth; x++) {
                this.terrainMap[y][x] = {
                    type: 'grass',
                    elevation: 0,
                    variant: 0
                };
            }
        }
        
        // Apply terrain from terrain objects
        game.terrainObjects.forEach(obj => {
            const tileX = Math.floor(obj.x);
            const tileY = Math.floor(obj.y);
            
            if (tileX >= 0 && tileX < game.mapWidth && tileY >= 0 && tileY < game.mapHeight) {
                const tile = this.terrainMap[tileY][tileX];
                
                switch(obj.type.toLowerCase()) {
                    case 'water':
                        tile.type = 'water';
                        tile.elevation = -1;
                        break;
                    case 'bridge':
                        tile.type = 'bridge';
                        tile.elevation = 0;
                        break;
                    case 'forest':
                        tile.type = 'forest';
                        tile.elevation = 0;
                        break;
                    case 'mountain':
                        tile.type = 'mountain';
                        tile.elevation = 2;
                        break;
                    case 'rock':
                        tile.type = 'stone';
                        tile.elevation = 1;
                        break;
                    case 'gold_deposit':
                        tile.type = 'stone';
                        tile.elevation = 0;
                        break;
                }
                
                // Spread elevation to neighbors
                if (obj.type.toLowerCase() === 'mountain') {
                    this.spreadElevation(tileX, tileY, game.mapWidth, game.mapHeight, 2);
                }
            }
        });
        
        // Smooth transitions
        this.smoothTerrainTransitions(game);
    }
    
    spreadElevation(x, y, width, height, maxElevation) {
        const directions = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [1,1], [-1,1], [1,-1]];
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const tile = this.terrainMap[ny][nx];
                if (tile.elevation < maxElevation - 1 && tile.type !== 'water') {
                    tile.elevation = Math.max(tile.elevation, maxElevation - 1);
                    if (tile.elevation >= 2) {
                        tile.type = 'stone';
                    }
                }
            }
        }
    }
    
    smoothTerrainTransitions(game) {
        // Add transition tiles between different terrain types
        for (let y = 0; y < game.mapHeight; y++) {
            for (let x = 0; x < game.mapWidth; x++) {
                const tile = this.terrainMap[y][x];
                
                // Check neighbors for water transitions
                if (tile.type === 'grass' || tile.type === 'dirt') {
                    let waterNeighbors = 0;
                    const directions = [[-1,0], [1,0], [0,-1], [0,1]];
                    
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < game.mapWidth && ny >= 0 && ny < game.mapHeight) {
                            if (this.terrainMap[ny][nx].type === 'water') {
                                waterNeighbors++;
                            }
                        }
                    }
                    
                    if (waterNeighbors > 0) {
                        tile.type = 'sand';
                        tile.elevation = 0;
                    }
                }
            }
        }
    }
    
    getTextureForTile(tile) {
        switch(tile.type) {
            case 'water':
                return this.textures.water;
            case 'bridge':
                return this.textures.bridge;
            case 'grass':
                return tile.variant === 0 ? this.textures.grass : this.textures.darkGrass;
            case 'forest':
                return this.textures.forest;
            case 'dirt':
                return this.textures.dirt;
            case 'stone':
                return this.textures.stone;
            case 'mountain':
                return tile.elevation >= 3 ? this.textures.snow : this.textures.mountain;
            case 'sand':
                return this.textures.sand;
            case 'snow':
                return this.textures.snow;
            default:
                return this.textures.grass;
        }
    }
    
    getTerrainColor(tile) {
        switch(tile.type) {
            case 'water':
                return tile.elevation < -1 ? this.terrainColors.deepWater : this.terrainColors.water;
            case 'bridge':
                return this.terrainColors.dirt;
            case 'grass':
                return tile.variant === 0 ? this.terrainColors.grass : this.terrainColors.darkGrass;
            case 'forest':
                return this.terrainColors.forest;
            case 'dirt':
                return this.terrainColors.dirt;
            case 'stone':
                return this.terrainColors.stone;
            case 'mountain':
                return tile.elevation >= 3 ? this.terrainColors.snow : this.terrainColors.mountain;
            case 'sand':
                return this.terrainColors.sand;
            case 'snow':
                return this.terrainColors.snow;
            default:
                return this.terrainColors.grass;
        }
    }
    

    
    drawUnit(unit) {
        const screenX = this.worldToScreenX(unit.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(unit.y * CONFIG.TILE_SIZE);
        const size = CONFIG.TILE_SIZE * this.camera.zoom;
        
        const unitData = UNIT_TYPES[unit.type.toUpperCase()];
        
        // Draw unit circle background
        this.ctx.fillStyle = unit.owner === 'player' ? CONFIG.PLAYER_COLOR : CONFIG.ENEMY_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw colored inner circle
        this.ctx.fillStyle = unitData.color || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size / 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw icon using Font Awesome or Game Icons
        this.drawIcon(screenX, screenY, size * 0.6, unitData.iconClass, '#ffffff');
        
        // Draw health bar
        this.drawHealthBar(screenX, screenY - size * 0.7, size, unit.stats.health, unit.stats.maxHealth);
        
        // Draw selection indicator
        if (unit.selected) {
            this.ctx.strokeStyle = CONFIG.SELECTION_COLOR;
            this.ctx.lineWidth = CONFIG.SELECTION_WIDTH;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw path if moving
        if (unit.path.length > 0 && unit.selected) {
            this.drawPath(unit.path);
        }
    }
    
    drawTerrainObject(obj) {
        const screenX = this.worldToScreenX(obj.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(obj.y * CONFIG.TILE_SIZE);
        const size = CONFIG.TILE_SIZE * obj.size * this.camera.zoom;
        
        const objData = TERRAIN_OBJECTS[obj.type.toUpperCase()];
        
        // Skip drawing water and bridges (already rendered as terrain)
        if (obj.type.toLowerCase() === 'water' || obj.type.toLowerCase() === 'bridge') {
            return;
        }
        
        // Draw background for resources
        if (obj.objectType === 'resource' && obj.harvestable) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size / 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw obstacle background
        if (obj.objectType === 'obstacle' && obj.blocking) {
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        }
        
        // Draw icon
        this.drawIcon(screenX, screenY, size * 0.8, objData.iconClass, objData.color);
        
        // Draw resource amount if harvestable
        if (obj.harvestable && obj.resource) {
            const percentage = obj.remainingResource / obj.resource.maxAmount;
            if (percentage < 1) {
                this.drawHealthBar(screenX, screenY + size * 0.6, size, obj.remainingResource, obj.resource.maxAmount);
            }
        }
        
        // Draw health for destructible obstacles
        if (obj.canDestroy && obj.health < obj.maxHealth) {
            this.drawHealthBar(screenX, screenY - size * 0.6, size, obj.health, obj.maxHealth);
        }
    }
    
    drawBuilding(building) {
        const screenX = this.worldToScreenX(building.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(building.y * CONFIG.TILE_SIZE);
        const size = CONFIG.TILE_SIZE * building.size * this.camera.zoom;
        
        const buildingData = BUILDING_TYPES[building.type.toUpperCase()];
        
        // Draw building base
        this.ctx.fillStyle = building.owner === 'player' ? CONFIG.PLAYER_COLOR : CONFIG.ENEMY_COLOR;
        this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        
        // Draw colored inner rectangle
        this.ctx.fillStyle = buildingData.color || '#ffffff';
        const innerSize = size * 0.8;
        this.ctx.fillRect(screenX - innerSize / 2, screenY - innerSize / 2, innerSize, innerSize);
        
        // Draw building icon
        this.drawIcon(screenX, screenY, size * 0.6, buildingData.iconClass, '#ffffff');
        
        // Draw health bar
        this.drawHealthBar(screenX, screenY - size * 0.6, size, building.stats.health, building.stats.maxHealth);
        
        // Draw selection indicator
        if (building.selected) {
            this.ctx.strokeStyle = CONFIG.SELECTION_COLOR;
            this.ctx.lineWidth = CONFIG.SELECTION_WIDTH;
            this.ctx.strokeRect(screenX - size / 2 - 3, screenY - size / 2 - 3, size + 6, size + 6);
        }
        
        // Draw production progress
        if (building.currentProduction) {
            const unitType = UNIT_TYPES[building.currentProduction.toUpperCase()];
            const progress = building.productionProgress / unitType.buildTime;
            this.drawProgressBar(screenX, screenY + size * 0.6, size, progress);
        }
    }
    
    drawHealthBar(x, y, width, current, max) {
        const barWidth = width;
        const barHeight = 4;
        const percentage = current / max;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
        
        // Health
        const healthColor = percentage > 0.5 ? '#2ecc71' : percentage > 0.25 ? '#f39c12' : '#e74c3c';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(x - barWidth / 2, y, barWidth * percentage, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
    }
    
    drawProgressBar(x, y, width, progress) {
        const barWidth = width;
        const barHeight = 6;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
        
        // Progress
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(x - barWidth / 2, y, barWidth * progress, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
    }
    
    drawPath(path) {
        if (path.length < 2) return;
        
        this.ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        const start = path[0];
        this.ctx.moveTo(
            this.worldToScreenX(start.x * CONFIG.TILE_SIZE),
            this.worldToScreenY(start.y * CONFIG.TILE_SIZE)
        );
        
        for (let i = 1; i < path.length; i++) {
            const point = path[i];
            this.ctx.lineTo(
                this.worldToScreenX(point.x * CONFIG.TILE_SIZE),
                this.worldToScreenY(point.y * CONFIG.TILE_SIZE)
            );
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawSelections(game) {
        // Draw selection rectangle if dragging
        if (game.input.dragStart) {
            this.ctx.strokeStyle = CONFIG.SELECTION_COLOR;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            
            const x = Math.min(game.input.dragStart.x, game.input.mouseX);
            const y = Math.min(game.input.dragStart.y, game.input.mouseY);
            const width = Math.abs(game.input.mouseX - game.input.dragStart.x);
            const height = Math.abs(game.input.mouseY - game.input.dragStart.y);
            
            this.ctx.strokeRect(x, y, width, height);
            this.ctx.setLineDash([]);
        }
    }
    
    drawBuildingPreview(game) {
        const buildingData = BUILDING_TYPES[game.buildingPlacementMode.toUpperCase()];
        const worldX = Math.floor(this.screenToWorldX(game.input.mouseX) / CONFIG.TILE_SIZE);
        const worldY = Math.floor(this.screenToWorldY(game.input.mouseY) / CONFIG.TILE_SIZE);
        
        const screenX = this.worldToScreenX(worldX * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(worldY * CONFIG.TILE_SIZE);
        const size = CONFIG.TILE_SIZE * buildingData.size * this.camera.zoom;
        
        // Check if valid location
        const isValid = game.isValidBuildLocation(worldX, worldY, buildingData.size);
        
        // Draw preview
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = isValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        
        // Draw icon
        this.ctx.globalAlpha = 0.8;
        this.drawIcon(screenX, screenY, size * 0.6, buildingData.iconClass, isValid ? '#00ff00' : '#ff0000');
        
        // Draw border
        this.ctx.strokeStyle = isValid ? '#00ff00' : '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawEffects() {
        this.effects = this.effects.filter(effect => {
            effect.age += 16; // Assuming 60 FPS
            
            if (effect.age > effect.lifetime) {
                return false;
            }
            
            const alpha = 1 - (effect.age / effect.lifetime);
            
            switch (effect.type) {
                case 'damage':
                    this.drawDamageText(effect, alpha);
                    break;
                case 'attack':
                    // Attack animation removed - damage number is enough
                    break;
                case 'attack':
                    this.drawAttackEffect(effect, alpha);
                    break;
                case 'resource':
                    this.drawResourceText(effect, alpha);
                    break;
            }
            
            return true;
        });
    }
    
    drawDamageText(effect, alpha) {
        const screenX = this.worldToScreenX(effect.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(effect.y * CONFIG.TILE_SIZE) - effect.age / 10;
        
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
        this.ctx.fillText(`-${effect.value}`, screenX, screenY);
    }
    
    drawHealText(effect, alpha) {
        const screenX = this.worldToScreenX(effect.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(effect.y * CONFIG.TILE_SIZE) - effect.age / 10;
        
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
        this.ctx.fillText(`+${effect.value}`, screenX, screenY);
    }
    
    drawAttackEffect(effect, alpha) {
        const startX = this.worldToScreenX(effect.x * CONFIG.TILE_SIZE);
        const startY = this.worldToScreenY(effect.y * CONFIG.TILE_SIZE);
        const endX = this.worldToScreenX(effect.targetX * CONFIG.TILE_SIZE);
        const endY = this.worldToScreenY(effect.targetY * CONFIG.TILE_SIZE);
        
        this.ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }
    
    drawResourceText(effect, alpha) {
        const screenX = this.worldToScreenX(effect.x * CONFIG.TILE_SIZE);
        const screenY = this.worldToScreenY(effect.y * CONFIG.TILE_SIZE) - effect.age / 10;
        
        const resourceIcons = {
            gold: '💰',
            wood: '🌲',
            mana: '⚡'
        };
        
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        this.ctx.fillText(`${resourceIcons[effect.resourceType] || ''} +${effect.value}`, screenX, screenY);
    }
    
    drawMinimap(game) {
        const ctx = this.minimapCtx;
        const width = this.minimapCanvas.width;
        const height = this.minimapCanvas.height;
        
        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Scale factor
        const scaleX = width / game.mapWidth;
        const scaleY = height / game.mapHeight;
        
        // Draw terrain objects
        game.terrainObjects.forEach(obj => {
            if (obj.objectType === 'resource') {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
            } else if (obj.blocking) {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            } else {
                return;
            }
            ctx.fillRect(
                obj.x * scaleX - 1,
                obj.y * scaleY - 1,
                2, 2
            );
        });
        
        // Draw units
        game.units.forEach(unit => {
            if (unit.state === 'dead') return;
            
            ctx.fillStyle = unit.owner === 'player' ? CONFIG.PLAYER_COLOR : CONFIG.ENEMY_COLOR;
            ctx.fillRect(
                unit.x * scaleX - 1,
                unit.y * scaleY - 1,
                3, 3
            );
        });
        
        // Draw buildings
        game.buildings.forEach(building => {
            ctx.fillStyle = building.owner === 'player' ? CONFIG.PLAYER_COLOR : CONFIG.ENEMY_COLOR;
            ctx.fillRect(
                building.x * scaleX - 2,
                building.y * scaleY - 2,
                5, 5
            );
        });
        
        // Draw camera view
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.camera.x * scaleX / CONFIG.TILE_SIZE,
            this.camera.y * scaleY / CONFIG.TILE_SIZE,
            (this.canvas.width / this.camera.zoom) * scaleX / CONFIG.TILE_SIZE,
            (this.canvas.height / this.camera.zoom) * scaleY / CONFIG.TILE_SIZE
        );
    }
    
    addEffect(type, x, y, value = 0, targetX = 0, targetY = 0, resourceType = null) {
        this.effects.push({
            type,
            x,
            y,
            value,
            targetX,
            targetY,
            resourceType,
            age: 0,
            lifetime: 1000
        });
    }
    
    worldToScreenX(worldX) {
        return (worldX - this.camera.x) * this.camera.zoom;
    }
    
    worldToScreenY(worldY) {
        return (worldY - this.camera.y) * this.camera.zoom;
    }
    
    screenToWorldX(screenX) {
        return (screenX / this.camera.zoom) + this.camera.x;
    }
    
    screenToWorldY(screenY) {
        return (screenY / this.camera.zoom) + this.camera.y;
    }
    
    moveCamera(dx, dy) {
        this.camera.x += dx / this.camera.zoom;
        this.camera.y += dy / this.camera.zoom;
        
        // Clamp camera
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(0, this.camera.y);
    }
    
    setZoom(zoom) {
        this.camera.zoom = Math.max(CONFIG.ZOOM_MIN, Math.min(CONFIG.ZOOM_MAX, zoom));
    }
    
    drawIcon(x, y, size, iconClass, color) {
        // Parse icon class
        const isGameIcon = iconClass.includes('gi-');
        const iconName = iconClass.split(' ').pop().replace('fa-', '').replace('gi-', '');
        
        // Use simpler geometric shapes for now since loading web fonts in canvas is complex
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        // Draw based on icon type
        const halfSize = size / 2;
        
        // Simplified icon mapping using basic shapes
        switch(iconName) {
            // Units
            case 'shield': // Knight
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - halfSize);
                this.ctx.lineTo(x + halfSize, y);
                this.ctx.lineTo(x, y + halfSize);
                this.ctx.lineTo(x - halfSize, y);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'wizard-staff': // Wizard
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('✦', x, y);
                break;
                
            case 'high-shot': // Archer
                this.ctx.beginPath();
                this.ctx.moveTo(x - halfSize * 0.5, y - halfSize);
                this.ctx.lineTo(x + halfSize, y);
                this.ctx.lineTo(x - halfSize * 0.5, y + halfSize);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(x - halfSize * 0.5, y, halfSize * 0.3, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'war-pick': // Dwarf
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⚒', x, y);
                break;
                
            case 'elf-ear': // Elf
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('♣', x, y);
                break;
                
            case 'crown': // Princess
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('♛', x, y);
                break;
                
            // Buildings
            case 'castle':
                this.ctx.fillRect(x - halfSize, y - halfSize * 0.5, size, size * 0.5);
                this.ctx.fillRect(x - halfSize * 0.3, y - halfSize, halfSize * 0.6, halfSize * 0.5);
                this.ctx.fillRect(x + halfSize * 0.3, y - halfSize, halfSize * 0.3, halfSize * 0.5);
                this.ctx.fillRect(x - halfSize * 0.9, y - halfSize, halfSize * 0.3, halfSize * 0.5);
                break;
                
            case 'stone-tower':
                this.ctx.fillRect(x - halfSize * 0.4, y - halfSize, halfSize * 0.8, size);
                this.ctx.beginPath();
                this.ctx.moveTo(x - halfSize * 0.6, y - halfSize);
                this.ctx.lineTo(x, y - halfSize * 1.3);
                this.ctx.lineTo(x + halfSize * 0.6, y - halfSize);
                this.ctx.fill();
                break;
                
            case 'wooden-door':
            case 'mining':
            case 'wood-axe':
            case 'well':
                this.ctx.fillRect(x - halfSize * 0.7, y - halfSize * 0.7, size * 0.7, size * 0.7);
                break;
                
            case 'magic-swirl':
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('✨', x, y);
                break;
                
            // Terrain
            case 'gold-bar':
                this.ctx.fillRect(x - halfSize * 0.8, y - halfSize * 0.4, size * 0.8, size * 0.4);
                this.ctx.fillRect(x - halfSize * 0.6, y - halfSize * 0.7, size * 0.6, size * 0.3);
                break;
                
            case 'oak':
            case 'pine-tree':
                this.ctx.beginPath();
                this.ctx.arc(x, y - halfSize * 0.2, halfSize * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillRect(x - halfSize * 0.15, y + halfSize * 0.3, halfSize * 0.3, halfSize * 0.5);
                break;
                
            case 'crystal-shine':
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - halfSize);
                this.ctx.lineTo(x + halfSize * 0.4, y);
                this.ctx.lineTo(x, y + halfSize);
                this.ctx.lineTo(x - halfSize * 0.4, y);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'mountain-cave':
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - halfSize);
                this.ctx.lineTo(x + halfSize, y + halfSize);
                this.ctx.lineTo(x - halfSize, y + halfSize);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'stone-pile':
            case 'water-drop':
                this.ctx.beginPath();
                this.ctx.arc(x, y, halfSize, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            default:
                // Fallback: draw circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, halfSize, 0, Math.PI * 2);
                this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    getIconCharacter(iconClass) {
        // This method is no longer needed with the new drawing approach
        return '●';
    }
}
