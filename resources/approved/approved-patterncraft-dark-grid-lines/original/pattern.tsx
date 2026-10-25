<div className="min-h-screen w-full bg-black relative overflow-hidden">
 {/* Dark Grid Lines Background */}
 <div
   className="absolute inset-0 z-0"
   style={{
     backgroundImage: `
       linear-gradient(to right, #262626 1px, transparent 1px),
       linear-gradient(to bottom, #262626 1px, transparent 1px)
     `,
     backgroundSize: "20px 20px", // Adjust grid size as needed
   }}
 />
 {/* Your Content Here */}
</div>