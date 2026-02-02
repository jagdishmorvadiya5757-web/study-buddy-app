import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalInstalls: number;
  todayInstalls: number;
  dailyActiveUsers: number;
  averageSessionDuration: number;
  totalDownloads: number;
  todayDownloads: number;
}

interface BranchAnalytics {
  branch_id: string;
  branch_name: string;
  download_count: number;
  resource_count: number;
}

interface ResourceAnalytics {
  id: string;
  title: string;
  subject_name: string;
  resource_type: string;
  download_count: number;
  branch_name: string;
}

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get total installs
      const { count: totalInstalls } = await supabase
        .from('app_installs')
        .select('*', { count: 'exact', head: true });

      // Get today's installs
      const { count: todayInstalls } = await supabase
        .from('app_installs')
        .select('*', { count: 'exact', head: true })
        .gte('installed_at', todayISO);

      // Get today's active users (unique users with sessions today)
      const { data: todaySessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('session_start', todayISO);
      
      const uniqueUsers = new Set(todaySessions?.map(s => s.user_id).filter(Boolean));
      const dailyActiveUsers = uniqueUsers.size;

      // Get average session duration
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .not('duration_seconds', 'is', null)
        .limit(1000);

      const avgDuration = sessions && sessions.length > 0
        ? sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / sessions.length
        : 0;

      // Get total downloads
      const { count: totalDownloads } = await supabase
        .from('resource_downloads')
        .select('*', { count: 'exact', head: true });

      // Get today's downloads
      const { count: todayDownloads } = await supabase
        .from('resource_downloads')
        .select('*', { count: 'exact', head: true })
        .gte('downloaded_at', todayISO);

      return {
        totalInstalls: totalInstalls || 0,
        todayInstalls: todayInstalls || 0,
        dailyActiveUsers,
        averageSessionDuration: Math.round(avgDuration),
        totalDownloads: totalDownloads || 0,
        todayDownloads: todayDownloads || 0,
      };
    },
  });
};

export const useBranchAnalytics = () => {
  return useQuery({
    queryKey: ['branch-analytics'],
    queryFn: async (): Promise<BranchAnalytics[]> => {
      // Get resources with their download counts grouped by branch
      const { data: resources } = await supabase
        .from('resources')
        .select('branch_id, download_count');

      const { data: branches } = await supabase
        .from('branches')
        .select('id, name');

      if (!branches) return [];

      const branchMap = new Map(branches.map(b => [b.id, b.name]));
      const analytics = new Map<string, { downloads: number; count: number }>();

      resources?.forEach(r => {
        const existing = analytics.get(r.branch_id) || { downloads: 0, count: 0 };
        analytics.set(r.branch_id, {
          downloads: existing.downloads + r.download_count,
          count: existing.count + 1,
        });
      });

      return Array.from(analytics.entries())
        .map(([branch_id, data]) => ({
          branch_id,
          branch_name: branchMap.get(branch_id) || 'Unknown',
          download_count: data.downloads,
          resource_count: data.count,
        }))
        .sort((a, b) => b.download_count - a.download_count);
    },
  });
};

export const useTopResources = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-resources', limit],
    queryFn: async (): Promise<ResourceAnalytics[]> => {
      const { data: resources } = await supabase
        .from('resources')
        .select('id, title, subject_name, resource_type, download_count, branch_id')
        .order('download_count', { ascending: false })
        .limit(limit);

      const { data: branches } = await supabase
        .from('branches')
        .select('id, name');

      if (!resources) return [];

      const branchMap = new Map(branches?.map(b => [b.id, b.name]) || []);

      return resources.map(r => ({
        id: r.id,
        title: r.title,
        subject_name: r.subject_name,
        resource_type: r.resource_type,
        download_count: r.download_count,
        branch_name: branchMap.get(r.branch_id) || 'Unknown',
      }));
    },
  });
};

export const useDownloadTrend = (days: number = 7) => {
  return useQuery({
    queryKey: ['download-trend', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data: downloads } = await supabase
        .from('resource_downloads')
        .select('downloaded_at')
        .gte('downloaded_at', startDate.toISOString());

      // Group by date
      const dailyCounts = new Map<string, number>();
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts.set(dateStr, 0);
      }

      downloads?.forEach(d => {
        const dateStr = d.downloaded_at.split('T')[0];
        if (dailyCounts.has(dateStr)) {
          dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
        }
      });

      return Array.from(dailyCounts.entries())
        .map(([date, count]) => ({ date, downloads: count }))
        .reverse();
    },
  });
};
