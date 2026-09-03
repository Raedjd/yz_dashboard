import { getTenantConnection } from "@/server/config/tenantDb";
import * as repository from "../repositories/document.repository";
import { validateCreateDocument } from "../validators/document.validator";

export async function getDocuments(tenantId: string) {
    const conn = await getTenantConnection(tenantId);
    return repository.findAll(conn);
}

export async function createDocument(tenantId: string, dto: any) {
    validateCreateDocument(dto);
    const conn = await getTenantConnection(tenantId);
    return repository.create(conn, dto);
}