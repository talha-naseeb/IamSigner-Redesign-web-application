// Centralized HTML mapping for email templates with inline styles for details
export const templateContentMapping = {
  Declined: `
      <div style="padding:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#333333; line-height:1.5; mso-line-height-rule:exactly; word-break:break-word; -webkit-font-smoothing:antialiased;">
        <p style="font-weight:700; margin:0 0 10px 0; font-size:18px; color:#333333;">Document Declined</p>
        <p style="margin:0 0 15px 0; font-size:16px; color:#333333;">Dear {name},</p>
        <p style="margin:20px 0; font-size:14px; color:#333333;">The below document has been declined.</p>
        <div style="margin:20px 0; border-radius:5px;">
          <p style="margin:0 0 8px 0; color:#5a6369; font-size:14px; font-weight:700;">Document Details:</p>
          <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Document Name: {documents}</p>
          <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Declined By: {declinedBy}</p>
          <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Declined On: {declinedDate}</p>
          <p style="margin:0; color:#5a6369; font-size:14px;">Reason: {declineReason}</p>
        </div>
      </div>
  `,
  Completed: `
      <div style="padding:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#333333; line-height:1.5; mso-line-height-rule:exactly; word-break:break-word; -webkit-font-smoothing:antialiased;">
        <p style="font-weight:700; margin:0 0 10px 0; font-size:18px; color:#333333;">Document Signing Complete</p>
        <p style="margin:0 0 15px 0; font-size:16px; color:#333333;">Dear {name},</p>
        <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;">We are pleased to inform you that the document you sent, based on the details below, has been successfully signed by all required signatories.</p>
        <div style="margin:20px 0; border-radius:5px;">
          <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px; font-weight:700;">Document Details:</p>
          <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Document Name: {documents}</p>
          <p style="margin:0; color:#5a6369; font-size:14px;">Reference No: {referenceNumber}</p>
        </div>
        <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;">The fully executed document is now available for download and distribution.</p>
      </div>
  `,
  CreateTeam: `
      <div>
        <div style="padding:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#333333; line-height:1.5; mso-line-height-rule:exactly; word-break:break-word; -webkit-font-smoothing:antialiased;">
          <p style="font-weight:700; margin:0 0 10px 0; font-size:18px; color:#333333;">Account Creation Notification</p>
          <p style="margin:0 0 15px 0; font-size:16px; color:#333333;">Dear {name},</p>
          <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;">We are pleased to inform you that your user account has been successfully created by the system administrator. Your temporary login credentials have been generated for secure access.</p>
          <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;"><strong>Temporary Password:</strong> <strong>{password}</strong></p>
          <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;">For security purposes, we strongly recommend that you log in immediately and update your password to ensure the protection of your account. Please use the secure login link provided below.</p>
        </div>
      </div>
  `,
  PasswordReset: `
      <div>
        <div style="padding:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#333333; line-height:1.5; mso-line-height-rule:exactly; word-break:break-word; -webkit-font-smoothing:antialiased;">
          <p style="font-weight:700; margin:0 0 10px 0; font-size:18px; color:#333333;">Password Recovery</p>
          <p style="margin:0 0 15px 0; font-size:16px; color:#333333;">Dear {name}</p>
          <p style="margin:20px 0 20px 0; font-size:14px; color:#333333;">To change your password, please click the button below. This link will expire in 5 minutes.</p>
        </div>
      </div>
  `,
  SigningDocument: `
      <div> 
        <div style="padding:20px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#333333; line-height:1.5; mso-line-height-rule:exactly; word-break:break-word; -webkit-font-smoothing:antialiased;">
          <p style="font-weight:700; margin:0 0 10px 0; font-size:18px; color:#333333;">Sign the Document</p>
          <p style="margin:0 0 15px 0; font-size:16px; color:#333333;">Dear {name},</p>
          <p style="margin:0 0 20px 0; font-size:14px; color:#333333;">{name} is invited to sign an important document with the following details:</p>
          <div style="margin:0 0 15px 0;">
            <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px; font-weight:700;">Document Details</p>
            <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Document Name: {documents}</p>
            <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Sent by: {sentBy}</p>
            <p style="margin:0 0 6px 0; color:#5a6369; font-size:14px;">Sent on: {sentOn}</p>
            <p style="margin:0; color:#5a6369; font-size:14px;">Reference No: {referenceNumber}</p>
          </div>
          <p style="font-size:14px; color:#333333;">Please take a few moments on the below link to sign / decline this document</p>
          <p style="font-size:14px; color:#333333;">Please click on the button below to access and sign the document.</p>
        </div>
      </div>
  `,
};
