import * as React from "react";
import { Route, BrowserRouter as Router, Redirect } from "react-router-dom";

import { Login } from "modules/Login";
import { Register } from "modules/Register";
import { Dashboard } from "modules/Dashboard";
import { Sheet } from "modules/Sheet";

const PrivateRoute = ({ component, ...rest }: any) => {
  const routeComponent = (props: any) =>
    localStorage.getItem("token") ? (
      React.createElement(component, props)
    ) : (
      <Redirect to="/login" />
    );
  return <Route {...rest} render={routeComponent} />;
};

const App: React.FC = () => (
  <Router>
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <PrivateRoute exact path="/" component={Dashboard} />
    <PrivateRoute exact path="/sheet/:userId" component={Sheet} />
  </Router>
);

export default App;
