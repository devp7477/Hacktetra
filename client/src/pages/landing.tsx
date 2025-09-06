import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircleIcon, ChartScatter } from "lucide-react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

export default function Landing() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen flex" data-testid="landing-page">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        {/* Abstract geometric background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-lg rotate-45"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 border-2 border-white rounded-lg"></div>
        </div>
        
        <div className="flex flex-col justify-center px-12 z-10">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4">
                <ChartScatter className="text-primary text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-white">SynergySphere</h1>
            </div>
            <p className="text-xl text-white/90 mb-8">Advanced Team Collaboration Platform</p>
            <p className="text-white/80 text-lg leading-relaxed">
              Transform how your team collaborates. Streamline projects, enhance communication, 
              and boost productivity with intelligent workflows designed for modern teams.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-white/90">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-300" />
              <span>Real-time collaboration</span>
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-300" />
              <span>Smart project management</span>
            </div>
            <div className="flex items-center text-white/90">
              <CheckCircleIcon className="mr-3 h-5 w-5 text-green-300" />
              <span>Mobile-first design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-3">
                <ChartScatter className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold">SynergySphere</h1>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to SynergySphere</h2>
            <p className="text-muted-foreground">
              {showSignUp ? "Create your account" : "Sign in to access your team collaboration workspace"}
            </p>
          </div>

          <Card className="p-6">
            {showSignUp ? (
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    card: "shadow-none",
                    rootBox: "w-full",
                  }
                }}
              />
            ) : (
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    card: "shadow-none",
                    rootBox: "w-full",
                  }
                }}
              />
            )}
          </Card>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowSignUp(!showSignUp)}
              className="text-sm"
            >
              {showSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Secure authentication powered by Clerk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
