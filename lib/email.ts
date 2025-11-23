// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailContent {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(emailContent: EmailContent): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log('📧 Attempting to send email to:', emailContent.to);
    
    const data = await resend.emails.send({
      from: emailContent.from || 'Batik Giriloyo <onboarding@resend.dev>',
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred while sending email' 
    };
  }
}