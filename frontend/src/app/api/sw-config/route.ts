// frontend/src/app/api/sw-config/route.ts
export async function GET() {
    const config = `
      self.FIREBASE_API_KEY = "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}";
      self.FIREBASE_AUTH_DOMAIN = "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}";
      self.FIREBASE_PROJECT_ID = "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}";
      self.FIREBASE_STORAGE_BUCKET = "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}";
      self.FIREBASE_MESSAGING_SENDER_ID = "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}";
      self.FIREBASE_APP_ID = "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}";
    `;
  
    return new Response(config, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }