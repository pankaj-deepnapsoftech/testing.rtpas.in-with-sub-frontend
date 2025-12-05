import AboutSection from "../landing/About"
import Contact from "../landing/Contact"
import Landing from "../landing/landing"
import PricingSection from "../landing/Pricing"
import PrivacyPolicy from "../landing/PrivacyPolicy"
import ServicesSection from "../landing/Services"
import Terms from "../landing/Terms"




 const Routes  = [
    {
        path:"/",
        element:<Landing />
    },
    {
        path:"/about",
        element:<AboutSection />
    },
    {
        path:"/pricing",
        element:<PricingSection />
    },
    {
        path:"/services",
        element:<ServicesSection />
    },
    {
        path:"/contact",
        element:<Contact />
    },
    {
        path:"/terms",
        element:<Terms />
    },
    {
        path:"/privacy-policy",
        element:<PrivacyPolicy />
    },
   
]


export default Routes;