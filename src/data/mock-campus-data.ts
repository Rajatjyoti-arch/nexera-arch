export interface StudentChat {
    id: string;
    name: string;
    query: string;
    time: string;
    course?: string;
    priority: "low" | "medium" | "high";
}

export const recentStudentChats: StudentChat[] = [
    { id: "1", name: "Rahul S.", query: "Clarification on Assignment 3 regarding the graph implementation.", time: "10m ago", course: "Data Structures", priority: "high" },
    { id: "2", name: "Priya K.", query: "Request for leave tomorrow due to medical reasons.", time: "1h ago", priority: "medium" },
    { id: "3", name: "Amit B.", query: "When will the mid-term grades be released?", time: "2h ago", course: "Algorithms", priority: "low" },
    { id: "4", name: "Sneha R.", query: "I'm having trouble accessing the digital library resources for the project.", time: "3h ago", priority: "high" },
    { id: "5", name: "Vikram S.", query: "Can we use Python for the final project instead of Java?", time: "5h ago", course: "Software Engineering", priority: "medium" },
];

export const recentNotices = [
    { title: "Faculty Meeting", content: "Monthly department meeting at 4 PM in Dean's office.", date: "Today", bg: "card-indigo" },
    { title: "Exam Schedule", content: "Mid-semester exam schedule has been updated for Lab courses.", date: "Yesterday", bg: "card-teal" },
];
