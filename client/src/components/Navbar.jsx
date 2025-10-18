import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    localStorage.removeItem("token")
    navigate("/");
  };

  return (
    <nav className="border-b border-black/20 bg-background backdrop-blur-sm sticky top-0 z-50 px-8">
      <div className="w-full h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-fanwood text-black">
          LostNFound
        </Link>
        <div className="flex items-center gap-4">
            <>
              <Button
                onClick={() => navigate("/report-lost")}
                className="gap-2 cursor-pointer"
              >
              <Plus className="h-4 w-4" />
                Report Lost
              </Button>
              <Button
                onClick={() => navigate("/report-found")}
                className="gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Report Found
              </Button>
              <Button
                variant="destructive"
                className={"cursor-pointer"}
                onClick={handleSignOut}
              >
                Logout
              </Button>
            </>
        </div>
      </div>
    </nav>
  );
};
