import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '', price: '', category: '', image_url: '', is_available: true });

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleEdit = (item) => {
    setFormData({ ...item });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({ id: null, name: '', description: '', price: '', category: '', image_url: '', is_available: true });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        is_available: formData.is_available
      };

      if (formData.id) {
        await api.patch(`/menu/${formData.id}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      
      setIsEditing(false);
      fetchMenu();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save item. Check inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchMenu();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.patch(`/menu/${item.id}`, { is_available: !item.is_available });
      setMenuItems(current => current.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  if (isLoading) {
     return <div className="p-12 text-center text-brand-400 animate-pulse text-xl">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center">
          <svg className="w-8 h-8 mr-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Admin Dashboard — Menu Management
        </h1>
        <button 
          onClick={handleAddNew}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-900/40"
        >
          + Add New Item
        </button>
      </div>

      {isEditing && (
        <div className="glass p-6 rounded-xl border-t-4 border-brand-500 mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold text-white mb-4">{formData.id ? 'Edit Menu Item' : 'Create New Menu Item'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500" placeholder="e.g. Mains, Appetizers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input type="url" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea rows="2" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="md:col-span-2 flex items-center mt-2">
                <input type="checkbox" id="is_available" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="w-4 h-4 text-brand-500 bg-slate-800 border-slate-700 rounded rounded focus:ring-brand-500 focus:ring-2" />
                <label htmlFor="is_available" className="ml-2 block text-sm text-slate-300">Available for Order</label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700 mt-6">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium">Save Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/80">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/30">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      {item.description && <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-400">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => toggleAvailability(item)}
                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full cursor-pointer transition-colors ${item.is_available ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'}`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white mr-4 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
