"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, User, MapPin, Package, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateManualOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Karachi',
    state: 'Sindh',
    postalCode: '',
    description: '',
    price: '',
    advanceReceived: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      router.push(`/admin/orders?highlight=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link href="/admin/orders" style={{ color: 'var(--gray-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--gray-100)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gray-900)" }}>Create Manual Order</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "4px" }}>Enter details for WhatsApp or custom gift basket orders.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '15px', borderRadius: '10px', marginBottom: '20px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        {/* Customer Info */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', borderBottom: '2px solid var(--gray-100)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--red)" /> Customer Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>First Name *</label>
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="John" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="Doe" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Phone Number *</label>
              <input required type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="03XXXXXXXXX" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="john@example.com" />
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', borderBottom: '2px solid var(--gray-100)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--red)" /> Delivery Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Complete Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="House 123, Street 4, Phase 5..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>City *</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>State/Province</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Postal Code</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} />
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', borderBottom: '2px solid var(--gray-100)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--red)" /> Order Item Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Item Description (Custom Details) *</label>
              <input required type="text" name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="E.g. Red Roses Basket with 10 Ferrero Rochers" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Total Final Price (Rs) *</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="5000" min="0" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Advance Payment Received (Rs)</label>
              <input type="number" name="advanceReceived" value={formData.advanceReceived} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} placeholder="E.g. 2500" min="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>Internal Notes / Card Message</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} placeholder="Message to write on the card..."></textarea>
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit" style={{ width: '100%', padding: '16px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.3s' }}>
          {loading ? 'Creating Order...' : <><Save size={20} /> Create Manual Order</>}
        </button>
      </form>
    </div>
  );
}
