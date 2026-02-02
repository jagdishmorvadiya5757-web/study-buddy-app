import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAdminAnalytics, 
  useBranchAnalytics, 
  useTopResources,
  useDownloadTrend 
} from '@/hooks/useAdminAnalytics';
import { ResourceType } from '@/hooks/useResources';
import { 
  Download, 
  Users, 
  Clock, 
  Smartphone,
  TrendingUp,
  Activity,
  ScanLine,
} from 'lucide-react';
import { usePendingScans } from '@/hooks/useScanReview';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: branchAnalytics } = useBranchAnalytics();
  const { data: topResources, isLoading: resourcesLoading } = useTopResources(5);
  const { data: downloadTrend } = useDownloadTrend(7);
  const { data: pendingScans } = usePendingScans();

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const kpiCards = [
    {
      title: 'New Installs Today',
      value: analytics?.todayInstalls || 0,
      subtitle: `${analytics?.totalInstalls || 0} total`,
      icon: Smartphone,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Daily Active Users',
      value: analytics?.dailyActiveUsers || 0,
      subtitle: 'Active today',
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(analytics?.averageSessionDuration || 0),
      subtitle: 'Per visit',
      icon: Clock,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
    },
    {
      title: 'Downloads Today',
      value: analytics?.todayDownloads || 0,
      subtitle: `${analytics?.totalDownloads || 0} total`,
      icon: Download,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  const resourceTypeLabels: Record<ResourceType, string> = {
    playlist: 'Playlist',
    gtu_paper: 'GTU Paper',
    paper_solution: 'Solution',
    imp: 'IMP',
    book: 'Book',
    lab_manual: 'Lab Manual',
    handwritten_notes: 'Notes',
  };

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Overview of your GTU Study portal"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.subtitle}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pending Scans Alert */}
      {pendingScans && pendingScans.length > 0 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="py-4">
            <Link 
              to="/admin/scans" 
              className="flex items-center justify-between hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <ScanLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    {pendingScans.length} Scan{pendingScans.length > 1 ? 's' : ''} Pending Review
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Click to review and approve
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
                Review Now →
              </Badge>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Download Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4" />
              Download Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={downloadTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Analytics Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Top Branches by Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branchAnalytics?.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="branch_name" 
                  width={90}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(name) => name.length > 10 ? name.slice(0, 10) + '...' : name}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="download_count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Resources Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 5 Trending Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {resourcesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : topResources && topResources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topResources.map((resource, index) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-bold text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{resource.title}</TableCell>
                    <TableCell className="text-muted-foreground">{resource.subject_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {resourceTypeLabels[resource.resource_type as ResourceType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {resource.download_count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground py-6 text-center">
              No resources yet. Add some to see trends!
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
