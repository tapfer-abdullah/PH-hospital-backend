export const createForgotPasswordMailBody = (
  name: string,
  resetLink: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Hello ${name},</h2>
        <p>You have requested to reset your password. Please click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
        <p>Thank you,<br/>AK-Health Care Team</p>
    </div>
  `;
};
