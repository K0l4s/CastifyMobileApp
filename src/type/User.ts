import { Role } from "./Role";

export interface User {
    id: string,
    firstName: string,
    middleName: string,
    lastName: string,
    avatarUrl: string,
    coverUrl: string,
    email: string,
    password: string,
    birthday: string,
    address: string,
    phone: string,
    code: string,
    createDay: Date,
    isActive: boolean,
    isLock: boolean,
    username: string,
    role: Role,
    enabled: boolean,
    [key: string]: any;
}
export interface userDetail{
    // private String id;
    // private String fullname;
    // private String username;
    // private String avatarUrl;
    // private String coverUrl;
    // private LocalDate birthday;
    // private String address;
    // private String phone;
    // private String email;
    // private List<String> badgesId;
    // private boolean isFollow;
    // private long totalFollower;
    // private long totalFollowing;
    // private long totalPost;
    id: string,
    fullname: string,
    username: string,
    avatarUrl: string,
    coverUrl: string,
    birthday: Date,
    address: string,
    phone: string,
    email: string,
    badgesId: string[],
    follow: boolean,
    totalFollower: number,
    totalFollowing: number,
    totalPost: number
    [key: string]: any;
}
export interface updateUser {
    firstName: string;
    middleName: string;
    lastName: string;
    birthday: string;
    // address: string;
    addressElements: string;
    ward: string;
    district: string;
    provinces: string;
    phone: string;
}
export interface userCard {
    id: string;
    fullname:string;
    username: string;
    avatarUrl: string;
    follow:boolean;
    totalFollower:number;
    totalFollowing:number;
    totalPost:number;
}

export interface userLogin {
    email: string;
    password: string;
}

export interface userRegister {
    // firstName: string,
    // middleName: string,
    // lastName: string,
    // email: string,
    // repeatEmail: string,
    // password: string,
    // repeatPass: string,
    // birthday: Date,
    // address: string,
    // phone: string,
    // nickName: string,
    lastName: string,
    middleName:string,
    firstName:string,
    email:string,
    repeatEmail:string,
    username:string,
    password:string,
    confirmPassword:string,
    birthday:Date,
    // address:string,
    addressElements: string,
    ward:string,
    district:string,
    provinces:string,
    phone:string
}
export interface userConfirm {
    email: string;
    code: string;
}

export interface userUpdate {
    id: number;
    email: string;
    role: Role;
    avatar: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth:Date;
    [key: string]: any;
}

export interface UserSimple {
    id: string;
    // firstName: string;
    // middleName: string;
    // lastName: string;
    fullname: string;
    username: string;
    avatarUrl: string;
    totalFollower: number;
    follow: boolean;
}

export interface BasicUser {
    id: string;
    fullname: string;
    username: string;
    avatarUrl: string;
    coverUrl: string;
    birthday: Date;
    address: string;
    phone: string;
    email: string;
    badgesId: string[];
    role: Role;
    totalFollower: number;
    totalFollowing: number;
    totalPost: number;
    active: boolean;
    nonBanned: boolean;
    nonLocked: boolean;
}

export interface shortUser {
    id:string;
    fullname:string;
    avatarUrl:string;
    username:string;
}