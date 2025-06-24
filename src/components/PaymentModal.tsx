import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, MapPin, Users, ChefHat, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { RestaurantBill } from "./RestaurantDashboard";
import { usePYUSD } from "@/hooks/usePYUSD";
import { PYUSD_CONFIG } from "@/lib/pyusd-config";

interface PaymentModalProps {
  bill: RestaurantBill;
  onPayment: (billId: string) => void;
  onClose: () => void;
}

export const PaymentModal = ({ bill, onPayment, onClose }: PaymentModalProps) => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { 
    formattedBalance, 
    isBalanceLoading, 
    transferPYUSD, 
    isTransactionPending, 
    hasSufficientBalance,
    transactionHash 
  } = usePYUSD();
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mock restaurant wallet address (in real app, this would come from the restaurant's profile)
  const restaurantWalletAddress = "0x742E48F3c62Ee6e6cD7C8AB24b6eFBf5e1C58267"; // Replace with actual restaurant address

  useEffect(() => {
    if (transactionHash && !isTransactionPending) {
      setPaymentSuccess(true);
      // Wait a moment then complete the payment flow
      setTimeout(() => {
        onPayment(bill.id);
        navigate(`/review/${bill.id}`);
      }, 2000);
    }
  }, [transactionHash, isTransactionPending, bill.id, onPayment, navigate]);

  const handlePYUSDPayment = async () => {
    if (!isConnected || !address) {
      return;
    }
    
    await transferPYUSD(restaurantWalletAddress as `0x${string}`, bill.total);
  };

  const hasSufficientFunds = hasSufficientBalance(bill.total);
  const isReadyToPay = isConnected && address && hasSufficientFunds && !isTransactionPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            Pay with PYUSD
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <ChefHat className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{bill.restaurantName}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{bill.location}</span>
                  <Users className="h-4 w-4 ml-2" />
                  <span>{bill.pax} pax</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 mb-3">Order Summary:</h4>
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
              
              <Separator className="my-3" />
              
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
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">${bill.total.toFixed(2)} PYUSD</span>
                </div>
              </div>
            </div>
          </div>

          {/* PYUSD Payment Section */}
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png" 
                  alt="PYUSD" 
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-gray-800">PayPal USD (PYUSD)</h3>
                  <p className="text-sm text-gray-600">Pay instantly with stablecoin</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  1:1 USD Parity
                </Badge>
              </div>

              {!isConnected ? (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Please connect your wallet to pay with PYUSD
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Wallet Balance */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Your PYUSD Balance:</span>
                      <div className="flex items-center gap-2">
                        {isBalanceLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <>
                            <span className="font-bold text-gray-800">{formattedBalance} PYUSD</span>
                            {hasSufficientFunds ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Insufficient Balance Warning */}
                  {!hasSufficientFunds && !isBalanceLoading && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                          <span className="text-sm font-medium">Insufficient PYUSD Balance</span>
                          <p className="text-xs text-red-700 mt-1">
                            You need ${bill.total.toFixed(2)} PYUSD but only have {formattedBalance} PYUSD
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Success */}
                  {paymentSuccess && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Payment successful! Redirecting to review page...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isTransactionPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePYUSDPayment}
              disabled={!isReadyToPay || paymentSuccess}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-lg"
            >
              {isTransactionPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : paymentSuccess ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Payment Complete
                </div>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay {bill.total.toFixed(2)} PYUSD
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
