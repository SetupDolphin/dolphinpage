import { Search } from "lucide-react";

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const Navigation = () => {
  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'TERMINAL', onClick: () => scrollToSection('terminal-section') },
    { name: 'PROJECTS', onClick: () => scrollToSection('bannerpost-section') },
    { name: 'CONTRACT ADDRESS', href: 'https://solscan.io/' },
    { name: 'AIRDROP', href: '/airdrop' }
  ];

  return (
    <div className="border-[#76E4F7] border-x-2">
      <nav className="flex items-center px-6 py-3 text-[#76E4F7] font-mono">
        <div className="flex gap-6 items-center flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href || '#'}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className="hover:bg-[#76E4F7] hover:text-[#0F172A] border border-[#76E4F7] px-3 py-1 transition-colors"
              target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="bg-transparent border border-[#76E4F7] px-3 py-1 text-[#76E4F7] focus:outline-none"
            placeholder="Search..."
          />
          <button className="border border-[#76E4F7] p-1 hover:bg-[#76E4F7] hover:text-[#0F172A] transition-colors">
            <Search size={20} className="text-[#76E4F7]" />
          </button>
        </div>
      </nav>
    </div>
  );
};
