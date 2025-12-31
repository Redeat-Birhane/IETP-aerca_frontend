import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";



import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Section1 from "./Components/Section-1/section1";
import Section2 from "./Components/Section-2/section2";
import Section3 from "./Components/Section-3/section3";
import Section4 from "./Components/Section-4/section4";
import Section5 from "./Components/Section-5/section5";
import Section6 from "./Components/Section-6/section6";

import Transitors from "./Components/Pages/Transitors/Transitors";
import Signin from "./Components/Signpage/Login";
import Signup from "./Components/Signpage/signup";
import Profile from "./Components/Signpage/Profile";
import Coursespage from "./Components/Section-2/Course.js";
import TaxWorkers from "./Components/Pages/Tax-Workers/Taxworkers.js";
import Taxconnect from "./Components/Section-3/Tax.js";
import Lawpost from "./Components/Section-4/Lawpost.js";
import Transistorconnect from "./Components/Section-4/Transitorconnect.js";
import Law from "./Components/Pages/Law&Authority/Law.js";
import Overview from "./Components/Pages/Geez-Assistant/overview";
import Teckspec from "./Components/Pages/Geez-Assistant/teckspec";
import Items from "./Components/Pages/Store/Items";
import Cart from "./Components/Pages/Bag/Cart";
import Courses from "./Components/Pages/Trading-Courses/Courses";
import Community from "./Components/Pages/Community-Questions/Community";
import Center from "./Components/Pages/Contact-Center/Center";
import Search from "./Components/Pages/Search/Search";
import  Instructions from "./Components/Pages/Instructions/Instructions";

import { CartProvider } from "./context/CartContext";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter =
    location.pathname === "/Overview" || location.pathname === "/Teckspec";

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Section1 />
              <Section2 />
              <Section3 />
              <Section4 />
              <Section5 />
              <Section6 />
            </>
          }
        />
        <Route path="/Transitors" element={<Transitors />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Coursespage" element={<Coursespage />} />
        <Route path="/Taxconnect" element={<Taxconnect />} />
        <Route path="/Lawpost" element={<Lawpost />} />
        <Route path="/Transistorconnect" element={<Transistorconnect />} />
        <Route path="/Overview" element={<Overview />} />
        <Route path="/Teckspec" element={<Teckspec />} />
        <Route path="/TaxWorkers" element={<TaxWorkers />} />
        <Route path="/Law" element={<Law />} />
        <Route path="/Items" element={<Items />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Courses" element={<Courses />} />
        <Route path="/Community" element={<Community />} />
        <Route path="/Center" element={<Center />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/Instructions" element={<Instructions />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Layout />
      </Router>
    </CartProvider>
  );
}
