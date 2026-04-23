-- Memory Game Database Schema
-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS memory_game;
USE memory_game;

-- Game History Table
CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(50) DEFAULT 'default_player',
    game_mode ENUM('numbers', 'alphabets', 'colors', 'shapes') NOT NULL,
    total_rounds INT NOT NULL,
    longest_sequence INT NOT NULL,
    correct_attempts INT NOT NULL,
    wrong_attempts INT NOT NULL,
    avg_response_time DECIMAL(5,2) NOT NULL,
    memory_score INT NOT NULL,
    memory_level ENUM('Excellent Memory', 'Good Memory', 'Average Memory', 'Needs Improvement') NOT NULL,
    tips_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_player_id (player_id),
    INDEX idx_created_at (created_at),
    INDEX idx_game_mode (game_mode)
);

-- Player Statistics Table (for aggregated data)
CREATE TABLE IF NOT EXISTS player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(50) UNIQUE NOT NULL,
    total_games_played INT DEFAULT 0,
    best_score INT DEFAULT 0,
    best_mode ENUM('numbers', 'alphabets', 'colors', 'shapes'),
    avg_score DECIMAL(6,2) DEFAULT 0,
    avg_response_time DECIMAL(5,2) DEFAULT 0,
    favorite_mode ENUM('numbers', 'alphabets', 'colors', 'shapes'),
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_player_id (player_id)
);

-- Insert sample data (optional)
-- INSERT INTO player_stats (player_id, total_games_played, best_score, avg_score) 
-- VALUES ('default_player', 0, 0, 0.00)
-- ON DUPLICATE KEY UPDATE total_games_played = total_games_played;
