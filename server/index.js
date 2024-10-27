import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize server
async function init() {
  await ensureDataDir();
}

// Save data
app.post('/api/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(req.body, null, 2));
    
    res.json({ success: true, filename });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest backup
app.get('/api/backup/latest', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup_'));
    
    if (backupFiles.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    // Get most recent backup
    const latestFile = backupFiles.sort().pop();
    const data = await fs.readFile(path.join(DATA_DIR, latestFile), 'utf-8');
    
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all backups
app.get('/api/backups', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const backups = files
      .filter(f => f.startsWith('backup_'))
      .map(f => ({
        filename: f,
        date: f.replace('backup_', '').replace('.json', '')
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    res.json({ success: true, backups });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific backup
app.get('/api/backup/:filename', async (req, res) => {
  try {
    const filepath = path.join(DATA_DIR, req.params.filename);
    const data = await fs.readFile(filepath, 'utf-8');
    
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Backup server running on port ${PORT}`);
  });
});