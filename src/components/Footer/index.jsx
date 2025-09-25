import React from "react";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="   bg-gradient-to-b 
    from-black 
    to-[#0f172a] 
    text-gray-200 
    relative 
    overflow-hidden  mt-20">
      
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
      
        <span className="text-[20vw] font-bold text-[#2c9c49] whitespace-nowrap">
          Technoblade
        </span>
      </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          <div className="lg:col-span-2">
            
            <p className="text-sm leading-6 border-l-2 border-[#9f37ea] pl-4 backdrop-blur-sm bg-gray-900/50 p-4 rounded-r-lg">
          
              "Seu futuro digital começa aqui: soluções seguras, ágeis e
              inteligentes."
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#9f37ea]/30">

          <div className="flex flex-col md:flex-row justify-between items-center">
            
            <p className="text-sm text-[#9f37ea]">
           
              © {currentYear} Technolade, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
