
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Star, Calendar, Trophy } from "lucide-react";

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  nftId: string;
  rating: number;
  date: string;
}

export const NFTModal = ({ isOpen, onClose, restaurantName, nftId, rating, date }: NFTModalProps) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full bg-white shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center pb-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Restaurant Review NFT
            </CardTitle>
          </div>
          
          <Badge className="mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            {nftId}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* NFT Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop"
              alt="Restaurant Food NFT"
              className="w-full h-64 object-cover rounded-lg border-4 border-gradient-to-r from-purple-300 to-pink-300"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              NFT Verified ✓
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-800">{restaurantName}</h3>
              <p className="text-sm text-gray-600">Dining Experience Review</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex">{renderStars(rating)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Blockchain Verified</span>
              </div>
              <p className="text-xs text-purple-700">
                This NFT represents a verified dining experience review stored permanently on the blockchain.
                It can be traded, collected, and serves as proof of your authentic restaurant experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Token Standard:</span>
                <div className="font-semibold">ERC-721</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Blockchain:</span>
                <div className="font-semibold">Ethereum</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Close NFT View
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
