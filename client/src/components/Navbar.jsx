import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";


export const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    api.logout();
    localStorage.removeItem('token');
    toast({ title: "Signed out" });
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary hover:text-accent transition-colors">
          Lost & Found
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/report-lost")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Report Lost
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/report-found")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Report Found
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
