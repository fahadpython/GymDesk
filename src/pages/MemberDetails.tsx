import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Phone, Calendar, MapPin, IndianRupee, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/members/${id}`)
      .then(res => res.json())
      .then(data => setMember(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-xl text-slate-500">Loading details...</div>;
  if (!member) return <div className="p-8 text-xl text-red-500">Member not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link to="/members" className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Member Profile</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-8 sm:flex justify-between items-start gap-8 border-b">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-5xl text-slate-400 overflow-hidden shadow-inner">
              {member.photoUrl ? (
                <img src={member.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{member.name}</h2>
                <div className="mt-4 space-y-2">
                  <p className="flex items-center justify-center sm:justify-start text-lg text-slate-600 font-medium">
                    <Phone className="w-5 h-5 mr-3 text-slate-400" /> {member.phone}
                  </p>
                  {member.address && (
                    <p className="flex items-center justify-center sm:justify-start text-lg text-slate-600">
                      <MapPin className="w-5 h-5 mr-3 text-slate-400" /> {member.address}
                    </p>
                  )}
                  <p className="flex items-center justify-center sm:justify-start text-lg text-slate-600">
                    <Calendar className="w-5 h-5 mr-3 text-slate-400" /> Joined on {format(new Date(member.joinDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-0 p-6 bg-slate-50 rounded-xl text-center sm:text-right min-w-[240px]">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</p>
            {member.status === 'ACTIVE' && (
              <div className="text-green-700 bg-green-100 px-4 py-2 rounded-lg font-bold text-lg inline-block">Active</div>
            )}
            {member.status === 'EXPIRED' && (
              <div className="text-red-700 bg-red-100 px-4 py-2 rounded-lg font-bold text-lg inline-block">Expired</div>
            )}
            {member.status === 'EXPIRING_SOON' && (
              <div className="text-orange-700 bg-orange-100 px-4 py-2 rounded-lg font-bold text-lg inline-block">Expiring Soon</div>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-slate-500">Valid Until</p>
              <p className="text-xl font-bold text-slate-900">{format(new Date(member.membershipEnd), 'dd MMM yyyy')}</p>
            </div>
            
            <Button asChild size="lg" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-lg h-14">
              <Link to={`/fees?userId=${member.id}`}>
                <CreditCard className="mr-2 h-5 w-5" /> Record Payment
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Payment History</h3>
          {member.payments.length === 0 ? (
            <p className="text-slate-500 text-lg">No payments recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Mode</th>
                    <th className="p-4 font-semibold">Months Added</th>
                    <th className="p-4 font-semibold text-right">Extended Till</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-lg">
                  {member.payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-900">{format(new Date(p.paymentDate), 'dd MMM yyyy')}</td>
                      <td className="p-4 font-bold text-slate-900"><div className="flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{p.amount}</div></td>
                      <td className="p-4 text-slate-600">{p.paymentMode}</td>
                      <td className="p-4 text-slate-600">{p.months} Month(s)</td>
                      <td className="p-4 font-medium text-right text-slate-900">{format(new Date(p.newMembershipEnd), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
