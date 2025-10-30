// Email template functions for Lost & Found Service
// Black and white theme with clean, professional design

function getLostItemReportedTemplate(item) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lost Item Reported</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #000000; padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Lost Item Reported</h1>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We have successfully recorded your lost item report. Our system is now actively monitoring for any matches.
              </p>
              
              <!-- Item Details Box -->
              <div style="background-color: #f9f9f9; border-left: 4px solid #000000; padding: 20px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px; font-weight: bold;">Item Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold; width: 120px;">Title:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.title}</td>
                  </tr>
                  ${item.description ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold; vertical-align: top;">Description:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.description}</td>
                  </tr>
                  ` : ''}
                  ${item.location ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.location}</td>
                  </tr>
                  ` : ''}
                  ${item.category ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Category:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.category}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="margin: 25px 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>What happens next?</strong>
              </p>
              
              <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                <li>We'll notify you immediately if a matching item is found</li>
                <li>You can check for updates anytime in the app</li>
                <li>Keep this email for your records</li>
              </ul>
              
              <p style="margin: 25px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                We hope to help you find your item soon.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #000000; padding: 25px 30px; border-top: 3px solid #333333;">
                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-align: center;">
                  Lost & Found Service
                </p>
                <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                  This is an automated notification. Please do not reply to this email.
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getItemFoundTemplate(item) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Item Found - Good News!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #000000; padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Great News!</h1>
              </div>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #f0f0f0; padding: 20px 30px; border-bottom: 2px solid #000000;">
                <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold; text-align: center;">
                  Your Lost Item May Have Been Found!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We have <strong>excellent news</strong>! An item matching your lost item report has been marked as found in our system.
              </p>
              
              <!-- Item Details Box -->
              <div style="background-color: #f9f9f9; border: 2px solid #000000; padding: 20px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px; font-weight: bold;">Your Item</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold; width: 120px;">Title:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.title}</td>
                  </tr>
                  ${item.description ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold; vertical-align: top;">Description:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.description}</td>
                  </tr>
                  ` : ''}
                  ${item.location ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${item.location}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: bold;">Status:</td>
                    <td style="padding: 8px 0; color: #000000; font-size: 14px; font-weight: bold;">✓ FOUND</td>
                  </tr>
                </table>
              </div>
              
              <!-- Action Box -->
              <div style="background-color: #000000; padding: 25px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 16px; font-weight: bold;">
                  Next Steps
                </p>
                <p style="margin: 0; color: #cccccc; font-size: 14px; line-height: 1.6;">
                  Please check the app for complete details and contact information to arrange pickup or verification of your item.
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong>Important:</strong> Please verify that this is indeed your item before making any arrangements. If this is not your item, you can continue to keep your report active in the system.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #000000; padding: 25px 30px; border-top: 3px solid #333333;">
                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-align: center;">
                  Lost & Found Service
                </p>
                <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                  This is an automated notification. Please do not reply to this email.
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Export for use in your Express app
export { getLostItemReportedTemplate, getItemFoundTemplate };

// Usage example:
/*
if (mailer && item.status === 'lost' && item.contact_email) {
  mailer.sendMail({
    from: SENDER_EMAIL,
    to: item.contact_email,
    subject: 'Lost item reported',
    html: getLostItemReportedTemplate(item)
  }).catch((error) => {console.log(error)})
}
*/