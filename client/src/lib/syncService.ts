// import { db, PendingSync } from "./db";
// import { supabase } from "./db";

// export const queueOfflineAction = async (table: string, operation: PendingSync['operation'], payload: any) => {
//     await db.pendingSync.add({
//         table,
//         operation,
//         payload,
//         created_at: Date.now()
//     });
// };

// export const syncDataWithCloud = async () => {
//     const pending = await db.pendingSync.toArray();
//     if (pending.length === 0) return;

//     for (const action of pending) {
//         const { table, operation, payload } = action;
        
//         let error;
//         if (operation === 'insert') {
//             ({ error } = await supabase.from(table).insert(payload));
//         }
//         // Add update/delete logic here later...

//         if (!error) {
//             await db.pendingSync.delete(action.id!);
//         }
//     }
// };