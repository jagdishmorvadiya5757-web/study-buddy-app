import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  ScanLine,
  ClipboardList,
  Settings,
  Shield,
  Users,
  Info,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Full nav for admins, limited for sub-admins
  const navItems = isAdmin
    ? [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/branches', icon: FolderTree, label: 'Branches' },
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
        { href: '/admin/scans', icon: ScanLine, label: 'Scan Review' },
        { href: '/admin/sub-admins', icon: Users, label: 'Sub-Admins' },
        { href: '/admin/support', icon: MessageSquare, label: 'Support Requests' },
        { href: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
        { href: '/admin/terms', icon: FileText, label: 'Terms & Privacy' },
        { href: '/admin/about', icon: Info, label: 'About Section' },
        { href: '/admin/audit', icon: ClipboardList, label: 'Audit Logs' },
      ]
    : [
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
      ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-display font-bold text-foreground">
            {isAdmin ? 'GTU Admin' : 'Sub-Admin'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'Control Panel' : 'Resource Manager'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          Back to App
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
