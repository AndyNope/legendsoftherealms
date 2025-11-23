// Simple A* Pathfinding
class Pathfinder {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.obstacles = [];
    }
    
    findPath(startX, startY, endX, endY) {
        // Convert to grid coordinates
        const start = {
            x: Math.floor(startX),
            y: Math.floor(startY)
        };
        const end = {
            x: Math.floor(endX),
            y: Math.floor(endY)
        };
        
        // Check if end position is valid
        if (this.isObstacle(end.x, end.y)) {
            return [];
        }
        
        const openSet = [start];
        const closedSet = [];
        const cameFrom = {};
        const gScore = {};
        const fScore = {};
        
        const key = (x, y) => `${x},${y}`;
        
        gScore[key(start.x, start.y)] = 0;
        fScore[key(start.x, start.y)] = this.heuristic(start, end);
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore[key(openSet[i].x, openSet[i].y)] < fScore[key(current.x, current.y)]) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.push(current);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                // Skip if in closed set
                if (closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    continue;
                }
                
                const tentativeGScore = gScore[key(current.x, current.y)] + 1;
                
                // Add to open set if not already there
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore[key(neighbor.x, neighbor.y)]) {
                    continue;
                }
                
                // This path is the best so far
                cameFrom[key(neighbor.x, neighbor.y)] = current;
                gScore[key(neighbor.x, neighbor.y)] = tentativeGScore;
                fScore[key(neighbor.x, neighbor.y)] = tentativeGScore + this.heuristic(neighbor, end);
            }
        }
        
        // No path found, return direct line
        return [{ x: endX, y: endY }];
    }
    
    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 },  // up
            { x: 1, y: 0 },   // right
            { x: 0, y: 1 },   // down
            { x: -1, y: 0 },  // left
            { x: 1, y: -1 },  // up-right
            { x: 1, y: 1 },   // down-right
            { x: -1, y: 1 },  // down-left
            { x: -1, y: -1 }  // up-left
        ];
        
        for (const dir of directions) {
            const x = node.x + dir.x;
            const y = node.y + dir.y;
            
            if (x >= 0 && x < this.gridWidth && 
                y >= 0 && y < this.gridHeight && 
                !this.isObstacle(x, y)) {
                neighbors.push({ x, y });
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(cameFrom, current) {
        const path = [{ x: current.x, y: current.y }];
        const key = (x, y) => `${x},${y}`;
        
        while (cameFrom[key(current.x, current.y)]) {
            current = cameFrom[key(current.x, current.y)];
            path.unshift({ x: current.x, y: current.y });
        }
        
        return path;
    }
    
    isObstacle(x, y) {
        return this.obstacles.some(obs => obs.x === x && obs.y === y);
    }
    
    addObstacle(x, y) {
        this.obstacles.push({ x, y });
    }
    
    removeObstacle(x, y) {
        this.obstacles = this.obstacles.filter(obs => obs.x !== x || obs.y !== y);
    }
    
    clearObstacles() {
        this.obstacles = [];
    }
}
