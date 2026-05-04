
'use client';

import { doc, Firestore } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export interface LogEntry {
  action: string;
  details: string;
  adminEmail: string;
}

/**
 * Records an administrative action to the activity_logs collection.
 */
export function logAdminAction(firestore: Firestore, entry: LogEntry) {
  const logId = crypto.randomUUID();
  const logRef = doc(firestore, "activity_logs", logId);
  
  setDocumentNonBlocking(logRef, {
    ...entry,
    id: logId,
    timestamp: Date.now(),
  }, { merge: true });
}
