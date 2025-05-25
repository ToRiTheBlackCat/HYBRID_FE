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
    fullName: string;
    address: string;
    phone: string;
    yearOfBirth: number;
    roleId: string;
    tierId: string;
}
export type Profile = {
    userId: string;
    fullName: string;
    address: string;
    phone: string;
    yearOfBirth: number;    
    tierName: string;
}