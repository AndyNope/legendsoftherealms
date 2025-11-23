// AI Controller
class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.updateInterval = 1000; // Update AI every second
        this.lastUpdate = 0;
        
        // AI State
        this.strategy = 'balanced'; // aggressive, defensive, balanced
        this.targetPriority = [];
        this.buildQueue = [];
        this.attackWaves = [];
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                reactionTime: 2000,
                accuracy: 0.6,
                aggression: 0.1,
                resourceBonus: 1.0,
                buildPriority: 'economy',
                attackThreshold: 8
            },
            medium: {
                reactionTime: 1000,
                accuracy: 0.8,
                aggression: 0.4,
                resourceBonus: 1.2,
                buildPriority: 'balanced',
                attackThreshold: 5
            },
            hard: {
                reactionTime: 500,
                accuracy: 0.95,
                aggression: 0.9,
                resourceBonus: 1.5,
                buildPriority: 'aggressive',
                attackThreshold: 3
            }
        };
        
        this.settings = this.difficultySettings[difficulty];
    }
    
    update(deltaTime) {
        this.lastUpdate += deltaTime;
        
        if (this.lastUpdate < this.updateInterval) return;
        
        this.lastUpdate = 0;
        
        // Main AI decision making
        this.assessSituation();
        this.manageEconomy();
        this.manageArmy();
        this.executeStrategy();
    }
    
    assessSituation() {
        const playerUnits = game.units.filter(u => u.owner === 'player' && u.state !== 'dead');
        const enemyUnits = game.units.filter(u => u.owner === 'enemy' && u.state !== 'dead');
        
        const playerStrength = this.calculateArmyStrength(playerUnits);
        const enemyStrength = this.calculateArmyStrength(enemyUnits);
        
        // Adjust strategy based on relative strength
        if (enemyStrength < playerStrength * 0.5) {
            this.strategy = 'defensive';
        } else if (enemyStrength > playerStrength * 1.5) {
            this.strategy = 'aggressive';
        } else {
            this.strategy = 'balanced';
        }
    }
    
    calculateArmyStrength(units) {
        return units.reduce((total, unit) => {
            return total + unit.stats.health + unit.stats.attack * 2;
        }, 0);
    }
    
    manageEconomy() {
        // Gather resources first if needed
        this.manageResourceGathering();
        
        // Build units based on resources
        const castle = game.buildings.find(b => b.owner === 'enemy' && b.type === 'castle');
        if (!castle) return;
        
        // Check if we can afford units
        if (game.enemyResources.gold >= 100) {
            const unitsToBuild = this.decideUnitsToBuild();
            
            unitsToBuild.forEach(unitType => {
                const cost = UNIT_TYPES[unitType.toUpperCase()].cost;
                if (this.canAfford(cost)) {
                    castle.queueProduction(unitType);
                    this.spendResources(cost);
                }
            });
        }
    }
    
    manageResourceGathering() {
        // Find available resources
        const goldDeposits = game.terrainObjects.filter(obj => 
            obj.type === 'gold_deposit' && !obj.depleted
        );
        const manaDeposits = game.terrainObjects.filter(obj => 
            obj.type === 'mana_crystal' && !obj.depleted
        );
        
        // Get enemy units that are idle
        const idleUnits = game.units.filter(u => 
            u.owner === 'enemy' && 
            u.state === 'idle' && 
            !u.target
        );
        
        // Assign more units to gather resources based on difficulty
        let gathererPercentage = 0.5; // Default 50%
        if (this.difficulty === 'easy') {
            gathererPercentage = 0.6; // 60% on easy
        } else if (this.difficulty === 'medium') {
            gathererPercentage = 0.5; // 50% on medium
        } else if (this.difficulty === 'hard') {
            gathererPercentage = 0.3; // 30% on hard (more aggressive)
        }
        
        const gathererCount = Math.floor(idleUnits.length * gathererPercentage);
        
        for (let i = 0; i < gathererCount && i < idleUnits.length; i++) {
            const unit = idleUnits[i];
            
            // Prioritize gold if low
            if (game.enemyResources.gold < 300 && goldDeposits.length > 0) {
                const nearestGold = this.findNearestResource(unit, goldDeposits);
                if (nearestGold) {
                    unit.harvestResource(nearestGold);
                }
            } else if (game.enemyResources.mana < 150 && manaDeposits.length > 0) {
                const nearestMana = this.findNearestResource(unit, manaDeposits);
                if (nearestMana) {
                    unit.harvestResource(nearestMana);
                }
            } else if (goldDeposits.length > 0) {
                const nearestGold = this.findNearestResource(unit, goldDeposits);
                if (nearestGold) {
                    unit.harvestResource(nearestGold);
                }
            }
        }
    }
    
    findNearestResource(unit, resources) {
        let nearest = null;
        let minDistance = Infinity;
        
        resources.forEach(resource => {
            const distance = unit.getDistanceTo(resource);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = resource;
            }
        });
        
        return nearest;
    }
    
    decideUnitsToBuild() {
        const enemyUnits = game.units.filter(u => u.owner === 'enemy' && u.state !== 'dead');
        const unitCounts = {};
        
        // Count current units
        enemyUnits.forEach(unit => {
            unitCounts[unit.type] = (unitCounts[unit.type] || 0) + 1;
        });
        
        const builds = [];
        
        // Build army composition based on strategy
        switch (this.strategy) {
            case 'aggressive':
                if ((unitCounts.knight || 0) < 3) builds.push('knight');
                if ((unitCounts.wizard || 0) < 2) builds.push('wizard');
                if ((unitCounts.archer || 0) < 2) builds.push('archer');
                break;
                
            case 'defensive':
                if ((unitCounts.knight || 0) < 2) builds.push('knight');
                if ((unitCounts.dwarf || 0) < 2) builds.push('dwarf');
                if ((unitCounts.archer || 0) < 3) builds.push('archer');
                break;
                
            case 'balanced':
                if ((unitCounts.knight || 0) < 2) builds.push('knight');
                if ((unitCounts.archer || 0) < 2) builds.push('archer');
                if ((unitCounts.wizard || 0) < 1) builds.push('wizard');
                if ((unitCounts.elf || 0) < 1) builds.push('elf');
                break;
        }
        
        return builds;
    }
    
    manageArmy() {
        const enemyUnits = game.units.filter(u => u.owner === 'enemy' && u.state !== 'dead');
        const playerUnits = game.units.filter(u => u.owner === 'player' && u.state !== 'dead');
        
        if (playerUnits.length === 0) return;
        
        // Check if we have enough units to attack based on difficulty
        const shouldAttack = enemyUnits.length >= this.settings.attackThreshold;
        
        enemyUnits.forEach(unit => {
            if (unit.isStunned() || unit.state === 'harvesting') return;
            
            // If unit is idle or finished moving, give new orders
            if (unit.state === 'idle' || (unit.state === 'moving' && unit.path.length === 0)) {
                // Only attack if we have enough units
                if (shouldAttack) {
                    this.giveUnitOrders(unit, playerUnits);
                }
                // Otherwise stay defensive near base
                else if (this.difficulty !== 'hard') {
                    const enemyCastle = game.buildings.find(b => b.owner === 'enemy' && b.type === 'castle');
                    if (enemyCastle) {
                        const distanceFromBase = unit.getDistanceTo(enemyCastle);
                        // Stay within 15 tiles of base
                        if (distanceFromBase > 15) {
                            unit.moveTo(enemyCastle.x, enemyCastle.y);
                        }
                    }
                }
            }
            
            // Use abilities
            if (shouldAttack) {
                this.useUnitAbilities(unit, playerUnits);
            }
        });
    }
    
    giveUnitOrders(unit, playerUnits) {
        // Find nearest target
        let nearestTarget = null;
        let nearestDistance = Infinity;
        
        playerUnits.forEach(target => {
            const distance = unit.getDistanceTo(target);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTarget = target;
            }
        });
        
        if (nearestTarget) {
            // Attack if in range, otherwise move closer
            if (nearestDistance <= unit.stats.attackRange) {
                unit.attackTarget(nearestTarget);
            } else {
                // Add some randomness to movement
                const randomOffset = {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                };
                unit.moveTo(
                    nearestTarget.x + randomOffset.x,
                    nearestTarget.y + randomOffset.y
                );
            }
        }
    }
    
    useUnitAbilities(unit, playerUnits) {
        // Simple AI ability usage
        unit.abilities.forEach(abilityId => {
            if (unit.abilityCooldowns[abilityId] > 0) return;
            
            const ability = ABILITIES[abilityId];
            if (unit.stats.mana < ability.manaCost) return;
            
            // Use healing abilities on self if health is low
            if (ability.effect === 'heal' && unit.stats.health < unit.stats.maxHealth * 0.5) {
                unit.useAbility(abilityId, unit);
                return;
            }
            
            // Use offensive abilities on nearest enemy
            if (['damage', 'stun'].includes(ability.effect)) {
                const nearestEnemy = this.findNearestEnemy(unit, playerUnits);
                if (nearestEnemy && unit.getDistanceTo(nearestEnemy) <= (ability.range || unit.stats.attackRange)) {
                    unit.useAbility(abilityId, nearestEnemy);
                }
            }
            
            // Use buff abilities
            if (ability.effect === 'buff' && Math.random() < 0.3) {
                unit.useAbility(abilityId, unit);
            }
        });
    }
    
    findNearestEnemy(unit, enemies) {
        let nearest = null;
        let minDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = unit.getDistanceTo(enemy);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    executeStrategy() {
        // Launch coordinated attacks
        if (this.strategy === 'aggressive' && Math.random() < this.settings.aggression) {
            this.launchAttackWave();
        }
    }
    
    launchAttackWave() {
        const enemyUnits = game.units.filter(u => u.owner === 'enemy' && u.state !== 'dead');
        const playerBuildings = game.buildings.filter(b => b.owner === 'player');
        
        if (enemyUnits.length < 3 || playerBuildings.length === 0) return;
        
        // Target player castle
        const targetBuilding = playerBuildings[0];
        
        // Send all units to attack
        enemyUnits.forEach(unit => {
            unit.moveTo(targetBuilding.x, targetBuilding.y);
        });
    }
    
    canAfford(cost) {
        return game.enemyResources.gold >= cost.gold &&
               game.enemyResources.wood >= cost.wood &&
               game.enemyResources.mana >= cost.mana;
    }
    
    spendResources(cost) {
        game.enemyResources.gold -= cost.gold;
        game.enemyResources.wood -= cost.wood;
        game.enemyResources.mana -= cost.mana;
    }
}
