import { getTenantConnection } from "@/server/config/tenantDb";
import * as repository from "../repositories/user.repository";
import { validateCreateUser } from "../validators/user.validator";

export async function getUsers(tenantId: string) {
    const conn = await getTenantConnection(tenantId);
    return repository.findAll(conn);
}

export async function getUser(tenantId: string, id: string) {
    const conn = await getTenantConnection(tenantId);
    return repository.findById(conn, id);
}

export async function createUser(tenantId: string, dto: any) {
    validateCreateUser(dto);
    const conn = await getTenantConnection(tenantId);
    return repository.create(conn, dto);
}

export async function updateUser(tenantId: string, id: string, dto: any) {
    const conn = await getTenantConnection(tenantId);
    return repository.update(conn, id, dto);
}

export async function deleteUser(tenantId: string, id: string) {
    const conn = await getTenantConnection(tenantId);
    return repository.remove(conn, id);
}