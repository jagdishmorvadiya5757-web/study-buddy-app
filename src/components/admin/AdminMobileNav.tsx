import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  ScanLine,
  ClipboardList,
  Users,
} from 'lucide-react';

const AdminMobileNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Full nav for admins, limited for sub-admins
  const navItems = isAdmin
    ? [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/branches', icon: FolderTree, label: 'Branches' },
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
        { href: '/admin/scans', icon: ScanLine, label: 'Scans' },
        { href: '/admin/sub-admins', icon: Users, label: 'Sub-Admins' },
      ]
    : [
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminMobileNav;
