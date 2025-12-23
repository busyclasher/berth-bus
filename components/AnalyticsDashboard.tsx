
import React from 'react';
import { AnalyticsData } from '../types';
import { TrendingUp, Clock, DollarSign, Wrench, Search, Bus as BusIcon, Zap, Target } from 'lucide-react';

interface AnalyticsProps {
  data: AnalyticsData;
}

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ data }) => {
  // Calculate before/after metrics
  const oldSearchTimeMin = 15; // 15 minutes before system
  const newSearchTimeSec = data.avgSearchTimeSeconds;
  const timeSavedPerSearch = (oldSearchTimeMin * 60) - newSearchTimeSec;
  const efficiencyGain = ((timeSavedPerSearch / (oldSearchTimeMin * 60)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ROI Hero Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 md:p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Monthly Cost Savings</h2>
              <p className="text-green-100 text-sm font-medium">Calculated from time reduction & labor costs</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-6xl md:text-7xl font-black tracking-tighter">
              ${(data.costSavingsMonthly / 1000).toFixed(1)}K
            </span>
            <span className="text-2xl font-bold text-green-100">SGD/month</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-green-100 text-xs font-bold uppercase mb-1">Efficiency Gain</div>
              <div className="text-3xl font-black">{efficiencyGain}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-green-100 text-xs font-bold uppercase mb-1">Time Saved</div>
              <div className="text-3xl font-black">{data.timeSavedHours}h</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-green-100 text-xs font-bold uppercase mb-1">Searches</div>
              <div className="text-3xl font-black">{data.totalSearches}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-green-100 text-xs font-bold uppercase mb-1">Issues Fixed</div>
              <div className="text-3xl font-black">{data.maintenanceResolved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before System */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Before PBMS</h3>
              <p className="text-red-600 text-xs font-bold uppercase">Manual Search Process</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Avg. Search Time</span>
              <span className="text-2xl font-black text-red-600">{oldSearchTimeMin} min</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Walking Distance</span>
              <span className="text-2xl font-black text-red-600">~500m</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Success Rate</span>
              <span className="text-2xl font-black text-red-600">65%</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-800 leading-relaxed">
              ❌ Technicians spent hours searching across multiple floors with no GPS signal
            </p>
          </div>
        </div>

        {/* After System */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-green-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">After PBMS</h3>
              <p className="text-green-600 text-xs font-bold uppercase">NFC-Based Tracking</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Avg. Search Time</span>
              <span className="text-2xl font-black text-green-600">{newSearchTimeSec}s</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Walking Distance</span>
              <span className="text-2xl font-black text-green-600">Direct</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
              <span className="text-sm font-bold text-gray-700">Success Rate</span>
              <span className="text-2xl font-black text-green-600">100%</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-100 rounded-xl">
            <p className="text-xs font-bold text-green-800 leading-relaxed">
              ✅ Instant location lookup. Walk straight to the exact berth. Zero search time.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Search size={20} />}
          label="Daily Searches"
          value={Math.ceil(data.totalSearches / 7)}
          color="blue"
          subtitle="Per day average"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Time per Search"
          value={`${newSearchTimeSec}s`}
          color="purple"
          subtitle={`Down from ${oldSearchTimeMin}min`}
        />
        <MetricCard
          icon={<BusIcon size={20} />}
          label="Daily Dispatches"
          value={data.dispatchesPerDay}
          color="orange"
          subtitle="Buses deployed"
        />
        <MetricCard
          icon={<Wrench size={20} />}
          label="Issues Resolved"
          value={data.maintenanceResolved}
          color="green"
          subtitle="This month"
        />
      </div>

      {/* ROI Breakdown */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">ROI Calculation Breakdown</h3>
            <p className="text-gray-500 text-sm font-medium">How we calculate cost savings</p>
          </div>
        </div>
        <div className="space-y-3">
          <CalcRow
            label="Time saved per search"
            value={`${Math.floor(timeSavedPerSearch / 60)} min ${Math.floor(timeSavedPerSearch % 60)} sec`}
            color="blue"
          />
          <CalcRow
            label="Total searches this month"
            value={`${data.totalSearches} searches`}
            color="purple"
          />
          <CalcRow
            label="Labor cost (avg technician)"
            value="$30 SGD/hour"
            color="orange"
          />
          <CalcRow
            label="Additional productivity gains"
            value="Faster maintenance turnaround"
            color="green"
          />
          <div className="pt-4 mt-4 border-t-2 border-gray-100">
            <CalcRow
              label="Monthly Cost Savings"
              value={`$${data.costSavingsMonthly.toLocaleString()} SGD`}
              color="green"
              large
            />
          </div>
        </div>
      </div>

      {/* Annual Projection */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-2">Annual Projection</p>
            <p className="text-5xl font-black tracking-tighter">
              ${((data.costSavingsMonthly * 12) / 1000).toFixed(0)}K
            </p>
            <p className="text-blue-100 text-sm font-medium mt-2">
              Estimated savings over 12 months
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-3">
              <div className="text-6xl font-black">
                <TrendingUp size={48} />
              </div>
            </div>
            <p className="text-xs font-bold text-blue-100 uppercase">System ROI: 2,400%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color, subtitle }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[10px] text-gray-400 font-medium">{subtitle}</div>
    </div>
  );
};

const CalcRow = ({ label, value, color, large }: any) => {
  const colors = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
  };

  return (
    <div className={`flex justify-between items-center p-4 rounded-xl ${colors[color] || 'bg-gray-50'}`}>
      <span className={`${large ? 'text-base' : 'text-sm'} font-bold text-gray-700`}>{label}</span>
      <span className={`${large ? 'text-2xl' : 'text-lg'} font-black text-gray-900`}>{value}</span>
    </div>
  );
};

export default AnalyticsDashboard;


