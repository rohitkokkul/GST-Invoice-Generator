import { create } from 'zustand';
import api from '../api';

const useDataStore = create((set, get) => ({
    tenants: [],
    activeTenantId: localStorage.getItem('active_tenant_id') || null,

    clients: [],
    items: [],
    invoices: [],

    // Tenants
    fetchTenants: async () => {
        try {
            const res = await api.get('/tenants');
            set({ tenants: res.data });

            // Auto-select first tenant if none is active
            const currentActive = get().activeTenantId;
            if (!currentActive && res.data.length > 0) {
                get().setActiveTenant(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    },

    setActiveTenant: (id) => {
        localStorage.setItem('active_tenant_id', id);
        set({ activeTenantId: id });
        get().fetchTenantData(id);
    },

    createTenant: async (data) => {
        try {
            await api.post('/tenants', data);
            await get().fetchTenants();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to create Company' };
        }
    },

    // Tenant-specific data
    fetchTenantData: async (tenantId) => {
        if (!tenantId) return;
        try {
            const [clientsRes, itemsRes, invoicesRes] = await Promise.all([
                api.get(`/tenants/${tenantId}/clients`),
                api.get(`/tenants/${tenantId}/items`),
                api.get(`/tenants/${tenantId}/invoices`)
            ]);
            set({
                clients: clientsRes.data,
                items: itemsRes.data,
                invoices: invoicesRes.data
            });
        } catch (err) {
            console.error(err);
        }
    }
}));

export default useDataStore;
