'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
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
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'An interactive bar chart for reading analytics';

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
  total_duration_minutes: {
    label: 'Total Duration (minutes)'
  },
  reading_sessions: {
    label: 'Reading Sessions',
    color: 'var(--primary)'
  },
  active_users: {
    label: 'Active Users',
    color: 'var(--secondary)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [data, setData] = React.useState<ReadingAnalytics[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<string>('');
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('reading_sessions');

  React.useEffect(() => {
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

  const total = React.useMemo(
    () => ({
      reading_sessions: data.reduce(
        (acc, curr) => acc + curr.reading_sessions,
        0
      ),
      active_users: data.reduce((acc, curr) => acc + curr.active_users, 0),
      total_duration_minutes: data.reduce(
        (acc, curr) => acc + curr.total_duration_minutes,
        0
      )
    }),
    [data]
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <Card className='@container/card !pt-3'>
        <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
          <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
            <CardTitle>Reading Analytics - Bar Chart</CardTitle>
            <CardDescription>Loading analytics data...</CardDescription>
          </div>
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
      <Card className='@container/card !pt-3'>
        <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
          <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
            <CardTitle>Reading Analytics - Bar Chart</CardTitle>
            <CardDescription>Error loading data</CardDescription>
          </div>
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
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Reading Analytics - Bar Chart</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              {period} • {data.length} days of data
            </span>
            <span className='@[540px]/card:hidden'>{period}</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['reading_sessions', 'active_users', 'total_duration_minutes'].map(
            (key) => {
              const chart = key as keyof typeof chartConfig;
              if (!chart || total[key as keyof typeof total] === 0) return null;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                  onClick={() => setActiveChart(chart)}
                >
                  <span className='text-muted-foreground text-xs'>
                    {chartConfig[chart].label}
                  </span>
                  <span className='text-lg leading-none font-bold sm:text-3xl'>
                    {key === 'total_duration_minutes'
                      ? `${Math.round(total[key as keyof typeof total] / 60)}h ${total[key as keyof typeof total] % 60}m`
                      : total[key as keyof typeof total]?.toLocaleString()}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12
              }}
            >
              <defs>
                <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.2}
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
                cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                content={
                  <ChartTooltipContent
                    className='w-[200px]'
                    nameKey={activeChart}
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill='url(#fillBar)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
