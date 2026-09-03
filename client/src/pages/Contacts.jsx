import React, { useState } from 'react';
import { Users, Phone, UserPlus, Trash2, ShieldCheck } from 'lucide-react';

export default function Contacts({ contacts, setContacts }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Friend');

  const addContact = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      relation,
    };
    const updated = [...contacts, newEntry];
    setContacts(updated);
    localStorage.setItem('suraksha_contacts', JSON.stringify(updated));
    setName('');
    setPhone('');
  };

  const removeContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('suraksha_contacts', JSON.stringify(updated));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" />
            Emergency Network
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Direct dispatch targets notified upon SOS activation
          </p>
        </div>
        <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
          {contacts.length} Armed
        </span>
      </div>

      <form onSubmit={addContact} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" /> Add Guardian
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            required
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Police / Helpline">Police / Helpline</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-all"
        >
          Add to Emergency Grid
        </button>
      </form>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-sm">
                {contact.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  {contact.name}
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {contact.relation}
                  </span>
                </p>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {contact.phone}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeContact(contact.id)}
              className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
