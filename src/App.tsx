import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Login from "./pages/Login";
import {  Routes, Route, useNavigate } from "react-router-dom";
// import Register from "./pages/Register";
import Layout from "./pages/Layout";
import routes from "./routes/routes";
import { useSelector } from "react-redux";
import NotFound from "./pages/NotFound";
import { useCookies } from "react-cookie";
import SubscriptionExpired from "./pages/SubscriptionEnd";
import PricingSection from "./pages/PricingModel";
import LandingLayout from "./landing/LandingLayout";
import PublicRoutes from "./routes/Public.routes"; 
import { useGetLoggedInUserQuery } from "./redux/api/api";
import { isSubscriptionEnd } from "./utils/dateModifyer";
import { motion } from "motion/react";

const App: React.FC = () => {
  const navigate = useNavigate()
  const [cookies] = useCookies();
  const { allowedroutes, isSuper,id } = useSelector((state: any) => state.auth);

  /** -------------------------------
   *  FIXED USER ID RESOLUTION LOGIC
   *  ------------------------------- */
  const getSavedUserId = () => {
    const raw = sessionStorage.getItem("Auth-data");
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed?._id || null;
    } catch {
      return null;
    }
  };

    const userId = id || getSavedUserId();


    /** -------------------------------
   *  API: Fetch logged-in user
   *  ------------------------------- */
  const { data: user, isLoading } = useGetLoggedInUserQuery(
    cookies.access_token ? userId : ""
  );



    useEffect(() => {
    if (user && isSubscriptionEnd(user?.user?.[0]?.subscription_end)) {
      navigate("/subscription-end")
    }
  }, [navigate, user]);

    if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
          ></motion.div>

          <p className="text-gray-600 font-medium tracking-wide">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[99vh] bg-gray-50">
      <div className="min-h-screen">
        <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/subscription-end" element={<SubscriptionExpired />} />
            <Route path="/pricing-modal" element={<PricingSection />} />


            {!cookies.access_token && (
              <Route element={<LandingLayout />}>
                {PublicRoutes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
              </Route>
            )}

            {/* <Route path="/register" element={<Register />} /> */}
           { cookies.access_token  &&  <Route path="/" element={<Layout />}>
              {routes.map((route, ind) => {
                const isAllowed =
                  isSuper ||
                  allowedroutes.includes(route.path.replaceAll("/", ""));
                if (route.isSublink) {
                  return (
                    <Route key={ind} path={route.path} element={route.element}>
                      {route.sublink &&
                        route.sublink.map((sublink, index) => {
                          return (
                            <Route
                              key={index}
                              path={sublink.path}
                              element={sublink.element}
                            ></Route>
                          );
                        })}
                    </Route>
                  );
                } else {
                  return (
                    <Route
                      index={route.name === "Dashboard" ? true : false}
                      key={ind}
                      path={route.path}
                      element={route.element}
                    ></Route>
                  );
                }
              })}
            </Route>}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </div>
    </div>
  );
};

export default App;
