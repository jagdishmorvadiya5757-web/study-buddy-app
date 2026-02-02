import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useAdminAnalytics, 
  useBranchAnalytics, 
  useTopResources,
  useDownloadTrend 
} from '@/hooks/useAdminAnalytics';
import { useResources, useCreateResource, useDeleteResource, ResourceType } from '@/hooks/useResources';
import { useBranches } from '@/hooks/useBranches';
import { 
  Download, 
  Users, 
  Clock, 
  Smartphone,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  BarChart3,
  Activity
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, userRole, isLoading } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: branchAnalytics, isLoading: branchLoading } = useBranchAnalytics();
  const { data: topResources, isLoading: resourcesLoading } = useTopResources(10);
  const { data: downloadTrend } = useDownloadTrend(7);
  const { data: resources } = useResources();
  const { data: branches } = useBranches();
  const deleteResource = useDeleteResource();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

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
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Daily Active Users',
      value: analytics?.dailyActiveUsers || 0,
      subtitle: 'Active today',
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(analytics?.averageSessionDuration || 0),
      subtitle: 'Per visit',
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Downloads Today',
      value: analytics?.todayDownloads || 0,
      subtitle: `${analytics?.totalDownloads || 0} total`,
      icon: Download,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Analytics and resource management
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/resources/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <FileText className="w-4 h-4" />
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))
                ) : (
                  kpiCards.map((kpi) => (
                    <Card key={kpi.title}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{kpi.title}</p>
                            <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                          </div>
                          <div className={`p-3 rounded-xl ${kpi.bg}`}>
                            <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Download Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Download Trend (7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={downloadTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="downloads" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Branch Analytics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Downloads by Branch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={branchAnalytics?.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis 
                          type="category" 
                          dataKey="branch_name" 
                          width={100}
                          className="text-xs"
                          tickFormatter={(name) => name.length > 12 ? name.slice(0, 12) + '...' : name}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
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
                <CardHeader>
                  <CardTitle>Top Resources by Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  {resourcesLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead className="text-right">Downloads</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topResources?.map((resource, index) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{resource.title}</TableCell>
                            <TableCell>{resource.subject_name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 text-xs rounded-full bg-muted">
                                {resourceTypeLabels[resource.resource_type as ResourceType]}
                              </span>
                            </TableCell>
                            <TableCell>{resource.branch_name}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {resource.download_count.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources?.slice(0, 20).map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.title}</TableCell>
                          <TableCell>{resource.subject_name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-muted">
                              {resourceTypeLabels[resource.resource_type]}
                            </span>
                          </TableCell>
                          <TableCell>Sem {resource.semester}</TableCell>
                          <TableCell>{resource.download_count}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('Delete this resource?')) {
                                  deleteResource.mutate(resource.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
