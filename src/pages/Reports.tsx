import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { format } from 'date-fns';

export function Reports() {
  const [growthData, setGrowthData] = useState([]);
  const [expiredData, setExpiredData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);

  useEffect(() => {
    fetch('/api/reports/growth').then(r => r.json()).then(setGrowthData);
    fetch('/api/reports/expired').then(r => r.json()).then(setExpiredData);
    fetch('/api/reports/collection').then(r => r.json()).then(setCollectionData);
  }, []);

  const downloadCSV = (filename: string, data: any[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-lg text-slate-500 mt-1">Export and analyze your gym's data.</p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="print:hidden">
          <FileText className="w-5 h-5 mr-2" /> Print Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2" /> Member Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="members" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button onClick={() => downloadCSV('member_growth', growthData)} className="w-full mt-4 print:hidden" variant="secondary">
              <Download className="w-4 h-4 mr-2" /> Export to CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center"><DollarSign className="mr-2" /> This Month's Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto pr-2 border rounded-md mb-4 p-2 bg-slate-50">
              {collectionData.length === 0 ? <p className="text-slate-500 text-center mt-10">No payments yet this month.</p> : (
                <ul className="space-y-2">
                  {collectionData.map((p: any) => (
                    <li key={p.id} className="flex justify-between p-2 bg-white rounded border shadow-sm text-sm">
                      <span className="font-medium">{p.member?.name}</span>
                      <span className="text-green-700 font-bold">₹{p.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button 
              onClick={() => {
                const formatted = collectionData.map((p: any) => ({
                  Name: p.member?.name,
                  Amount: p.amount,
                  Date: format(new Date(p.paymentDate), 'yyyy-MM-dd'),
                  Mode: p.paymentMode
                }));
                downloadCSV('collections_this_month', formatted);
              }} 
              className="w-full print:hidden bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" /> Export Collections CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-red-50 p-6 rounded-t-xl">
            <CardTitle className="text-xl flex items-center text-red-900"><Users className="mr-2 text-red-600" /> Expired Members</CardTitle>
            <Button 
              onClick={() => {
                const formatted = expiredData.map((m: any) => ({
                  Name: m.name, Phone: m.phone, ExpiredOn: format(new Date(m.membershipEnd), 'yyyy-MM-dd')
                }));
                downloadCSV('expired_members', formatted);
              }}
              variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 print:hidden"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 sticky top-0 text-slate-700">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Expired On</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expiredData.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{m.name}</td>
                      <td className="px-6 py-3">{m.phone}</td>
                      <td className="px-6 py-3 text-red-600 font-medium">{format(new Date(m.membershipEnd), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                  {expiredData.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">No expired members.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .max-h-96 { max-height: none !important; overflow: visible !important; }
          nav, aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}
