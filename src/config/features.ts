export type Role = "student" | "faculty" | "admin";

export const features = {
    geminiChat: {
        student: true,
        faculty: true,
        admin: true, // Enable for all for now
    },
    notifications: {
        student: true,
        faculty: true,
        admin: true,
    },
    premiumBadge: {
        student: true,
        faculty: false,
        admin: false,
    }
};

export const hasFeature = (role: Role, feature: keyof typeof features): boolean => {
    return features[feature][role];
};
