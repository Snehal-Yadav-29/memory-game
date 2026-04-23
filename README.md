# Memory Sequence Game with SQL Backend

A comprehensive memory training game with cognitive analysis and SQL database storage.

## Features

- **4 Game Modes**: Numbers, Alphabets, Colors, Shapes
- **Memory Analysis**: Tracks performance metrics and calculates memory scores
- **Personalized Tips**: Provides cognitive improvement recommendations
- **SQL Backend**: Persistent data storage with MySQL
- **History Tracking**: View and compare past performance
- **Responsive Design**: Works on all devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Database Setup

1. **Install MySQL** if not already installed
2. **Create Database**: Run the SQL script
   ```bash
   mysql -u root -p < database.sql
   ```

3. **Update Database Credentials** (if needed):
   - Edit `server.js` and modify the `dbConfig` object
   - Default: localhost, root user, no password

### Backend Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Verify Server**: Open http://localhost:3001/api/health

### Frontend Setup

The game files are already ready. Simply open `index.html` in your browser or access via the server at http://localhost:3001

## API Endpoints

### Game History
- `POST /api/game-history` - Save game results
- `GET /api/game-history?player_id=default_player&limit=10` - Get game history
- `DELETE /api/game-history/:id` - Delete specific game record

### Player Statistics
- `GET /api/player-stats?player_id=default_player` - Get player statistics

### Health Check
- `GET /api/health` - Server health status

## Database Schema

### game_history Table
- `id` - Primary key
- `player_id` - Player identifier
- `game_mode` - Game mode played
- `total_rounds` - Rounds completed
- `longest_sequence` - Longest sequence remembered
- `correct_attempts` - Correct answers
- `wrong_attempts` - Wrong answers
- `avg_response_time` - Average response time
- `memory_score` - Calculated memory score
- `memory_level` - Performance level
- `tips_json` - Generated tips (JSON)
- `created_at` - Timestamp

### player_stats Table
- Aggregated player statistics
- Best scores, averages, preferences

## Features Details

### Memory Score Calculation
```
Memory Score = (Longest Sequence × 5) + (Correct Attempts × 2) − (Wrong Attempts × 1) − (Average Response Time)
```

### Memory Levels
- **Score > 40**: Excellent Memory
- **Score 25–40**: Good Memory  
- **Score 15–25**: Average Memory
- **Score < 15**: Needs Improvement

### Tip System
- **Maximum 3 tips** per game
- **Performance-based**: Improvements for low scores, acknowledgements for high scores
- **Smart categorization**: Response time, accuracy, sequence length, mode-specific

### Fallback System
- If SQL database is unavailable, automatically falls back to localStorage
- Ensures game functionality even without database connection

## Environment Variables

Optional environment variables for configuration:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=memory_game
PORT=3001
```

## Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
2. Check credentials in `server.js`
3. Ensure database exists: `CREATE DATABASE memory_game;`

### Server Not Starting
1. Check if port 3001 is available
2. Install dependencies: `npm install`
3. Check Node.js version: `node --version`

### Game Not Saving Data
1. Check browser console for errors
2. Verify server is running
3. Test API endpoint: http://localhost:3001/api/health

## Development

### File Structure
```
├── index.html          # Main game file
├── style.css           # Game styling
├── script.js           # Game logic
├── server.js           # Backend API
├── database.sql        # Database schema
├── package.json        # Dependencies
└── README.md           # This file
```

### Adding New Features
1. Frontend: Edit `script.js` for game logic
2. Styling: Edit `style.css` for visual changes
3. Backend: Edit `server.js` for API changes
4. Database: Edit `database.sql` for schema changes

## License

MIT License - feel free to use and modify for your projects.
