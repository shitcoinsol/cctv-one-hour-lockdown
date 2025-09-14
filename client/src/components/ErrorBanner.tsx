interface ErrorBannerProps {
  message: string;
  details?: string;
}

export function ErrorBanner({ message, details }: ErrorBannerProps) {
  return (
    <div 
      className="fixed inset-0 z-50 min-h-screen"
      style={{
        background: 'radial-gradient(ellipse at center, hsl(221, 45%, 5%) 0%, hsl(0, 0%, 0%) 100%)',
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
          radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%),
          linear-gradient(90deg, rgba(201,167,106,0.05) 1px, transparent 1px),
          linear-gradient(rgba(201,167,106,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 100% 100%, 60px 60px, 60px 60px',
        backgroundBlendMode: 'soft-light, normal, normal, normal'
      }}
    >
      {/* Gold Frame */}
      <div 
        className="fixed inset-4 z-10 animate-shimmer pointer-events-none"
        style={{
          border: '2px solid rgba(201,167,106,0.15)',
          borderRadius: '12px'
        }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-[-1px] pointer-events-none"
          style={{
            border: '1px solid rgba(201,167,106,0.06)',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Error Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
        <div 
          className="max-w-md w-full p-6 rounded-lg backdrop-blur-sm"
          style={{
            border: '2px solid hsl(39, 35%, 60%)',
            background: 'hsla(221, 45%, 5%, 0.95)'
          }}
          aria-label="Configuration Error"
        >
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border border-gold/30 flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-gold" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <div>
              <h2 className="font-head text-lg text-gold tracking-wide mb-2" data-testid="text-error-title">
                Configuration Error
              </h2>
              <p className="font-mono text-sm text-platinum/80 mb-2" data-testid="text-error-message">
                {message}
              </p>
              {details && (
                <p className="font-mono text-xs text-platinum/60" data-testid="text-error-details">
                  {details}
                </p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gold/20">
              <p className="font-sans-thin text-xs text-platinum/60">
                Set environment variables in Replit Secrets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
