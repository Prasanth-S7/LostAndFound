import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HomeNavbar } from "@/components/HomeNavbar";
import { api } from "@/lib/api";

const categories = [
  "electronics",
  "clothing",
  "accessories",
  "documents",
  "keys",
  "bags",
  "books",
  "sports",
  "jewelry",
  "other",
];

export default function ReportLost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    description: "",
    location_lost: "",
    date_lost: "",
    contact_info: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    setSession({ user: { token } });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setIsLoading(true);

    try {
      const token = session.user.token;
      await api.createItem(token, {
        title: formData.item_name,
        description: formData.description,
        location: formData.location_lost,
        status: 'lost',
        category: formData.category,
        contact_email: formData.email,
        contact_phone: formData.phone,
      });
      toast({
        title: "Lost item reported",
        description: "Your lost item has been added to the system.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error reporting item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div>
      <HomeNavbar />
    <div className="min-h-[calc(100vh-100px)] bg-background text-black flex items-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className={"bg-background text-black border border-black/20"}>
          <CardHeader>
            <CardTitle>Report Lost Item</CardTitle>
            <CardDescription>
              Fill out the form below to report an item you've lost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                  placeholder="e.g., iPhone 13, Blue Backpack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className={"border border-white/10"}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide additional details about the item"
                  className={"border border-white/10"}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_lost">Location Lost *</Label>
                <Input
                  id="location_lost"
                  value={formData.location_lost}
                  onChange={(e) => setFormData({ ...formData, location_lost: e.target.value })}
                  required
                  placeholder="e.g., Library, Main Building"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_lost">Date Lost *</Label>
                <Input
                  id="date_lost"
                  type="date"
                  value={formData.date_lost}
                  onChange={(e) => setFormData({ ...formData, date_lost: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="e.g., +1 555 123 4567"
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={() => navigate("/dashboard")} className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 cursor-pointer">
                  {isLoading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
