export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface LogEvent {
    id: string;
    timestamp: number;
    fileid: {
        id: string;
    };
    rawline: {
        rawline: string;
    };
    associatedalertid: {
        id: string;
    } | null;
}

export interface RawlineData {
    action: string | { id: string; name: string; };
    sourcedeviceid: string | { id: string; name: string; } | null;
    sourceport: number | null;
    destinationdeviceid: string | { id: string; name: string; } | null;
    destinationport: number | null;
    message: string;
    parseddata: any;
}

export interface Device {
    id: string;
    hostname: string;
    ipaddress: string;
    operatingsystem: string;
    location: string;
    devicetype: string;
}