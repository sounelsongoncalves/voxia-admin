import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface TripsPerDayChartProps {
    data?: Array<{ date: string; trips: number }>;
}

export const TripsPerDayChart: React.FC<TripsPerDayChartProps> = ({ data = [] }) => {
    return (
        <div className="bg-surface-1 border border-surface-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-txt-primary">Viagens por Dia</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                color: '#f8fafc',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                            cursor={{ stroke: '#334155' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="trips"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
