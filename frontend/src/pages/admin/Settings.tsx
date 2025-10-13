import { useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Shield,
  Mail,
  Bell,
  Database,
  Globe,
  Key,
  Users,
  Zap,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/providers/ThemeProvider";
import { useNotifications } from "@/contexts/NotificationContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const {
    notificationSettings,
    updateNotificationSettings,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    testBrowserNotification,
    isBrowserNotificationSupported,
  } = useNotifications();

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    allowRegistration: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
  });

  const [apiSettings, setApiSettings] = useState({
    apiVersion: "v1",
    rateLimitPerMinute: 100,
    enableCors: true,
    corsOrigins: "https://albedoai.com,https://app.albedoai.com",
    enableWebhooks: true,
    webhookSecret: "whsec_1234567890abcdef",
  });

  return (
    <div className="space-y-8">
      {/* Header - Add padding-top on mobile to avoid sidebar button overlap */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-12 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 gap-1">
          <TabsTrigger
            value="general"
            className="flex items-center justify-center gap-2 py-2.5"
          >
            <SettingsIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">General</span>
          </TabsTrigger>
          {/* <TabsTrigger
            value="security"
            className="flex items-center justify-center gap-2 py-2.5"
          >
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Security</span>
          </TabsTrigger> */}
          <TabsTrigger
            value="notifications"
            className="flex items-center justify-center gap-2 py-2.5"
          >
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Notifications</span>
          </TabsTrigger>
          {/* <TabsTrigger
            value="api"
            className="flex items-center justify-center gap-2 py-2.5"
          >
            <Key className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">API</span>
          </TabsTrigger> */}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as "light" | "dark" | "system")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before accessing the system
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        allowRegistration: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        enableTwoFactor: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">
                  Minimum Password Length
                </Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordMinLength: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences and channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Support Request Notifications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Support Request Notifications
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified via email when new support requests are
                        submitted
                      </p>
                    </div>
                    <Switch
                      checked={
                        notificationSettings?.email_support_requests ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          email_support_requests: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show system alerts for new support requests
                      </p>
                    </div>
                    <Switch
                      checked={
                        notificationSettings?.system_support_requests ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          system_support_requests: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser push notifications (even when tab is
                        closed)
                      </p>
                    </div>
                    <Switch
                      checked={
                        notificationSettings?.browser_support_requests ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          browser_support_requests: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* User Creation Notifications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    User Creation Notifications
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified via email when new users are created
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings?.email_user_created ?? true}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          email_user_created: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show system alerts when new users are created
                      </p>
                    </div>
                    <Switch
                      checked={
                        notificationSettings?.system_user_created ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          system_user_created: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser push notifications (even when tab is
                        closed)
                      </p>
                    </div>
                    <Switch
                      checked={
                        notificationSettings?.browser_user_created ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          browser_user_created: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Browser Notification Permission */}
                {isBrowserNotificationSupported() && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Browser Notification Permission
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Browser Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow browser push notifications (works even when tab
                          is closed)
                        </p>
                        <Badge
                          variant={
                            browserNotificationPermission === "granted"
                              ? "default"
                              : browserNotificationPermission === "denied"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {browserNotificationPermission === "granted"
                            ? "Enabled"
                            : browserNotificationPermission === "denied"
                            ? "Blocked"
                            : "Not Requested"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {browserNotificationPermission !== "granted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={requestBrowserNotificationPermission}
                            disabled={
                              browserNotificationPermission === "denied"
                            }
                          >
                            {browserNotificationPermission === "denied"
                              ? "Blocked by Browser"
                              : "Enable Notifications"}
                          </Button>
                        )}
                        {browserNotificationPermission === "granted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testBrowserNotification}
                          >
                            Test Notification
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Settings
              </CardTitle>
              <CardDescription>
                Configure API endpoints and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiVersion">API Version</Label>
                  <Select
                    value={apiSettings.apiVersion}
                    onValueChange={(value) =>
                      setApiSettings({ ...apiSettings, apiVersion: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1 (Current)</SelectItem>
                      <SelectItem value="v2">v2 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={apiSettings.rateLimitPerMinute}
                    onChange={(e) =>
                      setApiSettings({
                        ...apiSettings,
                        rateLimitPerMinute: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable CORS</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow cross-origin requests
                  </p>
                </div>
                <Switch
                  checked={apiSettings.enableCors}
                  onCheckedChange={(checked) =>
                    setApiSettings({ ...apiSettings, enableCors: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corsOrigins">CORS Origins</Label>
                <Textarea
                  id="corsOrigins"
                  value={apiSettings.corsOrigins}
                  onChange={(e) =>
                    setApiSettings({
                      ...apiSettings,
                      corsOrigins: e.target.value,
                    })
                  }
                  placeholder="https://example.com,https://app.example.com"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow webhook notifications
                  </p>
                </div>
                <Switch
                  checked={apiSettings.enableWebhooks}
                  onCheckedChange={(checked) =>
                    setApiSettings({ ...apiSettings, enableWebhooks: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={apiSettings.webhookSecret}
                    onChange={(e) =>
                      setApiSettings({
                        ...apiSettings,
                        webhookSecret: e.target.value,
                      })
                    }
                  />
                  <Button variant="outline" size="sm">
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
