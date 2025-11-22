// lib/email.ts
import { Resend } from 'resend';

// Gunakan API key langsung untuk testing
const resend = new Resend(process.env.RESEND_API_KEY!);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    console.log('📧 Attempting to send email to:', to);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!, // Gunakan dari address yang disediakan Resend
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Email ID:', result.data?.id);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    
    // Log error details dari Resend
    if (error.message) {
      console.error('🔍 Resend error message:', error.message);
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred'
    };
  }
}