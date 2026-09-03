import mongoose from "mongoose";
import { connectRootDB } from "@/server/config/mongodb";
import {ConnectionFilters, CreateConnectionDto, UpdateConnectionDto} from "@server/dto/connection.dto";
import {Connection} from "@server/models/Connection";

export async function findAllFiltered(filters: ConnectionFilters) {
    await connectRootDB();

    const { PageNumber, PageSize, SortBy, SortOrder, Search } = filters;

    const query: Record<string, any> = { deleted: false };
    if (Search) {
        query.name = { $regex: Search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const [items, totalCount] = await Promise.all([
        Connection.find(query)
            .select("-uri")
            .sort({ [SortBy]: SortOrder === "asc" ? 1 : -1 })
            .skip(PageNumber * PageSize)
            .limit(PageSize)
            .lean(),
        Connection.countDocuments(query),
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
    return Connection.findOne({ _id: id, deleted: false });
}

export async function create(data: CreateConnectionDto) {
    await connectRootDB();
    return Connection.create({ ...data, status: "disconnected" });
}

export async function update(id: string, data: UpdateConnectionDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return Connection.findOneAndUpdate({ _id: id, deleted: false }, data, { new: true });
}

export async function remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectRootDB();
    return Connection.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true });
}