import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendProfessorWelcomeEmail(to: string) {
  try {
    await resend.emails.send({
      from: "Peer Evaluator <onboarding@resend.dev>",
      to,
      subject: "You've been added as a Professor — Peer Evaluator",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
          <div style="background-color: #000066; padding: 24px 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0; letter-spacing: 0.05em;">
              PEER EVALUATOR
            </h1>
          </div>
          <div style="padding: 32px; border: 1px solid #d4e5f7; border-top: none;">
            <h2 style="color: #000066; font-size: 18px; margin: 0 0 16px;">
              Welcome, Professor!
            </h2>
            <p style="color: #00338D; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
              You have been granted <strong>professor access</strong> to the Peer Evaluator platform. You can now view courses, groups, students, and their peer evaluation results.
            </p>
            <p style="color: #00338D; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Sign in with your Google account to get started:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${APP_URL}/auth/signin"
                 style="background-color: #0097DC; color: #ffffff; text-decoration: none; padding: 12px 32px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; display: inline-block;">
                SIGN IN
              </a>
            </div>
            <p style="color: #00338D; font-size: 12px; line-height: 1.6; margin: 24px 0 0; opacity: 0.7;">
              If you did not expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send professor welcome email:", error);
  }
}
