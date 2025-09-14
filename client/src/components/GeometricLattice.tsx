export function GeometricLattice() {
  return (
    <div 
      className="fixed inset-0 animate-lattice"
      style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(201,167,106,0.05) 1px, transparent 1px),
          linear-gradient(rgba(201,167,106,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}
      aria-hidden="true"
    />
  );
}
