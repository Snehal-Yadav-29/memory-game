const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'memory_game',
    charset: 'utf8mb4'
};

let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        console.log('Database connected successfully');
        
        // Test connection
        const connection = await pool.getConnection();
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// API Routes

// Save game history
app.post('/api/game-history', async (req, res) => {
    try {
        const {
            player_id = 'default_player',
            game_mode,
            total_rounds,
            longest_sequence,
            correct_attempts,
            wrong_attempts,
            avg_response_time,
            memory_score,
            memory_level,
            tips
        } = req.body;

        const connection = await pool.getConnection();
        
        // Insert game history
        const [result] = await connection.execute(
            `INSERT INTO game_history 
            (player_id, game_mode, total_rounds, longest_sequence, correct_attempts, wrong_attempts, avg_response_time, memory_score, memory_level, tips_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [player_id, game_mode, total_rounds, longest_sequence, correct_attempts, wrong_attempts, avg_response_time, memory_score, memory_level, JSON.stringify(tips)]
        );

        // Update player statistics
        await updatePlayerStats(connection, player_id, game_mode, memory_score, avg_response_time);
        
        connection.release();
        
        res.json({ 
            success: true, 
            id: result.insertId,
            message: 'Game history saved successfully' 
        });
    } catch (error) {
        console.error('Error saving game history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save game history' 
        });
    }
});

// Get game history
app.get('/api/game-history', async (req, res) => {
    try {
        const { player_id = 'default_player', limit = 10 } = req.query;
        
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
            `SELECT * FROM game_history 
            WHERE player_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?`,
            [player_id, parseInt(limit)]
        );
        
        // Parse tips JSON
        rows.forEach(row => {
            if (row.tips_json) {
                row.tips = JSON.parse(row.tips_json);
                delete row.tips_json;
            }
        });
        
        connection.release();
        
        res.json({ 
            success: true, 
            data: rows 
        });
    } catch (error) {
        console.error('Error fetching game history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch game history' 
        });
    }
});

// Get player statistics
app.get('/api/player-stats', async (req, res) => {
    try {
        const { player_id = 'default_player' } = req.query;
        
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
            `SELECT * FROM player_stats WHERE player_id = ?`,
            [player_id]
        );
        
        connection.release();
        
        if (rows.length === 0) {
            res.json({ 
                success: true, 
                data: {
                    total_games_played: 0,
                    best_score: 0,
                    avg_score: 0,
                    avg_response_time: 0
                }
            });
        } else {
            res.json({ 
                success: true, 
                data: rows[0] 
            });
        }
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch player statistics' 
        });
    }
});

// Update player statistics helper function
async function updatePlayerStats(connection, player_id, game_mode, memory_score, avg_response_time) {
    try {
        // Get current stats
        const [currentStats] = await connection.execute(
            `SELECT * FROM player_stats WHERE player_id = ?`,
            [player_id]
        );

        if (currentStats.length === 0) {
            // Create new player stats
            await connection.execute(
                `INSERT INTO player_stats 
                (player_id, total_games_played, best_score, best_mode, avg_score, avg_response_time, favorite_mode)
                VALUES (?, 1, ?, ?, ?, ?, ?)`,
                [player_id, memory_score, game_mode, memory_score, avg_response_time, game_mode]
            );
        } else {
            // Update existing stats
            const stats = currentStats[0];
            const totalGames = stats.total_games_played + 1;
            const newAvgScore = ((stats.avg_score * stats.total_games_played) + memory_score) / totalGames;
            const newAvgResponseTime = ((stats.avg_response_time * stats.total_games_played) + avg_response_time) / totalGames;
            const newBestScore = Math.max(stats.best_score, memory_score);
            const newBestMode = memory_score > stats.best_score ? game_mode : stats.best_mode;

            await connection.execute(
                `UPDATE player_stats SET 
                total_games_played = ?, 
                best_score = ?, 
                best_mode = ?, 
                avg_score = ?, 
                avg_response_time = ?,
                last_played = CURRENT_TIMESTAMP
                WHERE player_id = ?`,
                [totalGames, newBestScore, newBestMode, newAvgScore, newAvgResponseTime, player_id]
            );
        }
    } catch (error) {
        console.error('Error updating player stats:', error);
        throw error;
    }
}

// Delete game history
app.delete('/api/game-history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { player_id = 'default_player' } = req.query;
        
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(
            `DELETE FROM game_history WHERE id = ? AND player_id = ?`,
            [id, player_id]
        );
        
        connection.release();
        
        if (result.affectedRows === 0) {
            res.status(404).json({ 
                success: false, 
                error: 'Game history not found' 
            });
        } else {
            res.json({ 
                success: true, 
                message: 'Game history deleted successfully' 
            });
        }
    } catch (error) {
        console.error('Error deleting game history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete game history' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: pool ? 'Connected' : 'Disconnected'
    });
});

// Serve the main game file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Database: ${dbConfig.database}`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (pool) {
        await pool.end();
    }
    process.exit(0);
});

startServer().catch(console.error);
