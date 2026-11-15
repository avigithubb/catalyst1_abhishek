import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || 'demo_user',
    pass: process.env.SMTP_PASS || 'demo_pass',
  },
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const emailService = {
  sendEmail: async (options: SendEmailOptions) => {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    console.log(`[Email Dispatch Service] Sending email to: ${recipients}`);
    console.log(`[Subject]: ${options.subject}`);
    
    try {
      if (process.env.SMTP_USER && process.env.SMTP_USER !== 'demo_user') {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'Elderly Care Alerts <alerts@elderlycare.local>',
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
        console.log('[Email Dispatch Service] Real SMTP transmission successful.');
      } else {
        console.log('[Email Dispatch Service] Simulated email successfully generated and queued (Demo mode).');
      }
      return { success: true, recipients };
    } catch (error) {
      console.error('[Email Dispatch Error]', error);
      // Fallback cleanly so downstream business logic isn't broken
      return { success: false, error };
    }
  },

  /**
   * Generates a reminder email when doses were missed for yesterday only
   */
  generateSingleDayMissedEmail: (patientName: string, missedMedications: string[]) => {
    return `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #d97706; margin-top: 0;">⚠️ Elderly Care Alert: Missed Medication Yesterday</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Our daily adherence monitor noticed that one or more medications were left due for yesterday. Please be advised that your adherence streak has reset.</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <strong>Yesterday's Missed Medications:</strong>
          <ul>
            ${missedMedications.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        <p>Please consult your daily schedule on the portal or contact your care team before taking overdue dosages.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          This is an automated adherence notice from ElderCare Connect.
        </p>
      </div>
    `;
  },

  /**
   * Generates an emergency alert email when medications are missed for more than 2 consecutive days.
   * Dispatched to ALL authorized family members and doctors.
   */
  generateCriticalMultiDayAlertEmail: (patientName: string, missedDays: number, missedMedications: string[]) => {
    return `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 12px; padding: 24px;">
        <h2 style="color: #dc2626; margin-top: 0;">🚨 CRITICAL ADHERENCE ESCALATION: 2+ DAYS OVERDUE</h2>
        <p>Attention Authorized Caregivers and Family Members,</p>
        <p>Patient <strong>${patientName}</strong> has missed medication schedules for <strong>${missedDays} consecutive days</strong>.</p>
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <strong style="color: #991b1b;">Overdue Prescriptions Requiring Immediate Intervention:</strong>
          <ul>
            ${missedMedications.map((m) => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        <p style="font-weight: bold; color: #991b1b;">
          Immediate Action Requested: Please call or visit the patient immediately to verify wellbeing.
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Dispatched to all authorized care circle members registered on ElderCare Connect.
        </p>
      </div>
    `;
  }
};
