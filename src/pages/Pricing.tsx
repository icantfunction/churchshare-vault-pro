import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Shield, Users, Database, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: "Free",
      annualPrice: "Free",
      storage: "5 GB",
      overage: "–",
      users: "5 users",
      extras: "watermark",
      icon: Users,
      popular: false,
      features: [
        "5 GB included storage",
        "Up to 5 users",
        "Basic file sharing",
        "Standard uploads",
        "ChurchShare watermark",
        "Email support"
      ]
    },
    {
      name: "Basic",
      price: "$29",
      annualPrice: "$24",
      storage: "100 GB",
      overage: "$9 / 100 GB",
      users: "25 users",
      extras: "logo branding",
      icon: Database,
      popular: false,
      features: [
        "100 GB included storage",
        "Up to 25 users",
        "Ministry-specific permissions",
        "Logo branding",
        "HD preview generation",
        "Priority email support"
      ]
    },
    {
      name: "Pro",
      price: "$79",
      annualPrice: "$66",
      storage: "10 TB",
      overage: "$9 / 100 GB",
      users: "100 users",
      extras: "unlimited ministries, 4K previews",
      icon: Zap,
      popular: true,
      features: [
        "10 TB included storage",
        "Up to 100 users",
        "Unlimited ministries",
        "4K preview generation",
        "Glacier-instant archive",
        "Advanced analytics",
        "Phone + email support"
      ]
    },
    {
      name: "Enterprise",
      price: "$299",
      annualPrice: "$249",
      storage: "50 TB",
      overage: "$9 / 100 GB",
      users: "Unlimited users",
      extras: "multi-campus, 24h SLA, lightning speeds, newest features",
      icon: Shield,
      popular: false,
      features: [
        "50 TB included storage",
        "Unlimited users",
        "Lightning uploads/download speeds",
        "Newest features (early access)",
        "Advanced security controls",
        "Custom integration support",
        "Multi-campus support",
        "24-hour SLA guarantee",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-poppins">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold">
                Church<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Share</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-gray-700 hover:text-primary">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your church or ministry. Scale as you grow with our flexible pricing.
          </p>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`font-medium ${!isAnnual ? 'text-primary' : 'text-gray-600'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`font-medium ${isAnnual ? 'text-primary' : 'text-gray-600'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-200">
              Pay yearly, get 2 months free
            </Badge>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = isAnnual ? plan.annualPrice : plan.price;
            
            return (
              <Card key={plan.name} className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1 rounded-full">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{displayPrice}</span>
                    {plan.price !== "Free" && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.storage} • {plan.users}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    asChild 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link to="/auth">
                      {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why We Can Include More Storage */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why can we include 10–50 TB when others can't?
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We leverage our <strong>Glacier-instant archive layer</strong>: your original files are vaulted in our 
              ultra-efficient deep-freeze, yet can still stream or download in milliseconds. That means you get 
              <em>massive</em> capacity without the usual "cold-storage wait time."
            </p>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Questions about pricing?
          </h3>
          <p className="text-gray-600 mb-6">
            All plans include our core features with no hidden fees. Upgrade or downgrade anytime.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Contact Sales</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/95 backdrop-blur-sm text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-2xl font-bold mb-4">
            Church<span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Share</span>
          </h4>
          <p className="text-gray-400">
            Secure, simple file sharing for churches and creative ministries
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
