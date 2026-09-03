import mongoose from "mongoose";
import { connectRootDB } from "@/server/config/mongodb";
import { ObjectConfigFilters, CreateObjectConfigDto, UpdateObjectConfigDto } from "@server/dto/objectConfig.dto";
import ObjectConfig from "@server/models/ObjectConfig";

export async function findAllFiltered(filters: ObjectConfigFilters) {
    await connectRootDB();

    const { PageNumber, PageSize, SortBy, SortOrder, Search } = filters;

    const query: Record<string, any> = {};

    if (Search) {
        const escapedSearch = Search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escapedSearch, $options: "i" };

        query.$or = [
            { ObjectType: regex },
            { DocumentType: regex },
            { Transaction: regex },
            { "Config.source.source_name": regex },
            { "Config.target.target_name": regex },
        ];
    }

    const sortDirection = SortOrder === "asc" ? 1 : -1;

    const [items, totalCount] = await Promise.all([
        ObjectConfig.find(query)
            .collation({ locale: "en", strength: 2 })
            .sort({ [SortBy]: sortDirection, _id: sortDirection })
            .skip(PageNumber * PageSize)
            .limit(PageSize)
            .lean(),
        ObjectConfig.countDocuments(query),
    ]);

    // Transforme _id -> id
    const mappedItems = items.map(({ _id, __v, ...rest }) => ({
        id: _id.toString(),
        ...rest,
    }));

    return { items: mappedItems, totalCount };
}


export async function findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return ObjectConfig.findOne({ _id: id });
}

export async function findByObjectTypeAndTransaction(objectType: string, transaction: string) {
    await connectRootDB();
    return ObjectConfig.findOne({ ObjectType: objectType, Transaction: transaction });
}

export async function findAllRaw() {
    await connectRootDB();
    return ObjectConfig.find({}).lean();
}

export async function create(data: CreateObjectConfigDto) {
    await connectRootDB();
    return ObjectConfig.create(data);
}

export async function update(id: string, data: UpdateObjectConfigDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return ObjectConfig.findOneAndUpdate({ _id: id }, data, { new: true });
}

export async function removeDefinitively(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    await connectRootDB();

    return ObjectConfig.findByIdAndDelete(id);
}

export async function setDeletedStatus(id: string, isDeleted: boolean) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();

    return ObjectConfig.findOneAndUpdate(
        { _id: id, IsDeleted: !isDeleted },
        { IsDeleted: isDeleted },
        { new: true }
    );
}