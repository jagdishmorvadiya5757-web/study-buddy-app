import { useState } from 'react';
import { Resource, ResourceType } from '@/hooks/useResources';
import { useTrackDownload } from '@/hooks/useDownloadTracking';
import { Button } from '@/components/ui/button';
import RewardedAdModal from '@/components/ads/RewardedAdModal';
import { 
  Download, 
  ExternalLink, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Star, 
  BookOpen, 
  FlaskConical, 
  PenTool 
} from 'lucide-react';

const resourceTypeConfig: Record<ResourceType, { label: string; icon: React.ElementType; color: string }> = {
  playlist: { label: 'Playlist', icon: PlayCircle, color: 'text-red-500 bg-red-50' },
  gtu_paper: { label: 'GTU Paper', icon: FileText, color: 'text-blue-500 bg-blue-50' },
  paper_solution: { label: 'Solution', icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  imp: { label: 'IMP', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  book: { label: 'Book', icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
  lab_manual: { label: 'Lab Manual', icon: FlaskConical, color: 'text-orange-500 bg-orange-50' },
  handwritten_notes: { label: 'Notes', icon: PenTool, color: 'text-pink-500 bg-pink-50' },
};

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  const config = resourceTypeConfig[resource.resource_type];
  const Icon = config.icon;
  const trackDownload = useTrackDownload();
  
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'view' | 'download' | null>(null);

  const performView = () => {
    const url = resource.external_url || resource.file_url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const performDownload = () => {
    const url = resource.file_url || resource.external_url;
    if (url) {
      trackDownload.mutate(resource.id);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAction = () => {
    setPendingAction('view');
    setShowAdModal(true);
  };

  const handleDownload = () => {
    setPendingAction('download');
    setShowAdModal(true);
  };

  const handleAdComplete = () => {
    if (pendingAction === 'view') {
      performView();
    } else if (pendingAction === 'download') {
      performDownload();
    }
    setPendingAction(null);
  };

  return (
    <>
      <div className="group p-5 rounded-xl bg-card shadow-soft hover:shadow-card transition-all duration-300 border border-border">
        <div className="flex items-start gap-4">
          {resource.thumbnail_url ? (
            <div className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-muted">
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.color}`}>
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">Sem {resource.semester}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {resource.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">{resource.subject_name}</p>
            {resource.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {resource.download_count} downloads
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={handleAction}
              disabled={!resource.external_url && !resource.file_url}
            >
              <ExternalLink className="w-4 h-4" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={handleDownload}
              disabled={!resource.file_url && !resource.external_url}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={showAdModal}
        onClose={() => {
          setShowAdModal(false);
          setPendingAction(null);
        }}
        onComplete={handleAdComplete}
        title={pendingAction === 'download' ? 'Preparing your download...' : 'Loading content...'}
      />
    </>
  );
};

export default ResourceCard;
