
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, History, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function ActivityLogsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const logsQuery = useMemoFirebase(() => {
    return query(collection(firestore, "activity_logs"), orderBy("timestamp", "desc"), limit(100));
  }, [firestore]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  const handleDelete = (id: string) => {
    if (!confirm("Remove this entry from the audit history?")) return;
    const docRef = doc(firestore, "activity_logs", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Log purged" });
  };

  const handleClearAll = () => {
    if (!confirm("Are you sure you want to clear the entire activity history? This action is irreversible.")) return;
    logs?.forEach(log => {
      const docRef = doc(firestore, "activity_logs", log.id);
      deleteDocumentNonBlocking(docRef);
    });
    toast({ title: "Registry history cleared" });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-2">
            <History className="h-3 w-3" />
            Audit Protocol
          </div>
          <h1 className="text-5xl font-black tracking-tighter font-headline uppercase">Activity Logs</h1>
          <p className="text-muted-foreground font-medium mt-1">Real-time tracking of all vault interactions.</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleClearAll}
          disabled={!logs || logs.length === 0}
          className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-[10px]"
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          Purge Entire Registry
        </Button>
      </div>

      <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">System History</CardTitle>
          <CardDescription className="font-medium text-xs">A record of the last 100 administrative actions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Scanning registry...</div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Protocol Action</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Timestamp</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="py-4">
                      <div>
                        <p className="font-bold text-sm text-white">{log.action}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{log.details}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-black uppercase tracking-widest text-primary">{log.adminEmail}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-20 text-center text-muted-foreground italic font-medium">
              Audit history is currently empty.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
