import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, Play, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    try {
      const res = await api.put(`/admin/settings/${key}`, { value });
      if (res.success) {
        setToast(`Setting '${key}' updated to '${value}'!`);
        fetchSettings();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTriggerReminders = async () => {
    setTriggering(true);
    setTriggerResult('');
    try {
      const res = await api.post('/admin/reminders/trigger');
      if (res.success) {
        setTriggerResult(res.message);
      }
    } catch (err) {
      setTriggerResult(`Failed: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Circulation Rules & Settings</h1>
          <p className="page-subtitle">
            Configure borrowing periods, daily late fine tariffs, loan limits, and automated schedulers
          </p>
        </div>
      </div>

      {toast && (
        <div style={{ backgroundColor: '#E6F8F5', color: '#0F9D8A', border: '1px solid #99F6E4', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} />
          <span>{toast}</span>
        </div>
      )}

      {/* Manual Trigger Scanner Card */}
      <div
        className="card"
        style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A' }}>
            Automated Deadline & Return Reminder Scheduler
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#3B82F6', marginTop: '4px' }}>
            Configured zone: <code>Asia/Kolkata</code> • Daily Cron: <code>0 0 8 * * ?</code> (8:00 AM IST daily).
            Runs idempotent scans for 2-day return reminders and project submission warnings.
          </p>
          {triggerResult && (
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F9D8A', marginTop: '6px' }}>
              ✓ {triggerResult}
            </div>
          )}
        </div>

        <button
          onClick={handleTriggerReminders}
          className="btn btn-primary"
          disabled={triggering}
        >
          <Play size={16} /> {triggering ? 'Scanning...' : 'Trigger Scheduled Scan Now'}
        </button>
      </div>

      {/* Configuration Settings Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
          Configurable Parameters
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Setting Key</th>
                <th>Description</th>
                <th>Current Value</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading settings...</td>
                </tr>
              ) : (
                settings.map((s) => (
                  <SettingRow key={s.id} setting={s} onSave={handleUpdate} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ setting, onSave }) {
  const [val, setVal] = useState(setting.settingValue);
  const isDirty = val !== setting.settingValue;

  return (
    <tr>
      <td style={{ fontWeight: 600, color: '#142D4E' }}><code>{setting.settingKey}</code></td>
      <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{setting.description}</td>
      <td style={{ width: '200px' }}>
        <input
          type="text"
          className="form-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </td>
      <td style={{ width: '120px' }}>
        <button
          onClick={() => onSave(setting.settingKey, val)}
          disabled={!isDirty}
          className={`btn btn-sm ${isDirty ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Save size={14} /> Save
        </button>
      </td>
    </tr>
  );
}
