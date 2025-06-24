
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Reservation {
  id: string;
  restaurantName: string;
  location: string;
  date: string;
  time: string;
  pax: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationNumber: string;
  phone: string;
  specialRequests?: string;
  reminderSet: boolean;
}

const mockReservations: Reservation[] = [
  {
    id: "1",
    restaurantName: "Blue Hill at Stone Barns",
    location: "Pocantico Hills, NY",
    date: "2024-06-28",
    time: "19:30",
    pax: 2,
    status: 'confirmed',
    confirmationNumber: "BH-2024-001",
    phone: "(914) 366-9600",
    specialRequests: "Anniversary dinner, window table preferred",
    reminderSet: true
  },
  {
    id: "2",
    restaurantName: "Per Se",
    location: "Columbus Circle, Manhattan",
    date: "2024-07-05",
    time: "18:00",
    pax: 4,
    status: 'confirmed',
    confirmationNumber: "PS-2024-078",
    phone: "(212) 823-9335",
    specialRequests: "Dietary restrictions: vegetarian option for 1 guest",
    reminderSet: true
  },
  {
    id: "3",
    restaurantName: "Osteria Francescana NYC",
    location: "Midtown, Manhattan",
    date: "2024-07-12",
    time: "20:00",
    pax: 6,
    status: 'pending',
    confirmationNumber: "OF-2024-156",
    phone: "(212) 555-0987",
    reminderSet: false
  },
  {
    id: "4",
    restaurantName: "The French Laundry at Hudson Yards",
    location: "Hudson Yards, Manhattan",
    date: "2024-07-20",
    time: "19:00",
    pax: 2,
    status: 'confirmed',
    confirmationNumber: "FL-2024-203",
    phone: "(212) 555-0654",
    specialRequests: "Wine pairing menu requested",
    reminderSet: true
  }
];

export const UpcomingReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  const handleCancelReservation = (reservationId: string, restaurantName: string) => {
    setReservations(prev => prev.map(res => 
      res.id === reservationId ? { ...res, status: 'cancelled' as const } : res
    ));
    toast.success(`Reservation at ${restaurantName} has been cancelled.`);
  };

  const handleCallRestaurant = (phone: string, name: string) => {
    toast.success(`Calling ${name}...`);
    window.open(`tel:${phone}`);
  };

  const handleSetReminder = (reservationId: string, restaurantName: string) => {
    setReservations(prev => prev.map(res => 
      res.id === reservationId ? { ...res, reminderSet: true } : res
    ));
    toast.success(`Reminder set for ${restaurantName}!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingReservations = reservations.filter(res => res.status !== 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Reservations</h2>
        <Badge className="bg-blue-100 text-blue-800">
          {upcomingReservations.length} Reservations
        </Badge>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className={`border-blue-200 shadow-md hover:shadow-lg transition-shadow ${
            reservation.status === 'cancelled' ? 'opacity-60' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {reservation.restaurantName}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{reservation.location}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-semibold">
                      {new Date(reservation.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <div className="font-semibold">{reservation.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="text-gray-600">Guests:</span>
                    <div className="font-semibold">{reservation.pax} pax</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Confirmation:</span>
                  <div className="font-semibold text-xs">{reservation.confirmationNumber}</div>
                </div>
              </div>

              {reservation.specialRequests && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Special Requests:</span>
                  </div>
                  <p className="text-blue-700 text-sm">{reservation.specialRequests}</p>
                </div>
              )}

              {reservation.status !== 'cancelled' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCallRestaurant(reservation.phone, reservation.restaurantName)}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-xs">Call</span>
                  </Button>
                  
                  {!reservation.reminderSet && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetReminder(reservation.id, reservation.restaurantName)}
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">Set Reminder</span>
                    </Button>
                  )}
                  
                  {reservation.reminderSet && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Reminder Set
                    </Badge>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelReservation(reservation.id, reservation.restaurantName)}
                    className="flex items-center gap-1 ml-auto"
                  >
                    <span className="text-xs">Cancel</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
