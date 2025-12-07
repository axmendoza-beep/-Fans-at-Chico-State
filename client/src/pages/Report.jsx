import { useState } from 'react';
import { reportsAPI } from '../lib/api';

function Report() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({
    reporter_user_id: '',
    event_id: '',
    category: 'spam',
    description: '',
    routed_to: 'admin'
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await reportsAPI.create(newReport);
      setSubmitStatus('success');
      alert('Report submitted successfully! Our team will review it.');
      setShowReportForm(false);
      setNewReport({
        reporter_user_id: '',
        event_id: '',
        category: 'spam',
        description: '',
        routed_to: 'admin'
      });
    } catch (err) {
      setSubmitStatus('error');
      alert('Failed to submit report: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Report & Safety</h1>
      <p>Report inappropriate content or behavior to keep our community safe</p>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Community Guidelines</h2>
        <ul>
          <li>Be respectful to all members</li>
          <li>No harassment or hate speech</li>
          <li>No spam or promotional content</li>
          <li>Keep content appropriate for all ages (unless marked 21+)</li>
          <li>Report any violations you see</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setShowReportForm(!showReportForm)}>
          {showReportForm ? 'Cancel' : 'Submit a Report'}
        </button>
      </div>

      {showReportForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h2>Submit a Report</h2>
          <p style={{ color: '#666' }}>All reports are anonymous and reviewed by our moderation team.</p>
          
          <form onSubmit={handleSubmitReport}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Your User ID:</label><br />
              <input
                type="text"
                value={newReport.reporter_user_id}
                onChange={(e) => setNewReport({ ...newReport, reporter_user_id: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Event ID (if applicable):</label><br />
              <input
                type="text"
                value={newReport.event_id}
                onChange={(e) => setNewReport({ ...newReport, event_id: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Category:</label><br />
              <select
                value={newReport.category}
                onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
              >
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="safety">Safety Concern</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Description (max 500 characters):</label><br />
              <textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                maxLength={500}
                rows={5}
                style={{ width: '100%' }}
                required
              />
              <small>{newReport.description.length}/500 characters</small>
            </div>

            <button type="submit">Submit Report</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
        <h3>⚠️ Age Filter</h3>
        <p>Events marked as 21+ are automatically hidden from users under 21 years old.</p>
        <p>This filter cannot be disabled for your protection.</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Need Help?</h2>
        <p>If you're experiencing an emergency, please contact campus security immediately.</p>
        <p><strong>Campus Security:</strong> (530) 898-5555</p>
        <p><strong>Report Issues:</strong> safety@fansatchicostate.com</p>
      </div>
    </div>
  );
}

export default Report;
