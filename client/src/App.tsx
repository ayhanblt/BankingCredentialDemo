import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Login } from "@/pages/Login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { isAuthenticated } from "./services/auth";

// Import Material Icons from Google CDN
function importMaterialIcons() {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

// Import Material Icons when component mounts
importMaterialIcons();

// Protected Route bileşeni
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/">
        <Redirect to={isAuthenticated() ? '/dashboard' : '/login'} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
