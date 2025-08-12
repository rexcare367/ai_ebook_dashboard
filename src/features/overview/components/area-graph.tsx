'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import axiosInstance from '@/lib/axios';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface ReadingAnalytics {
  date: string;
  total_duration_minutes: number;
  reading_sessions: number;
  active_users: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    analytics: ReadingAnalytics[];
    total_days: number;
    period: string;
    days_with_activity: number;
  };
  message: string;
  error: string | null;
}

const chartConfig = {
  total_duration: {
    label: 'Total Duration (minutes)'
  },
  reading_sessions: {
    label: 'Reading Sessions',
    color: 'var(--primary)'
  },
  active_users: {
    label: 'Active Users',
    color: 'var(--input)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  const [data, setData] = useState<ReadingAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          '/analytics/reading-duration/daily'
        );
        const result: AnalyticsResponse = response.data;

        if (result.success) {
          setData(result.data.analytics);
          setPeriod(result.data.period);
        } else {
          setError(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate trend percentage
  const calculateTrend = () => {
    if (data.length < 2) return 0;

    const recent = data[data.length - 1]?.total_duration_minutes || 0;
    const previous = data[data.length - 2]?.total_duration_minutes || 0;

    if (previous === 0) return 0;
    return ((recent - previous) / previous) * 100;
  };

  const trend = calculateTrend();

  if (loading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Reading Duration Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <div className='flex aspect-auto h-[250px] w-full items-center justify-center'>
            <div className='text-muted-foreground'>Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Reading Duration Analytics</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <div className='flex aspect-auto h-[250px] w-full items-center justify-center'>
            <div className='text-destructive'>{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Reading Duration Analytics</CardTitle>
        <CardDescription>
          Daily reading duration and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12
              }}
            >
              <defs>
                <linearGradient
                  id='fillReadingSessions'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-reading_sessions)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-reading_sessions)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id='fillActiveUsers'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='var(--color-active_users)'
                    stopOpacity={0.6}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-active_users)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                }}
              />
              <Area
                dataKey='reading_sessions'
                type='monotone'
                fill='url(#fillReadingSessions)'
                stroke='var(--color-reading_sessions)'
                strokeWidth={2}
                stackId='a'
              />
              <Area
                dataKey='active_users'
                type='monotone'
                fill='url(#fillActiveUsers)'
                stroke='var(--color-active_users)'
                strokeWidth={2}
                stackId='a'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {trend > 0
                ? 'Trending up'
                : trend < 0
                  ? 'Trending down'
                  : 'Stable'}
              {trend !== 0 && ` by ${Math.abs(trend).toFixed(1)}% this period`}
              {trend !== 0 && (
                <IconTrendingUp
                  className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              {period} • {data.length} days of data
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
