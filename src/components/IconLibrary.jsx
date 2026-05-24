import { 
  LayoutDashboard, Users, Link as LinkIcon, Settings, FileText, MessageSquare, 
  History, Star, Folder, Edit, Layout, Monitor, Clock, Calendar, 
  Inbox, Send, BarChart2, Plus, Table, HelpCircle, Tv, Zap,
  ArrowLeft, Shield, Radio, Check, Mic, Video, ChevronRight, 
  ChevronDown, ChevronUp, Filter, Trash2, Download, Upload,
  Search,
  Circle, Square, MoveRight, Type, Presentation, X, Paperclip, AlertCircle
} from 'lucide-react';

const CustomTempraTv = ({ width = 24, height = 24, ...props }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <ellipse cx="7" cy="5" rx="2.5" ry="5.5" fill="#FF69B4" transform="rotate(-35 7 5)" />
    <ellipse cx="17" cy="5" rx="2.5" ry="5.5" fill="#FF69B4" transform="rotate(35 17 5)" />
    <rect x="2" y="9" width="20" height="13" rx="3" fill="white" />
    <rect x="4" y="11" width="16" height="9" rx="1.5" fill="#f1f5f9" />
  </svg>
);

const CustomPuddingTv = ({ width = 24, height = 24, strokeWidth = 2, ...props }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
    {/* 3x thicker top edge towards the inside */}
    <line x1="3" y1={7 + strokeWidth} x2="21" y2={7 + strokeWidth} strokeWidth={strokeWidth * 2} />
  </svg>
);

const CustomTacosMonitor = ({ width = 24, height = 24, strokeWidth = 2, ...props }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="tacos-bars" x1="0" y1="0" x2="1" y2="0">
        <stop offset="33.3%" stopColor="#4CAF50" />
        <stop offset="33.3%" stopColor="#E21C26" />
        <stop offset="66.6%" stopColor="#E21C26" />
        <stop offset="66.6%" stopColor="#FFC107" />
      </linearGradient>
    </defs>
    <rect width="20" height="14" x="2" y="3" rx="2" fill="url(#tacos-bars)" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export const Icons = {
  Dashboard: LayoutDashboard,
  Users: Users,
  Link: LinkIcon,
  Settings: Settings,
  FileText: FileText,
  Chat: MessageSquare,
  History: History,
  Star: Star,
  Folder: Folder,
  Edit: Edit,
  Board: Layout,
  Monitor: CustomTacosMonitor,
  Clock: Clock,
  Calendar: Calendar,
  Inbox: Inbox,
  Send: Send,
  Chart: BarChart2,
  Plus: Plus,
  Table: Table,
  Help: HelpCircle,
  Tv: CustomPuddingTv,
  Zap: Zap,
  TempraTv: CustomTempraTv,
  ArrowLeft: ArrowLeft,
  Shield: Shield,
  Radio: Radio,
  Check: Check,
  Mic: Mic,
  Video: Video,
  Search: Search,
  ChevronRight: ChevronRight,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  Filter: Filter,
  Download: Download,
  Upload: Upload,
  Circle: Circle,
  Square: Square,
  ArrowRight: MoveRight,
  Text: Type,
  Role: Shield,
  Trash: Trash2,
  Trash2: Trash2,
  AlertCircle: AlertCircle,
  X: X,
  Clip: Paperclip
};
