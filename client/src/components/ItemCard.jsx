import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const ItemCard = ({ item, type }) => {
  
  const navigate = useNavigate();
  const location = type === "lost" ? item.location_lost : item.location_found;
  const date = type === "lost" ? item.date_lost : item.date_found;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-background text-black border border-black/20">
      <CardHeader>
        <div className="flex items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl font-fanwood flex justify-between items-center">
              <span>{item.item_name}</span>
              <Button className={"cursor-pointer"} onClick = {() => navigate("/report-found")}>Report Found</Button>
            </CardTitle>
            <span>
              <Badge className={"text-black"}>
                {item.category}
              </Badge>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 font-poppins">
        {item.description && (
          <p className="text-muted-foreground text-sm">{item.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
          
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <>
              <Mail className="h-4 w-4 text-primary" />
              <span className="break-all">{item.contact_email}</span>
            </>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <>
              <Phone className="h-4 w-4 text-primary" />
              <span>{item.contact_phone}</span>
            </>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
