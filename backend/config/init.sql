CREATE TABLE IF NOT EXISTS agent_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  interaction_type VARCHAR(50) DEFAULT 'general',
  target_info_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (target_info_id) REFERENCES info_items(id)
);
