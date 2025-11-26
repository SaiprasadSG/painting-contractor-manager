import React, { useState, useEffect } from 'react';
import './app.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sites, setSites] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [labours, setLabours] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [overheads, setOverheads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Report states
  const [siteReport, setSiteReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [selectedSiteForReport, setSelectedSiteForReport] = useState('');

  // Form states
  const [siteForm, setSiteForm] = useState({ 
    name: '', 
    owner_name: '', 
    owner_phone: '', 
    owner_email: '', 
    location: '', 
    start_date: '',
    status: 'Running'
  });
  const [materialForm, setMaterialForm] = useState({ 
    name: '', 
    unit: 'bucket',
    rate_per_unit: '', 
    current_stock: '' 
  });
  const [labourForm, setLabourForm] = useState({ name: '', rate_per_day: '' });

  // Edit states
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editMaterialForm, setEditMaterialForm] = useState(null);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [editSiteForm, setEditSiteForm] = useState(null);
  const [editingLabourId, setEditingLabourId] = useState(null);
  const [editLabourForm, setEditLabourForm] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sitesRes, materialsRes, laboursRes, logsRes, overheadsRes] = await Promise.all([
        fetch(`${API_URL}/api/sites`),
        fetch(`${API_URL}/api/materials`),
        fetch(`${API_URL}/api/labours`),
        fetch(`${API_URL}/api/site-logs`),
        fetch(`${API_URL}/api/overheads`),
      ]);

      if (sitesRes.ok) setSites(await sitesRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      if (laboursRes.ok) setLabours(await laboursRes.json());
      if (logsRes.ok) setDailyLogs(await logsRes.json());
      if (overheadsRes.ok) setOverheads(await overheadsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const addSite = async (e) => {
    e.preventDefault();
    if (!siteForm.name || !siteForm.owner_name || !siteForm.owner_phone || !siteForm.location || !siteForm.start_date) return;
    try {
      const res = await fetch(`${API_URL}/api/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm),
      });
      if (res.ok) {
        setSiteForm({ name: '', owner_name: '', owner_phone: '', owner_email: '', location: '', start_date: '', status: 'Running' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding site:', error);
    }
  };

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.name || !materialForm.unit || !materialForm.rate_per_unit || !materialForm.current_stock) return;
    try {
      const res = await fetch(`${API_URL}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: materialForm.name,
          unit: materialForm.unit,
          rate_per_unit: parseFloat(materialForm.rate_per_unit),
          current_stock: parseFloat(materialForm.current_stock),
        }),
      });
      if (res.ok) {
        setMaterialForm({ name: '', unit: 'bucket', rate_per_unit: '', current_stock: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const addLabour = async (e) => {
    e.preventDefault();
    if (!labourForm.name || !labourForm.rate_per_day) return;
    try {
      const res = await fetch(`${API_URL}/api/labours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: labourForm.name,
          rate_per_day: parseFloat(labourForm.rate_per_day),
        }),
      });
      if (res.ok) {
        setLabourForm({ name: '', rate_per_day: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding labour:', error);
    }
  };

  // Report fetching functions
  const fetchSiteReport = async () => {
    if (!selectedSiteForReport) return alert('Please select a site');
    try {
      const res = await fetch(`${API_URL}/api/reports/site/${selectedSiteForReport}`);
      if (res.ok) {
        const data = await res.json();
        setSiteReport(data);
      } else {
        alert('Failed to fetch site report');
      }
    } catch (error) {
      console.error('Error fetching site report:', error);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports/inventory`);
      if (res.ok) {
        const data = await res.json();
        setInventoryReport(data);
      } else {
        alert('Failed to fetch inventory report');
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    }
  };

  const fetchDailyReport = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports/daily`);
      if (res.ok) {
        const data = await res.json();
        setDailyReport(data);
      } else {
        alert('Failed to fetch daily report');
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
  };

  // Edit material functions
  const startEditMaterial = (material) => {
    setEditingMaterialId(material.material_id);
    setEditMaterialForm({ ...material });
  };

  const cancelEditMaterial = () => {
    setEditingMaterialId(null);
    setEditMaterialForm(null);
  };

  const saveMaterial = async () => {
    if (!editMaterialForm.name || !editMaterialForm.unit || !editMaterialForm.rate_per_unit || !editMaterialForm.current_stock) {
      return alert('Please fill all fields');
    }
    try {
      const res = await fetch(`${API_URL}/api/materials/${editingMaterialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editMaterialForm.name,
          unit: editMaterialForm.unit,
          rate_per_unit: parseFloat(editMaterialForm.rate_per_unit),
          current_stock: parseFloat(editMaterialForm.current_stock),
        }),
      });
      if (res.ok) {
        cancelEditMaterial();
        fetchAllData();
      } else {
        alert('Failed to update material');
      }
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const deleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const res = await fetch(`${API_URL}/api/materials/${materialId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchAllData();
        } else {
          alert('Failed to delete material');
        }
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  // Edit site functions
  const startEditSite = (site) => {
    setEditingSiteId(site.site_id);
    setEditSiteForm({ ...site });
  };

  const cancelEditSite = () => {
    setEditingSiteId(null);
    setEditSiteForm(null);
  };

  const saveSite = async () => {
    if (!editSiteForm.name || !editSiteForm.owner_name || !editSiteForm.owner_phone || !editSiteForm.location || !editSiteForm.start_date) {
      return alert('Please fill all required fields');
    }
    try {
      const res = await fetch(`${API_URL}/api/sites/${editingSiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editSiteForm.name,
          owner_name: editSiteForm.owner_name,
          owner_phone: editSiteForm.owner_phone,
          owner_email: editSiteForm.owner_email || '',
          location: editSiteForm.location,
          start_date: editSiteForm.start_date,
          status: editSiteForm.status,
        }),
      });
      if (res.ok) {
        cancelEditSite();
        fetchAllData();
      } else {
        alert('Failed to update site');
      }
    } catch (error) {
      console.error('Error updating site:', error);
    }
  };

  const deleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        const res = await fetch(`${API_URL}/api/sites/${siteId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchAllData();
        } else {
          alert('Failed to delete site');
        }
      } catch (error) {
        console.error('Error deleting site:', error);
      }
    }
  };

  // Edit labour functions
  const startEditLabour = (labour) => {
    setEditingLabourId(labour.labour_id);
    setEditLabourForm({ ...labour });
  };

  const cancelEditLabour = () => {
    setEditingLabourId(null);
    setEditLabourForm(null);
  };

  const saveLabour = async () => {
    if (!editLabourForm.name || !editLabourForm.rate_per_day) {
      return alert('Please fill all fields');
    }
    try {
      const res = await fetch(`${API_URL}/api/labours/${editingLabourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editLabourForm.name,
          rate_per_day: parseFloat(editLabourForm.rate_per_day),
        }),
      });
      if (res.ok) {
        cancelEditLabour();
        fetchAllData();
      } else {
        alert('Failed to update labour');
      }
    } catch (error) {
      console.error('Error updating labour:', error);
    }
  };

  const deleteLabour = async (labourId) => {
    if (window.confirm('Are you sure you want to delete this labourer?')) {
      try {
        const res = await fetch(`${API_URL}/api/labours/${labourId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchAllData();
        } else {
          alert('Failed to delete labourer');
        }
      } catch (error) {
        console.error('Error deleting labourer:', error);
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalMaterialValue = materials.reduce((sum, m) => sum + (m.rate_per_unit * m.current_stock || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🏗️ Painting Contractor Manager</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 border-b">
          {['dashboard', 'sites', 'materials', 'labours', 'logs', 'overheads', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Sites</h3>
              <p className="text-3xl font-bold text-blue-600">{sites.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Materials Value</h3>
              <p className="text-3xl font-bold text-green-600">₹{totalMaterialValue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Labour Count</h3>
              <p className="text-3xl font-bold text-purple-600">{labours.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Daily Logs</h3>
              <p className="text-3xl font-bold text-orange-600">{dailyLogs.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Sites</h2>
            </div>
            <div className="p-6">
              <form onSubmit={addSite} className="mb-6 p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-4">Add New Site</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Site Name"
                    value={siteForm.name}
                    onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Owner Name"
                    value={siteForm.owner_name}
                    onChange={(e) => setSiteForm({ ...siteForm, owner_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Owner Phone"
                    value={siteForm.owner_phone}
                    onChange={(e) => setSiteForm({ ...siteForm, owner_phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="email"
                    placeholder="Owner Email (optional)"
                    value={siteForm.owner_email}
                    onChange={(e) => setSiteForm({ ...siteForm, owner_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={siteForm.location}
                    onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="date"
                    value={siteForm.start_date}
                    onChange={(e) => setSiteForm({ ...siteForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Site
                  </button>
                </div>
              </form>

              {sites.length === 0 ? (
                <p className="text-gray-500">No sites yet. Create one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {sites.map((site) => (
                    <div key={site.site_id} className="border rounded p-4 hover:bg-gray-50">
                      {editingSiteId === site.site_id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Site Name"
                            value={editSiteForm.name}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Owner Name"
                            value={editSiteForm.owner_name}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, owner_name: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="tel"
                            placeholder="Owner Phone"
                            value={editSiteForm.owner_phone}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, owner_phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="email"
                            placeholder="Owner Email"
                            value={editSiteForm.owner_email}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, owner_email: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Location"
                            value={editSiteForm.location}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, location: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="date"
                            value={editSiteForm.start_date}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, start_date: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <select
                            value={editSiteForm.status}
                            onChange={(e) => setEditSiteForm({ ...editSiteForm, status: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          >
                            <option value="Running">Running</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={saveSite}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditSite}
                              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold">{site.name}</div>
                            <div className="text-sm text-gray-600">{site.owner_name} - {site.owner_phone}</div>
                            <div className="text-sm text-gray-600">{site.location} | {site.start_date} | Status: {site.status}</div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditSite(site)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSite(site.site_id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Materials</h2>
            </div>
            <div className="p-6">
              <form onSubmit={addMaterial} className="mb-6 p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-4">Add New Material</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Material Name"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="bucket">Bucket</option>
                    <option value="bag">Bag</option>
                    <option value="liter">Liter</option>
                    <option value="kg">Kg</option>
                    <option value="meter">Meter</option>
                    <option value="piece">Piece</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Rate Per Unit"
                    value={materialForm.rate_per_unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, rate_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Current Stock"
                    value={materialForm.current_stock}
                    onChange={(e) => setMaterialForm({ ...materialForm, current_stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    step="0.01"
                  />
                  <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Material
                  </button>
                </div>
              </form>

              {materials.length === 0 ? (
                <p className="text-gray-500">No materials yet.</p>
              ) : (
                <div className="space-y-3">
                  {materials.map((m) => (
                    <div key={m.material_id} className="border rounded p-4 hover:bg-gray-50">
                      {editingMaterialId === m.material_id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Material Name"
                            value={editMaterialForm.name}
                            onChange={(e) => setEditMaterialForm({ ...editMaterialForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <select
                            value={editMaterialForm.unit}
                            onChange={(e) => setEditMaterialForm({ ...editMaterialForm, unit: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          >
                            <option value="bucket">Bucket</option>
                            <option value="bag">Bag</option>
                            <option value="liter">Liter</option>
                            <option value="kg">Kg</option>
                            <option value="meter">Meter</option>
                            <option value="piece">Piece</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Rate Per Unit"
                            value={editMaterialForm.rate_per_unit}
                            onChange={(e) => setEditMaterialForm({ ...editMaterialForm, rate_per_unit: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            step="0.01"
                          />
                          <input
                            type="number"
                            placeholder="Current Stock"
                            value={editMaterialForm.current_stock}
                            onChange={(e) => setEditMaterialForm({ ...editMaterialForm, current_stock: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            step="0.01"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveMaterial}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditMaterial}
                              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-sm text-gray-600">
                              ₹{m.rate_per_unit} per {m.unit} | Stock: {m.current_stock} | Total: ₹{(m.rate_per_unit * m.current_stock).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditMaterial(m)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMaterial(m.material_id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'labours' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Labourers</h2>
            </div>
            <div className="p-6">
              <form onSubmit={addLabour} className="mb-6 p-4 bg-gray-50 rounded border">
                <h3 className="font-semibold mb-4">Add New Labourer</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Labourer Name"
                    value={labourForm.name}
                    onChange={(e) => setLabourForm({ ...labourForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Rate Per Day (₹)"
                    value={labourForm.rate_per_day}
                    onChange={(e) => setLabourForm({ ...labourForm, rate_per_day: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    step="0.01"
                  />
                  <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Labourer
                  </button>
                </div>
              </form>

              {labours.length === 0 ? (
                <p className="text-gray-500">No labourers yet.</p>
              ) : (
                <div className="space-y-3">
                  {labours.map((l) => (
                    <div key={l.labour_id} className="border rounded p-4 hover:bg-gray-50">
                      {editingLabourId === l.labour_id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Labourer Name"
                            value={editLabourForm.name}
                            onChange={(e) => setEditLabourForm({ ...editLabourForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Rate Per Day (₹)"
                            value={editLabourForm.rate_per_day}
                            onChange={(e) => setEditLabourForm({ ...editLabourForm, rate_per_day: e.target.value })}
                            className="w-full px-3 py-2 border rounded"
                            step="0.01"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveLabour}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditLabour}
                              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold">{l.name}</div>
                            <div className="text-sm text-gray-600">₹{l.rate_per_day}/day</div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => startEditLabour(l)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteLabour(l.labour_id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Daily Logs</h2>
            </div>
            <div className="p-6">
              {dailyLogs.length === 0 ? (
                <p className="text-gray-500">No daily logs yet.</p>
              ) : (
                <div className="space-y-4">
                  {dailyLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-gray-50 rounded border">
                      <p className="font-semibold">Site: {log.site_id}</p>
                      <p>Date: {log.date}</p>
                      <p>Labour Cost: ₹{log.labour_cost}</p>
                      <p>Material Cost: ₹{log.material_cost}</p>
                      <p>Total: ₹{log.total_cost}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'overheads' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Overheads</h2>
            </div>
            <div className="p-6">
              {overheads.length === 0 ? (
                <p className="text-gray-500">No overheads yet.</p>
              ) : (
                <ul className="space-y-2">
                  {overheads.map((o) => (
                    <li key={o.id} className="p-3 bg-gray-50 rounded">
                      {o.description} - ₹{o.amount}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Site Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Site Report</h2>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedSiteForReport}
                    onChange={(e) => setSelectedSiteForReport(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  >
                    <option value="">Select a site...</option>
                    {sites.map((site) => (
                      <option key={site.site_id} value={site.site_id}>
                        {site.name} - {site.location}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchSiteReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Generate Report
                  </button>
                </div>

                {siteReport && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-3">{siteReport.site.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-600">Material Cost</p>
                        <p className="text-2xl font-bold text-blue-600">₹{siteReport.total_material_cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-600">Labour Cost</p>
                        <p className="text-2xl font-bold text-green-600">₹{siteReport.total_labour_cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-600">Overhead Cost</p>
                        <p className="text-2xl font-bold text-purple-600">₹{siteReport.total_overhead_cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-600">Grand Total</p>
                        <p className="text-2xl font-bold text-red-600">₹{siteReport.grand_total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Total Logs: {siteReport.logs_count}</p>
                      <p>Total Overheads: {siteReport.overheads_count}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Inventory Report</h2>
              </div>
              <div className="p-6">
                <button
                  onClick={fetchInventoryReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                >
                  Generate Report
                </button>

                {inventoryReport && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Total Stock Value</p>
                      <p className="text-3xl font-bold text-green-600">₹{inventoryReport.total_stock_value.toLocaleString()}</p>
                    </div>

                    {inventoryReport.low_stock_items.length > 0 && (
                      <div className="bg-red-50 p-4 rounded border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">Low Stock Items (&lt; 5 units)</h4>
                        <ul className="space-y-1">
                          {inventoryReport.low_stock_items.map((item) => (
                            <li key={item.material_id} className="text-sm text-red-700">
                              {item.name}: {item.current_stock} {item.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">All Materials</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Material</th>
                            <th className="text-right py-2">Stock</th>
                            <th className="text-right py-2">Rate</th>
                            <th className="text-right py-2">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryReport.materials.map((m) => (
                            <tr key={m.material_id} className="border-b hover:bg-gray-50">
                              <td className="py-2">{m.name}</td>
                              <td className="text-right">{m.current_stock} {m.unit}</td>
                              <td className="text-right">₹{m.rate_per_unit}</td>
                              <td className="text-right font-semibold">₹{(m.rate_per_unit * m.current_stock).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Report */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Daily Report</h2>
              </div>
              <div className="p-6">
                <button
                  onClick={fetchDailyReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                >
                  Generate Report
                </button>

                {dailyReport && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Total Cost - {dailyReport.date}</p>
                      <p className="text-3xl font-bold text-blue-600">₹{dailyReport.total_cost.toLocaleString()}</p>
                    </div>

                    {dailyReport.logs.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-3">Daily Logs ({dailyReport.logs.length})</h4>
                        <ul className="space-y-2">
                          {dailyReport.logs.map((log) => (
                            <li key={log.id} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-semibold">{log.date || 'No date'}</p>
                                  <p className="text-sm text-gray-600">Materials: ₹{log.total_material_cost}, Labour: ₹{log.total_labour_cost}</p>
                                </div>
                                <p className="font-bold">₹{log.total_cost}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500">No daily logs found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
