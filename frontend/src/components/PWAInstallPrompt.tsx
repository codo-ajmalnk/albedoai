import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] z-50 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">A</span>
            </div>
            <div>
              <CardTitle className="text-xs sm:text-sm">Install Albedo AI</CardTitle>
              <CardDescription className="text-xs hidden sm:block">
                Get faster access and offline support
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 sm:h-6 sm:w-6 -mt-1 -mr-1"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          <ul className="text-xs text-muted-foreground space-y-1 hidden sm:block">
            <li>• Instant loading</li>
            <li>• Offline documentation</li>
            <li>• Push notifications</li>
          </ul>
          <div className="flex gap-2">
            <Button
              onClick={installPWA}
              size="sm"
              className="flex-1 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setIsDismissed(true)}
            >
              Later
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}