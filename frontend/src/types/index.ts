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

// In types/index.ts
export interface Logfile {
    id: number;
    uploadedby?: number | {
        uploadedby: number
    };
    sourcename?: string;
    sourcetype?: string;
    filename?: string;
    uploadtime?: string;
    status?: 'Uploaded' | 'Pending' | 'Failed';
    rawcontent?: string;
}

export interface Action {
    action: string;
    categoryname?: {
        categoryname: string
    };
}

export interface EventCategory {
    categoryname: string;
    description?: string;
}

export type AlertStatus = 'Open' | 'Investigating' | 'Resolved';

export interface Alert {
    id: number;
    triggeredat: any; // ISO date string
    ruleid: {
        id: number
    };
    status: AlertStatus;
}

export type Severity = 'Low' | 'Medium' | 'High';

export interface AlertRule {
    id: number,
    name: string,
    description: string,
    severity: Severity,
    conditionlogic: any,
    isactive: boolean,
    createdby: {
        id: number
    },
    createdat: any
}

export interface Threatintel {
    id?: number;
    indicator: string;
    type: string;
    severity: string;
    description?: string;
}

export interface Incidentreport {
    id: number;
    title?: string;
    description?: string;
    createdat?: string;
    createdby?: {
        id: number;
    };
    relatedalertid?: {
        id: number;
    };
}

export interface Alertrule {
    id: number;
    name: string;
    description?: string;
    severity: string;
    conditionlogic: Record<string, any>;
    isactive: boolean;
    createdat?: string;
    createdby?: {
        id: number;
    };
}

export interface Rawline {
    rawline: string;
    sourcedeviceid?: {
        id: number;
    };
    sourceport?: number;
    destinationdeviceid?: {
        id: number;
    };
    destinationport?: number;
    action?: {
        action: string;
    };
    message?: string;
    parseddata?: Record<string, any>;
}