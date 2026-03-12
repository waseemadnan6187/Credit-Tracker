
import React, { useState, useRef } from 'react';
import { SyncState } from '../types';
// Removed invalid imports: importJsonData, getDatabaseFile, importSqliteFile
import { getAllDataForSync, setSetting } from '../database';

interface Props {
  syncUrl: string;
  setSyncUrl: (url: string) => void;
  syncState: SyncState;
  onSyncNow: (isTest?: boolean) => void;
  onPullNow: () => void;
  refreshData: () => void;
}

const CloudSyncPage: React.FC<Props> = ({ syncUrl, setSyncUrl, syncState, onSyncNow, onPullNow, refreshData }) => {
  const [localUrl, setLocalUrl] = useState(syncUrl);
  const [activeTab, setActiveTab] = useState<'cloud' | 'manual'>('cloud');

  const handleUpdateUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setSyncUrl(localUrl);
    setSetting('cloud_sync_url', localUrl);
    alert("Endpoint updated.");
  };

  // Fixed: getAllDataForSync is async, so handleExportJson must await the result.
  const handleExportJson = async () => {
    try {
      const data = await getAllDataForSync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data. Please check connection to the backend server.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Sync Center</h2>
          <p className="text-slate-500 mt-2 font-medium">Remote connectivity and manual snapshots.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('cloud')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'cloud' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Cloud</button>
          <button onClick={() => setActiveTab('manual')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>Manual</button>
        </div>
      </div>

      {activeTab === 'cloud' && (
        <div className="space-y-8">
          <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[32px] space-y-4">
             <h4 className="font-black text-amber-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856" /></svg>
                Connection Troubleshooter
             </h4>
             <ul className="text-sm text-amber-800 space-y-2 list-disc ml-6 font-medium">
                <li><b>Mixed Content:</b> Ensure your endpoint is <b>HTTPS</b>. Browsers block HTTP on secure apps.</li>
                <li><b>CORS:</b> Your server <i>must</i> allow cross-origin requests. Add <code>Access-Control-Allow-Origin: *</code>.</li>
                <li><b>Apps Script Tip:</b> Do not run 'doPost' manually in the script editor. It only works via web requests from the app.</li>
             </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                 <h3 className="text-2xl font-black mb-6">Endpoint Settings</h3>
                 <form onSubmit={handleUpdateUrl} className="space-y-6">
                    <input type="url" placeholder="https://script.google.com/macros/s/.../exec" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium" value={localUrl} onChange={e => setLocalUrl(e.target.value)} />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black">SAVE URL</button>
                        <button type="button" onClick={() => onSyncNow(true)} className="px-6 bg-slate-100 text-slate-600 rounded-2xl font-black">TEST</button>
                    </div>
                 </form>
                 {syncState.errorMessage && (
                    <div className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-mono whitespace-pre-wrap leading-relaxed">
                        {syncState.errorMessage}
                    </div>
                 )}
            </div>

            <div className="bg-slate-900 p-10 rounded-[48px] text-white flex flex-col justify-between shadow-2xl">
               <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black tracking-tighter">Live Controls</h3>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${syncState.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>{syncState.status}</div>
               </div>
               <div className="mt-10 grid grid-cols-2 gap-4">
                  <button onClick={() => onSyncNow(false)} className="bg-blue-600 py-6 rounded-3xl font-black text-lg hover:bg-blue-500 transition-all active:scale-95">PUSH DATA</button>
                  <button onClick={onPullNow} className="bg-slate-800 py-6 rounded-3xl font-black text-lg hover:bg-slate-700 transition-all active:scale-95">PULL DATA</button>
               </div>
               <p className="mt-6 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Last Sync: {syncState.lastSync || 'Never'}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-10 rounded-[48px] space-y-8">
             <h4 className="text-xl font-black">Backend Integration Snippets</h4>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <p className="font-black uppercase text-[10px] text-slate-400">Google Apps Script (Robust Version)</p>
                    <div className="bg-slate-900 p-6 rounded-2xl font-mono text-[10px] text-blue-300 overflow-x-auto">
                        <pre>{`function doGet(e) {
  var data = PropertiesService.getScriptProperties().getProperty('BACKUP');
  return ContentService.createTextOutput(data || '{"bills":[]}')
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // If e is undefined, it means you're running manually in the editor.
  if (!e || !e.postData) return ContentService.createTextOutput("Error: No data");
  
  var contents = e.postData.contents;
  PropertiesService.getScriptProperties().setProperty('BACKUP', contents);
  return ContentService.createTextOutput("OK");
}`}</pre>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="font-black uppercase text-[10px] text-slate-400">Python FastAPI (Must have CORS)</p>
                    <div className="bg-slate-900 p-6 rounded-2xl font-mono text-[10px] text-blue-300 overflow-x-auto">
                        <pre>{`from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])
STORAGE = {"bills": [], "customers": []}

@app.get("/sync")
def pull():
    return STORAGE

@app.post("/sync")
async def push(req: Request):
    global STORAGE
    STORAGE = await req.json()
    return {"status": "ok"}`}</pre>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="bg-white p-20 rounded-[56px] border-2 border-slate-100 flex flex-col items-center gap-6 text-center">
            <h3 className="text-3xl font-black">Manual Local Backup</h3>
            <p className="text-slate-500 max-w-sm">Download your entire local database as a JSON file to your computer.</p>
            <button onClick={handleExportJson} className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">EXPORT LEDGER (.JSON)</button>
        </div>
      )}
    </div>
  );
};

export default CloudSyncPage;
