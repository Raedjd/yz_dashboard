import mongoose, { Connection } from "mongoose";
import { connectRootDB } from "./mongodb";
import Tenant from "@/server/models/Tenant";

const tenantConnections: Map<string, Connection> =
    (global as any).tenantConnections || new Map();
(global as any).tenantConnections = tenantConnections;

export async function getTenantConnection(tenantId: string): Promise<Connection> {
    console.log(">>> getTenantConnection called with tenantId =", tenantId);

    if (!tenantId) {
        throw new Error("Missing X-Company-Db header");
    }

    const existing = tenantConnections.get(tenantId);
    if (existing && existing.readyState === 1) {
        console.log(">>> Using cached tenant connection for", tenantId);
        return existing;
    }

    await connectRootDB();

    const tenant = await Tenant.findOne({ tenantId });
    console.log(">>> Tenant lookup result:", tenant);

    if (!tenant) {
        throw new Error(`Tenant "${tenantId}" not found`);
    }
    if (tenant.status !== "active") {
        throw new Error(`Tenant "${tenantId}" is inactive`);
    }

    const conn = await openTenantConnectionByDbName(tenant.dbName);
    tenantConnections.set(tenantId, conn);
    return conn;
}

export async function openTenantConnectionByDbName(dbName: string): Promise<Connection> {
    console.log(">>> openTenantConnectionByDbName called with dbName =", dbName);

    const MONGODB_BASE_URI = process.env.MONGODB_BASE_URI as string;
    console.log(">>> MONGODB_BASE_URI =", MONGODB_BASE_URI);

    if (!MONGODB_BASE_URI) {
        throw new Error("Please define MONGODB_BASE_URI");
    }

    const dbUri = `${MONGODB_BASE_URI}/${dbName}?authSource=admin`;
    console.log(">>> Final tenant dbUri =", dbUri);

    const conn = await mongoose.createConnection(dbUri).asPromise();
    console.log(">>> Tenant connection established for", dbName);
    return conn;
}