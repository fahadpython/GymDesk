import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, AlertCircle, IndianRupee, UserPlus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  activeMembers: number;
  feesCollected: number;
  overdueCount: number;
  expiringSoonCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-xl text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-lg text-slate-500 mt-2">Welcome back to GymDesk.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Members</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{stats.activeMembers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Fees This Month</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">₹{stats.feesCollected.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overdue Fees</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.overdueCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Expiring Soon</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.expiringSoonCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button asChild size="lg" className="h-16 text-lg bg-blue-600 hover:bg-blue-700">
            <Link to="/members/new">
              <UserPlus className="mr-3 h-6 w-6" /> Add Member
            </Link>
          </Button>
          <Button asChild size="lg" className="h-16 text-lg bg-slate-900 hover:bg-slate-800">
            <Link to="/fees">
              <CreditCard className="mr-3 h-6 w-6" /> Record Payment
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 text-lg border-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300">
            <Link to="/fees?filter=OVERDUE">
              <AlertCircle className="mr-3 h-6 w-6 text-red-500" /> View Overdue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
