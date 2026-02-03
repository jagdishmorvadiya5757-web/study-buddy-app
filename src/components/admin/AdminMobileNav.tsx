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
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminMobileNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Main nav items (limit to 4 for mobile)
  const mainNavItems = isAdmin
    ? [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
        { href: '/admin/scans', icon: ScanLine, label: 'Scans' },
        { href: '/admin/support', icon: MessageSquare, label: 'Support' },
      ]
    : [
        { href: '/admin/resources', icon: FileText, label: 'Resources' },
      ];

  // More menu items for admin
  const moreNavItems = isAdmin
    ? [
        { href: '/admin/branches', icon: FolderTree, label: 'Branches' },
        { href: '/admin/sub-admins', icon: Users, label: 'Sub-Admins' },
        { href: '/admin/faqs', label: 'FAQs' },
        { href: '/admin/terms', label: 'Terms & Privacy' },
        { href: '/admin/about', label: 'About Section' },
        { href: '/admin/audit', icon: ClipboardList, label: 'Audit Logs' },
      ]
    : [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex justify-around py-2">
        {mainNavItems.map((item) => {
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
        
        {isAdmin && moreNavItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreNavItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default AdminMobileNav;
