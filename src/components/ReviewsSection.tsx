
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Heart, MessageSquare, Sparkles, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  restaurantName: string;
  rating: number;
  reviewText: string;
  date: string;
  nftId: string;
  tips: number;
  ownerResponse?: string;
  ownerResponseDate?: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    restaurantName: "Bella Vista Italiana",
    rating: 5,
    reviewText: "Absolutely incredible dining experience! The pasta was perfectly al dente and the service was impeccable. The ambiance was romantic and perfect for our anniversary dinner.",
    date: "2024-06-15",
    nftId: "NFT-001",
    tips: 15.50,
    ownerResponse: "Thank you so much for this wonderful review! We're thrilled you enjoyed your anniversary dinner with us. Hope to see you again soon!",
    ownerResponseDate: "2024-06-16"
  },
  {
    id: "2",
    restaurantName: "Tokyo Nights Sushi",
    rating: 4,
    reviewText: "Fresh sushi and great atmosphere. The chef's special was outstanding. Only minor complaint was the wait time, but worth it for the quality.",
    date: "2024-06-10",
    nftId: "NFT-002",
    tips: 8.25
  },
  {
    id: "3",
    restaurantName: "Garden Terrace Café",
    rating: 3,
    reviewText: "Nice outdoor seating with good coffee. The food was decent but nothing extraordinary. Service could be more attentive.",
    date: "2024-06-05",
    nftId: "NFT-003",
    tips: 3.00,
    ownerResponse: "Thanks for your feedback! We're working on improving our service and hope to provide you with a better experience next time.",
    ownerResponseDate: "2024-06-07"
  }
];

export const ReviewsSection = () => {
  const [reviews] = useState<Review[]>(mockReviews);

  const handleTipReceived = (reviewId: string) => {
    toast.success("Someone tipped you for your review! 💰");
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
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">My NFT Reviews</h2>
        <Badge className="bg-purple-100 text-purple-800">
          {reviews.length} Reviews
        </Badge>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <span>{review.restaurantName}</span>
                    <Badge variant="outline" className="text-xs">
                      {review.nftId}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${review.tips.toFixed(2)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-700">{review.reviewText}</p>

              {/* Owner Response */}
              {review.ownerResponse && (
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        O
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-blue-800">Restaurant Owner</span>
                    <span className="text-xs text-blue-600">
                      {new Date(review.ownerResponseDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">{review.ownerResponse}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTipReceived(review.id)}
                  className="flex items-center gap-1"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-xs">Tip Received</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">View Comments</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-xs">View NFT</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
