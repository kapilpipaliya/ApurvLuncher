import React from 'react';
import {
  Globe,
  Terminal,
  FolderKanban,
  FileCode,
  FileText,
  FileJson,
  Image,
  Calculator,
  Settings,
  CheckSquare,
  Clock,
  Activity,
  HardDrive,
  ExternalLink,
  Code2,
  Trash2,
  Edit3,
  Move,
  Maximize2,
  Lock,
  Unlock,
  Grid,
  Plus,
  Download,
  Upload,
  ShieldCheck,
  Database,
  File,
  Folder,
  MoreVertical,
  RefreshCw,
  X,
  Play,
  Copy,
  Smartphone,
  Monitor,
  Eye,
  Check,
  AlertCircle,
  FolderPlus,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

interface IconRendererProps {
  name?: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  const props = { className, size, color };

  switch (name) {
    case 'Globe':
      return <Globe {...props} />;
    case 'Terminal':
      return <Terminal {...props} />;
    case 'FolderKanban':
      return <FolderKanban {...props} />;
    case 'FileCode':
      return <FileCode {...props} />;
    case 'FileText':
      return <FileText {...props} />;
    case 'FileJson':
      return <FileJson {...props} />;
    case 'Image':
      return <Image {...props} />;
    case 'Calculator':
      return <Calculator {...props} />;
    case 'Settings':
      return <Settings {...props} />;
    case 'CheckSquare':
      return <CheckSquare {...props} />;
    case 'Clock':
      return <Clock {...props} />;
    case 'Activity':
      return <Activity {...props} />;
    case 'HardDrive':
      return <HardDrive {...props} />;
    case 'ExternalLink':
      return <ExternalLink {...props} />;
    case 'Code2':
      return <Code2 {...props} />;
    case 'Trash2':
      return <Trash2 {...props} />;
    case 'Edit3':
      return <Edit3 {...props} />;
    case 'Move':
      return <Move {...props} />;
    case 'Maximize2':
      return <Maximize2 {...props} />;
    case 'Lock':
      return <Lock {...props} />;
    case 'Unlock':
      return <Unlock {...props} />;
    case 'Grid':
      return <Grid {...props} />;
    case 'Plus':
      return <Plus {...props} />;
    case 'Download':
      return <Download {...props} />;
    case 'Upload':
      return <Upload {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'Database':
      return <Database {...props} />;
    case 'Folder':
      return <Folder {...props} />;
    case 'FolderPlus':
      return <FolderPlus {...props} />;
    case 'Layers':
      return <Layers {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Search':
      return <Search {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Monitor':
      return <Monitor {...props} />;
    case 'Eye':
      return <Eye {...props} />;
    case 'RefreshCw':
      return <RefreshCw {...props} />;
    case 'X':
      return <X {...props} />;
    case 'Copy':
      return <Copy {...props} />;
    case 'Check':
      return <Check {...props} />;
    case 'AlertCircle':
      return <AlertCircle {...props} />;
    default:
      return <File {...props} />;
  }
};
