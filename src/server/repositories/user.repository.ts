import { Connection } from "mongoose";
import { getUserModel } from "@/server/models/User";

export async function findAll(conn: Connection) {
    return getUserModel(conn).find();
}

export async function findById(conn: Connection, id: string) {
    return getUserModel(conn).findById(id);
}

export async function create(conn: Connection, data: any) {
    return getUserModel(conn).create(data);
}

export async function update(conn: Connection, id: string, data: any) {
    return getUserModel(conn).findByIdAndUpdate(id, data, { new: true });
}

export async function remove(conn: Connection, id: string) {
    return getUserModel(conn).findByIdAndDelete(id);
}