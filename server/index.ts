import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

interface BackupData {
  cash_entries: any[];
  customers: any[];
  products: any[];
  purchase_invoices: any[];
  menu_items: any[];
  timestamp: string;
  version: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// CORS configuration for production
const corsOptions = {
  origin: ['http://198.58.101.166', 'http://198.58.101.166:3001'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data');
const MAX_BACKUPS = 50;

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Clean old backups
async function cleanOldBackups(): Promise<void> {
  try {
    const files = await fs.readdir(DATA_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('backup_'))
      .sort()
      .reverse();

    if (backupFiles.length > MAX_BACKUPS) {
      const filesToDelete = backupFiles.slice(MAX_BACKUPS);
      await Promise.all(
        filesToDelete.map(file => 
          fs.unlink(path.join(DATA_DIR, file))
        )
      );
    }
  } catch (error) {
    console.error('Error cleaning old backups:', error);
  }
}

// Initialize server
async function init(): Promise<void> {
  await ensureDataDir();
  await cleanOldBackups();
}

// Save data
app.post('/api/backup', async (req: Request, res: Response<ApiResponse<{ filename: string }>>) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(req.body, null, 2));
    await cleanOldBackups();
    
    res.json({ success: true, data: { filename } });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get latest backup
app.get('/api/backup/latest', async (req: Request, res: Response<ApiResponse<BackupData | undefined>>) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup_'));
    
    if (backupFiles.length === 0) {
      return res.json({ success: true, data: undefined });
    }
    
    // Get most recent backup
    const latestFile = backupFiles.sort().pop();
    if (!latestFile) {
      return res.json({ success: true, data: undefined });
    }
    
    const data = await fs.readFile(path.join(DATA_DIR, latestFile), 'utf-8');
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// List all backups
app.get('/api/backups', async (req: Request, res: Response<ApiResponse<{ filename: string; date: string }[]>>) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const backups = files
      .filter(f => f.startsWith('backup_'))
      .map(f => ({
        filename: f,
        date: f.replace('backup_', '').replace('.json', '')
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    res.json({ success: true, data: backups });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get specific backup
app.get('/api/backup/:filename', async (req: Request, res: Response<ApiResponse<BackupData>>) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      throw new Error('Filename is required');
    }
    
    const filepath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filepath, 'utf-8');
    
    res.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Start server
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Backup server running on port ${PORT}`);
  });
});