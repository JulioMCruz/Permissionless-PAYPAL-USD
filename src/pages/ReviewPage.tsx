import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Star, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";

export const ReviewPage = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock restaurant data based on billId (in real app, would fetch from API)
  const restaurantName = billId === "1" ? "The Modern SoHo" : 
                        billId === "2" ? "Lucia's Italian Bistro" : 
                        "Rooftop Grill NYC";

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please provide a star rating");
      return;
    }
    
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate NFT creation and review submission
    setTimeout(() => {
      toast.success("Review submitted and NFT created! 🎉");
      setIsSubmitting(false);
      navigate("/");
    }, 3000);
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl border-2 border-purple-200">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-purple-600" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Review Your Experience
              </CardTitle>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">{restaurantName}</h2>
            </div>
            <Badge className="mx-auto mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Will become NFT
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate your experience</h3>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Share your thoughts</h3>
              <Textarea
                placeholder="Tell others about your dining experience, the food, service, ambiance..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* NFT Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">NFT Creation</span>
              </div>
              <p className="text-sm text-purple-700">
                Your review will be minted as a unique NFT on the blockchain. This creates a permanent, 
                verifiable record of your dining experience that you can own and trade.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0 || !reviewText.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating NFT Review...
                </div>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Submit Review & Create NFT
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewPage;
