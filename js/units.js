// Unit Class
class Unit {
    constructor(type, x, y, owner) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.owner = owner; // 'player' or 'enemy'
        this.x = x;
        this.y = y;
        
        // Copy stats from unit type
        const unitData = UNIT_TYPES[type.toUpperCase()];
        this.name = unitData.name;
        this.icon = unitData.icon;
        this.unitType = unitData.type;
        this.stats = { ...unitData.stats };
        this.abilities = [...unitData.abilities];
        
        // State
        this.selected = false;
        this.target = null;
        this.path = [];
        this.state = 'idle'; // idle, moving, attacking, dead
        this.facing = 'right';
        
        // Combat
        this.attackCooldown = 0;
        this.abilityCooldowns = {};
        this.effects = []; // active effects (buffs, debuffs)
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 10;
    }
    
    update(deltaTime) {
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        for (let ability in this.abilityCooldowns) {
            if (this.abilityCooldowns[ability] > 0) {
                this.abilityCooldowns[ability] -= deltaTime;
            }
        }
        
        // Update effects
        this.effects = this.effects.filter(effect => {
            effect.duration -= deltaTime;
            if (effect.duration <= 0) {
                this.removeEffect(effect);
                return false;
            }
            return true;
        });
        
        // Update animation
        this.animationFrame += deltaTime / this.animationSpeed;
        
        // Handle state
        switch (this.state) {
            case 'idle':
                // Auto-attack: Look for nearby enemies if idle
                if (!this.isStunned()) {
                    this.lookForEnemies();
                }
                break;
            case 'moving':
                this.updateMovement(deltaTime);
                // Check for enemies while moving
                if (!this.isStunned()) {
                    this.lookForEnemies();
                }
                break;
            case 'attacking':
                this.updateAttack(deltaTime);
                break;
            case 'harvesting':
                this.updateHarvesting(deltaTime);
                break;
        }
    }
    
    lookForEnemies() {
        // Don't auto-attack if we have a specific target
        if (this.target && this.target.stats.health > 0) {
            return;
        }
        
        // Find nearest enemy
        const enemies = game.units.filter(u => 
            u.owner !== this.owner && 
            u.state !== 'dead'
        );
        
        let nearestEnemy = null;
        let nearestDistance = this.stats.visionRange || 8;
        
        for (const enemy of enemies) {
            const distance = this.getDistanceTo(enemy);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        // Attack if enemy found
        if (nearestEnemy) {
            this.attackTarget(nearestEnemy);
        }
    }
    
    updateMovement(deltaTime) {
        if (this.path.length === 0) {
            this.state = 'idle';
            // Look for enemies when movement complete
            this.lookForEnemies();
            return;
        }
        
        const target = this.path[0];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.1) {
            this.path.shift();
            if (this.path.length === 0) {
                this.state = 'idle';
                // Look for enemies when reaching waypoint
                this.lookForEnemies();
            }
            return;
        }
        
        const speed = this.stats.speed * deltaTime / 1000;
        this.x += (dx / distance) * speed;
        this.y += (dy / distance) * speed;
        
        // Update facing direction
        this.facing = dx > 0 ? 'right' : 'left';
    }
    
    updateAttack(deltaTime) {
        if (!this.target || this.target.stats.health <= 0) {
            // Target is dead, look for another nearby enemy
            this.target = null;
            this.state = 'idle';
            this.lookForEnemies();
            return;
        }
        
        const distance = this.getDistanceTo(this.target);
        
        if (distance > this.stats.attackRange) {
            // Move closer
            this.moveTo(this.target.x, this.target.y);
            return;
        }
        
        if (this.attackCooldown <= 0) {
            this.performAttack();
            this.attackCooldown = 1000; // 1 second between attacks
        }
    }
    
    performAttack() {
        if (!this.target) return;
        
        const damage = Math.max(1, this.stats.attack - this.target.stats.defense);
        this.target.takeDamage(damage, this);
        
        // Create attack animation/effect
        game.createEffect('attack', this.x, this.y, this.target.x, this.target.y);
        
        // Play attack sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playSound('attack');
        }
    }
    
    takeDamage(amount, attacker = null) {
        this.stats.health -= amount;
        
        if (this.stats.health <= 0) {
            this.stats.health = 0;
            this.die();
        } else {
            // Counter-attack if idle or harvesting and not already targeting attacker
            if (attacker && (this.state === 'idle' || this.state === 'harvesting')) {
                this.attackTarget(attacker);
            }
        }
        
        // Create damage effect
        game.createEffect('damage', this.x, this.y, amount);
    }
    
    heal(amount) {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
        game.createEffect('heal', this.x, this.y, amount);
    }
    
    die() {
        this.state = 'dead';
        game.createEffect('death', this.x, this.y);
    }
    
    moveTo(x, y) {
        this.path = game.findPath(this.x, this.y, x, y);
        if (this.path.length > 0) {
            this.state = 'moving';
        }
    }
    
    attackTarget(target) {
        this.target = target;
        this.state = 'attacking';
        this.harvestTarget = null;
    }
    
    updateHarvesting(deltaTime) {
        if (!this.harvestTarget || this.harvestTarget.depleted) {
            this.state = 'idle';
            this.harvestTarget = null;
            return;
        }
        
        // Check if still close enough
        const distance = this.getDistanceTo(this.harvestTarget);
        if (distance > 2) {
            this.moveTo(this.harvestTarget.x, this.harvestTarget.y);
            return;
        }
        
        // Harvest progress (2 seconds per harvest)
        if (!this.harvestProgress) this.harvestProgress = 0;
        this.harvestProgress += deltaTime;
        
        if (this.harvestProgress >= 2000) {
            // Complete harvest
            const amount = Math.min(10, this.harvestTarget.remainingResource);
            this.harvestTarget.remainingResource -= amount;
            
            if (this.harvestTarget.remainingResource <= 0) {
                this.harvestTarget.depleted = true;
            }
            
            // Add to resources
            const resources = this.owner === 'player' ? game.resources : game.enemyResources;
            const resourceType = this.harvestTarget.resourceType || this.harvestTarget.type;
            
            if (resourceType === 'gold_deposit') {
                resources.gold += amount;
                game.renderer.addEffect('resource', this.harvestTarget.x, this.harvestTarget.y, amount, 0, 0, 'gold');
            } else if (resourceType === 'mana_crystal') {
                resources.mana += amount;
                game.renderer.addEffect('resource', this.harvestTarget.x, this.harvestTarget.y, amount, 0, 0, 'mana');
            }
            
            game.updateResourceDisplay();
            
            // Reset progress and continue harvesting if resource not depleted
            this.harvestProgress = 0;
            if (this.harvestTarget.depleted) {
                this.state = 'idle';
                this.harvestTarget = null;
            }
        }
    }
    
    harvestResource(terrainObj) {
        if (!terrainObj.harvestable || terrainObj.depleted) return false;
        
        // Check if unit is close enough
        const distance = this.getDistanceTo(terrainObj);
        if (distance > 2) {
            // Move closer
            this.moveTo(terrainObj.x, terrainObj.y);
            this.state = 'harvesting';
            this.harvestTarget = terrainObj;
            return false;
        }
        
        // Set harvesting state
        this.state = 'harvesting';
        this.harvestTarget = terrainObj;
        this.harvestProgress = 0;
        
        return true;
    }
    
    useAbility(abilityId, target) {
        if (!this.abilities.includes(abilityId)) return false;
        
        const ability = ABILITIES[abilityId];
        
        // Check cooldown
        if (this.abilityCooldowns[abilityId] > 0) return false;
        
        // Check mana
        if (this.stats.mana < ability.manaCost) return false;
        
        // Use ability
        this.stats.mana -= ability.manaCost;
        this.abilityCooldowns[abilityId] = ability.cooldown;
        
        // Apply effect
        this.applyAbilityEffect(ability, target);
        
        return true;
    }
    
    applyAbilityEffect(ability, target) {
        switch (ability.effect) {
            case 'damage':
                if (ability.aoe) {
                    const units = game.getUnitsInRadius(target.x, target.y, ability.aoe, this.owner);
                    units.forEach(unit => unit.takeDamage(ability.damage));
                } else {
                    target.takeDamage(ability.damage);
                }
                break;
                
            case 'heal':
                target.heal(ability.amount);
                break;
                
            case 'buff':
                this.addEffect({
                    type: 'buff',
                    duration: ability.duration,
                    bonus: ability.bonus
                });
                break;
                
            case 'stun':
                target.addEffect({
                    type: 'stun',
                    duration: ability.duration
                });
                break;
                
            case 'teleport':
                this.x = target.x;
                this.y = target.y;
                break;
        }
        
        game.createEffect(ability.effect, this.x, this.y);
    }
    
    addEffect(effect) {
        this.effects.push(effect);
        this.applyEffect(effect);
    }
    
    applyEffect(effect) {
        // Apply effect modifications
        switch (effect.type) {
            case 'buff':
                // Effects are applied in combat calculations
                break;
            case 'stun':
                this.state = 'idle';
                this.path = [];
                break;
        }
    }
    
    removeEffect(effect) {
        // Remove effect modifications
    }
    
    getDistanceTo(target) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isStunned() {
        return this.effects.some(e => e.type === 'stun');
    }
}

// Building Class
class Building {
    constructor(type, x, y, owner) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.owner = owner;
        this.x = x;
        this.y = y;
        
        const buildingData = BUILDING_TYPES[type.toUpperCase()];
        this.name = buildingData.name;
        this.icon = buildingData.icon;
        this.stats = { ...buildingData.stats };
        this.canProduce = buildingData.canProduce || [];
        this.size = buildingData.size || 1;
        this.description = buildingData.description || '';
        
        // Resource generation
        this.generatesResource = buildingData.generatesResource || null;
        this.resourceTimer = 0;
        
        this.selected = false;
        this.productionQueue = [];
        this.currentProduction = null;
        this.productionProgress = 0;
    }
    
    update(deltaTime) {
        // Resource generation
        if (this.generatesResource && this.owner === 'player') {
            this.resourceTimer += deltaTime;
            
            if (this.resourceTimer >= this.generatesResource.interval) {
                this.resourceTimer = 0;
                
                // Add resources to player
                const resourceType = this.generatesResource.type;
                const amount = this.generatesResource.amount;
                
                if (game.resources[resourceType] !== undefined) {
                    game.resources[resourceType] += amount;
                    game.updateResourceUI();
                    
                    // Show floating text
                    game.createEffect('resource', this.x, this.y, amount, 0, 0, resourceType);
                }
            }
        }
        
        if (this.currentProduction) {
            this.productionProgress += deltaTime;
            
            const unitType = UNIT_TYPES[this.currentProduction.toUpperCase()];
            if (this.productionProgress >= unitType.buildTime) {
                this.completeProduction();
            }
        } else if (this.productionQueue.length > 0) {
            this.startProduction(this.productionQueue.shift());
        }
        
        // Tower auto-attack
        if (this.stats.attack && this.stats.attackRange) {
            this.updateTowerAttack(deltaTime);
        }
    }
    
    startProduction(unitType) {
        this.currentProduction = unitType;
        this.productionProgress = 0;
    }
    
    completeProduction() {
        // Spawn unit near building
        const spawnX = this.x + 2;
        const spawnY = this.y + 2;
        
        const unit = new Unit(this.currentProduction, spawnX, spawnY, this.owner);
        game.addUnit(unit);
        
        this.currentProduction = null;
        this.productionProgress = 0;
    }
    
    queueProduction(unitType) {
        this.productionQueue.push(unitType);
    }
    
    takeDamage(amount) {
        this.stats.health -= amount;
        
        if (this.stats.health <= 0) {
            this.stats.health = 0;
            this.destroy();
        }
    }
    
    destroy() {
        game.createEffect('destruction', this.x, this.y);
    }
    
    updateTowerAttack(deltaTime) {
        if (!this.attackCooldown) this.attackCooldown = 0;
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
            return;
        }
        
        // Find nearest enemy in range
        const enemies = game.units.filter(u => 
            u.owner !== this.owner && 
            u.state !== 'dead'
        );
        
        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) + 
                Math.pow(this.y - enemy.y, 2)
            );
            
            if (distance <= this.stats.attackRange) {
                // Attack enemy
                const damage = this.stats.attack;
                enemy.takeDamage(damage);
                
                game.createEffect('attack', this.x, this.y, enemy.x, enemy.y);
                
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.playSound('attack');
                }
                
                this.attackCooldown = 2000; // 2 seconds between attacks
                break;
            }
        }
    }
}

// Terrain Object Class (Resources & Obstacles)
class TerrainObject {
    constructor(type, x, y) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.x = x;
        this.y = y;
        
        const objData = TERRAIN_OBJECTS[type.toUpperCase()];
        this.name = objData.name;
        this.icon = objData.icon;
        this.objectType = objData.type; // 'resource', 'obstacle', or 'structure'
        this.blocking = objData.blocking;
        this.size = objData.size || 1;
        this.overWater = objData.overWater || false; // For bridges
        
        // Resource specific
        this.harvestable = objData.harvestable || false;
        if (objData.resource) {
            this.resource = { ...objData.resource };
            this.remainingResource = this.resource.maxAmount;
        }
        
        // Obstacle specific
        this.canDestroy = objData.canDestroy || false;
        this.health = objData.health || 0;
        this.maxHealth = objData.health || 0;
    }
    
    harvest(amount) {
        if (!this.harvestable || this.remainingResource <= 0) {
            return 0;
        }
        
        const harvested = Math.min(amount, this.remainingResource);
        this.remainingResource -= harvested;
        
        if (this.remainingResource <= 0) {
            this.depleted = true;
        }
        
        return harvested;
    }
    
    takeDamage(amount) {
        if (!this.canDestroy) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }
}
