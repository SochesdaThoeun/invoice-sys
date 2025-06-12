import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthTabs() {
  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-11">
        <TabsTrigger 
          value="login" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="register"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="mt-6">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register" className="mt-6">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
} 