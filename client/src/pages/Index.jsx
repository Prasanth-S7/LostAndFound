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
  const [smartQuery, setSmartQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [smartResults, setSmartResults] = useState([]);
  const [showSmartResults, setShowSmartResults] = useState(false);

  useEffect(() => {
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

  const handleSmartSearch = async () => {
    if (!smartQuery.trim()) {
      alert("Please enter a query first");
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/items/similar?queryText=${encodeURIComponent(smartQuery)}`
      );
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Map the smart results to match the expected format
      const mappedResults = (data.items || []).map((item) => {
        const baseItem = {
          id: item.id,
          item_name: item.title,
          category: item.category,
          description: item.description,
          contact_email: item.contact_email,
          contact_phone: item.contact_phone,
        };
        
        // Add status-specific fields
        if (item.status === 'lost') {
          return {
            ...baseItem,
            location_lost: item.location,
            date_lost: item.created_at,
          };
        } else {
          return {
            ...baseItem,
            location_found: item.location,
            date_found: item.created_at,
          };
        }
      });
      
      setSmartResults(mappedResults);
      setShowSmartResults(true);
    } catch (err) {
      console.error("Smart search failed", err);
      alert("Error performing smart search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">          
          <p className="text-black font-fanwood text-4xl text-center">Browse lost and found items or report your own</p>
          {/* <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-10 py-5 text-black"
            />
          </div> */}
          
          {/* Smart Search Section */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 'black leather wallet with cards'"
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="flex-1 text-black"
              />
              <Button 
                onClick={handleSmartSearch}
                disabled={isLoading}
              >
                Search
              </Button>
            </div>
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
        
        {showSmartResults && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-center mb-4 text-black">
              🔍 Smart Matches for "{smartQuery}"
            </h2>
            {smartResults.length === 0 ? (
              <p className="text-center text-muted-foreground">No similar items found.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {smartResults.map((item) => {
                  // Determine type based on which location field exists
                  const itemType = item.location_lost ? 'lost' : 'found';
                  return (
                    <ItemCard key={item.id} item={item} type={itemType} />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;