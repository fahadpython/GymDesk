import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ImportMembers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data as any[]);
      }
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: data })
      });
      const resultData = await res.json();
      setResult(resultData);
      setData([]); // clear preview
    } catch (err) {
      alert("Failed to import members");
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const sample = "name,phone,address,plan,fees_paid_until,notes\nJohn Doe,9876543210,Mumbai,Monthly,2026-06-01,Test member 1\nJane Smith,9123456780,Delhi,Yearly,2024-01-01,Expired member";
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gymdesk_import_sample.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import Members</h1>
        <p className="text-lg text-slate-500 mt-2">Upload a CSV file to add multiple members at once.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Select CSV File</p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            
            <Button variant="outline" onClick={downloadSample} className="w-full h-12">
              Download Sample CSV
            </Button>
          </div>

          <div className="flex-1 w-full bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-lg text-blue-900 mb-2">💡 Have data on paper?</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Open ChatGPT or Google Lens on your phone.</li>
              <li>Take a clear photo of your notebook/register.</li>
              <li>Ask: <span className="italic font-medium">"Convert this to a CSV table with columns: name, phone, address, plan, fees_paid_until format YYYY-MM-DD"</span>.</li>
              <li>Save the result as a .csv file and upload it here!</li>
            </ol>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Preview ({data.length} records)</h2>
              <p className="text-slate-500 text-sm mt-1">Check data before importing. Invalid dates will default to today.</p>
            </div>
            <Button size="lg" onClick={handleImport} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Importing...' : <><Upload className="w-5 h-5 mr-2" /> Confirm & Import</>}
            </Button>
          </div>
          <div className="overflow-x-auto max-h-96 border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Paid Until</th>
                  <th className="px-6 py-3">Plan</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 100).map((row, i) => (
                  <tr key={i} className="bg-white border-b">
                    <td className="px-6 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-6 py-3">{row.phone}</td>
                    <td className="px-6 py-3">{row.fees_paid_until}</td>
                    <td className="px-6 py-3">{row.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && <p className="p-4 text-center text-slate-500">Showing first 100 rows...</p>}
          </div>
        </div>
      )}

      {result && (
        <div className={`p-6 rounded-xl border ${result.errors.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {result.errors.length > 0 ? <AlertTriangle className="w-8 h-8 text-orange-500"/> : <CheckCircle2 className="w-8 h-8 text-green-500"/>}
            <h2 className="text-2xl font-bold">Import Complete</h2>
          </div>
          <p className="text-lg mb-4 font-medium text-slate-700">
            ✅ {result.successCount} members imported successfully.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-red-700 font-bold mb-2">❌ {result.errors.length} rows failed:</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/members">Go to Members List</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
