
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import AIHealthAssistantDemo from '@/components/AIHealthAssistantDemo';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ServiceCards />
        <AIHealthAssistantDemo />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
