export type User = {
    userId: string;
    roleId: string;
    roleName: string;
    accessToken: string;
    refreshToken: string;
}
export type Account = {
    email: string;
    password: string;
    roleId: string;
}
export type Profile = {
    userId: string;
    fullName: string;
    address: string;
    phone: string;
    yearOfBirth: number;    
    tierName: string;
}
export type ProfileUpdate = {
    userId: string;
    isTeacher: boolean;
    fullName?: string;
    address?: string;
    phone?: string;
    yearOfBirth?: number;
}
export type StudentAccount = {
    userId: string;
    fullName: string;
    address: string;
    phone: string;
    yearOfBirth: number;
}
export type TeacherAccount = {
    userId: string;
    fullName: string;
    address: string;
    phone: string;
    yearOfBirth: number;
}