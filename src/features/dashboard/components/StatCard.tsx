import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
    trendUp?: boolean
    className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUp, className }: StatCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={trendUp ? "text-emerald-500" : "text-rose-500"}>
                                {trend}
                            </span>
                        )}{" "}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
