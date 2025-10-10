import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

export default function ReportFound() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [lostOptions, setLostOptions] = useState([]);
  const [selectedLostId, setSelectedLostId] = useState("");
  
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    description: "",
    location_found: "",
    date_found: "",
    contact_info: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    setSession({ user: { token } });
    // load lost items for dropdown
    api.listItems(undefined, 'lost').then(({ items }) => {
      setLostOptions(items);
    }).catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setIsLoading(true);

    try {
      const token = session.user.token;
      if (mode === 'existing' && selectedLostId) {
        await api.markFound(token, selectedLostId);
      } else {
        await api.createItem(token, {
          title: formData.item_name,
          description: formData.description,
          location: formData.location_found,
          status: 'found',
        });
      }
      navigate("/");
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
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Report Found Item</CardTitle>
            <CardDescription>
              Fill out the form below to report an item you've found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>How are you reporting?</Label>
                <RadioGroup value={mode} onValueChange={setMode} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="existing" value="existing" />
                    <Label htmlFor="existing">Existing lost item</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="new" value="new" />
                    <Label htmlFor="new">New item I found</Label>
                  </div>
                </RadioGroup>
              </div>

              {mode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="existing_id">Select lost item *</Label>
                  <Select value={selectedLostId} onValueChange={setSelectedLostId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {lostOptions.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
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
                      <SelectTrigger>
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
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_found">Location Found *</Label>
                    <Input
                      id="location_found"
                      value={formData.location_found}
                      onChange={(e) => setFormData({ ...formData, location_found: e.target.value })}
                      required
                      placeholder="e.g., Library, Main Building"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_found">Date Found *</Label>
                    <Input
                      id="date_found"
                      type="date"
                      value={formData.date_found}
                      onChange={(e) => setFormData({ ...formData, date_found: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Contact Info *</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      required
                      placeholder="Email or phone number"
                    />
                  </div>
                </>
              )}
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
                  <SelectTrigger>
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
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_found">Location Found *</Label>
                <Input
                  id="location_found"
                  value={formData.location_found}
                  onChange={(e) => setFormData({ ...formData, location_found: e.target.value })}
                  required
                  placeholder="e.g., Library, Main Building"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_found">Date Found *</Label>
                <Input
                  id="date_found"
                  type="date"
                  value={formData.date_found}
                  onChange={(e) => setFormData({ ...formData, date_found: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Contact Info *</Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  required
                  placeholder="Email or phone number"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Submitting..." : "Submit Report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
