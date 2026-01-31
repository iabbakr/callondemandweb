import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Providers
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";

// Global Components
import { Toaster } from "react-hot-toast";
import MaintenanceGuard from "@/components/auth/MaintenanceGuard";
import BroadcastListener from "@/components/notifications/BroadcastListener";

const inter = Inter({ subsets: ["latin"] });

/**
 * VIEWPORT CONFIGURATION
 * Optimized for mobile responsiveness and consistent brand coloring.
 */
export const viewport: Viewport = {
  themeColor: "#6200EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * PLATFORM METADATA
 * PWA ready with manifest and essential SEO headers.
 */
export const metadata: Metadata = {
  title: "CallOnDemand | Your All-in-One Service App",
  description: "Manage finances, earn rewards, and access essential services.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 selection:bg-primary selection:text-white`}>
        <AuthProvider>
          <AppProvider>
            {/* Global Toast Notifications (Mac-style alerts) */}
            <Toaster 
              position="top-center" 
              reverseOrder={false}
              toastOptions={{
                className: 'font-bold text-sm rounded-2xl shadow-2xl border border-slate-50',
                duration: 4000,
                style: {
                  padding: '16px 24px',
                  color: '#1e293b',
                },
              }}
            />

            {/* THE SYSTEM CORE 
                MaintenanceGuard: Locks out users when admin activates maintenance mode.
                BroadcastListener: Listens for global system-wide popups.
            */}
            <MaintenanceGuard>
              <BroadcastListener />
              
              {/* Main App Content */}
              {children}
            </MaintenanceGuard>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}