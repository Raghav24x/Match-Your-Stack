import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Hero />
        <Features />
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default Index;
