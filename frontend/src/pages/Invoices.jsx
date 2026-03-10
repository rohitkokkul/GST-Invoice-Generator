import React, { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import useDataStore from '../store/dataStore';
import api from '../api';
import { Plus, Trash2, Save, Eye, Download, FileText, Calendar, Hash, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import InvoicePreview from '../components/InvoicePreview';

export default function Invoices() {
    const { clients, items, activeTenantId, tenants, invoices, fetchTenantData } = useDataStore();
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'preview'
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const pdfRef = useRef();

    const activeTenant = tenants.find(t => t.id === parseInt(activeTenantId));

    const { register, control, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            client_id: '',
            invoice_no: '',
            date: new Date().toISOString().split('T')[0],
            reference: '',
            other_reference: '',
            remarks: '',
            line_items: [{ item_id: '', particulars: '', hsn_sac: '', quantity: 1, rate: 0, gst_rate: 18 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "line_items"
    });

    // Watch line items to calculate live totals
    const watchLineItems = watch("line_items");
    const totalAmount = watchLineItems.reduce((acc, curr) => acc + (parseFloat(curr.quantity || 0) * parseFloat(curr.rate || 0)), 0);
    const totalTax = watchLineItems.reduce((acc, curr) => {
        const amount = parseFloat(curr.quantity || 0) * parseFloat(curr.rate || 0);
        return acc + (amount * (parseFloat(curr.gst_rate || 0) / 100));
    }, 0);

    const onSubmit = async (data) => {
        if (!activeTenantId) return alert("Select a company first");
        setError('');
        setSuccess('');

        // Transform data
        const payload = {
            ...data,
            client_id: parseInt(data.client_id),
            date: new Date(data.date).toISOString(),
            line_items: data.line_items.map(li => ({
                ...li,
                quantity: parseFloat(li.quantity),
                rate: parseFloat(li.rate),
                gst_rate: parseFloat(li.gst_rate),
                item_id: li.item_id ? parseInt(li.item_id) : null,
            }))
        };

        try {
            await api.post(`/tenants/${activeTenantId}/invoices`, payload);
            setSuccess('Invoice saved successfully to database!');
            reset(); // Clear form
            fetchTenantData(activeTenantId); // refresh data
            setViewMode('list'); // Return to list view
        } catch (err) {
            setError('Failed to save invoice: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDownloadPDF = () => {
        // Native browser print is 100% reliable with modern CSS
        // We will rely on Tailwind's print:* classes to hide the UI
        window.print();
    };

    const handlePreviewCurrent = () => {
        const data = watch();
        // Reformat data to match DB structure for the preview component
        const previewData = {
            ...data,
            total_amount: totalAmount,
            total_tax: totalTax,
            line_items: data.line_items.map(li => ({
                ...li,
                quantity: parseFloat(li.quantity || 0),
                rate: parseFloat(li.rate || 0),
                gst_rate: parseFloat(li.gst_rate || 0),
            }))
        };
        setSelectedInvoice(previewData);
        setViewMode('preview');
    };

    const renderListView = () => (
        <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Invoices</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage all your generated tax invoices</p>
                    </div>
                </div>
                <button
                    onClick={() => { reset(); setViewMode('create'); }}
                    className="btn-primary flex items-center shadow-indigo-500/20"
                >
                    <Plus size={18} className="mr-2" />
                    <span>Create Invoice</span>
                </button>
            </div>

            <div className="glass-card shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {invoices.map((inv) => {
                                const client = clients.find(c => c.id === inv.client_id);
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">{inv.invoice_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{client?.buyer_name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">
                                            ₹{(inv.total_amount + inv.total_tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <button
                                                onClick={() => { setSelectedInvoice(inv); setViewMode('preview'); }}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center justify-center mx-auto transition-colors font-medium border border-indigo-100"
                                            >
                                                <Eye size={16} className="mr-1.5" /> View / Print
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                                <FileText size={32} className="text-indigo-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium text-lg">No invoices found</p>
                                            <p className="text-slate-400 text-sm mt-1">Create your first invoice to see it listed here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderPreviewMode = () => {
        const client = clients.find(c => c.id === parseInt(selectedInvoice?.client_id));
        return (
            <div className="space-y-6 max-w-5xl mx-auto animate-fade-in print:space-y-0 print:max-w-none">
                <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 print:hidden">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setViewMode(selectedInvoice.id ? 'list' : 'create')}
                            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            title="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Invoice Preview</h1>
                            <p className="text-slate-500 text-sm mt-0.5">Review and download the final PDF</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="btn-primary flex items-center shadow-emerald-500/20 from-emerald-600 to-teal-600"
                        >
                            <Download size={18} className="mr-2" /> Download PDF
                        </button>
                    </div>
                </div>

                {/* The hidden/visible div to capture for PDF */}
                <div className="overflow-x-auto bg-slate-200/50 p-4 md:p-8 rounded-2xl border border-slate-200 flex justify-center print:p-0 print:border-none print:shadow-none print:bg-transparent">
                    <div ref={pdfRef} className="shadow-2xl bg-white print:shadow-none">
                        <InvoicePreview
                            invoice={selectedInvoice}
                            activeTenant={activeTenant}
                            client={client || { buyer_name: 'Draft Client', address: '', gstin: '', state_name: '', state_code: '' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (viewMode === 'list') return renderListView();
    if (viewMode === 'preview') return renderPreviewMode();

    // Helper to autofill row when a master Item is selected
    const handleItemSelect = (index, itemId) => {
        if (!itemId) return;
        const item = items.find(i => i.id === parseInt(itemId));
        if (item) {
            setValue(`line_items.${index}.particulars`, item.particulars);
            setValue(`line_items.${index}.hsn_sac`, item.hsn_sac);
            setValue(`line_items.${index}.rate`, item.rate);
            setValue(`line_items.${index}.gst_rate`, item.gst_rate);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-slide-up pb-12">
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-4">
                    <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Create New Invoice</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Draft and save a tax invoice</p>
                    </div>
                </div>
                <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors py-2 px-4 rounded-lg hover:bg-slate-100">
                    Cancel & Return
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start text-sm animate-fade-in">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl flex items-start text-sm animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Top Details */}
                <div className="glass-card grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    <div className="p-6 md:p-8 space-y-5 bg-white/40">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Client Details</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Client / Buyer *</label>
                            <select {...register("client_id", { required: true })} className="input-field bg-white">
                                <option value="">-- Choose Buyer --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.buyer_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Remarks / Notes</label>
                            <input type="text" {...register("remarks")} className="input-field" placeholder="e.g. Invoice for the month of April..." />
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-5 bg-slate-50/40">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Voucher Details</h3>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Invoice No *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Hash size={16} /></div>
                                    <input type="text" {...register("invoice_no", { required: true })} className="input-field pl-9 font-mono uppercase" placeholder="INV-001" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                                <div className="relative">
                                    <input type="date" {...register("date", { required: true })} className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reference No.</label>
                                <input type="text" {...register("reference")} className="input-field" placeholder="PO-123" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Other Ref.</label>
                                <input type="text" {...register("other_reference")} className="input-field" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="glass-card overflow-hidden">
                    <div className="bg-white/40 p-6 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Line Items</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50/80">
                                <tr className="text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-4 border-b border-slate-200 w-48">Product Map</th>
                                    <th className="p-4 border-b border-slate-200">Particulars *</th>
                                    <th className="p-4 border-b border-slate-200 w-24">HSN/SAC</th>
                                    <th className="p-4 border-b border-slate-200 w-24">Qty *</th>
                                    <th className="p-4 border-b border-slate-200 w-32">Rate (₹) *</th>
                                    <th className="p-4 border-b border-slate-200 w-24">GST % *</th>
                                    <th className="p-4 border-b border-slate-200 w-32 text-right">Amount</th>
                                    <th className="p-4 border-b border-slate-200 w-16 text-center">Act</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {fields.map((field, index) => {
                                    const qty = watchLineItems[index]?.quantity || 0;
                                    const rate = watchLineItems[index]?.rate || 0;
                                    const lineAmount = qty * rate;

                                    return (
                                        <tr key={field.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-3">
                                                <select
                                                    {...register(`line_items.${index}.item_id`)}
                                                    onChange={(e) => handleItemSelect(index, e.target.value)}
                                                    className="w-full text-sm rounded-lg border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 transition-colors cursor-pointer outline-none"
                                                    title="Autofill from master list"
                                                >
                                                    <option value="">- Custom -</option>
                                                    {items.map(item => <option key={item.id} value={item.id}>{item.particulars}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <input type="text" required {...register(`line_items.${index}.particulars`, { required: true })} className="w-full rounded-lg border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-colors shadow-sm" placeholder="Item Desc" />
                                            </td>
                                            <td className="p-3">
                                                <input type="text" {...register(`line_items.${index}.hsn_sac`)} className="w-full rounded-lg border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-center outline-none transition-colors shadow-sm font-mono" />
                                            </td>
                                            <td className="p-3">
                                                <input type="number" step="any" required {...register(`line_items.${index}.quantity`)} className="w-full rounded-lg border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-center outline-none transition-colors shadow-sm" />
                                            </td>
                                            <td className="p-3">
                                                <input type="number" step="0.01" required {...register(`line_items.${index}.rate`)} className="w-full rounded-lg border-slate-200 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-right outline-none transition-colors shadow-sm font-mono" />
                                            </td>
                                            <td className="p-3">
                                                <input type="number" step="0.1" required {...register(`line_items.${index}.gst_rate`)} className="w-full rounded-lg border-emerald-200 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-center outline-none transition-colors shadow-sm bg-emerald-50/50 text-emerald-700 font-bold" />
                                            </td>
                                            <td className="p-3 align-middle text-right font-display text-slate-800 font-medium">
                                                ₹{lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-3 text-center align-middle">
                                                <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Remove row">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end sm:items-center space-y-6 sm:space-y-0">
                        <button
                            type="button"
                            onClick={() => append({ item_id: '', particulars: '', hsn_sac: '', quantity: 1, rate: 0, gst_rate: 18 })}
                            className="flex items-center space-x-2 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-indigo-100 bg-white"
                        >
                            <Plus size={16} /> <span>Add New Item Row</span>
                        </button>

                        <div className="w-full sm:w-auto bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-[300px]">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Taxable Amount</span>
                                    <span className="font-semibold text-slate-800 font-mono">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Total Tax</span>
                                    <span className="font-semibold text-slate-800 font-mono">₹{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-800">Grand Total</span>
                                    <span className="text-xl font-display font-bold text-indigo-600">₹{(totalAmount + totalTax).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handlePreviewCurrent}
                        className="btn-secondary flex items-center justify-center"
                    >
                        <Eye size={18} className="mr-2" /> Live PDF Preview
                    </button>
                    <button type="submit" className="btn-primary flex items-center justify-center shadow-indigo-500/20">
                        <Save size={18} className="mr-2" /> Save Invoice to Cloud
                    </button>
                </div>
            </form>
        </div>
    );
}
