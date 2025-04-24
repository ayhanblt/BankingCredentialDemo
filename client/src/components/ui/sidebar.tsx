import { Button } from "./button";

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface SidebarProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ user, isOpen, onClose, onLogout }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl font-semibold">Banking App</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {}}
          >
            <span className="material-icons mr-3">dashboard</span>
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {}}
          >
            <span className="material-icons mr-3">account_balance</span>
            Accounts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {}}
          >
            <span className="material-icons mr-3">swap_horiz</span>
            Transactions
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {}}
          >
            <span className="material-icons mr-3">schedule</span>
            Upcoming Payments
          </Button>
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <img
                className="inline-block h-9 w-9 rounded-full"
                src={user?.avatarUrl || "https://ui-avatars.com/api/?name=" + user?.name}
                alt={user?.name}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user?.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <span className="material-icons mr-3">logout</span>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
