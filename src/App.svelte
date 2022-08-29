<script>
  import { Router, Route } from "svelte-routing";
  import NavLink from "./components/NavLink.svelte";
  import Home from "./routes/Home.svelte";
  import HRPCharts from "./routes/HRPCharts.svelte";
  import OCHACharts from "./routes/OCHACharts.svelte";

  // Used for SSR. A falsy value is ignored by the Router.
  export let url = "";
</script>

<Router url="{url}">
<!--   <nav>
    <NavLink to="/">Home</NavLink>
    <NavLink to="hrp-charts">HRP Charts</NavLink>
    <NavLink to="ocha-charts">OCHA Charts</NavLink>
  </nav> -->
  <div>
    <Route path="hrp-charts" component="{HRPCharts}" />
    <Route path="ocha-charts" component="{OCHACharts}" />
    <Route path="/" component="{Home}" />
  </div>
</Router>