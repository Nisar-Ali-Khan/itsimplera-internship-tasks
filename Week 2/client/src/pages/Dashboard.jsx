import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ListTodo, Clock, Loader2, CheckCircle2, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import Loader from '../components/Loader';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/validators';

const PRIORITY_CHART_COLORS = { Low: '#14B8A6', Medium: '#F59E0B', High: '#FB7185' };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    userService
      .getDashboardStats()
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <Loader />
      </AppLayout>
    );
  }

  const stats = data?.stats || { total: 0, pending: 0, inProgress: 0, completed: 0, priorityBreakdown: {} };
  const chartData = Object.entries(stats.priorityBreakdown || {})
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <AppLayout title="Dashboard">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display font-semibold text-2xl">Hi, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's what's on your plate today.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')}>
          <PlusCircle size={16} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard label="Total Tasks" value={stats.total} icon={ListTodo} accent="teal" />
        <DashboardCard label="Pending" value={stats.pending} icon={Clock} accent="slate" />
        <DashboardCard label="In Progress" value={stats.inProgress} icon={Loader2} accent="amber" />
        <DashboardCard label="Completed" value={stats.completed} icon={CheckCircle2} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-semibold mb-4">Priority Breakdown</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">No tasks to chart yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_CHART_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 card p-5">
          <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
          {data?.recentActivity?.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
              No activity yet — create your first task.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {data.recentActivity.map((task) => (
                <button
                  key={task._id}
                  onClick={() => navigate(`/tasks/${task._id}/edit`)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs font-mono text-slate-400">
                      Updated {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
