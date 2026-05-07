import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { addMonths, format } from 'date-fns';

export function AddMember() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    plan: 'Monthly',
    membershipStart: format(new Date(), 'yyyy-MM-dd'),
    firstPaymentAmount: '',
    firstPaymentMonths: '1',
    paymentMode: 'CASH'
  });

  const handleNext = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please enter both name and phone number.');
      return;
    }
    if (formData.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setStep(2);
  };

  const calculateEnd = () => {
    const start = new Date(formData.membershipStart);
    const end = addMonths(start, parseInt(formData.firstPaymentMonths));
    return format(end, 'dd MMM yyyy');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.firstPaymentAmount) {
      setError('Please enter the payment amount.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        firstPaymentAmount: parseFloat(formData.firstPaymentAmount),
        firstPaymentMonths: parseInt(formData.firstPaymentMonths)
      };

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create member');
      }

      alert('Member created successfully!');
      navigate('/members');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add New Member</h1>
        <p className="text-lg text-slate-500 mt-2">Step {step} of 2</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        {step === 1 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base">Full Name *</Label>
              <Input 
                id="name" 
                className="h-14 text-lg" 
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-base">Phone Number *</Label>
              <Input 
                id="phone" 
                type="tel"
                className="h-14 text-lg" 
                placeholder="10 digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="address" className="text-base">Address (Optional)</Label>
              <Input 
                id="address" 
                className="h-14 text-lg" 
                placeholder="Area or Street"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleNext} size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700">
                Next Step <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <button type="button" onClick={() => setStep(1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <h2 className="text-2xl font-semibold">First Payment</h2>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-blue-600 font-medium">Adding</p>
                <p className="font-bold text-lg">{formData.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Phone</p>
                <p className="font-bold text-lg">{formData.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="start" className="text-base">Join Date</Label>
                <Input 
                  id="start" 
                  type="date"
                  className="h-14 text-lg"
                  value={formData.membershipStart}
                  onChange={e => setFormData({...formData, membershipStart: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="months" className="text-base">Duration (Months)</Label>
                <select 
                  id="months"
                  className="flex h-14 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  value={formData.firstPaymentMonths}
                  onChange={e => setFormData({...formData, firstPaymentMonths: e.target.value})}
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months (Quarterly)</option>
                  <option value="6">6 Months (Half-Yearly)</option>
                  <option value="12">12 Months (Yearly)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <span className="text-green-800 font-medium tracking-wide">Valid Until: </span>
              <span className="text-xl font-bold text-green-900 ml-2">{calculateEnd()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-base">Amount Paid (₹)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  className="h-14 text-lg font-bold"
                  placeholder="e.g. 1500"
                  value={formData.firstPaymentAmount}
                  onChange={e => setFormData({...formData, firstPaymentAmount: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="mode" className="text-base">Payment Mode</Label>
                <select 
                  id="mode"
                  className="flex h-14 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  value={formData.paymentMode}
                  onChange={e => setFormData({...formData, paymentMode: e.target.value})}
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📱 UPI (GPay/PhonePe)</option>
                  <option value="CARD">💳 Card</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button type="submit" disabled={loading} size="lg" className="w-full h-16 text-xl bg-green-600 hover:bg-green-700">
                {loading ? 'Saving...' : <><Check className="mr-2 h-6 w-6" /> Save Member & Payment</>}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
