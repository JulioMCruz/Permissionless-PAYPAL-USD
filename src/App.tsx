
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/providers/Web3Provider";
import { Header } from "@/components/Header";
import { NetworkGuard } from "@/components/NetworkGuard";
import Index from "./pages/Index";
import ReviewPage from "./pages/ReviewPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <Web3Provider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <Header />
          <NetworkGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/review/:billId" element={<ReviewPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NetworkGuard>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </Web3Provider>
);

export default App;
