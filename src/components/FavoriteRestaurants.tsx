
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart, Phone, Clock } from "lucide-react";
import { toast } from "sonner";

interface FavoriteRestaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  rating: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  phone: string;
  averageVisits: number;
  lastVisit: string;
  specialties: string[];
}

const mockFavorites: FavoriteRestaurant[] = [
  {
    id: "1",
    name: "The Modern SoHo",
    location: "SoHo, Manhattan",
    cuisine: "Contemporary American",
    rating: 5,
    priceRange: "$$$",
    phone: "(212) 555-0123",
    averageVisits: 8,
    lastVisit: "2024-06-23",
    specialties: ["Truffle Risotto", "Grilled Salmon", "Wine Selection"]
  },
  {
    id: "2",
    name: "Lucia's Italian Bistro",
    location: "Little Italy, Manhattan",
    cuisine: "Italian",
    rating: 4,
    priceRange: "$$",
    phone: "(212) 555-0456",
    averageVisits: 12,
    lastVisit: "2024-06-20",
    specialties: ["Handmade Pasta", "Wood-fired Pizza", "Chianti Collection"]
  },
  {
    id: "3",
    name: "Sakura Sushi House",
    location: "East Village, Manhattan",
    cuisine: "Japanese",
    rating: 5,
    priceRange: "$$$",
    phone: "(212) 555-0789",
    averageVisits: 6,
    lastVisit: "2024-06-15",
    specialties: ["Omakase", "Fresh Sashimi", "Sake Pairing"]
  },
  {
    id: "4",
    name: "Le Petit Café",
    location: "Greenwich Village, Manhattan",
    cuisine: "French",
    rating: 4,
    priceRange: "$$",
    phone: "(212) 555-0321",
    averageVisits: 15,
    lastVisit: "2024-06-10",
    specialties: ["Croissants", "French Onion Soup", "Wine & Cheese"]
  }
];

export const FavoriteRestaurants = () => {
  const [favorites] = useState<FavoriteRestaurant[]>(mockFavorites);

  const handleCallRestaurant = (phone: string, name: string) => {
    toast.success(`Calling ${name}...`);
    // In a real app, this would open the phone dialer
    window.open(`tel:${phone}`);
  };

  const handleMakeReservation = (restaurantName: string) => {
    toast.success(`Reservation request sent to ${restaurantName}!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">My Favorite Restaurants</h2>
        <Badge className="bg-red-100 text-red-800">
          {favorites.length} Favorites
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {favorites.map((restaurant) => (
          <Card key={restaurant.id} className="border-red-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    {restaurant.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{restaurant.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(restaurant.rating)}</div>
                    <Badge variant="outline" className="text-xs">
                      {restaurant.cuisine}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {restaurant.priceRange}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Visits:</span>
                  <span className="ml-2 font-semibold">{restaurant.averageVisits}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Visit:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(restaurant.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Specialties:</h4>
                <div className="flex flex-wrap gap-1">
                  {restaurant.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCallRestaurant(restaurant.phone, restaurant.name)}
                  className="flex items-center gap-1 flex-1"
                >
                  <Phone className="h-4 w-4" />
                  <span className="text-xs">Call</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleMakeReservation(restaurant.name)}
                  className="flex items-center gap-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Reserve</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
