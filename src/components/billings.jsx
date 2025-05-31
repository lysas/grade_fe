import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  DollarSign, CreditCard, TrendingUp, TrendingDown, AlertTriangle, 
  Calendar, Filter, Download, Plus, Edit, Trash2, Eye, FileText,
  Settings, RefreshCw, Bell, Users, Activity, Menu, Home, BarChart3,
  Receipt, Target, History, ChevronRight, Search, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000'; // Base URL without /billing

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Service
class BillingAPI {
  async request(url, options = {}) {
    try {
      console.log(`Making request to: ${url}`);
      const response = await api({
        url,
        ...options,
      });
      console.log(`Response from ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Request failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
      toast.error(errorMessage);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardData() {
    return this.request('/api/dashboard/');
  }

  // Usage Records
  async getUsageRecords(params = {}) {
    return this.request('/api/usage/', { params });
  }

  // Analytics
  async getAnalytics(params = {}) {
    return this.request('/api/analytics/', { params });
  }

  // Invoices
  async getInvoices() {
    return this.request('/api/invoices/');
  }

  async getInvoiceDetail(invoiceId) {
    return this.request(`/api/invoices/${invoiceId}/`);
  }

  async downloadInvoicePDF(invoiceId) {
    try {
      const response = await api.get(`/api/invoices/${invoiceId}/pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Failed to download invoice PDF');
      throw error;
    }
  }

  // Budgets
  async getBudgets() {
    return this.request('/api/budgets/');
  }

  async createBudget(budgetData) {
    return this.request('/api/budgets/create/', {
      method: 'POST',
      data: budgetData,
    });
  }

  async updateBudget(budgetId, budgetData) {
    return this.request(`/api/budgets/${budgetId}/update/`, {
      method: 'POST',
      data: budgetData,
    });
  }

  async deleteBudget(budgetId) {
    return this.request(`/api/budgets/${budgetId}/delete/`, {
      method: 'DELETE',
    });
  }

  async getBudgetStatus(budgetId) {
    return this.request(`/api/budgets/${budgetId}/status/`);
  }

  // Credits
  async getCreditHistory() {
    return this.request('/api/credits/history/');
  }

  // API endpoints
  async getSpendingData(params = {}) {
    return this.request('/api/api/spending-data/', { params });
  }
}

const apiInstance = new BillingAPI();

// Context for global state
const BillingContext = createContext();

// Navigation Component
const Navigation = ({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'usage', label: 'Usage Records', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'credits', label: 'Credit History', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-md shadow-md"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Billing Portal</h1>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  currentView === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiInstance.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const totalCredits = (dashboardData?.user_credit?.free_credit || 0) + (dashboardData?.user_credit?.paid_credit || 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">${totalCredits.toFixed(2)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Free: ${dashboardData?.user_credit?.free_credit?.toFixed(2) || '0.00'} | 
            Paid: ${dashboardData?.user_credit?.paid_credit?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardData?.current_month_spending?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.active_budgets?.length || 0}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.recent_invoices?.length || 0}</p>
            </div>
            <Receipt className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Usage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData?.daily_usage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value}`, 'Cost']} />
              <Area type="monotone" dataKey="total_cost" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.spending_by_service}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="total_cost"
                nameKey="service_type__display_name"
                label={({ name, value }) => `${name}: $${value}`}
              >
                {dashboardData?.spending_by_service?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {dashboardData?.recent_transactions?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.paid_credit_change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.paid_credit_change > 0 ? '+' : ''}${transaction.paid_credit_change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
          <div className="space-y-4">
            {dashboardData?.active_budgets?.map((budgetData) => (
              <div key={budgetData.budget.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{budgetData.budget.name}</span>
                  <span className="text-sm text-gray-500">
                    ${budgetData.status.current_spending?.toFixed(2)} / ${budgetData.budget.budget_amount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      budgetData.status.percentage_used > 90 ? 'bg-red-500' :
                      budgetData.status.percentage_used > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetData.status.percentage_used, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {budgetData.status.percentage_used?.toFixed(1)}% used
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Usage Records Component
const UsageRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service_type: '',
    date_from: '',
    date_to: '',
    is_billable: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecords();
  }, [filters, currentPage]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await apiInstance.getUsageRecords({ ...filters, page: currentPage });
      setRecords(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 25));
    } catch (error) {
      console.error('Error fetching usage records:', error);
      toast.error('Failed to load usage records');
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Usage Records</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.service_type}
              onChange={(e) => handleFilterChange('service_type', e.target.value)}
            >
              <option value="">All Services</option>
              <option value="1">API Calls</option>
              <option value="2">Storage</option>
              <option value="3">Compute</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input 
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input 
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billable</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.is_billable}
              onChange={(e) => handleFilterChange('is_billable', e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Billable</option>
              <option value="false">Free Tier</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="animate-spin" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.service_type?.display_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.units_consumed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${record.total_cost?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.created).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.is_billable ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {record.is_billable ? 'Billable' : 'Free Tier'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await apiInstance.getAnalytics(dateRange);
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Spending Analytics</h2>
          <div className="flex space-x-4">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data?.monthly_spending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value}`, name === 'total_cost' ? 'Cost' : 'Usage Count']} />
              <Bar dataKey="total_cost" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Spending by Service Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.service_breakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total_cost"
                  nameKey="service_type__display_name"
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {data?.service_breakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              {data?.service_breakdown?.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{service.service_type__display_name}</p>
                    <p className="text-sm text-gray-500">{service.usage_count} requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${service.total_cost?.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      ${(service.total_cost / service.usage_count).toFixed(4)} per request
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Spending */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Daily Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.daily_spending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value}`, 'Cost']} />
              <Line type="monotone" dataKey="total_cost" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Main Billing Component
const Billing = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'usage':
        return <UsageRecords />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className={`lg:ml-64 p-6 transition-all duration-300`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Billing;