import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    // const token = localStorage.getItem('token');
    // if (token) {
    //   const currentUser = api.getCurrentUser();
    //   if (currentUser) {
    //     setSession({ user: currentUser });
    //   }
    // }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { items } = await api.listItems();
      // items-service returns generic items with status field; map to two lists by status
      const lost = items.filter((i) => i.status === 'lost').map((i) => ({
        id: i.id,
        item_name: i.title,
        category: i.category,
        description: i.description,
        location_lost: i.location,
        date_lost: i.created_at,
        contact_email: i.contact_email,
        contact_phone: i.contact_phone,
      }))
      const found = items.filter((i) => i.status === 'found').map((i) => ({
        id: i.id,
        item_name: i.title,
        category: i.category,
        description: i.description,
        location_found: i.location,
        date_found: i.created_at,
        contact_email: i.contact_email,
        contact_phone: i.contact_phone,
      }))
      setLostItems(lost)
      setFoundItems(found)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = (items) => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  };

  // if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">          
          <p className="text-black font-fanwood text-4xl text-center">Browse lost and found items or report your own</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-5 text-black"
            />
          </div>
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-black border border-white/10 mx-auto">
            <TabsTrigger value="lost">Lost Items ({filterItems(lostItems).length})</TabsTrigger>
            <TabsTrigger value="found">Found Items ({filterItems(foundItems).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="mt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : filterItems(lostItems).length === 0 ? (
              <p className="text-center text-muted-foreground">No lost items found</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterItems(lostItems).map((item) => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : filterItems(foundItems).length === 0 ? (
              <p className="text-center text-muted-foreground font-poppins">No found items reported</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterItems(foundItems).map((item) => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
