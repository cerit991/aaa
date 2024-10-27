import { useState, useEffect } from 'react';
import { Download, Upload, List } from 'lucide-react';
import { backup } from '../utils/backup';

interface BackupManagerProps {
  onBackupComplete?: () => void;
}

function BackupManager({ onBackupComplete }: BackupManagerProps) {
  const [backups, setBackups] = useState<{ filename: string; date: string }[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showBackups) {
      loadBackups();
    }
  }, [showBackups]);

  const loadBackups = async () => {
    const list = await backup.list();
    setBackups(list);
  };

  const handleBackup = async () => {
    setLoading(true);
    const success = await backup.save();
    setLoading(false);

    if (success) {
      alert('Yedekleme başarılı');
      loadBackups();
    } else {
      alert('Yedekleme başarısız oldu');
    }
  };

  const handleRestore = async (filename?: string) => {
    if (!confirm('Yedeği geri yüklemek istediğinize emin misiniz? Mevcut veriler silinecek.')) {
      return;
    }

    setLoading(true);
    const success = await backup.restore(filename);
    setLoading(false);

    if (success) {
      alert('Yedek başarıyla geri yüklendi. Sayfa yenilenecek.');
      onBackupComplete?.();
      window.location.reload();
    } else {
      alert('Geri yükleme başarısız oldu');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackup}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
          title="Verileri Yedekle"
        >
          <Download className="w-4 h-4" />
          {loading ? 'İşleniyor...' : 'Yedekle'}
        </button>

        <button
          onClick={() => handleRestore()}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
          title="Son Yedeği Geri Yükle"
        >
          <Upload className="w-4 h-4" />
          {loading ? 'İşleniyor...' : 'Son Yedeği Geri Yükle'}
        </button>

        <button
          onClick={() => setShowBackups(!showBackups)}
          className="btn-secondary flex items-center gap-2"
          title="Yedekleri Göster"
        >
          <List className="w-4 h-4" />
          Yedekler
        </button>
      </div>

      {showBackups && backups.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-medium mb-2">Yedekler</h3>
          <div className="space-y-2 max-h-60 overflow-auto">
            {backups.map(backup => (
              <div 
                key={backup.filename}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <span>{new Date(backup.date).toLocaleDateString('tr-TR')}</span>
                <button
                  onClick={() => handleRestore(backup.filename)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Geri Yükle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BackupManager;