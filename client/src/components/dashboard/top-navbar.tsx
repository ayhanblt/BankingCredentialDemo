import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@shared/schema";

interface TopNavbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
  user?: User | null;
}

export default function TopNavbar({ onMenuClick, isMobile, user }: TopNavbarProps) {
  return (
    <div className="relative z-10 flex items-center justify-between h-16 flex-shrink-0 bg-white shadow-sm px-4 sm:px-6">
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={onMenuClick}
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      {/* Center content - shows brand on mobile, search on desktop */}
      <div className="flex-1 flex justify-center md:justify-start">
        <div className="block md:hidden ml-2">
          <span className="text-lg font-semibold text-neutral-700">SecureBank</span>
        </div>
        <div className="hidden md:flex md:ml-4">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-neutral-400 text-sm">search</span>
            </div>
            <Input 
              type="text" 
              placeholder="Search..." 
              className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-md text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
            />
          </div>
        </div>
      </div>
      
      {/* Right side icons/buttons */}
      <div className="flex items-center ml-4 md:ml-6">
        <Button
          variant="ghost"
          size="icon"
          className="p-1 rounded-full text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary relative"
        >
          <span className="material-icons">notifications</span>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive notification-badge"></span>
        </Button>
        
        {/* Only show user icon on mobile */}
        {isMobile && (
          <div className="ml-3 relative block md:hidden">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="flex max-w-xs items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                  <span className="material-icons text-neutral-500 text-sm">person</span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
