import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, Key, Database, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SecurityAuditPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Security Architecture & Audit</h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed overview of security vulnerabilities mitigated, cryptographic protocols, and recommended extensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Security Vulnerabilities Mitigated"
          subtitle="Implemented controls protecting patient health data"
          icon={<Shield className="w-5 h-5 text-emerald-600" />}
        >
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Password Hashing with Salt (Bcrypt):</strong> Prevents plaintext exposure and rainbow-table attacks. Passwords are never saved in the database unhashed.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">JWT Token Expiry & Verification:</strong> Eliminates session hijacking with signed bearer tokens and server-side verification middleware.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">SQL Injection Mitigation:</strong> Avoided SQL injection by strictly using parameterized queries (`$1, $2`) and structured ORM methods across all PostgreSQL operations.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">ACID Transactions & Avoiding N+1 Queries:</strong> Medication checklists and adherence logs run in relational single-query batch joins (`JOIN` / single round-trip batches) rather than querying each medication individually in loops.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Shared Account Isolation:</strong> Only users with verified shared access passcode can view or alter the specific patient's medications and records.
              </div>
            </li>
          </ul>
        </Card>

        <Card
          title="Further Security Features to Add"
          subtitle="Enterprise-grade healthcare compliance recommendations"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        >
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Time-based One-Time Passwords (TOTP / 2FA):</strong> Integrating Google Authenticator or SMS 2FA for multi-factor login before viewing medical logs.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">HIPAA Compliant Immutable Audit Trail:</strong> Storing every mutation (`who, when, what changed`) in a write-once ledger for regulatory compliance.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Encrypted Field-Level Storage (pgcrypto):</strong> AES-256 field-level encryption for sensitive diagnoses and dosages at rest in PostgreSQL.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Rate Limiting & Brute-force Prevention:</strong> `express-rate-limit` + Redis sliding window to throttle failed passcode attempts.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-800">Role-Based Access Control (RBAC):</strong> Granular permissions restricting caregivers to marking doses while reserving prescription changes to doctors only.
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
