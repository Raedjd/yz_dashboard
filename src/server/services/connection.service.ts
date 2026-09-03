import * as repository from "@/server/repositories/connection.repository";
import {ConnectionFilters, TestConnectionDto} from "@server/dto/connection.dto";
import {validateCreateConnection, validateUpdateConnection} from "@server/validators/connection.validator";
import mongoose from "mongoose";


export async function getConnections(filters: ConnectionFilters) {
    return repository.findAllFiltered(filters);
}

export async function getConnection(id: string) {
    const connection = await repository.findById(id);
    if (!connection) {
        throw new Error(`Connection not found: ${id}`);
    }
    return connection;
}

export async function createConnection(dto: any) {
    const data = validateCreateConnection(dto);
    return repository.create({ ...data });
}

export async function updateConnection(id: string, dto: any) {
    const data = validateUpdateConnection(dto);
    const connection = await repository.update(id, data);
    if (!connection) {
        throw new Error(`Connection not found: ${id}`);
    }
    return connection;
}

export async function deleteConnection(id: string) {
    const connection = await repository.remove(id);
    if (!connection) {
        throw new Error(`Connection not found: ${id}`);
    }
    return connection;
}

async function testConnection(uri: string, database: string) {
    const conn = await mongoose.createConnection(uri, { dbName: database, serverSelectionTimeoutMS: 5000 }).asPromise();
    await conn.close();
}

export async function testConnectionById(id: string) {
    const connection = await repository.findById(id);
    if (!connection) {
        throw new Error(`Connection not found: ${id}`);
    }

    const start = Date.now();
    let status: "connected" | "error";
    let message = "Connection successful";

    try {
        await testConnection(connection.uri, connection.database);
        status = "connected";
    } catch (err: any) {
        status = "error";
        message = err.message;
    }

    // met à jour le status en base avec le résultat du test
  //  await repository.update(id, { status });

    return {
        success: status === "connected",
        message,
        latencyMs: Date.now() - start,
        status,
    };
}

