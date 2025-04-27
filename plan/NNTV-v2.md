# GAME DEVELOPMENT PLAN: NIGHT NINJA - TWILIGHT VOYAGE

## PROJECT OVERVIEW

**Game Title**: Night Ninja: Twilight Voyage
**Genre**: Puzzle / Stealth / Turn-based
**Platform**: Web (Phaser 3 + Vite)
**Difficulty**: Gradually increasing

**Core Concept**: A turn-based stealth puzzle game on a grid where players control a ninja (black circle) who must navigate through levels while avoiding lit areas to rescue a princess. The twist is that in the final level, the princess cannot be rescued.

## DEVELOPMENT APPROACH

The game development will follow an incremental approach:
1. First establish core mechanics (grid movement, light detection)
2. Create the first basic level
3. Gradually introduce new enemy types with progressive levels
4. Finally, implement the special final level with the game's twist

## GAME MECHANICS

### Grid System
- Game takes place on a grid (initially 8x8, can vary by level)
- Each cell can be dark (safe) or lit (dangerous)
- Player moves one cell per turn
- Walls block movement

### Core Game Objects
- **Player**: Black circle, controlled by keyboard/touch
- **Walls**: Black squares, cannot be passed through
- **Light Areas**: Yellow squares, cause player to lose if entered
- **Goal**: Green square, reaching it completes the level
- **Guards**: Different colored triangles that create light patterns

### Guard Types (Introduce progressively)
1. **Static Guard** (Red triangle): Always illuminates fixed cells
2. **Rotating Guard** (Blue triangle): Rotates its light direction each turn
3. **Blinking Guard** (Yellow triangle): Toggles its lights on/off each turn
4. **Patrolling Guard** (Purple triangle): Moves along a predefined path

### Player Controls
- **Desktop**: Arrow keys or WASD
- **Mobile**: On-screen directional buttons
- One move per turn

## VISUAL DESIGN

The game will use simple geometric shapes instead of sprites:
- **Dark Areas**: Gray squares
- **Light Areas**: Yellow squares
- **Walls**: Black squares
- **Player**: Black circle
- **Goal**: Green square
- **Guards**: Colored triangles

No complex graphics, animations, or sounds are needed, making this a "programmer art" prototype.

## PROJECT STRUCTURE

### File Organization (Based on Phaser Vite Template)
```
src/
├── game/
│   ├── objects/           # Game objects (Player, Guards, etc.)
│   │   ├── Player.js
│   │   ├── Guard.js
│   │   ├── GridSystem.js
│   │   └── TurnManager.js
│   ├── levels/            # Level definitions
│   │   ├── LevelManager.js
│   │   └── Levels.js      # Level data
│   └── scenes/            # Phaser scenes
│       ├── Boot.js        # (already exists)
│       ├── Preloader.js   # (already exists)
│       ├── MainMenu.js    # (already exists)
│       ├── Game.js        # Main game scene
│       └── GameOver.js    # (already exists)
```

### Integration with Existing Project

The game will be integrated with the existing Phaser project structure:

1. Reuse current scene flow (Boot → Preloader → MainMenu → Game → GameOver)
2. Add new game objects and managers within the Game scene
3. Extend existing code rather than replacing it

## PHASER IMPLEMENTATION NOTES

### Using Phaser API
- Use `this.add.rectangle()` and `this.add.circle()` for grid cells and player
- Use `this.add.polygon()` for guards (triangles)
- Utilize Phaser's built-in `Container` for grouping related objects
- Use `this.add.graphics()` for drawing grid lines and other effects
- Implement `this.input.keyboard.createCursorKeys()` for player control

### GridSystem Implementation
```javascript
// In Game.js
create() {
    // Create grid cells using Phaser Rectangle objects
    this.gridCells = [];
    for (let row = 0; row < this.gridSize; row++) {
        this.gridCells[row] = [];
        for (let col = 0; col < this.gridSize; col++) {
            const x = col * this.cellSize + this.cellSize / 2;
            const y = row * this.cellSize + this.cellSize / 2;

            // Create rectangle using Phaser's API
            const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0x888888);
            cell.setStrokeStyle(1, 0x000000);

            // Store cell data
            cell.setData('isLit', false);
            cell.setData('isWall', false);
            this.gridCells[row][col] = cell;
        }
    }
}
```

### Player Implementation
```javascript
// In Game.js or Player.js
createPlayer(row, col) {
    const position = this.gridToPixel(row, col);
    this.player = this.add.circle(
        position.x,
        position.y,
        this.cellSize / 3,
        0x000000
    );
    this.player.setData('row', row);
    this.player.setData('col', col);
}

movePlayer(direction) {
    // Calculate new position based on direction
    const currentRow = this.player.getData('row');
    const currentCol = this.player.getData('col');

    let newRow = currentRow;
    let newCol = currentCol;

    // Update based on direction
    if (direction === 'up') newRow--;
    else if (direction === 'down') newRow++;
    else if (direction === 'left') newCol--;
    else if (direction === 'right') newCol++;

    // Check if valid move
    if (this.isValidMove(newRow, newCol)) {
        // Update player position
        this.player.setData('row', newRow);
        this.player.setData('col', newCol);

        // Move player sprite
        const newPos = this.gridToPixel(newRow, newCol);
        this.tweens.add({
            targets: this.player,
            x: newPos.x,
            y: newPos.y,
            duration: 100
        });

        // Handle turn progression
        this.nextTurn();
    }
}
```

## LEVEL DESIGN

### Level Progression
Each level should introduce or focus on a new gameplay element:

1. **Level 1**: Basic movement, reaching goal (no guards)
2. **Level 2**: Introduction to light areas to avoid
3. **Level 3**: Introduction to Static Guard (red)
4. **Level 4-5**: More complex layouts with Static Guards
5. **Level 6**: Introduction to Rotating Guard (blue)
6. **Level 7-8**: Combining Static and Rotating Guards
7. **Level 9**: Introduction to Blinking Guard (yellow)
8. **Level 10**: Introduction to Patrolling Guard (purple)
9. **Level 11**: Complex puzzle using all guard types
10. **Level 12**: Final level with the twist (princess can't be rescued)

### Example Level Format
```javascript
// In Levels.js
export const LEVELS = [
    {
        id: 1,
        name: "First Steps",
        grid: {
            rows: 6,
            cols: 6
        },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 4 }
        ],
        guards: [] // No guards in first level
    },
    {
        id: 2,
        name: "Lights!",
        grid: {
            rows: 6,
            cols: 6
        },
        player: { row: 0, col: 0 },
        goal: { row: 5, col: 5 },
        walls: [
            { row: 2, col: 2 },
            { row: 3, col: 3 }
        ],
        litCells: [
            { row: 2, col: 3 },
            { row: 3, col: 2 }
        ],
        guards: [] // Still no guards, just predefined lit cells
    },
    // Levels 3-12 follow similar format, introducing new guard types
]
```

## DEVELOPMENT MILESTONES

### Milestone 1: Core Mechanics
- [x] Project setup using Phaser + Vite
- [ ] Grid system implementation
- [ ] Player movement and collision detection
- [ ] Turn management system
- [ ] Basic win/lose conditions

### Milestone 2: Level Mechanics
- [ ] Implement static light areas
- [ ] Implement first guard type (Static Guard)
- [ ] Level loading and transition system
- [ ] Basic UI (lives remaining, current level)

### Milestone 3: Enemy Types
- [ ] Implement Rotating Guard
- [ ] Implement Blinking Guard
- [ ] Implement Patrolling Guard
- [ ] Design levels 1-6 that progressively introduce these mechanics

### Milestone 4: Game Flow
- [ ] Complete all 12 level designs
- [ ] Implement life system (3 lives across all levels)
- [ ] Create main menu and level select screens
- [ ] Implement special twist for final level

### Milestone 5: Polish
- [ ] Mobile controls implementation
- [ ] UI improvements and feedback
- [ ] Game over and victory screens
- [ ] Testing and bug fixes

## IMPLEMENTATION TIPS FOR AI

1. **Phaser-Specific Implementation**:
   - Use existing scenes structure in the template
   - Leverage Phaser's game object factory (`this.add`)
   - Use Phaser's input system for controls

2. **Progressive Development**:
   - Implement core grid and movement system first
   - Add one guard type at a time
   - Create and test a few levels before adding more complex ones

3. **When Reporting Progress**:
   - Clearly state which milestone and task you're working on
   - Explain any challenges or alternative approaches taken
   - List what's working and what's still pending

4. **Starting Point**:
   - Begin with the Game.js scene implementation
   - Create the GridSystem
   - Implement basic player movement
   - Then add turn system before moving to guard implementation

This plan should provide a clear structure for developing the game incrementally, with a focus on core mechanics first and complexity added gradually.
