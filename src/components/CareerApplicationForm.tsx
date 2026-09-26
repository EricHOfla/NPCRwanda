'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';

interface CareerApplicationFormProps {
  careerId?: string;
  careerTitle: string;
  onSuccess?: () => void;
}

export default function CareerApplicationForm({
  careerId,
  careerTitle,
  onSuccess,
}: CareerApplicationFormProps) {
  const { addJobApplication } = useData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !coverLetter.trim()) {
      setError('Please fill in all required fields (Name, Email, Phone, Cover Letter).');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      if (careerId) formData.append('careerId', careerId);
      formData.append('careerTitle', careerTitle);
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('coverLetter', coverLetter.trim());
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await addJobApplication(formData);

      setSubmitted(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setCoverLetter('');
      setResumeFile(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white" style={{ border: '1px solid #E2E8F0' }}>
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: '70px', height: '70px', background: '#DCFCE7', color: '#16A34A' }}
        >
          <i className="fas fa-check-circle fa-2x" />
        </div>
        <h4 className="fw-bold text-dark mb-2">Application Submitted Successfully!</h4>
        <p className="text-muted mb-4" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem' }}>
          Thank you for applying for the <strong>{careerTitle}</strong> position. Your submission and resume have been securely received by the NPC Rwanda recruitment team. We will review your credentials and contact shortlisted candidates.
        </p>
        <div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm px-4 fw-semibold"
            onClick={() => setSubmitted(false)}
          >
            <i className="fas fa-redo me-2" /> Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="apply" className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white" style={{ border: '1px solid #E2E8F0' }}>
      <div className="mb-4">
        <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
          Online Application Form
        </span>
        <h3 className="h4 fw-bold text-dark mb-1">Apply for this Opportunity</h3>
        <p className="text-muted small mb-0">
          Position: <strong className="text-dark">{careerTitle}</strong>. Complete the details below and attach your CV.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center mb-4" role="alert">
          <i className="fas fa-circle-exclamation me-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="row g-3">
        {/* Full Name */}
        <div className="col-md-12">
          <label className="form-label small fw-bold text-dark">
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <i className="fas fa-user" />
            </span>
            <input
              type="text"
              required
              className="form-control border-start-0"
              placeholder="e.g. Jean Damascene Hakizimana"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <i className="fas fa-envelope" />
            </span>
            <input
              type="email"
              required
              className="form-control border-start-0"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark">
            Phone / WhatsApp Number <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted border-end-0">
              <i className="fas fa-phone" />
            </span>
            <input
              type="tel"
              required
              className="form-control border-start-0"
              placeholder="+250 788 000 000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Resume / CV Upload */}
        <div className="col-md-12">
          <label className="form-label small fw-bold text-dark d-flex justify-content-between">
            <span>Resume / Curriculum Vitae (CV)</span>
            <span className="text-muted fw-normal">PDF, DOC, DOCX (Max 10MB)</span>
          </label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx,.rtf,.txt"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.size > 10 * 1024 * 1024) {
                  setError('The selected file exceeds the 10MB size limit.');
                  e.target.value = '';
                  return;
                }
                setResumeFile(file);
                setError(null);
              }
            }}
            disabled={loading}
          />
          {resumeFile && (
            <div className="mt-1 small text-success d-flex align-items-center">
              <i className="fas fa-file-circle-check me-1.5" />
              <span>Selected: {resumeFile.name} ({(resumeFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        {/* Cover Letter / Statement */}
        <div className="col-md-12">
          <label className="form-label small fw-bold text-dark">
            Cover Letter / Motivation Statement <span className="text-danger">*</span>
          </label>
          <textarea
            required
            rows={5}
            className="form-control"
            placeholder="Introduce yourself, explain your interest in joining NPC Rwanda, and summarize your relevant experience and qualifications..."
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            disabled={loading}
            style={{ fontSize: '0.95rem', lineHeight: 1.6 }}
          />
        </div>

        {/* Submit Button */}
        <div className="col-12 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary fw-bold px-4 py-2.5 w-100 d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                <span>Submitting Your Application...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane" />
                <span>Submit Official Application</span>
              </>
            )}
          </button>
          <p className="text-muted text-center small mt-2 mb-0" style={{ fontSize: '0.78rem' }}>
            <i className="fas fa-shield-halved me-1" /> Your personal information is kept strictly confidential and used solely for recruitment purposes by NPC Rwanda.
          </p>
        </div>
      </form>
    </div>
  );
}
