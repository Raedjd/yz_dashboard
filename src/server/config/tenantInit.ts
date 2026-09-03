import { Connection } from "mongoose";
import { getUserModel } from "@/server/models/User";

import {getScheduleModel} from "@server/models/Schedule";
import {collectionTypes, getModelByCollectionType} from "@server/models/GenericCollection";

export async function initTenantDatabase(conn: Connection): Promise<void> {
    await getUserModel(conn).init();
    await getScheduleModel(conn).init();

    for (const type of collectionTypes) {
        await getModelByCollectionType(conn, type).init();
    }
}