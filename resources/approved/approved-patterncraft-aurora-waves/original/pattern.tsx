<div className="min-h-screen w-full relative">
  {/* Aurora Waves Pattern */}
  <style>{`
    @keyframes aurora {
      0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
      100% { transform: scale(1) rotate(360deg); opacity: 0.5; }
    }
  `}</style>
  <div
    className="absolute inset-0 z-0"
    style={{
      background: `linear-gradient(45deg, #1a1a1a 0%, #003366 100%),
        repeating-linear-gradient(
          45deg,
          rgba(0, 255, 255, 0.1) 0px,
          rgba(0, 255, 255, 0.1) 20px,
          rgba(0, 255, 0, 0.1) 20px,
          rgba(0, 255, 0, 0.1) 40px
        ),
        radial-gradient(
          circle at 50% 50%,
          rgba(32, 196, 232, 0.3) 0%,
          rgba(76, 201, 240, 0.1) 100%
        )`,
      backgroundBlendMode: "normal, overlay, overlay",
      animation: "aurora 8s linear infinite",
    }}
  />
  {/* Your Content/Components */}
</div>