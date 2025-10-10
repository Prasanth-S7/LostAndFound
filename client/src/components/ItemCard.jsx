import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Mail, Tag } from "lucide-react";
import { format } from "date-fns";

export const ItemCard = ({ item, type }) => {
  const location = type === "lost" ? item.location_lost : item.location_found;
  const date = type === "lost" ? item.date_lost : item.date_found;

  const getCategoryColor = (category) => {
    const colors = {
      electronics: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      clothing: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      accessories: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
      documents: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      keys: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
      bags: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      books: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
      sports: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      jewelry: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
      other: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    };
    return colors[category] || colors.other;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{item.item_name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getCategoryColor(item.category)}>
                <Tag className="h-3 w-3 mr-1" />
                {item.category}
              </Badge>
              <Badge 
                variant={type === "lost" ? "destructive" : "default"}
                className={type === "lost" ? "" : "bg-success hover:bg-success/90"}
              >
                {type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
            {item.contact_info.includes("@") ? (
              <>
                <Mail className="h-4 w-4 text-primary" />
                <span className="break-all">{item.contact_info}</span>
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 text-primary" />
                <span>{item.contact_info}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
