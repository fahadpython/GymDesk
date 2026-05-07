import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Phone } from 'lucide-react';
import { format } from 'date-fns';

export function Fees() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Form State
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('1');
  const [mode, setMode] = useState('CASH');
  const [savingMsg, setSavingMsg] = useState('');

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        if (userId) {
          const m = data.find((x: any) => x.id === userId);
          if (m) setSelectedMember(m);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMsg('Saving payment...');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          amount: parseFloat(amount),
          months: parseInt(months),
          paymentDate: new Date(),
          paymentMode: mode
        })
      });
      if (!res.ok) throw new Error('Payment failed');
      
      alert('Payment recorded successfully!');
      window.location.href = '/fees'; // Reload page to refresh list
    } catch (err) {
      alert('Failed to save payment.');
      setSavingMsg('');
    }
  };

  const overdue = members.filter(m => m.status === 'EXPIRED');
  const expiringSoon = members.filter(m => m.status === 'EXPIRING_SOON');

  if (loading) return <div className="p-8 text-xl">Loading Fees Dashboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fees & Payments</h1>
          <p className="text-lg text-slate-500 mt-1">Manage renewals and overdue accounts.</p>
        </div>
      </div>

      {selectedMember && (
        <div className="bg-white p-8 rounded-xl shadow-md border-2 border-blue-200 relative">
          <Link to="/fees" className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            ✕
          </Link>
          <h2 className="text-2xl font-bold mb-6">Record Payment for {selectedMember.name}</h2>
          <form onSubmit={handlePaymentSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base text-slate-600">Current Expiry Date</Label>
                <div className="h-14 px-4 bg-slate-100 rounded-lg flex items-center font-bold text-lg text-slate-700">
                  {format(new Date(selectedMember.membershipEnd), 'dd MMM yyyy')}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="months" className="text-base">Extend By (Months)</Label>
                <select 
                  id="months"
                  required
                  className="flex h-14 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  value={months}
                  onChange={e => setMonths(e.target.value)}
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base">Amount Received (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  required 
                  min="0"
                  className="h-14 text-lg font-bold"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode" className="text-base">Payment Mode</Label>
                <select 
                  id="mode"
                  required
                  className="flex h-14 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  value={mode}
                  onChange={e => setMode(e.target.value)}
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                </select>
              </div>
            </div>
            <Button type="submit" size="lg" className="h-16 text-lg w-full bg-green-600 hover:bg-green-700" disabled={!!savingMsg}>
              {savingMsg || <><Check className="mr-2 h-6 w-6"/> Record Fees & Activate</>}
            </Button>
          </form>
        </div>
      )}

      {/* Overview Boxes */}
      {!selectedMember && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600">OVERDUE ({overdue.length})</h2>
            </div>
            {overdue.length === 0 ? (
              <p className="text-lg text-slate-500 bg-slate-50 p-6 rounded-lg text-center border">No overdue members. Great job!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdue.map(m => (
                  <div key={m.id} className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{m.name}</h3>
                      <a href={`tel:${m.phone}`} className="inline-flex items-center text-slate-600 mt-2 hover:text-blue-600 font-medium">
                        <Phone className="w-4 h-4 mr-2" /> {m.phone}
                      </a>
                      <p className="text-red-700 font-bold mt-3 text-sm bg-red-50 p-2 rounded inline-block">
                        Expired {format(new Date(m.membershipEnd), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <Button asChild className="w-full mt-4 h-12 text-base font-medium">
                      <Link to={`/fees?userId=${m.id}`}>Record Payment</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
             <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-orange-600">EXPIRING IN 3 DAYS ({expiringSoon.length})</h2>
            </div>
            {expiringSoon.length === 0 ? (
              <p className="text-lg text-slate-500 bg-slate-50 p-6 rounded-lg text-center border">No members expiring within 3 days.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiringSoon.map(m => (
                  <div key={m.id} className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{m.name}</h3>
                      <a href={`tel:${m.phone}`} className="inline-flex items-center text-slate-600 mt-2 hover:text-blue-600 font-medium">
                        <Phone className="w-4 h-4 mr-2" /> {m.phone}
                      </a>
                      <p className="text-orange-700 font-bold mt-3 text-sm bg-orange-50 p-2 rounded inline-block">
                        Expiring {format(new Date(m.membershipEnd), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <Button asChild className="w-full mt-4 h-12 text-base font-medium bg-orange-600 hover:bg-orange-700 text-white">
                      <Link to={`/fees?userId=${m.id}`}>Renew Now</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
