import { connectRootDB } from "@/server/config/mongodb";
import Tenant from "@/server/models/Tenant";
import {TenantFilters} from "@server/dto/tenant-filters.dto";
import mongoose from "mongoose";



export async function findAllFiltered(filters: TenantFilters) {
    await connectRootDB();

    const { PageNumber, PageSize, SortBy, SortOrder, Search } = filters;

    const query: Record<string, any> = {};
    if (Search) {
        const escapedSearch = Search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escapedSearch, $options: "i" };

        query.$or = [
            { TenantName: regex },
            { Description: regex },
            { "Organizations.OrganizationUnitId": regex },
            { "Organizations.ReferentialId": regex },
        ];
    }

    const [items, totalCount] = await Promise.all([
        Tenant.find(query)
            .sort({ [SortBy]: SortOrder === "asc" ? 1 : -1 })
            .skip(PageNumber  * PageSize)
            .limit(PageSize)
            .lean(),
        Tenant.countDocuments(query),
    ]);
    const mappedItems = items.map(({ _id, __v, ...rest }) => ({
        id: _id.toString(),
        ...rest,
    }));

    return { items: mappedItems, totalCount };
}

export async function findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return Tenant.findOne({ _id: id });
}

export async function create(data: any) {
    await connectRootDB();
    return Tenant.create(data);
}

export async function update(id: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return Tenant.findOneAndUpdate({ _id: id, IsDeleted: false }, data, { new: true });
}

export async function removeDefinitively(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    await connectRootDB();

    return Tenant.findByIdAndDelete(id);
}

export async function findByTenant(tenantId: string) {
    await connectRootDB();
    return Tenant.findOne({ tenantId });
}

export async function setDeletedStatus(id: string, isDeleted: boolean) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();

    return Tenant.findOneAndUpdate(
        { _id: id, IsDeleted: !isDeleted },
        { IsDeleted: isDeleted },
        { new: true }
    );
}