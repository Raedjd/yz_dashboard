import {Connection} from "mongoose";
import {getDocumentModel} from "@/server/models/Document";


export async function findAll(conn: Connection) {
    return getDocumentModel(conn).find();
}

export async function findById(conn: Connection, id: string) {
    return getDocumentModel(conn).findById(id);
}

export async function create(conn: Connection, data: any) {
    return getDocumentModel(conn).create(data);
}