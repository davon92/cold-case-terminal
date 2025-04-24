export default function RebootPanel() {
    return (
      <div className="w-full max-w-lg bg-gray-900 border-4 border-green-600 p-4 text-green-400 font-mono shadow-2xl space-y-4">
        <div className="text-xl text-center font-bold tracking-wide border border-green-500 bg-black py-2">
          SYSTEM SECURED
        </div>
  
        <div className="text-center border border-green-500 p-2 bg-black">
          <p className="text-lg font-semibold">REBOOTING SYSTEM...</p>
          <p className="text-sm">VOLUME — NEDRYLAND JP</p>
        </div>
  
        <div className="flex justify-center space-x-2">
          <div className="w-4 h-4 bg-green-500 animate-pulse"></div>
          <div className="w-4 h-4 bg-green-500 animate-pulse delay-200"></div>
          <div className="w-4 h-4 bg-green-500 animate-pulse delay-400"></div>
        </div>
  
        <div className="text-xs uppercase text-center mt-2">Standby...</div>
      </div>
    );
  }
  