import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Phone, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export function MembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, EXPIRED, EXPIRING_SOON

  const fetchMembers = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (filter !== 'ALL') query.append('status', filter);

    fetch(`/api/members?${query.toString()}`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filter]);

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'ACTIVE') return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">Active</span>;
    if (status === 'EXPIRED') return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">Expired</span>;
    if (status === 'EXPIRING_SOON') return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">Expiring Soon</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Members</h1>
        <div className="flex space-x-3">
          <Button asChild variant="outline" size="lg" className="h-12 border-2">
            <Link to="/members/import">
              <FileUp className="mr-2 h-5 w-5" /> Import
            </Link>
          </Button>
          <Button asChild size="lg" className="h-12 bg-blue-600 hover:bg-blue-700">
            <Link to="/members/new">
              <UserPlus className="mr-2 h-5 w-5" /> Add New Member
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="pl-10 h-12 text-lg w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['ALL', 'ACTIVE', 'EXPIRED', 'EXPIRING_SOON'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                filter === f 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-xl text-slate-500">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <Link key={member.id} to={`/members/${member.id}`} className="block block group">
              <div className="bg-white p-6 rounded-xl border shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                    <p className="flex items-center text-slate-500 mt-1">
                      <Phone className="w-4 h-4 mr-1" /> {member.phone}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl overflow-hidden">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : member.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="pt-4 border-t flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Valid Till</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(member.membershipEnd), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
