import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Shield, Lock, Home, ArrowLeft, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="cursor-docs-main">
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Privacy-themed 404 Card */}
          <Card className="text-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-foreground mb-2">
                404
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                This page is protected and not accessible
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-foreground/80">
                  The page you're looking for doesn't exist or has been moved for security reasons.
                </p>
                <p className="text-sm text-muted-foreground">
                  This could be due to privacy protection or the resource being relocated.
                </p>
              </div>

              {/* Privacy-focused messaging */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Your privacy and security are our priority</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="group">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Return to Home
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="group">
                  <Link to="/docs">
                    <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Browse Documentation
                  </Link>
                </Button>
              </div>

              {/* Additional help */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help finding what you're looking for?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/support" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy notice */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground/60">
              This 404 page is designed with privacy in mind. No tracking or data collection occurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
