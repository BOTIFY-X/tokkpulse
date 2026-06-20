import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMe, useUpdateMe } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: user } = useGetMe();
  const updateMe = useUpdateMe();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [niche, setNiche] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setCountry(user.country || "");
      setNiche(user.niche || "");
    }
  }, [user]);

  const handleSave = () => {
    updateMe.mutate({ data: { displayName, country, niche } }, {
      onSuccess: () => toast({ title: "Settings saved" })
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Niche</label>
              <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. Tech, Comedy, Lifestyle" />
            </div>
            <Button onClick={handleSave} disabled={updateMe.isPending} className="mt-4">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}