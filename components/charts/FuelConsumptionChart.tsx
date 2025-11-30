import React from 'react';
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

interface FuelConsumptionChartProps {
    data?: Array<{ plate: string; consumption: number }>;
}

export const FuelConsumptionChart: React.FC<FuelConsumptionChartProps> = ({ data = [] }) => {
    return (
        <div className="bg-surface-1 border border-surface-border rounded-xl p-4 space-y-4 h-full flex flex-col">
            <h3 className="font-semibold text-txt-primary">Consumo de Combustível (L/100km)</h3>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                            dataKey="plate"
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
                            cursor={{ fill: '#334155', opacity: 0.2 }}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                color: '#f8fafc',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Bar dataKey="consumption" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#007AFF" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
