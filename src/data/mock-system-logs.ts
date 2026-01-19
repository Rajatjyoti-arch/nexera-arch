export interface SystemLog {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
    service: "API" | "DATABASE" | "AUTH" | "FRONTEND";
    message: string;
    details?: string;
}

export const recentSystemLogs: SystemLog[] = [
    {
        id: "log-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        level: "ERROR",
        service: "DATABASE",
        message: "Connection timeout while querying 'attendance_records'",
        details: "Query took 4500ms. Pool utilization at 95%."
    },
    {
        id: "log-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        level: "WARN",
        service: "API",
        message: "High latency detected on /api/v1/students/sync",
        details: "Average response time: 1.2s (Threshold: 0.5s)"
    },
    {
        id: "log-3",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        level: "CRITICAL",
        service: "AUTH",
        message: "Multiple failed login attempts detected from IP 192.168.1.105",
        details: "50 failed attempts in 1 minute. IP temporarily blocked."
    },
    {
        id: "log-4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        level: "ERROR",
        service: "FRONTEND",
        message: "Unhandled Promise Rejection in StudentDashboard",
        details: "TypeError: Cannot read properties of undefined (reading 'courses')"
    },
    {
        id: "log-5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        level: "WARN",
        service: "DATABASE",
        message: "Slow query detected on 'notifications' table",
        details: "Missing index on 'created_at' column."
    }
];
