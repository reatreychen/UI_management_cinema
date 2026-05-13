"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, LoginResponse } from "@/services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response: LoginResponse = await AuthService.login({
        email,
        password,
      });

      if (response.success) {
        // Store tokens in localStorage (only on client side)
        if (typeof window !== 'undefined') {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          
          // Store user data for AuthContext to pick up
          const userData = {
            id: response.data?.id || "1",
            email: email,
            name: response.data?.name || "User"
          };
          localStorage.setItem("user", JSON.stringify(userData));
        }
        
        // Redirect to dashboard
        router.push("/dashboard/cinemas");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0A0A0B', color: '#e5e2e3' }}>
      {/* Background Hero Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-40 blur-sm" 
          alt="A wide-angle, low-light shot of a majestic, empty art deco grand cinema theater with plush red velvet seating. Warm golden light emanates from vintage wall sconces, casting long, soft shadows across the carpeted aisles. The atmosphere is quiet and prestigious, with a deep obsidian sky-like darkness in the upper corners. The overall aesthetic is cinematic and high-end, utilizing deep charcoal and warm amber tones."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOyKfLSrrGcajlbNUK_ALWnMvGa6gPUGvhh6f8ap0Zu_R5i5ozaRjAHH650OMQfCXV-u4pn0k13jzf81YVkdId7Z1FiYOW-wrUHoWIPCuSfB6CJ6I37IOpwixn-2PZFIrulTgwLGJhu7zHqiGNVrC-RE23BzVaJ1sJ0_pU8Or7VDD4Hlud1kKa9QLtulsUiSkHl-8WoznZCeDtCFh5ssmLGehhudXIa9-zAwL9u7L3qNGr283y_TNMADmx8rFGofrHw4i51c6Wf6P"
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 20%, #0A0A0B 100%)' }}></div>
      </div>

      {/* Film Grain Effect */}
      <div className="film-grain" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.04,
        backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBi5BXHWKQ6IR1SwtsaH2xR_gEaYE8IOb3ysJ5Rh_1UD-6JXFY7CbfKHv0TQFecMK_v3blskOouADKJT6JY4i_IgyK1Q4zGACiRD4i49P2fSHC6UqUZnUnKpJQ8EKMq4VyXMl8Gs1BUPL0FsoLnSGhONx1sEY7l1gws6VMC7WV4XF4VTD-5cNLr6RJ6k7_oBeQvRgJbCnLwL4MAsIrmq686zqZm1WkXzqneS9oSbm4RrJbGQqiqkIYkJDS0UT_kY-zYzjOv1f_OOjcV)',
        zIndex: 50
      }}></div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-5 md:px-20">
        {/* Login Card */}
        <div 
          className="w-full max-w-[480px] rounded-xl p-8 flex flex-col gap-8 shadow-2xl"
          style={{
            background: 'rgba(14, 14, 15, 0.15)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Branding Header */}
          <div className="flex flex-col items-center gap-2">
            <span 
              className="font-bold text-4xl tracking-tighter"
              style={{ color: '#e50914' }}
            >
              CineView
            </span>
            <p className="text-sm" style={{ color: '#e9bcb6' }}>
              The Premiere Experience Awaits
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-xs px-1" style={{ color: '#c8c6c8' }}>
                Email
              </label>
              <input
                type="email"
                required
                className="rounded-lg px-4 py-3 placeholder:text-gray-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e5e2e3',
                  transition: 'all 0.3s ease'
                }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e50914';
                  e.target.style.boxShadow = '0 0 15px rgba(229, 9, 20, 0.3)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs px-1" style={{ color: '#c8c6c8' }}>
                Password
              </label>
              <input
                type="password"
                required
                className="rounded-lg px-4 py-3 placeholder:text-gray-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e5e2e3',
                  transition: 'all 0.3s ease'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#e50914';
                  e.target.style.boxShadow = '0 0 15px rgba(229, 9, 20, 0.3)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {error && (
              <div 
                className="px-4 py-3 rounded"
                style={{
                  backgroundColor: 'rgba(255, 75, 75, 0.1)',
                  border: '1px solid rgba(255, 75, 75, 0.3)',
                  color: '#ff6b6b'
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="text-white font-semibold text-lg py-4 rounded-lg transition-all active:scale-[0.98] mt-2"
              style={{
                backgroundColor: '#e50914',
                boxShadow: loading ? 'none' : '0 0 25px rgba(229, 9, 20, 0.5)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(229, 9, 20, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs" style={{ color: '#c7c6c6' }}>
              OR CONTINUE WITH
            </span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
              </svg>
              <span className="text-sm">Google</span>
            </button>

            <button 
              className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.23 15.9 3.6 9.3 8.1 9.1c1.3.05 2.03.8 2.85.8 1.03 0 1.5-.83 3.05-.86 1.63-.03 2.95.5 3.78 1.7-3.32 1.93-2.78 6.13.4 7.42-.64 1.58-1.5 3.02-3.13 4.12zM12.03 9.04c-.1-.83.3-1.63.83-2.2.53-.57 1.43-1.03 2.2-.93.1.86-.3 1.63-.84 2.18-.54.55-1.4.98-2.19.95z" fill="currentColor"></path>
              </svg>
              <span className="text-sm">Apple</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="text-center mt-2">
            <p className="text-base" style={{ color: '#e9bcb6' }}>
              New to CineView?{" "}
              <a 
                href="#" 
                className="font-bold hover:text-red-600 transition-colors"
                style={{ color: '#e5e2e3' }}
              >
                Sign up now
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Branding Element / Bottom Right Corner */}
      <div className="fixed bottom-20 right-20 z-20 hidden md:block">
        <div 
          className="flex items-center gap-3 px-6 py-3 rounded-full"
          style={{
            background: 'rgba(58, 57, 58, 0.4)',
            backdropFilter: 'blur(md)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <span style={{ color: '#e50914', fontVariationSettings: "'FILL' 1" }}>🎭</span>
          <span className="text-xs tracking-widest" style={{ color: '#c8c6c8' }}>
            PREMIERE ACCESS
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="w-full py-8 px-5 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10"
        style={{
          background: 'rgba(19, 19, 20, 0.6)',
          backdropFilter: 'blur(lg)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <span className="text-lg font-bold" style={{ color: '#e50914' }}>
          CineView
        </span>
        <div className="flex gap-8">
          <a className="text-xs hover:text-red-600 transition-opacity duration-300" style={{ color: '#c7c6c6' }} href="#">
            Privacy Policy
          </a>
          <a className="text-xs hover:text-red-600 transition-opacity duration-300" style={{ color: '#c7c6c6' }} href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:text-red-600 transition-opacity duration-300" style={{ color: '#c7c6c6' }} href="#">
            Support
          </a>
        </div>
        <p className="text-xs opacity-60" style={{ color: '#e5e2e3' }}>
          © 2024 CineView Premiere. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
