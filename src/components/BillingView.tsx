import React, { useState } from 'react';
import {
  Receipt,
  CreditCard,
  Search,
  Filter,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  Printer,
  X,
  QrCode,
  ShieldCheck,
  Building,
  Smartphone,
} from 'lucide-react';
import { Bill, Patient, Payment, UserRole } from '../types/hms.ts';
import { api } from '../services/api.ts';

interface BillingViewProps {
  bills: Bill[];
  patients: Patient[];
  payments: Payment[];
  currentRole: UserRole;
  onRefresh: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  bills,
  patients,
  payments,
  currentRole,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<Bill | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Online Payment Gateway Form
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Counter'>('UPI');
  const [upiId, setUpiId] = useState('patient@okhdfcbank');
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [processingPay, setProcessingPay] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  // Create Bill Form
  const [createForm, setCreateForm] = useState({
    patientId: '',
    consultationCharges: '800.00',
    roomCharges: '0.00',
    doctorCharges: '0.00',
    labCharges: '350.00',
    pharmacyCharges: '120.00',
    procedureCharges: '0.00',
    otherCharges: '50.00',
    discount: '50.00',
    dueDate: new Date().toISOString().split('T')[0],
    notes: 'Outpatient consultation and pharmacy charges',
  });
  const [creatingBill, setCreatingBill] = useState(false);

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.patientName.toLowerCase().includes(q) ||
      b.billCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenPay = (bill: Bill) => {
    setSelectedBillForPayment(bill);
    const balance = Math.max(0, parseFloat(bill.grandTotal) - parseFloat(bill.paidAmount));
    setPayAmount(balance.toFixed(2));
    setPaymentSuccessData(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    setProcessingPay(true);
    try {
      const res = await api.processPayment({
        billId: selectedBillForPayment.id,
        amount: payAmount,
        paymentMethod,
        transactionReference: paymentMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-8)}` : `CC-AUTH-${Date.now().toString().slice(-6)}`,
      });
      setPaymentSuccessData(res);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setProcessingPay(false);
    }
  };

  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingBill(true);
    try {
      await api.createBill(createForm);
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setCreatingBill(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Billing, Invoicing & Online Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated charge aggregation, itemized invoices, and Indian payment gateway</p>
        </div>

        {['accountant', 'admin', 'receptionist', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name or Invoice Code (e.g. INV-7001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Invoice Statuses</option>
          <option value="Paid">Paid in Full</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Pending">Pending Payment</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax (5%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Paid / Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No hospital invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const grandTotal = parseFloat(b.grandTotal);
                  const paid = parseFloat(b.paidAmount);
                  const due = Math.max(0, grandTotal - paid);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{b.billCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{b.patientName}</td>
                      <td className="py-3 px-4 text-slate-500">{b.billDate}</td>
                      <td className="py-3 px-4">${parseFloat(b.subtotal).toFixed(2)}</td>
                      <td className="py-3 px-4">${parseFloat(b.taxAmount).toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${grandTotal.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-emerald-700">${paid.toFixed(2)} Paid</div>
                        {due > 0 && <div className="text-rose-600 font-bold text-[11px]">${due.toFixed(2)} Due</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            b.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'Partially Paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedBillForPrint(b)}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                        >
                          Invoice Slip
                        </button>
                        {due > 0 && (
                          <button
                            onClick={() => handleOpenPay(b)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-xs"
                          >
                            Pay Online / Counter
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Gateway Modal */}
      {selectedBillForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  Secure Hospital Payment Gateway
                </h2>
                <p className="text-[11px] text-slate-500">Invoice: {selectedBillForPayment.billCode}</p>
              </div>
              <button onClick={() => setSelectedBillForPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccessData ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Receipt Code: <span className="font-mono font-bold text-teal-700">{paymentSuccessData.payment.paymentCode}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Amount Paid: <span className="font-bold">${payAmount}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Txn Ref: {paymentSuccessData.payment.transactionReference}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBillForPayment(null)}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-500"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                {/* Amount to pay */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Payment Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Credit Card', 'Cash'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold transition-all ${
                          paymentMethod === m
                            ? 'border-teal-600 bg-teal-50 text-teal-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Channel Details */}
                {paymentMethod === 'UPI' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold text-slate-800">UPI VPA or QR Scan</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. user@okaxis / user@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                    <p className="text-[10px] text-slate-500">Supports Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                )}

                {paymentMethod === 'Credit Card' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>256-bit encrypted secure bank gateway. Never stores CVV/PIN.</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Cash' && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                    Hospital Counter Cash Collection. Receipt will be marked immediately.
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processingPay}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                  >
                    {processingPay ? 'Verifying Gateway...' : `Authorize & Pay $${payAmount}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Printable Slip */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <span className="text-xs font-bold text-slate-700">Official Hospital Tax Invoice</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button onClick={() => setSelectedBillForPrint(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">CarePulse Healthcare Services</h2>
                  <p className="text-[11px] text-slate-500">Tax Invoice & Cash Receipt Voucher</p>
                  <p className="text-[10px] text-slate-400">GSTIN: 27AAAAA0000A1Z5 • PAN: AABBC1234D</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-teal-700">{selectedBillForPrint.billCode}</p>
                  <p className="text-slate-500">Bill Date: {selectedBillForPrint.billDate}</p>
                </div>
              </div>

              {/* Patient */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-400 font-medium">BILLED TO</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedBillForPrint.patientName}</p>
                  <p className="text-slate-500">Patient ID: PAT-{1000 + selectedBillForPrint.patientId}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium">INVOICE STATUS</span>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedBillForPrint.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Service / Fee Description</th>
                      <th className="py-2.5 px-3 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3">Specialist Physician Consultation</td>
                      <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.consultationCharges).toFixed(2)}</td>
                    </tr>
                    {parseFloat(selectedBillForPrint.roomCharges) > 0 && (
                      <tr>
                        <td className="py-2 px-3">Inpatient Bed & Room Charges</td>
                        <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.roomCharges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedBillForPrint.labCharges) > 0 && (
                      <tr>
                        <td className="py-2 px-3">Diagnostic Laboratory & Pathology Tests</td>
                        <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.labCharges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedBillForPrint.pharmacyCharges) > 0 && (
                      <tr>
                        <td className="py-2 px-3">Hospital Pharmacy Medications</td>
                        <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.pharmacyCharges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedBillForPrint.procedureCharges) > 0 && (
                      <tr>
                        <td className="py-2 px-3">Surgical / Nursing Procedures</td>
                        <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.procedureCharges).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(selectedBillForPrint.otherCharges) > 0 && (
                      <tr>
                        <td className="py-2 px-3">Administrative / Miscellaneous Registration</td>
                        <td className="py-2 px-3 text-right">${parseFloat(selectedBillForPrint.otherCharges).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${parseFloat(selectedBillForPrint.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Institutional Discount:</span>
                  <span>-${parseFloat(selectedBillForPrint.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%):</span>
                  <span>${parseFloat(selectedBillForPrint.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span>${parseFloat(selectedBillForPrint.grandTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Total Paid:</span>
                  <span>${parseFloat(selectedBillForPrint.paidAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Bill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-600" />
              Generate Hospital Billing Invoice
            </h2>
            <p className="text-xs text-slate-500 mb-4">Itemize consultation, room, laboratory, and pharmacy charges.</p>

            <form onSubmit={handleCreateBillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Patient *</label>
                <select
                  required
                  value={createForm.patientId}
                  onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.consultationCharges}
                    onChange={(e) => setCreateForm({ ...createForm, consultationCharges: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Room / Bed ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.roomCharges}
                    onChange={(e) => setCreateForm({ ...createForm, roomCharges: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lab Charges ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.labCharges}
                    onChange={(e) => setCreateForm({ ...createForm, labCharges: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pharmacy ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.pharmacyCharges}
                    onChange={(e) => setCreateForm({ ...createForm, pharmacyCharges: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.discount}
                    onChange={(e) => setCreateForm({ ...createForm, discount: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBill}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {creatingBill ? 'Generating...' : 'Save & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
