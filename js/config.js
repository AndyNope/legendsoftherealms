// Game Configuration
const CONFIG = {
    // Canvas Settings
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    TILE_SIZE: 32,
    
    // Game Settings
    FPS: 60,
    SCROLL_SPEED: 10,
    ZOOM_MIN: 0.5,
    ZOOM_MAX: 2.0,
    
    // Resources
    STARTING_GOLD: 500,
    STARTING_WOOD: 300,
    STARTING_MANA: 200,
    
    // Unit Colors
    PLAYER_COLOR: '#3498db',
    ENEMY_COLOR: '#e74c3c',
    NEUTRAL_COLOR: '#95a5a6',
    
    // Selection
    SELECTION_COLOR: '#2ecc71',
    SELECTION_WIDTH: 2,
    
    // Fog of War
    FOG_ENABLED: true,
    VISION_RADIUS: 5
};

// Unit Types Definition
const UNIT_TYPES = {
    KNIGHT: {
        id: 'knight',
        name: 'Heiliger Ritter',
        icon: 'shield',
        iconType: 'fa', // Font Awesome
        iconClass: 'fa-solid fa-shield',
        color: '#c0c0c0',
        type: 'melee',
        cost: { gold: 100, wood: 0, mana: 0 },
        stats: {
            maxHealth: 150,
            health: 150,
            maxMana: 50,
            mana: 50,
            attack: 20,
            defense: 15,
            speed: 2,
            attackRange: 1,
            visionRange: 6
        },
        abilities: ['shield_bash', 'holy_strike'],
        buildTime: 3000,
        description: 'Starker Nahkampf-Krieger mit hoher Verteidigung'
    },
    WIZARD: {
        id: 'wizard',
        name: 'Zauberer',
        icon: 'wizard',
        iconType: 'gi', // Game Icons
        iconClass: 'gi gi-wizard-staff',
        color: '#9b59b6',
        type: 'ranged',
        cost: { gold: 120, wood: 0, mana: 50 },
        stats: {
            maxHealth: 80,
            health: 80,
            maxMana: 200,
            mana: 200,
            attack: 30,
            defense: 5,
            speed: 1.5,
            attackRange: 5,
            visionRange: 7
        },
        abilities: ['fireball', 'ice_blast', 'teleport'],
        buildTime: 4000,
        description: 'Mächtiger Fernkämpfer mit verheerenden Zaubersprüchen'
    },
    ARCHER: {
        id: 'archer',
        name: 'Bogenschütze',
        icon: 'bow',
        iconType: 'gi',
        iconClass: 'gi gi-high-shot',
        color: '#27ae60',
        type: 'ranged',
        cost: { gold: 80, wood: 30, mana: 0 },
        stats: {
            maxHealth: 100,
            health: 100,
            maxMana: 0,
            mana: 0,
            attack: 15,
            defense: 8,
            speed: 2.5,
            attackRange: 6,
            visionRange: 8
        },
        abilities: ['rapid_shot', 'poison_arrow'],
        buildTime: 2500,
        description: 'Schneller Fernkämpfer mit großer Reichweite'
    },
    DWARF: {
        id: 'dwarf',
        name: 'Zwerg',
        icon: 'hammer',
        iconType: 'gi',
        iconClass: 'gi gi-war-pick',
        color: '#d35400',
        type: 'melee',
        cost: { gold: 90, wood: 0, mana: 0 },
        stats: {
            maxHealth: 180,
            health: 180,
            maxMana: 0,
            mana: 0,
            attack: 18,
            defense: 20,
            speed: 1.5,
            attackRange: 1,
            visionRange: 5
        },
        abilities: ['mining', 'ground_slam'],
        buildTime: 3500,
        description: 'Robuster Kämpfer, kann Ressourcen schneller sammeln'
    },
    ELF: {
        id: 'elf',
        name: 'Elfe',
        icon: 'elf',
        iconType: 'gi',
        iconClass: 'gi gi-elf-ear',
        color: '#1abc9c',
        type: 'ranged',
        cost: { gold: 110, wood: 20, mana: 30 },
        stats: {
            maxHealth: 90,
            health: 90,
            maxMana: 100,
            mana: 100,
            attack: 18,
            defense: 10,
            speed: 3,
            attackRange: 5,
            visionRange: 9
        },
        abilities: ['heal', 'nature_blessing', 'swift_shot'],
        buildTime: 3000,
        description: 'Schnelle Einheit mit Heil- und Unterstützungsfähigkeiten'
    },
    PRINCESS: {
        id: 'princess',
        name: 'Prinzessin',
        icon: 'crown',
        iconType: 'fa',
        iconClass: 'fa-solid fa-crown',
        color: '#f39c12',
        type: 'support',
        cost: { gold: 150, wood: 0, mana: 100 },
        stats: {
            maxHealth: 120,
            health: 120,
            maxMana: 150,
            mana: 150,
            attack: 10,
            defense: 12,
            speed: 2,
            attackRange: 1,
            visionRange: 7
        },
        abilities: ['inspire', 'divine_protection', 'royal_command'],
        buildTime: 5000,
        description: 'Führungsfigur, die verbündete Einheiten stärkt'
    }
};

// Abilities Definition
const ABILITIES = {
    shield_bash: {
        name: 'Schildstoß',
        icon: '🛡️',
        manaCost: 20,
        cooldown: 5000,
        effect: 'stun',
        duration: 2000,
        damage: 15
    },
    holy_strike: {
        name: 'Heiliger Schlag',
        icon: '✨',
        manaCost: 30,
        cooldown: 8000,
        effect: 'damage',
        damage: 50
    },
    fireball: {
        name: 'Feuerball',
        icon: '🔥',
        manaCost: 40,
        cooldown: 6000,
        effect: 'damage',
        damage: 60,
        aoe: 2
    },
    ice_blast: {
        name: 'Eisstoß',
        icon: '❄️',
        manaCost: 35,
        cooldown: 7000,
        effect: 'slow',
        duration: 3000,
        damage: 30
    },
    teleport: {
        name: 'Teleport',
        icon: '✴️',
        manaCost: 50,
        cooldown: 15000,
        effect: 'teleport',
        range: 10
    },
    rapid_shot: {
        name: 'Schnellschuss',
        icon: '💨',
        manaCost: 0,
        cooldown: 3000,
        effect: 'attack_speed',
        duration: 5000
    },
    poison_arrow: {
        name: 'Giftpfeil',
        icon: '☠️',
        manaCost: 0,
        cooldown: 10000,
        effect: 'poison',
        damage: 10,
        duration: 5000
    },
    mining: {
        name: 'Bergbau',
        icon: '⛏️',
        manaCost: 0,
        cooldown: 0,
        effect: 'gather',
        bonus: 2
    },
    ground_slam: {
        name: 'Erdschlag',
        icon: '💥',
        manaCost: 0,
        cooldown: 12000,
        effect: 'stun',
        aoe: 2,
        duration: 1500,
        damage: 25
    },
    heal: {
        name: 'Heilung',
        icon: '💚',
        manaCost: 40,
        cooldown: 8000,
        effect: 'heal',
        amount: 60
    },
    nature_blessing: {
        name: 'Segen der Natur',
        icon: '🍃',
        manaCost: 60,
        cooldown: 20000,
        effect: 'buff',
        duration: 10000,
        bonus: 1.5
    },
    swift_shot: {
        name: 'Flinker Schuss',
        icon: '➡️',
        manaCost: 30,
        cooldown: 5000,
        effect: 'damage',
        damage: 35
    },
    inspire: {
        name: 'Inspiration',
        icon: '⭐',
        manaCost: 50,
        cooldown: 15000,
        effect: 'buff',
        duration: 8000,
        bonus: 1.3,
        aoe: 5
    },
    divine_protection: {
        name: 'Göttlicher Schutz',
        icon: '🛡️',
        manaCost: 70,
        cooldown: 25000,
        effect: 'shield',
        duration: 10000,
        amount: 100
    },
    royal_command: {
        name: 'Königlicher Befehl',
        icon: '👑',
        manaCost: 80,
        cooldown: 30000,
        effect: 'control',
        duration: 5000
    }
};

// Building Types
const BUILDING_TYPES = {
    CASTLE: {
        id: 'castle',
        name: 'Burg',
        icon: 'castle',
        iconType: 'gi',
        iconClass: 'gi gi-castle',
        color: '#3498db',
        cost: { gold: 0, wood: 0, mana: 0 },
        stats: {
            maxHealth: 1000,
            health: 1000,
            defense: 50
        },
        canProduce: ['knight', 'wizard', 'archer', 'dwarf', 'elf', 'princess'],
        size: 2
    },
    TOWER: {
        id: 'tower',
        name: 'Abwehrturm',
        icon: 'tower',
        iconType: 'gi',
        iconClass: 'gi gi-stone-tower',
        color: '#7f8c8d',
        cost: { gold: 150, wood: 100, mana: 0 },
        stats: {
            maxHealth: 300,
            health: 300,
            defense: 30,
            attack: 25,
            attackRange: 8
        },
        size: 1,
        description: 'Automatischer Verteidigungsturm'
    },
    BARRACKS: {
        id: 'barracks',
        name: 'Kaserne',
        icon: 'barracks',
        iconType: 'gi',
        iconClass: 'gi gi-wooden-door',
        color: '#8b4513',
        cost: { gold: 200, wood: 150, mana: 0 },
        stats: {
            maxHealth: 400,
            health: 400,
            defense: 20
        },
        canProduce: ['knight', 'archer', 'dwarf'],
        size: 2,
        description: 'Trainiert Nahkämpfer und Bogenschützen'
    },
    MAGIC_TOWER: {
        id: 'magic_tower',
        name: 'Magierschule',
        icon: 'magic',
        iconType: 'gi',
        iconClass: 'gi gi-magic-swirl',
        color: '#8e44ad',
        cost: { gold: 250, wood: 100, mana: 100 },
        stats: {
            maxHealth: 350,
            health: 350,
            defense: 15
        },
        canProduce: ['wizard', 'elf', 'princess'],
        size: 2,
        description: 'Beschwört magische Einheiten',
        generatesResource: { type: 'mana', amount: 5, interval: 3000 }
    },
    GOLD_MINE: {
        id: 'gold_mine',
        name: 'Goldmine',
        icon: 'mine',
        iconType: 'gi',
        iconClass: 'gi gi-mining',
        color: '#f1c40f',
        cost: { gold: 100, wood: 50, mana: 0 },
        stats: {
            maxHealth: 250,
            health: 250,
            defense: 10
        },
        size: 1,
        description: 'Generiert Gold über Zeit',
        generatesResource: { type: 'gold', amount: 10, interval: 5000 },
        requiresNearby: 'gold_deposit'
    },
    LUMBER_MILL: {
        id: 'lumber_mill',
        name: 'Holzfällerlager',
        icon: 'lumber',
        iconType: 'gi',
        iconClass: 'gi gi-wood-axe',
        color: '#795548',
        cost: { gold: 80, wood: 30, mana: 0 },
        stats: {
            maxHealth: 200,
            health: 200,
            defense: 10
        },
        size: 1,
        description: 'Generiert Holz über Zeit',
        generatesResource: { type: 'wood', amount: 8, interval: 4000 },
        requiresNearby: 'forest'
    },
    MANA_WELL: {
        id: 'mana_well',
        name: 'Mana-Brunnen',
        icon: 'well',
        iconType: 'gi',
        iconClass: 'gi gi-well',
        color: '#3498db',
        cost: { gold: 150, wood: 50, mana: 50 },
        stats: {
            maxHealth: 200,
            health: 200,
            defense: 15
        },
        size: 1,
        description: 'Generiert Mana über Zeit',
        generatesResource: { type: 'mana', amount: 6, interval: 4000 }
    }
};

// Terrain Resources and Obstacles
const TERRAIN_OBJECTS = {
    // Resources
    GOLD_DEPOSIT: {
        id: 'gold_deposit',
        name: 'Goldvorkommen',
        icon: 'gold',
        iconType: 'gi',
        iconClass: 'gi gi-gold-bar',
        color: '#f1c40f',
        type: 'resource',
        harvestable: true,
        resource: { type: 'gold', amount: 50, maxAmount: 500 },
        blocking: false,
        size: 1
    },
    FOREST: {
        id: 'forest',
        name: 'Wald',
        icon: 'tree',
        iconType: 'gi',
        iconClass: 'gi gi-oak',
        color: '#27ae60',
        type: 'resource',
        harvestable: true,
        resource: { type: 'wood', amount: 30, maxAmount: 300 },
        blocking: false,
        size: 1
    },
    MANA_CRYSTAL: {
        id: 'mana_crystal',
        name: 'Mana-Kristall',
        icon: 'crystal',
        iconType: 'gi',
        iconClass: 'gi gi-crystal-shine',
        color: '#9b59b6',
        type: 'resource',
        harvestable: true,
        resource: { type: 'mana', amount: 40, maxAmount: 200 },
        blocking: false,
        size: 1
    },
    
    // Obstacles
    MOUNTAIN: {
        id: 'mountain',
        name: 'Berg',
        icon: 'mountain',
        iconType: 'gi',
        iconClass: 'gi gi-mountain-cave',
        color: '#95a5a6',
        type: 'obstacle',
        blocking: true,
        size: 2
    },
    ROCK: {
        id: 'rock',
        name: 'Felsen',
        icon: 'rock',
        iconType: 'gi',
        iconClass: 'gi gi-stone-pile',
        color: '#7f8c8d',
        type: 'obstacle',
        blocking: true,
        size: 1
    },
    WATER: {
        id: 'water',
        name: 'Wasser',
        icon: 'water',
        iconType: 'gi',
        iconClass: 'gi gi-water-drop',
        color: '#3498db',
        type: 'obstacle',
        blocking: true,
        size: 1
    },
    TREE: {
        id: 'tree',
        name: 'Baum',
        icon: 'tree',
        iconType: 'gi',
        iconClass: 'gi gi-pine-tree',
        color: '#27ae60',
        type: 'obstacle',
        blocking: true,
        size: 1,
        canDestroy: true,
        health: 50
    },
    BRIDGE: {
        id: 'bridge',
        name: 'Brücke',
        icon: 'bridge',
        iconType: 'gi',
        iconClass: 'gi gi-stone-bridge',
        color: '#8b7355',
        type: 'structure',
        blocking: false,
        size: 1,
        overWater: true
    }
};
