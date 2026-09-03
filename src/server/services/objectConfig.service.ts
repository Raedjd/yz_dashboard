import * as repository from "@/server/repositories/objectConfig.repository";
import { ObjectConfigFilters } from "@server/dto/objectConfig.dto";
import { validateCreateObjectConfig, validateUpdateObjectConfig } from "@server/validators/objectConfig.validator";


export async function getObjectConfigs(filters: ObjectConfigFilters) {
    return repository.findAllFiltered(filters);
}

export async function getAllObjectConfigsRaw() {
    return repository.findAllRaw();
}

export async function getObjectConfig(id: string) {
    const config = await repository.findById(id);
    if (!config) {
        throw new Error(`ObjectConfig not found: ${id}`);
    }
    return config;
}

export async function getObjectConfigByTypeAndTransaction(objectType: string, transaction: string) {
    const config = await repository.findByObjectTypeAndTransaction(objectType, transaction);
    if (!config) {
        throw new Error(`ObjectConfig not found for ${objectType}/${transaction}`);
    }
    return config;
}

export async function createObjectConfig(dto: any) {
    const data = validateCreateObjectConfig(dto);
    return repository.create({ ...data });
}

export async function updateObjectConfig(id: string, dto: any) {
    const data = validateUpdateObjectConfig(dto);
    const config = await repository.update(id, data);
    if (!config) {
        throw new Error(`ObjectConfig not found: ${id}`);
    }
    return config;
}

export async function deleteObjectConfig(id: string) {
    const config = await repository.removeDefinitively(id);
    if (!config) {
        throw new Error(`ObjectConfig not found: ${id}`);
    }
    return config;
}
export async function setObjectConfigArchiveStatus(id: string, isDeleted: boolean) {
    const config = await repository.setDeletedStatus(id, isDeleted);
    if (!config) {
        throw new Error(`Config not found or already in requested state: ${id}`);
    }
    return config;
}
