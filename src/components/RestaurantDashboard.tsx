
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, MapPin, Users, CreditCard, Clock, CheckCircle, Heart, Calendar } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { ReviewsSection } from "./ReviewsSection";
import { FavoriteRestaurants } from "./FavoriteRestaurants";
import { UpcomingReservations } from "./UpcomingReservations";

export interface RestaurantBill {
  id: string;
  restaurantName: string;
  location: string;
  date: string;
  pax: number;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'pending' | 'paid';
}

const mockBills: RestaurantBill[] = [
  {
    id: "1",
    restaurantName: "The Modern SoHo",
    location: "SoHo, Manhattan",
    date: "2024-06-23",
    pax: 2,
    items: [
      { name: "Truffle Risotto", price: 32.00, quantity: 1 },
      { name: "Grilled Salmon", price: 28.00, quantity: 1 },
      { name: "Caesar Salad", price: 16.00, quantity: 2 },
      { name: "House Wine (Glass)", price: 12.00, quantity: 2 },
      { name: "Tiramisu", price: 14.00, quantity: 1 }
    ],
    subtotal: 130.00,
    tax: 11.70,
    tip: 19.50,
    total: 161.20,
    status: 'pending'
  },
  {
    id: "2",
    restaurantName: "Lucia's Italian Bistro",
    location: "Little Italy, Manhattan",
    date: "2024-06-20",
    pax: 3,
    items: [
      { name: "Margherita Pizza", price: 18.00, quantity: 1 },
      { name: "Spaghetti Carbonara", price: 22.00, quantity: 1 },
      { name: "Chicken Parmigiana", price: 26.00, quantity: 1 },
      { name: "Caprese Salad", price: 14.00, quantity: 1 },
      { name: "Chianti (Bottle)", price: 35.00, quantity: 1 }
    ],
    subtotal: 115.00,
    tax: 10.35,
    tip: 17.25,
    total: 142.60,
    status: 'paid'
  },
  {
    id: "3",
    restaurantName: "Rooftop Grill NYC",
    location: "Midtown, Manhattan",
    date: "2024-06-18",
    pax: 4,
    items: [
      { name: "NY Strip Steak", price: 45.00, quantity: 2 },
      { name: "Lobster Mac & Cheese", price: 32.00, quantity: 1 },
      { name: "Grilled Vegetables", price: 18.00, quantity: 2 },
      { name: "Craft Cocktails", price: 15.00, quantity: 4 }
    ],
    subtotal: 198.00,
    tax: 17.82,
    tip: 29.70,
    total: 245.52,
    status: 'paid'
  }
];

export const RestaurantDashboard = () => {
  const [selectedBill, setSelectedBill] = useState<RestaurantBill | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  
  // Ensure only one pending bill exists (the most recent one)
  const processedBills = mockBills.map((bill, index) => ({
    ...bill,
    status: index === 0 ? 'pending' as const : 'paid' as const
  }));
  
  const [bills, setBills] = useState(processedBills);

  const handlePayment = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, status: 'paid' as const } : bill
    ));
    setShowPayment(false);
    setSelectedBill(null);
  };

  const pendingBills = bills.filter(bill => bill.status === 'pending');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Silvia's Restaurant Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your dining experiences and manage payments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Bills</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid Bills</p>
                  <p className="text-2xl font-bold text-green-600">{paidBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="text-2xl font-bold text-red-600">${totalPending.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Bills, Reviews, Favorites, and Reservations */}
        <Tabs defaultValue="bills" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="bills">Restaurant Bills</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
          </TabsList>

          <TabsContent value="bills">
            {/* Bills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                          <ChefHat className="h-5 w-5 text-orange-600" />
                          {bill.restaurantName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{bill.location}</span>
                        </div>
                      </div>
                      <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                        {bill.status === 'paid' ? 'PAID' : 'PENDING'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Date and Pax */}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{new Date(bill.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{bill.pax} pax</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Items */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">What you consumed:</h4>
                        {bill.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                            </span>
                            <span className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Totals */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${bill.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${bill.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tip:</span>
                          <span>${bill.tip.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-orange-600">${bill.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Pay Button */}
                      {bill.status === 'pending' && (
                        <Button 
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowPayment(true);
                          }}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now - ${bill.total.toFixed(2)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsSection />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoriteRestaurants />
          </TabsContent>

          <TabsContent value="reservations">
            <UpcomingReservations />
          </TabsContent>
        </Tabs>

        {/* Payment Modal */}
        {showPayment && selectedBill && (
          <PaymentModal
            bill={selectedBill}
            onPayment={handlePayment}
            onClose={() => {
              setShowPayment(false);
              setSelectedBill(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
