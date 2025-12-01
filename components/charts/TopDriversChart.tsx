import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface TopDriversChartProps {
    data?: Array<{ name: string; km: number }>;
}

const COLORS = ['#00CC99', '#00CC99', '#00CC99', '#00CC99', '#00CC99'];

export const TopDriversChart: React.FC<TopDriversChartProps> = ({ data = [] }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-surface-1 border border-surface-border rounded-xl p-4 space-y-4 h-full flex flex-col">
            <h3 className="font-semibold text-txt-primary">{t('dashboard.driverRanking')}</h3>
            <div className="flex-1 w-full min-h-[250px]">
                {data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-txt-tertiary">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">leaderboard</span>
                        <p className="text-sm">{t('dashboard.noData') || 'Sem dados disponíveis'}</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 40,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: '#334155', opacity: 0.2 }}
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderColor: '#334155',
                                    color: '#f8fafc',
                                    borderRadius: '8px'
                                }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="km" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
