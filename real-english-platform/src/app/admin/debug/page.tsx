
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function DebugEnvPage() {
    const supabase = await createClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dbCheck = "Pending";
    try {
        const { data, error } = await supabase.from('exams').select('count').limit(1).single();
        if (error) dbCheck = `Error: ${error.message}`;
        else dbCheck = "Success - Connected";
    } catch (e: any) {
        dbCheck = `Exception: ${e.message}`;
    }

    return (
        <div className="p-10 space-y-4">
            <h1 className="text-2xl font-bold">Environment Debug</h1>
            <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {url ? `${url.substring(0, 15)}... (Exists)` : <span className="text-red-500">MISSING</span>}
            </div>
            <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {anon ? "Exists (Hidden)" : <span className="text-red-500">MISSING</span>}
            </div>
            <div>
                <strong>SUPABASE_SERVICE_ROLE_KEY:</strong> {service ? "Exists (Hidden)" : <span className="text-gray-500">MISSING (Not unexpected)</span>}
            </div>
            <div>
                <strong>DB Connection Check (Client):</strong> {dbCheck}
            </div>
            <pre className="bg-gray-100 p-4 rounded">
                Process Env Keys: {JSON.stringify(Object.keys(process.env).filter(k => k.includes('SUPABASE')), null, 2)}
            </pre>
        </div>
    );
}
